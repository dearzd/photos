import React, { Component } from 'react';
import PropTypes from 'prop-types';

class Icon extends Component {
  render() {
    const { name, size, className, color } = this.props;

    // read svg from file
    let svgStr = require('resources/icons/' + name + '.svg');

    if (!svgStr) {
      return null;
    }

    // find svg child html
    let startMatch = /<svg(\s|\S)*?>/.exec(svgStr);
    let endMatch = /<\/svg>/.exec(svgStr);
    let svgChildren = svgStr.substr(startMatch.index + startMatch[0].length, endMatch.index);

    // find svg viewBox attribute
    let viewBoxMatch = /viewBox="((\d|\D)*?)"/.exec(startMatch[0]);
    let viewBox = viewBoxMatch && viewBoxMatch[1];

    // init and external classNames
    let classNames = ['icon'];
    if (className) {
      classNames.push(className);
    }

    return (
      <svg
        viewBox={viewBox}
        width={size}
        height={size}
        className={classNames.join(' ')}
        fill={color}
        dangerouslySetInnerHTML={{__html: svgChildren}}
      />
    );
  }
}

Icon.defaultProps = {
  size: 16
};

Icon.propTypes = {
  name: PropTypes.string,
  size: PropTypes.number,
  className: PropTypes.string,
  color: PropTypes.string
};

export default Icon;