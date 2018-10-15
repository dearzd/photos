const path = require('path');

const appRoot = path.resolve(__dirname, '../');

function resolveApp(dir) {
  return path.resolve(appRoot, dir);
}

module.exports = {
  appClient: resolveApp('client'),
  appServer: resolveApp('server'),
  appPublic: resolveApp('public'),
  appLoaders: resolveApp('loaders'),
  appResources: resolveApp('client/resources'),
  appHtml: resolveApp('client/index.html'),
  appEntryJS: resolveApp('client/entry.js')
};