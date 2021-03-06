import axios from 'axios';
import {showLoading, hideLoading} from 'actions/appAction';
import {DIALOGTYPE, dialogHandler} from 'containers/dialog';

axios.defaults.baseURL = '/api';

const restAPI = {
	get: (url, config) => {
		return axios.get(url, config);
	},
	post: (url, postData, config) => {
		return axios.post(url, postData, config);
	},
	put: (url, putData, config) => {
		return axios.put(url, putData, config);
	},
	delete: (url, config) => {
		return axios.delete(url, config);
	},
	setup: (dispatch, history) => {
		// before send, show loading
		axios.interceptors.request.use((config) => {
			// add timestamp to api url for no cache
			if (~config.url.indexOf('?')) {
				config.url += '&timestamp=' + +new Date();
			} else {
				config.url += '?timestamp=' + +new Date();
			}
			if (!config.hideLoading) {
				dispatch(showLoading());
			}
			return config;
		});

		// after receive response, hide loading hand handle error
		axios.interceptors.response.use((response) => {
			// success
			if (!response.config || !response.config.hideLoading) {
				dispatch(hideLoading());
			}
			return response;
		}, function (error) {
			// error
			if (error.response) {
				if (error.response.config.hideError) {
					console.log('hide loading');
				}
				if (error.response.status === 401) {
					history.push('/login');
				} else if (!error.response.config.hideError) {
					dialogHandler.show({
						type: DIALOGTYPE.alert,
						message: error.response.status + ' ' + error.response.data.errorText || error.response.statusText
					});
					//console.log(error.response);
				}
			}
			if (!error.response.config.hideLoading) {
				dispatch(hideLoading());
			}
			// stop then
			return Promise.reject(error);
		});
	}
};

export default restAPI;
