const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const sizeOf = require('image-size');
const gm = require('gm');

const utils = require('./utils');
const {
  thumbHeight,
  paths
} = require('./serverConf');
let db = require('./db');

// multer middleware for upload images
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.resolve(paths.albumsFolder, req.params.id, 'large'));
    },
    filename: (req, file, cb) => {
      let originalName = file.originalname;
      let albumList = db.getData('/albumList');
      let currentAlbum = albumList.filter((albumInfo) => {
        return albumInfo.id === req.params.id;
      })[0];
      let images = currentAlbum && currentAlbum.images;

      if (Array.isArray(images) && images.length) {
        let count = 0;
        let getName = function(fileName) {
          if (~images.findIndex(imgInfo => imgInfo.name === fileName)) {
            // duplicated name, plus 1
            fileName = utils.getBaseName(originalName) + '_' + ++count + path.extname(fileName);
            return getName(fileName);
          } else {
            return fileName;
          }
        };
        cb(null, getName(originalName));
      } else {
        cb(null, originalName);
      }

    }
  }),
  fileFilter: (req, file, cb) => {
    if (utils.isImg(file.originalname)) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  }
});

const profileUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, paths.uploadFolder);
    },
    filename: (req, file, cb) => {
      let originalName = file.originalname;
      let extName = path.extname(originalName);
      let name = ~req.url.indexOf('/changeAvatar') ? 'avatar' : 'bg';
      cb(null, name + extName);
    }
  })
});

let api = express.Router();

function notNeedCertification(req) {
  if (req.method === 'GET') {
    return ~req.url.indexOf('/userProfile') || ~req.url.indexOf('/settings');
  } else {
    return ~req.url.indexOf('/login') || ~req.url.indexOf('/logout')|| ~req.url.indexOf('/changePassword');
  }
}

/*
 rest api
*/
api.use((req, res, next) => {
  // all api path need access grant
  if (notNeedCertification(req)) {
    next();
  } else if (!req.session.isLogined) {
    res.status(401).send(null);
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

  let reqPwd = utils.md5(req.body.password);
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
    let bgPath = path.resolve(paths.uploadFolder, settings.landingBg.url.split('?')[0]);
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
        avatarName = utils.getBaseName(file.filename) + '.jpg';
        let size = sizeOf(file.path);
        let toHeight = Math.min(size.height, thumbHeight);
        let toWidth = size.width / size.height * toHeight;
        let bgThumbPath = path.resolve(paths.uploadFolder, avatarName);
        let readStream = fs.createReadStream(file.path);
        fs.unlinkSync(file.path);
        let prevGifAvatar = path.resolve(paths.uploadFolder, 'avatar.gif');
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
        let prevJpgAvatar = path.resolve(paths.uploadFolder, 'avatar.jpg');
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
  let account;
  try {
    account = db.getData('/account');
  } catch (err) {
    console.log(err);
    res.status(500).json({});
  }

  let reqOldPassword = utils.md5(req.body.oldPassword);
  let reqNewPassword = utils.md5(req.body.newPassword);
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
    console.log(err);
    res.status(500).json({errorText: 'database error.'});
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

});

/* create album */
api.post('/album', (req, res) => {
  let albumName = req.body.name;

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

    // create large folder
    let largeFolderPath = path.resolve(albumPath, 'large');
    fs.mkdirSync(largeFolderPath); // todo, error handler

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
      if (utils.isFile(thisPath)) {
        fs.unlinkSync(thisPath);
      } else if (utils.isDirectory(thisPath)) {
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

api.put('/album/:id/cover', (req, res) => {
  let albumId = req.params.id;
  let imgName = req.body.name;
  if (utils.isImg(imgName)) {
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

/* upload photo */
api.post('/uploadPhoto/:id', upload.single('photo'), (req, res) => {
  let albumId = req.params.id;
  let file = req.file;

  // todo, when filFilter return false.

  // file information
  let size = sizeOf(file.path);
  let photoInfo = {
    name: file.filename,
    size: [size.width, size.height], // todo, save cropped size
    date: fs.statSync(file.path).birthtimeMs
  };

  // create album for photo
  let createAlbum = function() {
    let toHeight = Math.min(size.height, thumbHeight);
    let toWidth = size.width / size.height * toHeight;
    let thumbImgPath = utils.getThumbPath(albumId, file.filename);
    return new Promise((resolve, reject) => {
      gm(file.path)
        .resize(toWidth, toHeight)
        .write(thumbImgPath, (err) => {
          if (err) {
            console.log(err);
            reject(err);
          }
          resolve();
        });
    });
  };

  // crop photo to small size when if necessary
  let cropPhoto = function() {
    let maxWidth = 1500;
    let maxHeight = 1000;
    let photoPath = utils.getPhotoPath(albumId, file.filename);
    return new Promise((resolve, reject) => {
      if (size.width > maxWidth || size.height > maxHeight) {
        let toWidth, toHeight;
        let proportion = size.width / size.height;
        if (proportion < maxWidth / maxHeight) {
          toHeight = maxHeight;
          toWidth = proportion * toHeight;
        } else {
          toWidth = maxWidth;
          toHeight = size.height / size.width * toWidth;
        }

        // save cropped photo
        gm(file.path)
          .resize(toWidth, toHeight)
          .write(photoPath, (err) => {
            if (err) {
              console.log(err);
              reject(err);
            }
            // delete large photo, todo
            // fs.unlinkSync(file.path);
            resolve();
          });
      } else {
        fs.copyFile(file.path, photoPath, resolve);
      }
    });
  };

  // last, save photo info to db
  let updateDB = function() {
    return new Promise((resolve, reject) => {
      let albumList;
      try {
        albumList = db.getData('/albumList');
      } catch (err) {
        console.log(err);
        reject('database error.');
      }
      let albumIndex = albumList.findIndex(info => info.id === albumId);
      let albumInfo = albumList[albumIndex];

      albumInfo.images.unshift(photoInfo);
      if (!albumInfo.cover) {
        albumInfo.cover = file.filename;
      }

      try {
        db.push('/albumList[' + albumIndex + ']', albumInfo);
        resolve(photoInfo);
      } catch (err) {
        console.log(err);
        reject('database error.');
      }
    });
  };

  // if prev three step failed one or more, roll back to delete photo and thumb
  let rollBack = function() {
    // delete large photo
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    // delete thumb
    if (fs.existsSync(utils.getThumbPath(albumId, file.filename))) {
      fs.unlinkSync(utils.getThumbPath(albumId, file.filename));
    }
    // delete cropped photo
    let croppedPath = path.resolve(paths.albumsFolder, albumId, file.filename);
    if (fs.existsSync(croppedPath)) {
      fs.unlinkSync(croppedPath);
    }
    res.status(500).end(); // todo, error text
  };

  // do all
  createAlbum()
    .then(cropPhoto)
    .then(updateDB)
    .then((photoInfo) => {
      // all operation success
      res.json(photoInfo);
    })
    .catch(rollBack);
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

    let photoPath = utils.getPhotoPath(albumId, photoName);
    let thumbPath = utils.getThumbPath(albumId, photoName);
    let largePath = utils.getLargePath(albumId, photoName);
    if (fs.existsSync(photoPath)) {
      fs.unlinkSync(photoPath);
    }
    if (fs.existsSync(thumbPath)) {
      fs.unlinkSync(thumbPath);
    }
    if (fs.existsSync(largePath)) {
      fs.unlinkSync(largePath);
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

module.exports = api;