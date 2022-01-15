import { fork, put, take } from 'redux-saga/effects';
import { API_CALLING_METHOD, callNonSecureApi, callSecureApi, RETURN_CODE_API_CALL_SUCCESS } from '../../common/ApiPortal';
import Config from '../../config/index';
import { actionTypes } from '../action/index';

export const API_FICTION_URL = Config.apiPath + '/fiction';
export const API_TRANSLATE_FICTION_URL = '/translate';
export const API_REDUCE_CHAPTER_FICTION_URL = '/reduce-chapter';
export const API_RATE_FICTION_URL = '/rate';
export const API_STATUS_FICTION_URL = '/status';
export const API_NEW_FICTION_URL = '?list=new';
export const API_TOP_FICTION_URL = '?list=top';
export const API_TOP_AND_RATE_FICTION_LANGUAGE_SUFFIX = '&language=';
export const API_SEARCH_URL = Config.apiPath + '/search';

// Worker
function* loadFiction(fictionId) {
  try {
    let response;

    response = yield callNonSecureApi(API_FICTION_URL + '/' + fictionId, API_CALLING_METHOD.GET, {});

    if (response.result === RETURN_CODE_API_CALL_SUCCESS) {
      yield put({
        type: actionTypes.REQUEST_LOAD_FICTION_SUCCESS,
        payload: response.data,
      });
    } else {
      throw response;
    }
  } catch (err) {
    if (err && err.data) {
      yield put({
        type: actionTypes.REQUEST_LOAD_FICTION_FAIL,
        payload: { error: err.data, fictionId },
      });
    } else {
      yield put({
        type: actionTypes.REQUEST_LOAD_FICTION_FAIL,
        payload: { fictionId },
      });
    }
  }
}

// Watcher
export function* watchLoadFiction() {
  while (true) {
    const actionObject = yield take(actionTypes.REQUEST_LOAD_FICTION_INITIAL);
    yield fork(loadFiction, actionObject.payload.fictionId);
  }
}

// Worker
function* writeNewFiction(sessionTimeoutDispatcher, updateTokenDispatcher, currentUser, inputFiction) {
  if (!(inputFiction.categories instanceof Array)) {
    inputFiction.categories = new Array(inputFiction.categories);
  }
  try {
    const response = yield callSecureApi(
      sessionTimeoutDispatcher,
      updateTokenDispatcher,
      currentUser,
      API_FICTION_URL,
      API_CALLING_METHOD.POST,
      {},
      { fiction: inputFiction },
    );
    if (response.result === RETURN_CODE_API_CALL_SUCCESS) {
      yield put({
        type: actionTypes.REQUEST_CREATE_NEW_FICTION_SUCCESS,
        payload: { fictionId: response.data.fiction.fictionId, fictionName: inputFiction.fictionName },
      });
    } else {
      yield put({
        type: actionTypes.REQUEST_CREATE_NEW_FICTION_FAIL,
        payload: response.data,
      });
    }
  } catch (err) {
    yield put({
      type: actionTypes.REQUEST_CREATE_NEW_FICTION_FAIL,
      payload: err.response.data,
    });
  }

  // TODO Do Something
}

// Watcher
export function* watchWriteNewFiction() {
  while (true) {
    const actionObject = yield take(actionTypes.REQUEST_CREATE_NEW_FICTION_INITIAL);
    yield fork(
      writeNewFiction,
      actionObject.payload.sessionTimeoutDispatcher,
      actionObject.payload.updateTokenDispatcher,
      actionObject.payload.currentUser,
      actionObject.payload.inputFiction,
    );
  }
}

// Worker
function* updateFiction(sessionTimeoutDispatcher, updateTokenDispatcher, currentUser, inputFiction) {
  try {
    const response = yield callSecureApi(
      sessionTimeoutDispatcher,
      updateTokenDispatcher,
      currentUser,
      API_FICTION_URL + '/' + inputFiction.fictionId,
      API_CALLING_METHOD.PUT,
      {},
      { fiction: inputFiction },
    );
    if (response.result === RETURN_CODE_API_CALL_SUCCESS) {
      yield put({
        type: actionTypes.REQUEST_UPDATE_FICTON_SUCCESS,
        payload: { fictionId: inputFiction.fictionId, fictionName: inputFiction.fictionName },
      });
    } else {
      yield put({
        type: actionTypes.REQUEST_UPDATE_FICTON_FAIL,
        payload: response.data,
      });
    }
  } catch (err) {
    yield put({
      type: actionTypes.REQUEST_UPDATE_FICTON_FAIL,
      payload: err.response.data,
    });
  }
}

// Watcher
export function* watchUpdateFiction() {
  while (true) {
    const actionObject = yield take(actionTypes.REQUEST_UPDATE_FICTON_INITIAL);
    yield fork(
      updateFiction,
      actionObject.payload.sessionTimeoutDispatcher,
      actionObject.payload.updateTokenDispatcher,
      actionObject.payload.currentUser,
      actionObject.payload.inputFiction,
    );
  }
}

