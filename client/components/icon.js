import React, { Component } from 'react';
import PropTypes from 'prop-types';
// import svg icon
importAll(require.context('resources/', false, /\.svg$/));

function importAll(r) {
  r.keys().forEach(r);
}

class Icon extends Component {
  render() {
    const { name, size, className, color } = this.props;
    let classNames = ['icon'];
    if (className) {
      classNames.push(className);
    }
    return (
      <svg width={size} height={size} className={classNames.join(' ')} fill={color}>
        <use xlinkHref={'#symbol-' + name} />
      </svg>
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