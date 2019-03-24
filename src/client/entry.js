import React from 'react';
import {render} from 'react-dom';
import configureStore from './root/configureStore';
import Root from './root/root';

const store = configureStore();

render(
	<Root store={store}/>,
	document.getElementById('root')
);
