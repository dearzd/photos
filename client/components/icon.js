import React, { Component } from 'react';
import PropTypes from 'prop-types';

class Icon extends Component {
  render() {
    const { name, size, className, color } = this.props;

    // read svg from file
    let svg = require('resources/icons/' + name + '.svg');

    if (!svg) {
      return null;
    }

    // produced by svg-children-loader
    const { viewBox, childrenStr } = svg;

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
        dangerouslySetInnerHTML={{__html: childrenStr}}
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