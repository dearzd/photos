import thunk from 'redux-thunk';
import {applyMiddleware, compose, createStore} from 'redux';
import reducers from 'reducers/reducers';
import DevTools from './devTools';

const enhancer = compose(
	applyMiddleware(thunk),
	DevTools.instrument()
);

export default function configureStore() {
	const store = createStore(
		reducers,
		enhancer
	);
	return store;
}
