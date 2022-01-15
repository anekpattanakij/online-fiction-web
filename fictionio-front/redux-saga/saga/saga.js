import { all } from 'redux-saga/effects';
import annoucementSagaList from './annoucementSaga';
import chapterSagaList from './chapterSaga';
import fictionSagaList from './fictionSaga';
import userSagaList from './userSaga';
import paymentSagaList from './paymentSaga';

// Combine Watcher
function* rootSaga() {
  yield all([
    ...annoucementSagaList,
    ...chapterSagaList,
    ...fictionSagaList,
    ...userSagaList,
    ...paymentSagaList,
  ]);
}

export default rootSaga;
