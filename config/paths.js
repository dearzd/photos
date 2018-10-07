const path = require('path');

const appRoot = path.resolve(__dirname, '../');

function resolveApp(dir) {
  return path.resolve(appRoot, dir);
}

module.exports = {
  appClient: resolveApp('client'),
  appServer: resolveApp('server'),
  appPublic: resolveApp('public'),
  appResources: resolveApp('client/resources'),
  appPackageJson: resolveApp('package.json'),
  appHtml: resolveApp('client/index.html'),
  appEntryJS: resolveApp('client/entry.js'),
  appServerJS: resolveApp('server/server.js')
};