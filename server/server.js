const express = require('express');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');
const crypto = require('crypto');
const bodyParser = require('body-parser');
const multer = require('multer');
const JsonDB = require('node-json-db');
const session = require('express-session');
const sizeOf = require('image-size');
const gm = require('gm');

/* server configuration */
const port = 3000;
const paths = {
  webHome: path.resolve(__dirname, '../public'), // home page of http request
  albumsFolder: path.resolve(__dirname, '../public/albums')
};
const sitePages = ['/album', '/uploadPhoto', '/login', '/account', '/settings'];
const supportTypes = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.ico', '.svg'];
const thumbHeight = 512;

// use express
let app = express();
let api = express.Router();

// simple database to store albums information
let db = new JsonDB(path.resolve(__dirname, 'db'), true, true);

// multer middleware for upload images
let upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.resolve(paths.albumsFolder, req.params.id));
    },
    filename: (req, file, cb) => {
      let originalName = file.originalname;
      let files = fs.readdirSync(path.resolve(paths.albumsFolder, req.params.id));

      // todo, check from db, not from disk
      let count = 0;
      let getName = function(fileName) {
        if (~files.findIndex(name => name === fileName)) {
          // duplicated name, plus 1
          fileName = getBaseName(originalName) + '_' + ++count + path.extname(fileName);
          return getName(fileName);
        } else {
          return fileName;
        }
      };

      cb(null, getName(originalName));
    }
  }),
  fileFilter: (req, file, cb) => {
    if (isImg(file.originalname)) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  }
});
let profileUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, paths.webHome);
    },
    filename: (req, file, cb) => {
      let originalName = file.originalname;
      let extName = path.extname(originalName);
      let name = req.url === '/changeAvatar' ? 'avatar' : 'bg';
      cb(null, name + extName);
    }
  })
});

// session define
let appSession = session({
  secret: 'P,h,oto,s',
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
  res.type('html').send(getHomePage());
});
app.use(appSession);
app.use(bodyParser.json());
app.use('/api', api);
app.use((req, res) => {
  res.status(404).send(null);
});

/* common methods */
function md5(data) {
  let hmac = crypto.createHmac('md5', 'P,h,oto,s');
  return hmac.update(data).digest('base64');
}

function notNeedCertification(req) {
  if (req.method === 'GET') {
    return req.url === '/userProfile' || req.url === '/settings';
  } else {
    return req.url === '/login' || req.url === '/logout' || req.url === '/changePassword';
  }
}

function getHomePage() {
  return fs.readFileSync(path.resolve(paths.webHome, 'index.html'));
}

function getBaseName(photoName) {
  return path.basename(photoName, path.extname(photoName));
}

function getThumbPath(albumId, photoName) {
  let thumbName = getBaseName(photoName) + '-thumb.jpg';
  return path.resolve(paths.albumsFolder, albumId, 'thumb', thumbName);
}

function isFile(filePath) {
  return fs.statSync(filePath).isFile();
}

function isDirectory(filePath) {
  return fs.statSync(filePath).isDirectory();
}

function isImg(filName) {
  let extName = path.extname(filName);
  for (let i = 0, len = supportTypes.length; i < len; i++) {
    if (supportTypes[i] === extName.toLowerCase()) {
      return true;
    }
  }
  return false;
}

function isHiddenItem(filName) {
  // todo
  return (/(^|\/)\.[^\/\.]/g).test(filName);
}

