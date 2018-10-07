import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import { uploadPhoto } from 'actions/actions';
import Title from 'components/title';
import Toolbar from 'components/toolbar';
import Icon from 'components/icon';
import Button from 'components/button';
import PhotoPreview from 'components/photoPreview';
import { DIALOGTYPE, dialogHandler } from 'containers/dialog';
import 'style/uploadPhoto.css';

class UploadPhoto extends Component {
  constructor(props) {
    super(props);

    this.state = {
      albumId: props.match.params.id,
      selectedFiles: [],
      percent: []
    };

    this.handlePhotoSelected = this.handlePhotoSelected.bind(this);
    this.handleConfirm = this.handleConfirm.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.onUploadProgress = this.onUploadProgress.bind(this);
    this.goBack = this.goBack.bind(this);
  }

  handlePhotoSelected(e) {
    const files = e.target.files;
    if (files) {
      let selectedFiles = this.state.selectedFiles;
      for (let i = 0, len = files.length; i < len; i ++) {
        selectedFiles.push(files[i]);
      }
      this.setState({
        selectedFiles: selectedFiles
      });
    }
  }

  removeFile(index) {
    let { selectedFiles } = this.state;
    selectedFiles.splice(index, 1);
    this.setState({
      selectedFiles: selectedFiles
    });
  }

  handleConfirm() {
    const { uploadPhoto } = this.props;
    const { albumId, selectedFiles } = this.state;

    uploadPhoto(albumId, selectedFiles, this.onUploadProgress).then(() => {
      dialogHandler.show({
        type: DIALOGTYPE.alert,
        message: selectedFiles.length + ' files uploaded successfully.',
        onConfirm: this.goBack,
      });
    });
  }

  onUploadProgress(index, progressEvent) {
    let { percent } = this.state;
    percent[index] = Math.floor((progressEvent.loaded / progressEvent.total) * 100);
    this.setState({
      percent: percent
    });
  }

  goBack() {
    this.props.history.goBack();
  }

  handleCancel() {
    this.props.history.goBack();
  }

  render() {
    console.log('upload render');
    const { history } = this.props;
    const { selectedFiles, percent } = this.state;
    let toolButtons = [{
      icon: 'ok',
      text: 'Upload',
      onClick: this.handleConfirm,
      disabled: !selectedFiles.length || percent.length
    },{
      icon: 'close',
      text: 'Cancel',
      onClick: this.handleCancel
    }];

    return (
      <Title title={'Photos - ' + this.state.albumId + ' - upload'}>
        <div>
          <Toolbar buttons={toolButtons} history={history}/>
          <div id="upload-photo" className="main">
            <Button type="file" text="Select Photo" icon="add" className="upload-photo-button" onChange={this.handlePhotoSelected} multiple={true} />
            {
              <div id="upload-preview">
                {
                  selectedFiles.map((file, index) => {
                    return (
                      <div className="preview" key={file.name}>
                          <span className="preview-remove" onClick={this.removeFile.bind(this, index)}>
                            { !percent.length ? <Icon name="close" /> : null }
                          </span>
                        <PhotoPreview file={file} />
                        {
                          percent[index] !== 100 ?
                            <div className="progress-bar">
                              <div className="upload-percent" style={{width: (percent[index] || 0) + '%'}} />
                            </div>
                            :
                            <Icon name="ok" className="upload-success-icon" />
                        }
                        <div className="ellipsis">{file.name}</div>
                      </div>
                    );
                  })
                }
              </div>
            }
          </div>
        </div>
      </Title>
    );
  }
}

UploadPhoto.propTypes = {
  uploadPhoto: PropTypes.func,
  history: PropTypes.object,
  match: PropTypes.object
};

const mapDispatchToProps = {
  uploadPhoto
};

export default connect(null, mapDispatchToProps)(UploadPhoto);