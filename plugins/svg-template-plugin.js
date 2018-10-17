const fs = require('fs');
const path = require('path');
const SVGO =require('svgo');

class SVGTemplatePlugin {
  constructor(options) {
    this.options = options;
    this.svgo = new SVGO({
      plugins: [
        {removeTitle: true},
        {removeStyleElement: true},
        {removeAttrs: {attrs: '(stroke|fill|class)'}},
        {removeDimensions: true},
        {removeUselessDefs: true},
        {removeViewBox: false},
        {convertPathData: true}
      ]
    });
  }

  apply(compiler) {
    if (compiler.hooks) {
      compiler.hooks
        .emit.tap('SVGTemplatePlugin', () => {
        this.packageIcons(compiler.options.output.path);
      });
    } else {
      compiler.plugin('emit', (compilation, callback) => {
        this.packageIcons(compiler.options.output.path).then(() => {
          callback();
        }, (error) => {
          throw new Error(error);
        });
      });
    }
  }

  packageIcons(outputPath) {
    return new Promise((resolve, reject) => {
      if (!fs.existsSync(this.options.template)) {
        reject();
      }

      let files = fs.readdirSync(this.options.iconsFolder);
      let html = fs.readFileSync(this.options.template, {encoding: 'utf-8'});
      let promises = [];
      let filesStr = [];
      files.forEach((name) => {
        if (this.isSVG(name)) {
          let svgStr = fs.readFileSync(path.resolve(this.options.iconsFolder, name), {encoding: 'utf-8'});
          promises.push(
            this.svgo.optimize(svgStr).then((result) => {
              filesStr.push(this.wrapSVG(result.data, name));
            })
          );
        }
      });

      Promise.all(promises).then(() => {
        html = html.replace('<--holder-->', filesStr.join(''));

        let output = path.resolve(outputPath, this.options.filename);

        fs.writeFileSync(output, html, {encoding: 'utf-8'});

        resolve();
      }).catch((error) => {
        reject(error);
      });
    });
  }

  isSVG(name) {
    return path.extname(name).toLowerCase() === '.svg';
  }

  wrapSVG(svgStr, name) {
    return '' +
      '<div class="svg-wrapper">' +
        svgStr +
        '<div>' +
          path.basename(name, path.extname(name)) +
        '</div>' +
      '</div>';
  }
}

module.exports = SVGTemplatePlugin;