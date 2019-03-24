import thunk from 'redux-thunk';
import {applyMiddleware, createStore} from 'redux';
import reducers from 'reducers/reducers';

export default function configureStore() {
	const store = createStore(
		reducers,
		applyMiddleware(thunk)
	);
	return store;
}
