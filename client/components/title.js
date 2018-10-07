import React, { Component } from 'react';
import PropTypes from 'prop-types';

class Title extends Component {
  componentDidMount() {
    document.title = this.props.title;
  }

  render() {
    return React.Children.only(this.props.children);
  }
}

Title.propTypes = {
  title: PropTypes.string,
  children: PropTypes.object
};

export default Title;