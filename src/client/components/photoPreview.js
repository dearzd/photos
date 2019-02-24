import React, { Component } from 'react';
import PropTypes from 'prop-types';

class PhotoPreview extends Component {
  constructor(props) {
    super(props);

    this.state = {
      fileBase64: null
    };
  }

  componentDidMount() {
    const { file } = this.props;
    let me = this;
    let fileReader = new FileReader();
    fileReader.readAsDataURL(file);
    fileReader.onload = function() {
      me.setState({
        fileBase64: this.result
      });
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    return this.state !== nextState;
  }

  render() {
    const { fileBase64 } = this.state;
    if (!fileBase64) {
      return null;
    }
    return (
      <div className="preview-wrapper">
        <img src={fileBase64} />
      </div>
    );
  }
}

PhotoPreview.propTypes = {
  file: PropTypes.object
};

export default PhotoPreview;