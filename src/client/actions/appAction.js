import restAPI from 'utils/restAPI';

export const GET_USER_PROFILE_SUCCESS = 'GET_USER_PROFILE_SUCCESS';
export const GET_SETTINGS_SUCCESS = 'GET_SETTINGS_SUCCESS';
export const SAVE_SETTINGS_SUCCESS = 'SAVE_SETTINGS_SUCCESS';
export const CHANGE_NAME_SUCCESS = 'CHANGE_NAME_SUCCESS';
export const CHANGE_AVATAR_SUCCESS = 'CHANGE_AVATAR_SUCCESS';
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const SHOW_LOADING = 'SHOW_LOADING';
export const HIDE_LOADING = 'HIDE_LOADING';
export const SHOW_DIALOG = 'SHOW_DIALOG';
export const HIDE_DIALOG = 'HIDE_DIALOG';

export const getUserProfile = () => {
  return (dispatch) => {
    return restAPI.get('/userProfile').then((res) => {
      dispatch({type: GET_USER_PROFILE_SUCCESS, payload: res.data});
    });
  };
};

export const getSettings = () => {
  return (dispatch) => {
    return restAPI.get('/settings').then((res) => {
      dispatch({type: GET_SETTINGS_SUCCESS, payload: res.data});
    });
  };
};

export const saveSettings = (settingsData) => {
  return (dispatch) => {
    let { settings, bgFile } = settingsData;

    let formData = new FormData();
    formData.append('landingBgFile', bgFile);
    formData.append('whiteList', settings.whiteList.join('<--split-->'));
    formData.append('enableBg', settings.landingBg.enable);
    formData.append('bgUrl', settings.landingBg.url);
    formData.append('autoCrop', settings.autoCrop);

    return restAPI.put('/settings', formData).then((res) => {
      dispatch({type: SAVE_SETTINGS_SUCCESS, payload: res.data.settings});
    });
  };
};

export const login = (password) => {
  return (dispatch) => {
    return restAPI.post('/login', {password: password}).then((res) => {
      if (res.data.success) {
        dispatch({type: LOGIN_SUCCESS, payload: res.data.userProfile});
      }
      return res;
    });
  };
};

export const logout = () => {
  return () => {
    return restAPI.post('/logout');
  };
};

export const changeUserName = (name) => {
  return (dispatch) => {
    return restAPI.put('/changeUserName', {name}).then(() => {
      dispatch({type: CHANGE_NAME_SUCCESS, payload: {name}});
    });
  };
};

export const changeAvatar = (file, onUploadProgress) => {
  return (dispatch) => {
    let formData = new FormData();
    formData.append('avatar', file);

    let config = {
      onUploadProgress: onUploadProgress,
      hideLoading: true
    };
    return restAPI.put('/changeAvatar', formData, config).then((res) => {
      dispatch({type: CHANGE_AVATAR_SUCCESS, payload: {avatar: res.data.avatar}});
    });
  };
};

export const changePassword = (oldPassword, newPassword) => {
  return () => {
    return restAPI.put('/changePassword', {oldPassword, newPassword});
  };
};

export const showLoading = () => {
  return {type: SHOW_LOADING};
};

export const hideLoading = () => {
  return {type: HIDE_LOADING};
};

export const showDialog = (dialogInfo) => {
  return {type: SHOW_DIALOG, payload: dialogInfo};
};

export const hideDialog = () => {
  return {type: HIDE_DIALOG};
};