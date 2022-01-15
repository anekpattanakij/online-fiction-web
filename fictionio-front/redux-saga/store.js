import { compose } from 'recompose';
import { applyMiddleware, createStore } from 'redux';
import { persistCombineReducers } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import createSagaMiddleware from 'redux-saga';
import { reducerList, State } from './reducer';
import rootSaga from './saga/saga';
import crossTabEnhancer from './crossTabMiddleware';
import ExpireTransform from './expireTransformReducer';
import Config from '../config/index';

const isBrowser = process.browser;
const sagaMiddleware = createSagaMiddleware();

const persistConfig = {
  key: Config.persistKey,
  storage: storage,
  blacklist: ['fiction', 'chapter'],
  transforms: [ExpireTransform(24, ['annoucement', 'topupPrice'])],
};

const bindMiddleware = middleware => {
  if (process.env.NODE_ENV !== 'production') {
    const { composeWithDevTools } = require('redux-devtools-extension');
    return composeWithDevTools(applyMiddleware(...middleware));
  }
  return applyMiddleware(...middleware);
};

const configureStore = (initialState = new State()) => {
  const persistedReducer = persistCombineReducers(persistConfig, reducerList);

  const store = createStore(persistedReducer, Object.assign({}, initialState), compose(bindMiddleware([sagaMiddleware])));
  if (isBrowser) {
    crossTabEnhancer(store, persistConfig, { blacklist: ['fiction,chapter'] });
  }

  store.runSagaTask = () => {
    store.sagaTask = sagaMiddleware.run(rootSaga);
  };

  store.runSagaTask();
  return store;
};

export default configureStore;