// Worker
function* translateFiction(sessionTimeoutDispatcher, updateTokenDispatcher, currentUser, inputFiction) {
  try {
    const response = yield callSecureApi(
      sessionTimeoutDispatcher,
      updateTokenDispatcher,
      currentUser,
      API_FICTION_URL + '/' + inputFiction.fictionId + API_TRANSLATE_FICTION_URL,
      API_CALLING_METHOD.PUT,
      {},
      { fiction: inputFiction },
    );
    if (response.result === RETURN_CODE_API_CALL_SUCCESS) {
      yield put({
        type: actionTypes.REQUEST_TRANSLATE_FICTION_SUCCESS,
        payload: { fictionId: inputFiction.fictionId, fictionName: inputFiction.fictionName },
      });
    } else {
      yield put({
        type: actionTypes.REQUEST_TRANSLATE_FICTION_FAIL,
        payload: response.data,
      });
    }
  } catch (err) {
    yield put({
      type: actionTypes.REQUEST_TRANSLATE_FICTION_FAIL,
      payload: err.response.data,
    });
  }
}

// Watcher
export function* watchTranslateFiction() {
  while (true) {
    const actionObject = yield take(actionTypes.REQUEST_TRANSLATE_FICTION_INITIAL);
    yield fork(
      translateFiction,
      actionObject.payload.sessionTimeoutDispatcher,
      actionObject.payload.updateTokenDispatcher,
      actionObject.payload.currentUser,
      actionObject.payload.inputFiction,
    );
  }
}

// Worker
function* rateFiction(sessionTimeoutDispatcher, updateTokenDispatcher, currentUser, fictionId, rate) {
  try {
    const response = yield callSecureApi(
      sessionTimeoutDispatcher,
      updateTokenDispatcher,
      currentUser,
      API_FICTION_URL + '/' + fictionId + API_RATE_FICTION_URL,
      API_CALLING_METHOD.PUT,
      {},
      { rate: rate },
    );
    if (response.result === RETURN_CODE_API_CALL_SUCCESS) {
      yield put({
        type: actionTypes.REQUEST_RATE_FICTION_SUCCESS,
        payload: { rate: rate },
      });
    } else {
      yield put({
        type: actionTypes.REQUEST_RATE_FICTION_FAIL,
        payload: response.data,
      });
    }
  } catch (err) {
    yield put({
      type: actionTypes.REQUEST_RATE_FICTION_FAIL,
      payload: err.response.data,
    });
  }
}

// Watcher
export function* watchRateFiction() {
  while (true) {
    const actionObject = yield take(actionTypes.REQUEST_RATE_FICTION_INITIAL);
    yield fork(
      rateFiction,
      actionObject.payload.sessionTimeoutDispatcher,
      actionObject.payload.updateTokenDispatcher,
      actionObject.payload.currentUser,
      actionObject.payload.fictionId,
      actionObject.payload.rate,
    );
  }
}

// Worker
function* updateFictionStatus(sessionTimeoutDispatcher, updateTokenDispatcher, currentUser, fictionId, newStatus) {
  try {
    const response = yield callSecureApi(
      sessionTimeoutDispatcher,
      updateTokenDispatcher,
      currentUser,
      API_FICTION_URL + '/' + fictionId + API_STATUS_FICTION_URL,
      API_CALLING_METHOD.PUT,
      {},
      { fiction: { fictionId: fictionId, status: newStatus } },
    );
    if (response.result === RETURN_CODE_API_CALL_SUCCESS) {
      yield put({
        type: actionTypes.REQUEST_CHANGE_STATUS_FICTION_SUCCESS,
        payload: { status: newStatus },
      });
    } else {
      yield put({
        type: actionTypes.REQUEST_CHANGE_STATUS_FICTION_FAIL,
        payload: response.data,
      });
    }
  } catch (err) {
    yield put({
      type: actionTypes.REQUEST_CHANGE_STATUS_FICTION_FAIL,
      payload: err.response.data,
    });
  }
}

// Watcher
export function* watchUpdateFictionStatus() {
  while (true) {
    const actionObject = yield take(actionTypes.REQUEST_CHANGE_STATUS_FICTION_INITIAL);
    yield fork(
      updateFictionStatus,
      actionObject.payload.sessionTimeoutDispatcher,
      actionObject.payload.updateTokenDispatcher,
      actionObject.payload.currentUser,
      actionObject.payload.fictionId,
      actionObject.payload.newStatus,
    );
  }
}

export default [
  fork(watchLoadFiction),
  fork(watchWriteNewFiction),
  fork(watchUpdateFiction),
  fork(watchTranslateFiction),
  fork(watchRateFiction),
  fork(watchUpdateFictionStatus),
];
