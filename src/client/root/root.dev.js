import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Provider} from 'react-redux';
import {BrowserRouter, Route} from 'react-router-dom';
import App from 'containers/app';
import DevTools from './devTools';

export default class Root extends Component {
	render() {
		const {store} = this.props;
		return (
			<Provider store={store}>
				<div>
					<BrowserRouter>
						<Route path="/" component={(props) => <App {...props} dispatch={store.dispatch}/>}/>
					</BrowserRouter>
					<DevTools/>
				</div>
			</Provider>
		);
	}
}

Root.propTypes = {
	store: PropTypes.object
};
