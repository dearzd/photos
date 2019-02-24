import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Button from 'components/button';
import { DIALOGTYPE, dialogHandler } from 'containers/dialog';

class ChangeAvatar extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedFile: null,
      fileBase64: null,
      percent: 0
    };

    this.handlePhotoSelected = this.handlePhotoSelected.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.onUploadProgress = this.onUploadProgress.bind(this);
  }

  handlePhotoSelected(e) {
    let file = e.target.files[0];
    if (file) {
      let me = this;
      let fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.onload = function() {
        me.setState({
          selectedFile: file,
          fileBase64: this.result
        });
      };
    }
  }

  handleSubmit() {
    //e.preventDefault();
    const { changeAvatar, history } = this.props;
    const { selectedFile } = this.state;
    changeAvatar(selectedFile, this.onUploadProgress).then(() => {
      // success
      dialogHandler.show({
        type: DIALOGTYPE.alert,
        message: 'Avatar changed successfully.',
        onConfirm: () => {
          history.goBack();
        }
      });
    });
  }

  handleCancel(e) {
    e.preventDefault();
    this.props.onCancel();
  }

  onUploadProgress(progressEvent) {
    this.setState({
      percent: Math.floor((progressEvent.loaded / progressEvent.total) * 100)
    });
  }

  render() {
    const { userProfile } = this.props;
    const { fileBase64, percent } = this.state;
    let bg = null;
    if (userProfile.avatar || fileBase64) {
      bg = 'url(';
      bg += fileBase64 || userProfile.avatar;
      bg += ')';
    }
    return (
      <div id="change-avatar" className="landing-body">
        <div className="middle">
          <div className="avatar" style={{backgroundImage: bg}} />
          <div className="progress-bar">
            <div className="upload-percent" style={{width: (percent || 0) + '%'}} />
          </div>
        </div>
        <h1>Change avatar</h1>
        <div className="landing-buttons">
          <Button type="file" text="Select Photo" icon="add" className="btn-landing"  onChange={this.handlePhotoSelected} />
          {
            fileBase64 ?
              <Button text="Ok" icon="ok" className="btn-landing" onClick={this.handleSubmit} />
              : null
          }
          <Button className="btn-landing btn-landing-cancel" text="Cancel" onClick={this.handleCancel} />
        </div>
      </div>
    );
  }
}

ChangeAvatar.propTypes = {
  userProfile: PropTypes.object,
  changeAvatar: PropTypes.func,
  onCancel: PropTypes.func,
  history: PropTypes.object
};

export default ChangeAvatar;