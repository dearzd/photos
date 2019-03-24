import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import update from 'immutability-helper';
import {fetchAlbum, changeAlbumName, deleteAlbum, setCover, deletePhotos} from 'actions/actions';
import Title from 'components/title';
import Toolbar from 'components/toolbar';
import PhotoView from 'components/photoView';
import PhotoMaxView from 'components/photoMaxView';
import Icon from 'components/icon';
import {DIALOGTYPE, dialogHandler} from 'containers/dialog';
import commonUtil from 'utils/commonUtil';
import 'style/albumDetail.css';

const photoViewHeight = 256;
const photoMargin = 12;

class AlbumDetail extends Component {
	constructor(props) {
		super(props);

		this.state = {
			albumId: props.match.params.id,
			albumIndex: this.getAlbumIndex(),
			photoCount: 0,
			availableWidth: 0,
			computedWidth: null,
			selectMode: false,
			selectedIndex: [],
			currentIndex: -1
		};

		this.container = null;

		this.computeSize = this.computeSize.bind(this);
		this.handleWindowResize = this.handleWindowResize.bind(this);
		this.handleGetLink = this.handleGetLink.bind(this);
		this.handleAddPhoto = this.handleAddPhoto.bind(this);
		this.handleDeleteAlbumClick = this.handleDeleteAlbumClick.bind(this);
		this.handleSelectPhoto = this.handleSelectPhoto.bind(this);
		this.handleDeletePhotoClick = this.handleDeletePhotoClick.bind(this);
		this.handleSetCover = this.handleSetCover.bind(this);
		this.switchSelectMode = this.switchSelectMode.bind(this);
		this.onConfirmDeletePhoto = this.onConfirmDeletePhoto.bind(this);
		this.onConfirmDeleteAlbum = this.onConfirmDeleteAlbum.bind(this);
		this.intoMaxView = this.intoMaxView.bind(this);
		this.outMaxView = this.outMaxView.bind(this);
		this.handleKeyUp = this.handleKeyUp.bind(this);
		this.editName = this.editName.bind(this);
	}

	componentDidMount() {
		if (!AlbumDetail.getCurrentAlbum(this.props, this.state)) {
			this.props.fetchAlbum(this.state.albumId);
		} else if (!this.state.computedWidth) {
			this.computeSize();
		}
		document.body.addEventListener('keyup', this.handleKeyUp);
		window.addEventListener('resize', this.handleWindowResize);
	}

	componentWillUnmount() {
		document.body.removeEventListener('keyup', this.handleKeyUp);
		window.removeEventListener('resize', this.handleWindowResize);
	}

	static getDerivedStateFromProps(props, state) {
		let currentAlbum = AlbumDetail.getCurrentAlbum(props, state);
		if (currentAlbum && currentAlbum.images.length !== state.photoCount) {
			// if photo count changed, delete computedWidth to re-compute in componentDidUpdate
			return {
				computedWidth: null
			};
		}

		return null;
	}

	shouldComponentUpdate(nextProps, nextState) {
		if (nextProps !== this.props) {
			return true;
		}
		// if only selectedIndex changed, not re-render
		let keys = Object.keys(nextState);
		for (let key of keys) {
			if (key === 'selectedIndex') {
				if (nextState[key].length === 1 || nextState[key].length === 2) {
					// selectedIndex.length from 0 to 1 or from 1 to 2/0, toolbar buttons will update
					return true;
				} else {
					// otherwise, only selectedIndex.length change, not re-render
					continue;
				}
			}
			if (this.state[key] !== nextState[key]) {
				return true;
			}
		}
		return false;
	}

	componentDidUpdate() {
		if (!this.state.computedWidth) {
			// after fetch photos
			this.computeSize();
		} else {
			let currentAlbum = AlbumDetail.getCurrentAlbum(this.props, this.state);
			if (currentAlbum && currentAlbum.images.length !== this.state.photoCount) {
				// after delete photos
				this.computeSize();
			}
		}
	}

	static getCurrentAlbum(props, state) {
		const {albums} = props;
		const {albumIndex} = state;

		let currentAlbum = null;
		if (albums) {
			currentAlbum = albums[albumIndex];
		}

		if (!(currentAlbum && currentAlbum.images)) {
			return null;
		}

		return currentAlbum;
	}

	scaleWidth(imgInfo) {
		return imgInfo.size[0] / imgInfo.size[1] * photoViewHeight;
	}

