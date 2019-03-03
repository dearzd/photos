import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Checkbox from './checkbox';
import commonUtil from 'utils/commonUtil';

class PhotoView extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selected: false
    };

    this.handleSelect = this.handleSelect.bind(this);
    this.handlePhotoClick = this.handlePhotoClick.bind(this);
  }

  static getDerivedStateFromProps(props, state) {
    // if out select mode , clear select state
    if (!props.selectMode && state.selected) {
      return {
        selected: false
      };
    } else {
      return null;
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return this.props.width !== nextProps.width || this.state !== nextState;
  }

  handleSelect(checked) {
    this.setState({selected: checked});
    this.props.onSelect(this.props.imgIndex, checked);
  }

  handlePhotoClick() {
    if (this.props.selectMode) {
      this.handleSelect(!this.state.selected);
    } else {
      this.props.onClick(this.props.imgIndex);
    }
  }

  render() {
    const { width, height, albumId, imgName } = this.props;
    let photoUrl = commonUtil.getThumbUrl(albumId, imgName);
    let bg = 'url("' + photoUrl + '")';
    return (
      <div style={{width: width, height: height}} className={'photo-view' + (this.state.selected ? ' selected' : '')} onClick={this.handlePhotoClick}>
        <div style={{backgroundImage: bg}} className="photo-view-bg" />
        <Checkbox className="img-checkbox" checked={this.state.selected} onClick={this.handleSelect} />
      </div>
    );
  }
}

PhotoView.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  albumId: PropTypes.string,
  imgName: PropTypes.string,
  imgIndex: PropTypes.number,
  selectMode: PropTypes.bool,
  onSelect: PropTypes.func,
  onClick: PropTypes.func
};

export default PhotoView;