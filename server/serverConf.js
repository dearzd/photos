const port = 3000;
const supportTypes = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.ico', '.svg']; // todo, change to mimitype
const thumbHeight = 512;
const paths = {
  webHome: '../public',
  albumsFolder: '../public/albums'
};
const md5Key = 'P,h,oto,s';

module.exports = {
  port,
  supportTypes,
  thumbHeight,
  paths,
  md5Key
};