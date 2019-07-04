import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';
import {connect} from 'react-redux';
import {fetchAlbums, createAlbum} from 'actions/actions';
import {DIALOGTYPE, dialogHandler} from 'containers/dialog';
import Title from 'components/title';
import Toolbar from 'components/toolbar';
import commonUtil from 'utils/commonUtil';
import 'style/albumList.css';

class AlbumList extends Component {
	constructor(props) {
		super(props);

		this.handleCreateAlbumClick = this.handleCreateAlbumClick.bind(this);
		this.handleConfirmCreate = this.handleConfirmCreate.bind(this);
	}

	componentDidMount() {
		if (!this.props.listFetched) {
			// fetch albums list from server
			this.props.fetchAlbums();
		} else {
			// just clear currentId
		}
	}

	handleCreateAlbumClick() {
		dialogHandler.show({
			type: DIALOGTYPE.prompt,
			message: 'Type album name:',
			onConfirm: this.handleConfirmCreate
		});
	}

	handleConfirmCreate(name) {
		if (name) {
			this.props.createAlbum(name).then((id) => {
				this.props.history.push('/albums/' + id);
			});
		} else {
			dialogHandler.show({
				type: DIALOGTYPE.alert,
				message: 'Album name invalid.'
			});
		}
	}

	render() {
		const {albums} = this.props;

		if (!albums) {
			return null;
		}

		let toolButtons = [{
			id: 'createAlbum',
			icon: 'add',
			text: 'Create Album',
			onClick: this.handleCreateAlbumClick,
			className: 'create-button'
		}];

		return (
			<Title title="Photos - Album List">
				<div>
					<Toolbar buttons={toolButtons} history={this.props.history}/>
					<div id="album-list" className="main">
						<h1 className="page-title">Albums</h1>
						{
							albums.map((folderInfo, index) => {
								let backgroundUrl = '';
								if (folderInfo.cover) {
									backgroundUrl += 'url("' + commonUtil.getPhotoUrl(folderInfo.id, folderInfo.cover) + '")';
								}
								return (
									<Link className="album-wrap" key={index} to={'/albums/' + folderInfo.id}>
										<div className="album-cover-wrapper">
											<div className="album-cover" style={{'backgroundImage': backgroundUrl}}/>
										</div>
										<div className="album-info">
											{folderInfo.name + ' (' + folderInfo.count + ' items)'}
											<div className="album-date">
												{new Date(folderInfo.creationDate).toDateString()}
											</div>
										</div>
									</Link>
								);
							})
						}
					</div>
				</div>
			</Title>
		);
	}
}

AlbumList.propTypes = {
	listFetched: PropTypes.bool,
	albums: PropTypes.array,
	fetchAlbums: PropTypes.func,
	createAlbum: PropTypes.func,
	history: PropTypes.object
};

const mapStateToProps = state => {
	return {
		listFetched: state.listFetched,
		albums: state.albums
	};
};

const mapDispatchToProps = {
	fetchAlbums,
	createAlbum
};

export default connect(mapStateToProps, mapDispatchToProps)(AlbumList);
