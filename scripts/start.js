process.env.BABEL_ENV = 'development';
process.env.NODE_ENV = 'development';

const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const openBrowser = require('react-dev-utils/openBrowser');

const config = require('../config/webpack.config.dev');

const compiler = webpack(config);
const serverConfig = Object.assign({}, config.devServer);

const server = new WebpackDevServer(compiler, serverConfig);

const protocol = 'http';
const host = 'localhost';
const port = 9090;

server.listen(port, host, () => {
  console.log('Starting dev server on http://localhost:9090');
  let url = protocol + '://' + host + ':' + port;
  openBrowser(url);
});