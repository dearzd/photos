import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {uploadPhotos} from 'actions/actions';
import Title from 'components/title';
import Toolbar from 'components/toolbar';
import Icon from 'components/icon';
import Button from 'components/button';
import PhotoPreview from 'components/photoPreview';
import {DIALOGTYPE, dialogHandler} from 'containers/dialog';
import 'style/uploadPhoto.css';

class UploadPhoto extends Component {
	constructor(props) {
		super(props);

		this.state = {
			albumId: props.match.params.id,
			selectedFiles: [],
			percent: [],
			completed: []
		};

		this.handlePhotoSelected = this.handlePhotoSelected.bind(this);
		this.handleConfirm = this.handleConfirm.bind(this);
		this.handleCancel = this.handleCancel.bind(this);
		this.onUploadProgress = this.onUploadProgress.bind(this);
		this.onSuccess = this.onSuccess.bind(this);
		this.onFailed = this.onFailed.bind(this);
		this.goBack = this.goBack.bind(this);
	}

	handlePhotoSelected(e) {
		const files = e.target.files;
		if (files) {
			let selectedFiles = this.state.selectedFiles;
			for (let i = 0, len = files.length; i < len; i++) {
				selectedFiles.push(files[i]);
			}
			this.setState({
				selectedFiles: selectedFiles
			});
		}
	}

	removeFile(index) {
		let {selectedFiles} = this.state;
		selectedFiles.splice(index, 1);
		this.setState({
			selectedFiles: selectedFiles
		});
	}

	handleConfirm() {
		const {uploadPhotos} = this.props;
		const {albumId, selectedFiles} = this.state;

		uploadPhotos(albumId, selectedFiles, this.onUploadProgress, this.onSuccess, this.onFailed).then(() => {
			const {completed} = this.state;
			let failedCount = completed.filter(item => item === false).length;
			dialogHandler.show({
				type: DIALOGTYPE.alert,
				message: (selectedFiles.length - failedCount) + ' files success.\n' + failedCount + ' files failed.',
				onConfirm: this.goBack,
			});
		});
	}

	onUploadProgress(index, progressEvent) {
		let {percent} = this.state;
		percent[index] = Math.floor((progressEvent.loaded / progressEvent.total) * 100);
		this.setState({
			percent: percent
		});
	}

	onSuccess(index) {
		let {completed} = this.state;
		completed[index] = true;
		this.setState({
			completed: completed
		});
	}

	onFailed(index) {
		let {completed} = this.state;
		completed[index] = false;
		this.setState(({
			completed: completed
		}));
	}

	goBack() {
		this.props.history.goBack();
	}

	handleCancel() {
		this.props.history.goBack();
	}

	getCompleteIcon(index) {
		const {completed} = this.state;
		if (completed[index] === true) {
			return <Icon name="ok" className="upload-complete-icon"/>;
		} else if (completed[index] === false) {
			return <Icon name="close" className="upload-complete-icon"/>;
		} else {
			return null;
		}
	}

	render() {
		const {history} = this.props;
		const {selectedFiles, percent} = this.state;
		let toolButtons = [{
			icon: 'ok',
			text: 'Upload',
			onClick: this.handleConfirm,
			disabled: !selectedFiles.length || percent.length
		}, {
			icon: 'close',
			text: 'Cancel',
			onClick: this.handleCancel
		}];

		return (
			<Title title={'Photos - ' + this.state.albumId + ' - upload'}>
				<div>
					<Toolbar buttons={toolButtons} history={history}/>
					<div id="upload-photo" className="main">
						<Button type="file" text="Select Photo" icon="add" className="upload-photo-button"
										onChange={this.handlePhotoSelected} multiple={true}/>
						{
							<div id="upload-preview">
								{
									selectedFiles.map((file, index) => {
										return (
											<div className="preview" key={file.name}>
												<span className="preview-remove" onClick={this.removeFile.bind(this, index)}>
													{!percent.length ? <Icon name="close"/> : null}
												</span>
												<PhotoPreview file={file}/>
												{
													this.getCompleteIcon(index) ||
													<div className="progress-bar">
														<div className="upload-percent" style={{width: (percent[index] || 0) + '%'}}/>
													</div>
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
	uploadPhotos: PropTypes.func,
	history: PropTypes.object,
	match: PropTypes.object
};

const mapDispatchToProps = {
	uploadPhotos
};

export default connect(null, mapDispatchToProps)(UploadPhoto);
