import update from 'immutability-helper';
import {
  FETCH_ALBUMS,
  FETCH_ALBUM_DETAIL_SUCCESS,
  CREATE_ALBUM_SUCCESS,
  CHANGE_ALBUM_NAME_SUCCESS,
  DELETE_ALBUM_SUCCESS,
  UPLOAD_PHOTO_SUCCESS,
  DELETE_PHOTOS_SUCCESS,
  SET_COVER_SUCCESS
} from 'actions/actions';
import {
  SHOW_LOADING,
  HIDE_LOADING,
  SHOW_DIALOG,
  HIDE_DIALOG,
  GET_USER_PROFILE_SUCCESS,
  GET_SETTINGS_SUCCESS,
  SAVE_SETTINGS_SUCCESS,
  LOGIN_SUCCESS,
  CHANGE_NAME_SUCCESS,
  CHANGE_AVATAR_SUCCESS
} from 'actions/appAction';

let initState = {
  userProfile: null,
  settings: null,
  albums: null,
  listFetched: false, // indicate whether visited home page
  loading: 0,
  dialogInfo: null
};

function getAlbumIndex(id, albums) {
  return albums.findIndex(info => info.id === id);
}

function sortPhoto(images) {
  return images.sort((a, b) => b.date - a.date);
}

function reducers(state = initState, action) {
  let {type, payload} = action;
  switch (type) {
    case SHOW_LOADING:
      return update(state, {
        loading: {$set: state.loading + 1}
      });
    case HIDE_LOADING:
      return update(state, {
        loading: {$set: Math.max(state.loading - 1, 0)}
      });
    case SHOW_DIALOG:
      return update(state, {
        dialogInfo: {$set: payload}
      });
    case HIDE_DIALOG:
      return update(state, {
        dialogInfo: {$set: null}
      });
    case GET_USER_PROFILE_SUCCESS:
    case LOGIN_SUCCESS:
      return update(state, {
        userProfile: {$set: payload}
      });
    case GET_SETTINGS_SUCCESS:
    case SAVE_SETTINGS_SUCCESS:
      return update(state, {
        settings: {$set: payload}
      });
    case CHANGE_NAME_SUCCESS:
      return update(state, {
        userProfile: {
          name: {$set: payload.name}
        }
      });
    case CHANGE_AVATAR_SUCCESS:
      return update(state, {
        userProfile: {
          avatar: {$set: payload.avatar}
        }
      });
    case FETCH_ALBUMS:
      return update(state, {
        albums: {$set: payload},
        listFetched: {$set: true}
      });
    case FETCH_ALBUM_DETAIL_SUCCESS: {
      let { albumInfo } = payload;
      let { albums } = state;
      if (!albums) {
        // if albums === null, means never go to list page,
        // this time, just push the current album info to state.albums
        albums = [].concat(albumInfo);
      } else {
        // find current album info index in state.albums
        let index = getAlbumIndex(albumInfo.id, albums);

        if (~index) {
          albums = update(albums, {
            [index]: {$set: albumInfo}
          });
        }
      }
      return update(state, {
        albums: {$set: albums}
      });
    }
    case CREATE_ALBUM_SUCCESS: {
      // if !state.albums, means never go to album list page, create an empty array,
      // and this time listFetched === false, next time go to list page will re-fetch and update entire list
      let albums = state.albums || [];
      albums = update(albums, {$push: [payload]});
      return update(state, {
        albums: {$set: albums}
      });
    }
    case CHANGE_ALBUM_NAME_SUCCESS: {
      let { albumId, albumName } = payload;
      let albums = state.albums;
      let index = getAlbumIndex(albumId, albums);
      return update(state, {
        albums: {
          [index]: {
            name: {$set: albumName}
          }
        }
      });
    }
    case DELETE_ALBUM_SUCCESS: {
      let deletedId = payload.albumId;
      let albums = state.albums;
      let index = getAlbumIndex(deletedId, albums);
      if (~index) {
        albums = update(albums, {
          $splice: [[index, 1]]
        });
      }
      return update(state, {
        albums: {$set: albums}
      });
    }
    case UPLOAD_PHOTO_SUCCESS: {
      let { albumId, uploaded } = payload;
      let albums = state.albums;

      if (albums) {
        let albumIndex = getAlbumIndex(albumId, albums);
        let currentAlbum = albums[albumIndex];
        // sort by date descending
        sortPhoto(uploaded);
        // if is new album with no cover, set cover
        if (!currentAlbum.cover) {
          currentAlbum = update(currentAlbum, {
            cover: {$set: uploaded[uploaded.length - 1].name} // set first uploaded photo as cover
          });
        }
        // change count and push images
        currentAlbum = update(currentAlbum, {
          count: {$set: currentAlbum.count + uploaded.length},
          images: {$unshift: uploaded}
        });
        albums = update(albums, {
          [albumIndex]: {$set: currentAlbum}
        });
        return update(state, {
          albums: {$set: albums}
        });
      } else {
        // directly refresh uploadPhoto page
        return state;
      }
    }
    case DELETE_PHOTOS_SUCCESS: {
      const { albumId, names } = payload;
      let albums = state.albums;
      let albumIndex = getAlbumIndex(albumId, albums);
      let currentAlbum = albums[albumIndex];
      // iterate to delete photos in state
      names.forEach((name) => {
        let photoIndex = currentAlbum.images.findIndex(n => n.name === name);
        currentAlbum = update(currentAlbum, {
          images: {
            $splice: [[photoIndex, 1]]
          }
        });
        // if cover photo been deleted
        if (name === currentAlbum.cover) {
          currentAlbum = update(currentAlbum, {
            cover: {$set: ''}
          });
        }
      });
      // minus count
      currentAlbum = update(currentAlbum, {
        count: {$set: currentAlbum.count - names.length}
      });
      return update(state, {
        albums: {
          [albumIndex]: {$set: currentAlbum}
        }
      });
    }
    case SET_COVER_SUCCESS: {
      const { albumId, imgName } = payload;
      let albums = state.albums;
      let albumIndex = getAlbumIndex(albumId, albums);
      return update(state, {
        albums: {
          [albumIndex]: {
            cover: {$set: imgName}
          }
        }
      });
    }
    default:
      return state;
  }
}

export default reducers;