	computeSize() {
		let currentAlbum = AlbumDetail.getCurrentAlbum(this.props, this.state);
		if (currentAlbum && currentAlbum.images.length) {
			// scale up image line by line according to availableSize
			let images = currentAlbum.images;
			let availableWidth = this.container.clientWidth;
			let computedWidth = [];

			let firstImgInitWidth = this.scaleWidth(images[0]);
			let oneLineWidthArr = [].concat(firstImgInitWidth);
			let lineTotal = firstImgInitWidth;
			let i, len;
			for (i = 1, len = images.length; i < len; i++) {
				let thisInitW = this.scaleWidth(images[i]);

				if (lineTotal + thisInitW + photoMargin < availableWidth) {
					// in one line
					oneLineWidthArr.push(thisInitW);
					lineTotal += thisInitW + photoMargin;
				} else {
					let restWidth = availableWidth - lineTotal;
					let everyRest = restWidth / oneLineWidthArr.length;

					// dispatch rest width to every photo
					oneLineWidthArr = oneLineWidthArr.map((w) => {
						return (w + everyRest).toFixed(2) - 0;
					});
					computedWidth.push(...oneLineWidthArr);

					// new line init
					oneLineWidthArr = [].concat(thisInitW);
					lineTotal = thisInitW;
				}
			}
			// last line
			if (lineTotal > availableWidth) {
				// if only has one photo, and width is larger than availableWidth
				oneLineWidthArr[0] += (availableWidth - lineTotal);
			}
			computedWidth.push(...oneLineWidthArr);

			this.setState({
				photoCount: images.length,
				availableWidth: availableWidth,
				computedWidth: computedWidth
			});
		} else {
			this.setState({
				photoCount: 0,
				computedWidth: []
			});
		}
	}

	handleWindowResize() {
		if (this.container.clientWidth !== this.state.availableWidth) {
			commonUtil.ticktock.stop('reComputePhotoViewSize');
			commonUtil.ticktock.start('reComputePhotoViewSize', this.computeSize, 50);
		}
	}

	getAlbumIndex() {
		const {albums} = this.props;
		let albumId = this.props.match.params.id;
		if (albums) {
			return albums.findIndex(info => info.id === albumId);
		} else {
			return 0;
		}
	}


	getSelectedNames() {
		const {selectedIndex} = this.state;
		let images = AlbumDetail.getCurrentAlbum(this.props, this.state).images;
		return selectedIndex.map(index => images[index].name);
	}

	handleAddPhoto() {
		this.props.history.push('/uploadPhoto/' + this.state.albumId);
	}

	switchSelectMode(mode) {
		const {selectMode} = this.state;
		if (!mode || selectMode) {
			// cancel select mode
			this.setState({
				selectMode: false,
				selectedIndex: []
			});
		} else {
			// into select mode
			this.setState({
				selectMode: true
			});
		}
	}

	handleKeyUp(e) {
		if (e.keyCode === 27 && this.state.selectMode) {
			this.switchSelectMode();
		}
	}

	handleGetLink() {
		let images = this.getSelectedNames();
		let links = images.map(name => window.location.origin + commonUtil.getPhotoUrl(this.state.albumId, name));
		dialogHandler.show({
			type: DIALOGTYPE.link,
			message: 'Link address:',
			links: links,
			onConfirm: () => this.switchSelectMode(false)
		});
	}

	handleSetCover() {
		let name = this.getSelectedNames()[0];
		this.props.setCover(this.state.albumId, name).then(() => {
			this.setState({
				selectedIndex: [],
				selectMode: false
			});
		});
	}

	handleDeletePhotoClick() {
		dialogHandler.show({
			type: DIALOGTYPE.confirm,
			message: 'Delete These?',
			onConfirm: this.onConfirmDeletePhoto
		});
	}

	handleDeleteAlbumClick() {
		dialogHandler.show({
			type: DIALOGTYPE.confirm,
			message: 'Delete album will delete all photos, confirm?',
			onConfirm: this.onConfirmDeleteAlbum
		});
	}

	onConfirmDeletePhoto() {
		const {albumId} = this.state;
		let names = this.getSelectedNames();
		this.props.deletePhotos(albumId, names).then(() => {
			this.setState({
				selectedIndex: [],
				selectMode: false
			});
		});
	}

	onConfirmDeleteAlbum() {
		const {deleteAlbum, history} = this.props;
		deleteAlbum(this.state.albumId).then(() => {
			history.push('/');
		});
	}

