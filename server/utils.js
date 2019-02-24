const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const {
  supportTypes,
  paths,
  md5Key
} = require('./serverConf');

function md5(data) {
  let hmac = crypto.createHmac('md5', md5Key);
  return hmac.update(data).digest('base64');
}

function getHomePage() {
  return fs.readFileSync(path.resolve(paths.webHome, 'index.html'));
}

function getBaseName(photoName) {
  return path.basename(photoName, path.extname(photoName));
}

function getPhotoPath(albumId, photoName) {
  return path.resolve(paths.albumsFolder, albumId, photoName);
}

function getThumbPath(albumId, photoName) {
  let thumbName = getBaseName(photoName) + '.jpg';
  return path.resolve(paths.albumsFolder, albumId, 'thumb', thumbName);
}

function getLargePath(albumId, photoName) {
  return path.resolve(paths.albumsFolder, albumId, 'large', photoName);
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

module.exports = {
  md5,
  getHomePage,
  getBaseName,
  getPhotoPath,
  getThumbPath,
  getLargePath,
  isFile,
  isImg,
  isHiddenItem
};