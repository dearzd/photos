const loaderUtils = require('loader-utils');

module.exports = function (source) {
  const options = loaderUtils.getOptions(this);
  let svgStr = source;

  // find svg child html
  let startMatch = /<svg(\s|\S)*?>/.exec(svgStr);
  let endMatch = /<\/svg>/.exec(svgStr);
  let svgChildren = svgStr.substr(startMatch.index + startMatch[0].length, endMatch.index);

  let svg = {
    svgChildren: svgChildren
  };

  // extract attributes of svg element
  if (options) {
    let { extractAttributes } = options;
    if (Array.isArray(extractAttributes)) {
      extractAttributes.forEach(function(attrName) {
        let attrMatch = new RegExp(attrName + '="((\\d|\\D)*?)"').exec(startMatch[0]);
        svg[attrName] = attrMatch && attrMatch[1];
      });
    }
  }

  return 'module.exports = ' + JSON.stringify(svg);
};