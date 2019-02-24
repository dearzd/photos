process.env.BABEL_ENV = 'production';
process.env.NODE_ENV = 'production';

const webpack = require('webpack');
const formatWebpackMessages = require('react-dev-utils/formatWebpackMessages');
const config = require('../config/webpack.config');

build();

function build() {
  let compiler = webpack(config);
  compiler.run((err, stats) => {
    if (err) {
      // todo, different with stats.errors
      throw err;
    }

    if (stats.hasErrors()) {
      const messages = formatWebpackMessages(stats.toJson({}, true));
      throw new Error(messages.errors.join('\n\n'));
    }

    // treat warning error
    if (stats.hasWarnings()) {
      const messages = formatWebpackMessages(stats.toJson({}, true));
      throw new Error(messages.warnings.join('\n\n'));
    }

    console.log('build successfully!');
  });
}