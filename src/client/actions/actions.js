import restAPI from 'utils/restAPI';

export const FETCH_ALBUMS = 'FETCH_ALBUMS';
export const FETCH_ALBUM_DETAIL_SUCCESS = 'FETCH_ALBUM_DETAIL_SUCCESS';
export const CREATE_ALBUM_SUCCESS = 'CREATE_ALBUM_SUCCESS';
export const CHANGE_ALBUM_NAME_SUCCESS = 'CHANGE_ALBUM_NAME_SUCCESS';
export const DELETE_ALBUM_SUCCESS = 'DELETE_ALBUM_SUCCESS';
export const UPLOAD_PHOTO_COMPLETE = 'UPLOAD_PHOTO_COMPLETE';
export const DELETE_PHOTOS_SUCCESS = 'DELETE_PHOTOS_SUCCESS';
export const SET_COVER_SUCCESS = 'SET_COVER_SUCCESS';

export const fetchAlbums = () => {
	// thunk action creators with function
	return (dispatch) => {
		return restAPI.get('/albums').then((res) => {
			dispatch({type: FETCH_ALBUMS, payload: res.data});
		});
	};
};

export const createAlbum = (albumName) => {
	return (dispatch) => {
		return restAPI.post('/albums', {name: albumName}).then((res) => {
			dispatch({type: CREATE_ALBUM_SUCCESS, payload: res.data});
			return res.data.id; // return id for redirect
		});
	};
};

export const fetchAlbum = (id) => {
	return (dispatch) => {
		return restAPI.get('/albums/' + id).then((res) => {
			dispatch({type: FETCH_ALBUM_DETAIL_SUCCESS, payload: res.data});
		});
	};
};

export const changeAlbumName = (id, albumName) => {
	return (dispatch) => {
		return restAPI.put('/albums/' + id, {name: albumName}).then(() => {
			dispatch({type: CHANGE_ALBUM_NAME_SUCCESS, payload: {albumId: id, albumName: albumName}});
		});
	};
};

export const deleteAlbum = (id) => {
	return (dispatch) => {
		return restAPI.delete('/albums/' + id).then(() => {
			dispatch({type: DELETE_ALBUM_SUCCESS, payload: {albumId: id}});
		});
	};
};

export const setCover = (id, imgName) => {
	return (dispatch) => {
		return restAPI.put('/albums/' + id + '/cover', {name: imgName}).then(() => {
			dispatch({type: SET_COVER_SUCCESS, payload: {albumId: id, imgName: imgName}});
		});
	};
};

export const uploadPhotos = (id, files, onUploadProgress, onSuccess, onFailed) => {
	return (dispatch) => {
		let count = files.length;
		let succeeded = [];
		let parallelCount = Math.min(count, 5);

		let doUpload = function (index) {
			let file = files[index];
			let formData = new FormData();
			formData.append('photo', file);

			let config = {
				onUploadProgress: (progressEvent) => {
					onUploadProgress(index, progressEvent);
				},
				hideLoading: true,
				hideError: true
			};

			return restAPI.post('/uploadPhoto/' + id, formData, config).then((res) => {
				succeeded.push(res.data);
				onSuccess(index);
			}, () => {
				onFailed(index);
			});
		};

		return new Promise((resolve) => {
			let nextUploadIndex = 0;
			let done = 0;

			// up to 5 photos in uploading at a same time
			let sequenceUpload = function () {
				if (nextUploadIndex < count) {
					// upload next file
					doUpload(nextUploadIndex).then(() => {
						done++;
						sequenceUpload();
					});
					nextUploadIndex++;
				} else {
					// all file uploaded
					if (done === count) {
						dispatch({type: UPLOAD_PHOTO_COMPLETE, payload: {albumId: id, succeeded: succeeded}});
						resolve();
					}
				}
			};

			for (let i = 0; i < parallelCount; i++) {
				sequenceUpload();
			}

		});

	};
};

export const deletePhotos = (id, names) => {
	return (dispatch) => {
		return restAPI.post('/deletePhotos/' + id, names).then(() => {
			dispatch({type: DELETE_PHOTOS_SUCCESS, payload: {albumId: id, names: names}});
		});
	};
};
