const path = require('path');

const root = path.resolve(__dirname, '../');

function resolveApp(dir) {
	return path.resolve(root, dir);
}

module.exports = {
	appClient: resolveApp('src/client'),
	appServer: resolveApp('src/server'),
	appBuild: resolveApp('dist'),
	appResources: resolveApp('src/client/resources'),
	appHtml: resolveApp('src/client/index.html'),
	appEntryJS: resolveApp('src/client/entry.js')
};