	handleSelectPhoto(imgIndex, checked) {
		let selectedIndex = this.state.selectedIndex;

		if (checked) {
			// add to selected array
			selectedIndex = update(selectedIndex, {
				$push: [imgIndex]
			});
		} else {
			// clear from selected array
			let index = selectedIndex.findIndex(n => n === imgIndex);
			if (~index) {
				selectedIndex = update(selectedIndex, {$splice: [[index, 1]]});
			}
		}

		this.setState({
			selectedIndex: selectedIndex,
			selectMode: selectedIndex.length > 0
		});
	}

	intoMaxView(index) {
		this.setState({
			currentIndex: index
		});
	}

	outMaxView() {
		this.setState({
			currentIndex: -1
		});
	}

	editName() {
		dialogHandler.show({
			type: DIALOGTYPE.prompt,
			message: 'Type new album name:',
			onConfirm: this.props.changeAlbumName.bind(this, this.state.albumId)
		});
	}

	getButtons() {
		let toolButtons;
		if (!this.state.selectMode) {
			toolButtons = [{
				icon: 'add',
				text: 'Add Photos',
				onClick: this.handleAddPhoto
			}, {
				icon: 'select',
				text: 'Select',
				onClick: this.switchSelectMode
			}, {
				icon: 'delete',
				text: 'Delete Album',
				onClick: this.handleDeleteAlbumClick
			}];
		} else {
			toolButtons = [{
				icon: 'link',
				text: 'Get Address',
				onClick: this.handleGetLink,
				disabled: !this.state.selectedIndex.length
			}, {
				icon: 'favorites',
				text: 'Set Cover',
				onClick: this.handleSetCover,
				disabled: this.state.selectedIndex.length !== 1
			}, {
				icon: 'delete',
				text: 'Delete Photos',
				onClick: this.handleDeletePhotoClick,
				disabled: !this.state.selectedIndex.length
			}, {
				icon: 'close',
				text: 'Cancel',
				onClick: this.switchSelectMode
			}];
		}

		return toolButtons;
	}

	render() {
		const {albumId, currentIndex, selectMode, computedWidth} = this.state;
		let currentAlbum = AlbumDetail.getCurrentAlbum(this.props, this.state);

		if (!currentAlbum) {
			return null;
		}

		let toolButtons = this.getButtons();

		let classNames = ['main'];
		if (selectMode) {
			classNames.push('select-mode');
		}

		return (
			<Title title={'Photos - ' + currentAlbum.name}>
				<div>
					<Toolbar buttons={toolButtons} history={this.props.history}/>
					<div
						id="album-detail"
						className={classNames.join(' ')}
						style={{opacity: !computedWidth ? 0 : null}}
						ref={c => this.container = c}
					>
						<h1 className="page-title">
							{currentAlbum.name}
							{
								!selectMode ?
									<span className="edit-album-name" onClick={this.editName}>
                    <Icon name="edit" className="edit-icon" color="#999"/>
                  </span>
									: null
							}
						</h1>
						<div className="album-photos">
							{
								currentAlbum.images.map((imgInfo, imgIndex) => {
									return (
										<PhotoView
											key={imgInfo.name}
											width={computedWidth ? computedWidth[imgIndex] : this.scaleWidth(imgInfo)}
											height={photoViewHeight}
											albumId={albumId}
											imgName={imgInfo.name}
											imgIndex={imgIndex}
											selectMode={selectMode}
											onSelect={this.handleSelectPhoto}
											onClick={this.intoMaxView}/>
									);
								})
							}
						</div>
						{
							~currentIndex ?
								<PhotoMaxView
									albumId={albumId}
									images={currentAlbum.images}
									currentIndex={currentIndex}
									onExit={this.outMaxView}/>
									: null
						}
					</div>
				</div>
			</Title>
		);
	}
}

AlbumDetail.propTypes = {
	albums: PropTypes.array,
	fetchAlbum: PropTypes.func,
	changeAlbumName: PropTypes.func,
	deleteAlbum: PropTypes.func,
	deletePhotos: PropTypes.func,
	setCover: PropTypes.func,
	history: PropTypes.object,
	match: PropTypes.object
};

const mapStateToProps = state => {
	return {
		albums: state.albums
	};
};

const mapDispatchToProps = {
	fetchAlbum,
	changeAlbumName,
	deleteAlbum,
	deletePhotos,
	setCover
};

export default connect(mapStateToProps, mapDispatchToProps)(AlbumDetail);
