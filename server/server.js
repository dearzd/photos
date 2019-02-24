const express = require('express');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');
const bodyParser = require('body-parser');
const JsonDB = require('node-json-db');
const session = require('express-session');
const sizeOf = require('image-size');
const gm = require('gm');

const api = require('./api');
const utils = require('./utils');
const {
  port,
  thumbHeight,
  paths,
  md5Key
} = require('./serverConf');

const sitePages = ['/album', '/uploadPhoto', '/login', '/account', '/settings'];

// use express
let app = express();

// simple database to store albums information
let db = new JsonDB(path.resolve(__dirname, 'db'), true, true);

// session define
let appSession = session({
  secret: md5Key,
  resave: false,
  saveUninitialized: false,
  cookie: {maxAge: 60 * 60 * 1000} // one hour
});

/*
 middleware used
*/
app.use((req, res, next) => {
  // anti stealing link
  let reqUrl = req.url;
  let extName = path.extname(reqUrl);
  let referer = req.headers.referer;
  let host = req.headers.host;
  let refererHost = referer && new URL(referer).host;
  if (!extName || !referer || host === refererHost) {
    // no need to check whether in white list
    next();
  } else {
    let whiteList;
    try {
      whiteList = db.getData('/settings/whiteList');
    } catch (err) {
      res.status(500).json({errorText: 'database error.'});
    }

    if (~whiteList.findIndex(str => str === refererHost)) {
      // in white list
      next();
    } else {
      // illegal request
      res.status(403).send(null);
    }

  }
});
app.use(express.static(paths.webHome)); // static, html, js, css, favicon.icon, and images
app.use(sitePages, (req, res) => {
  res.type('html').send(utils.getHomePage());
});
app.use(appSession);
app.use(bodyParser.json());
app.use('/api', api);

// check whether has account info, if not, insert
function checkAccount() {
  console.log('--checking for db account...');
  let account;
  try {
    account = db.getData('/account');
    return Promise.resolve();
  } catch (err) {
    account = {
      name: 'admin',
      password: utils.md5('admin'),
      avatar: ''
    };
    try {
      db.push('/account', account);
      return Promise.resolve();
    } catch (err) {
      return Promise.reject(err);
    }
  }
}

// check whether has settings, if not, insert
function checkSettings() {
  console.log('--checking for db settings...');
  let settings;
  try {
    settings = db.getData('/settings');
  } catch(err) {
    settings = {
      whiteList: [],
      landingBg: {
        enable: false,
        url: ''
      },
      autoCrop: true
    };
    db.push('/settings', settings);
  }
}

// check whether has albumList, if not, insert
function checkAlbumList() {
  console.log('--checking for db albumList...');
  let albumList;
  try {
    albumList = db.getData('/albumList');
  } catch (err) {
    albumList = [];
    db.push('/albumList', albumList);
  }
}

// check albums folder whether existing, if not, create folder
function checkAlbumsFolder() {
  console.log('--checking for albums folder...');
  if(!fs.existsSync(paths.albumsFolder)) {
    fs.mkdirSync(paths.albumsFolder);
  }
}

// check photos in albums folder whether same with db
// if not, update db according to albums folder
function checkPhotos() {
  console.log('--checking for photos...');
  let albumList;
  try {
    albumList = db.getData('/albumList'); // todo, get albumList from real folder
  } catch (err) {
    return;
  }

  albumList.forEach((albumInfo, albumIndex) => {
    let albumPath = path.resolve(paths.albumsFolder, albumInfo.id);
    let files = fs.readdirSync(albumPath);
    let photos = files.filter((file) => {
      return !utils.isHiddenItem(file) && utils.isFile(path.resolve(albumPath, file)) && utils.isImg(file);
    });

    if (photos.length !== albumInfo.images.length) {
      // photos in folder not accordance with db, update db
      let images = photos.map((img) => {
        let imgPath = path.resolve(albumPath, img);
        let size = sizeOf(imgPath);

        return {
          name: img,
          size: [size.width, size.height],
          date: fs.statSync(imgPath).birthtimeMs
        };
      });

      images.sort((a, b) => b.date - a.date);

      db.push('/albumList[' + albumIndex + ']/images', images);
    }
  });
}

// check whether thumb is exists and count is equals to photo's count
// if not, reproduce all thumbs in album
function checkThumb() {
  console.log('--checking for thumb...');
  let albumList;
  try {
    albumList = db.getData('/albumList');
  } catch (err) {
    return;
  }

  let promises = [];
  albumList.forEach((albumInfo) => {
    let albumPath = path.resolve(paths.albumsFolder, albumInfo.id);
    let thumbFolderPath = path.resolve(albumPath, 'thumb');
    if (!fs.existsSync(thumbFolderPath)) {
      // if no thumb folder, create
      fs.mkdirSync(thumbFolderPath);
    }

    let dbImages = albumInfo.images;
    let thumbImages = fs.readdirSync(thumbFolderPath);

    if (dbImages.length !== thumbImages.length) {
      // todo, this case just handler has photo but no thumb
      // todo, if has thumb but no photo? if has large but no photo?
      // image's count in db's albumList not equals thumb count
      dbImages.forEach((imgInfo) => {
        let imgPath = path.resolve(albumPath, imgInfo.name);
        let thumbImgPath = utils.getThumbPath(albumInfo.id, imgInfo.name);

        if (!fs.existsSync(thumbImgPath)) {
          // if not exist this thumb, create
          let thumbPromise = new Promise((resolve, reject) => {
            gm(imgPath)
              .size(function(err, size) {
                if (err) {
                  reject(err);
                } else {
                  let toHeight = Math.min(size.height, thumbHeight);
                  let toWidth = size.width / size.height * toHeight;
                  this.resize(toWidth, toHeight)
                    .write(thumbImgPath, (err) => {
                      if (err) {
                        console.log(err);
                        reject(err);
                      } else {
                        resolve();
                      }
                    });
                }
              });
          });
          promises.push(thumbPromise);
        }

      });
    }
  });

  return Promise.all(promises);
}

function checkLargePhoto() {
  console.log('--checking for large photo...');
  let albumList;
  try {
    albumList = db.getData('/albumList');
  } catch (err) {
    return;
  }

  albumList.forEach((albumInfo) => {
    let albumPath = path.resolve(paths.albumsFolder, albumInfo.id);
    let largeFolderPath = path.resolve(albumPath, 'large');
    if (!fs.existsSync(largeFolderPath)) {
      // if no thumb folder, create
      fs.mkdirSync(largeFolderPath);
    }

    // todo,
  });
}

// init app
(function init() {
  checkAccount()
    .then(checkSettings)
    .then(checkAlbumList)
    .then(checkAlbumsFolder)
    .then(checkPhotos)
    .then(checkThumb)
    .then(checkLargePhoto)
    .then(() => {
      app.listen(port, () => {
        console.log('NodeJS server on port %s', port);
      });
    })
    .catch((err) => {
      console.log(err);
    });
})();
