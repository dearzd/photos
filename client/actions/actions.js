import restAPI from 'utils/restAPI';

export const FETCH_ALBUMS = 'FETCH_ALBUMS';
export const FETCH_ALBUM_DETAIL_SUCCESS = 'FETCH_ALBUM_DETAIL_SUCCESS';
export const CREATE_ALBUM_SUCCESS = 'CREATE_ALBUM_SUCCESS';
export const CHANGE_ALBUM_NAME_SUCCESS = 'CHANGE_ALBUM_NAME_SUCCESS';
export const DELETE_ALBUM_SUCCESS = 'DELETE_ALBUM_SUCCESS';
export const UPLOAD_PHOTO_SUCCESS = 'UPLOAD_PHOTO_SUCCESS';
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

export const fetchAlbum = (id) => {
  return (dispatch) => {
    return restAPI.get('/album/' + id).then((res) => {
      dispatch({type: FETCH_ALBUM_DETAIL_SUCCESS, payload: res.data});
    });
  };
};

export const createAlbum = (name) => {
  return (dispatch) => {
    return restAPI.post('/album/' + name).then((res) => {
      dispatch({type: CREATE_ALBUM_SUCCESS, payload: res.data});
      return res.data.id; // return id for redirect
    });
  };
};

export const changeAlbumName = (id, albumName) => {
  return (dispatch) => {
    return restAPI.put('/album/' + id, {name: albumName}).then(() => {
      dispatch({type: CHANGE_ALBUM_NAME_SUCCESS, payload: {albumId: id, albumName: albumName}});
    });
  };
};

export const deleteAlbum = (id) => {
  return (dispatch) => {
    return restAPI.delete('/album/' + id).then(() => {
      dispatch({type: DELETE_ALBUM_SUCCESS, payload: {albumId: id}});
    });
  };
};

export const uploadPhoto = (id, files, onUploadProgress) => {
  return (dispatch) => {
    let promises = [];
    let uploaded = [];
    files.forEach((file, index) => {
      let formData = new FormData();
      formData.append('photo', file);

      let config = {
        onUploadProgress: (progressEvent) => {
          onUploadProgress(index, progressEvent);
        },
        hideLoading: true
      };

      let uploadPromise = restAPI.post('/uploadPhoto/' + id, formData, config).then((res) => {
        uploaded.push(res.data);
      });

      promises.push(uploadPromise);
    });

    return Promise.all(promises).then(() => {
      dispatch({type: UPLOAD_PHOTO_SUCCESS, payload: {albumId: id, uploaded: uploaded}});
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

export const setCover = (id, imgName) => {
  return (dispatch) => {
    return restAPI.put('/setCover/' + id, {name: imgName}).then(() => {
      dispatch({type: SET_COVER_SUCCESS, payload: {albumId: id, imgName: imgName}});
    });
  };
};