/* startup checks */
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
      password: md5('admin'),
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
    albumList = db.getData('/albumList');
  } catch (err) {
    return;
  }

  albumList.forEach((albumInfo, albumIndex) => {
    let albumPath = path.resolve(paths.albumsFolder, albumInfo.id);
    let files = fs.readdirSync(albumPath);
    let photos = files.filter((file) => {
      return !isHiddenItem(file) && isFile(path.resolve(albumPath, file)) && isImg(file);
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
      // image's count in db's albumList not equals thumb count
      dbImages.forEach((imgInfo) => {
        let imgPath = path.resolve(albumPath, imgInfo.name);
        let thumbImgPath = getThumbPath(albumInfo.id, imgInfo.name);

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

// init app
(function init() {
  checkAccount()
    .then(checkSettings)
    .then(checkAlbumList)
    .then(checkAlbumsFolder)
    .then(checkPhotos)
    .then(checkThumb)
    .then(() => {
      app.listen(port, () => {
        console.log('NodeJS server on port %s', port);
      });
    })
    .catch((err) => {
      console.log(err);
    });
})();




/*
 rest api
*/
api.use((req, res, next) => {
  // all api path need access grant
  if (notNeedCertification(req)) {
    next();
  } else if (!req.session.isLogined) {
    res.status(403).json({});
  } else {
    next();
  }
});

api.post('/login', (req, res) => {
  let account;
  try {
    account = db.getData('/account');
  } catch (err) {
    console.log(err);
    res.status(500).json({errorText: 'database error.'});
  }

  let reqPwd = md5(req.body.password);
  if (reqPwd === account.password) {
    req.session.regenerate((err) => {
      if (err) {
        return res.json({
          errorText: 'Create session failed.'
        });
      }

      req.session.isLogined = true;
      res.json({
        success: true,
        userProfile: {
          name: account.name,
          avatar: account.avatar
        }
      });
    });
  } else {
    res.json({
      errorText: 'Password not correct.'
    });
  }
});

api.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      res.status(500).json(err.code);
    }
    res.json({});
  });
});

api.get('/userProfile', (req, res) => {
  let account;
  try {
    account = db.getData('/account');
  } catch (err) {
    console.log(err);
    res.status(500).json({errorText: 'database error.'});
  }

  res.json({
    name: account.name,
    avatar: account.avatar
  });
});

api.get('/settings', (req, res) => {
  let settings;
  try {
    settings = db.getData('/settings');
  } catch (err) {
    console.log(err);
    res.status(500).json({errorText: 'database error.'});
  }

  res.json(settings);
});

api.put('/settings', profileUpload.single('landingBgFile'), (req, res) => {
  let settings;
  try {
    settings = db.getData('/settings');
  } catch (err) {
    console.log(err);
    res.status(500).json({errorText: 'database error.'});
  }

  let postData = req.body;
  let { whiteList, enableBg, bgUrl, autoCrop } = postData;

  // delete bg or create thumb
  if (settings.landingBg.url && !bgUrl) {
    // delete bg.jpg
    let bgPath = path.resolve(paths.webHome, settings.landingBg.url.split('?')[0]);
    if (fs.existsSync(bgPath)) {
      fs.unlinkSync(bgPath);
    }
  }

  // todo, postData valid check
  // store to db
  settings.whiteList = whiteList.split('<--split-->');
  settings.landingBg = {
    enable: enableBg === 'true',
    url: req.file ? (req.file.filename + '?v=' + (+new Date())) : bgUrl
  };
  settings.autoCrop = autoCrop === 'true';

  db.push('/settings', settings);

  res.json({settings});
});

api.put('/changeUserName', (req, res) => {
  db.push('/account/name', req.body.name);
  res.json({success: true});
});

api.put('/changeAvatar', profileUpload.single('avatar'), (req, res) => {
  let file = req.file;
  if (file) {
    // if file is .gif, just keep the original file, otherwise, create a .jpg thumb
    new Promise((resolve, reject) => {
      let avatarName;
      if (path.extname(file.filename) !== '.gif') {
        // create thumb
        avatarName = getBaseName(file.filename) + '.jpg';
        let size = sizeOf(file.path);
        let toHeight = Math.min(size.height, thumbHeight);
        let toWidth = size.width / size.height * toHeight;
        let bgThumbPath = path.resolve(paths.webHome, avatarName);
        let readStream = fs.createReadStream(file.path);
        fs.unlinkSync(file.path);
        let prevGifAvatar = path.resolve(paths.webHome, 'avatar.gif');
        if (fs.existsSync(prevGifAvatar)) {
          fs.unlinkSync(prevGifAvatar);
        }
        gm(readStream)
          .resize(toWidth, toHeight)
          .write(bgThumbPath, (err) => {
            if (err) {
              console.log(err);
              reject(err);
            }
            resolve(avatarName);
          });
      } else {
        avatarName = file.filename;
        let prevJpgAvatar = path.resolve(paths.webHome, 'avatar.jpg');
        if (fs.existsSync(prevJpgAvatar)) {
          fs.unlinkSync(prevJpgAvatar);
        }
        resolve(avatarName);
      }
    }).then((avatarName) => {
      let newName = avatarName + '?v=' + (+new Date());
      db.push('/account/avatar', newName);
      res.json({avatar: newName});
    }).catch(() => {
      res.status(500).end();
    });
  } else {
    res.end();
  }
});

api.put('/changePassword', (req, res) => {
  return;
  let account;
  try {
    account = db.getData('/account');
  } catch (err) {
    console.log(err);
    res.status(500).json({});
  }

  let reqOldPassword = md5(req.body.oldPassword);
  let reqNewPassword = md5(req.body.newPassword);
  if (reqOldPassword === account.password) {
    db.push('/account/password', reqNewPassword);
    res.json({success: true});
  } else {
    res.json({errorText: 'Old password not correct.'});
  }
});

api.get('/albums', (req, res) => {
  let albumList;
  try {
    albumList = db.getData('/albumList');
  } catch (err) {
    albumList = [];
  }
  albumList = albumList.map((albumInfo) => {
    let info = {...albumInfo};
    info.count = albumInfo.images.length;
    info.images = undefined;
    return info;
  });

  res.json(albumList);
});

api.get('/album/:id', (req, res) => {
  let albumId = req.params.id;

  // get album information
  let albumList;
  try {
    albumList = db.getData('/albumList');
  } catch (err) {
    console.log(err);
    res.status(500).json({errorText: 'database error.'});
  }
  let index = albumList.findIndex(info => info.id === albumId);
  let albumInfo;
  if (~index) {
    albumInfo = albumList[index];
  }

  return res.json({
    albumInfo: {
      ...albumInfo,
      count: albumInfo.images.length
    }
  });

  // get all image name
  /*fs.readdir(albumPath, (err, files) => {
    if (err) {
      console.log(err);
      return res.status(500).json(err.code);
    }

    let images = [];
    files.forEach((fileName) => {
      let filePath = path.resolve(albumPath, fileName);
      let stat = fs.statSync(filePath);

      if (stat.isFile() && isImg(fileName) && !isHiddenItem(fileName)) {
        let size = sizeOf(filePath);
        images.push({
          name: fileName,
          date: stat.birthtimeMs,
          size: {
            width: size.width,
            height: size.height
          }
        });
      }
    });
    return res.json({
      albumInfo: albumInfo,
      images: images
    });
  });*/

});

/* create album */
api.post('/album/:name', (req, res) => {
  let albumName = req.params.name;

  // compute albumId
  let albumList;
  try {
    albumList = db.getData('/albumList');
  } catch (err) {
    console.log(err);
    res.status(500).json({errorText: 'database error.'});
  }
  let existIds = albumList.map(albumInfo => albumInfo.id);
  let albumId = existIds.length ? Math.max(...existIds) + 1 + '' : '101'; // + '' to string

  // create folder and save to db
  let albumPath = path.resolve(paths.albumsFolder, albumId);
  fs.mkdir(albumPath, (err) => {

    if (err) {
      console.log(err);
      return res.status(500).json(err.code);
    }

    // create thumb folder
    let thumbFolderPath = path.resolve(albumPath, 'thumb');
    fs.mkdirSync(thumbFolderPath); // todo, error handler

    let albumInfo = {
      id: albumId,
      name: albumName,
      creationDate: +new Date(),
      cover: '',
      images: []
    };

    db.push('/albumList[]', albumInfo);

    return res.json({
      ...albumInfo,
      count: 0
    });
  });

});

/* change album name */
api.put('/album/:id', (req, res) => {
  let id = req.params.id;
  let name = req.body.name;

  // compute albumId
  let albumList;
  try {
    albumList = db.getData('/albumList');
  } catch (err) {
    console.log(err);
    res.status(500).json({errorText: 'database error.'});
  }

  let albumIndex = albumList.findIndex(albumInfo => albumInfo.id === id);

  if (name !== undefined || name !== null) {
    db.push('/albumList[' + albumIndex + ']/name', name);
  }

  res.json({});
});

/* delete album */
api.delete('/album/:id', (req, res) => {
  let albumId = req.params.id;
  let albumPath = path.resolve(paths.albumsFolder, albumId);

  let deleteWithChildren = function(folderPath) {
    // delete all files
    fs.readdirSync(folderPath).forEach((name) => {
      let thisPath = path.resolve(folderPath, name);
      if (isFile(thisPath)) {
        fs.unlinkSync(thisPath);
      } else if (isDirectory(thisPath)) {
        deleteWithChildren(thisPath);
      }
    });
    // delete folder
    fs.rmdirSync(folderPath);
  };

  deleteWithChildren(albumPath);

  // delete album info in db
  let albumList;
  try {
    albumList = db.getData('/albumList');
  } catch (err) {
    console.log(err);
    res.status(500).json({errorText: 'database error.'});
  }
  let albumIndex = albumList.findIndex(info => info.id === albumId);
  if (~albumIndex) {
    db.delete('/albumList[' + albumIndex + ']');
  } else {
    // todo, error handle
  }

  return res.json({});
});

/* upload photo */
api.post('/uploadPhoto/:id', upload.single('photo'), (req, res) => {
  let albumId = req.params.id;
  let file = req.file;

  // todo, when filFilter return false.

  // file information
  let size = sizeOf(file.path);
  let photoInfo = {
    name: file.filename,
    size: [size.width, size.height],
    date: fs.statSync(file.path).birthtimeMs
  };

  new Promise((resolve, reject) => {
    // create thumb
    let toHeight = Math.min(size.height, thumbHeight);
    let toWidth = size.width / size.height * toHeight;
    let thumbImgPath = getThumbPath(albumId, file.filename);
    gm(file.path)
      .resize(toWidth, toHeight)
      .write(thumbImgPath, (err) => {
        if (err) {
          console.log(err);
          reject(err);
        }
        resolve();
      });
  }).then(() => {
    // update images and cover
    let albumList;
    try {
      albumList = db.getData('/albumList');
    } catch (err) {
      console.log(err);
      res.status(500).json({errorText: 'database error.'});
    }
    let albumIndex = albumList.findIndex(info => info.id === albumId);
    let albumInfo = albumList[albumIndex];

    albumInfo.images.unshift(photoInfo);
    if (!albumInfo.cover) {
      albumInfo.cover = file.filename;
    }
    db.push('/albumList[' + albumIndex + ']', albumInfo);

    res.json(photoInfo);
  }).catch(() => {
    // create album error, need to roll back: delete photo
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    res.status(500).end();
  });
});

api.post('/deletePhotos/:id', (req, res) => {
  let albumId = req.params.id;
  let names = req.body;

  let albumList;
  try {
    albumList = db.getData('/albumList');
  } catch (err) {
    console.log(err);
    res.status(500).json({errorText: 'database error.'});
  }

  let albumIndex = albumList.findIndex(info => info.id === albumId);
  if (!~albumIndex) {
    res.status(404).json({errorText: 'Cannot find album'});
  }

  let albumInfo = albumList[albumIndex];
  let needResetCover = false;

  // get db images name to index mapping
  let nameToIndex = {};
  albumInfo.images.forEach((photoInfo, photoIndex) => {
    nameToIndex[photoInfo.name] = photoIndex;
  });

  // delete photos from disk
  names.forEach((photoName) => {
    if (!needResetCover && photoName === albumInfo.cover) {
      // if cover photo been deleted, reset cover
      needResetCover = true;
    }
    // mark to be delete
    let indexInDb = nameToIndex[photoName];
    if (indexInDb !== undefined) {
      albumInfo.images[indexInDb].needToDelete = true;
    }

    let photoPath = path.resolve(paths.albumsFolder, albumId, photoName);
    let thumbPath = getThumbPath(albumId, photoName);
    if (fs.existsSync(photoPath)) {
      fs.unlinkSync(photoPath);
    }
    if (fs.existsSync(thumbPath)) {
      fs.unlinkSync(thumbPath);
    }
  });

  // delete photos info from db
  albumInfo.images = albumInfo.images.filter((photoInfo) => {
    return !photoInfo.needToDelete;
  });

  // clear cover
  needResetCover = needResetCover || albumInfo.images.length === 0;
  if (needResetCover) {
    albumInfo.cover = '';
  }

  db.push('/albumList[' + albumIndex + ']', albumInfo);

  res.json({});
});

api.put('/setCover/:id', (req, res) => {
  let albumId = req.params.id;
  let imgName = req.body.name;
  if (isImg(imgName)) {
    let albumList;
    try {
      albumList = db.getData('/albumList');
    } catch (err) {
      console.log(err);
      res.status(500).json({errorText: 'database error.'});
    }

    let albumIndex = albumList.findIndex(info => info.id === albumId);
    if (!~albumIndex) {
      res.status(404).json({errorText: 'Cannot find album'});
    }

    db.push('/albumList[' + albumIndex + ']/cover', imgName);
  }

  res.json({});
});