import { fork, put, take } from 'redux-saga/effects';
import { API_CALLING_METHOD, callNonSecureApi,  RETURN_CODE_API_CALL_SUCCESS } from '../../common/ApiPortal';
import Error from '../../common/Error';
import Config from '../../config/index';
import { actionTypes } from '../action/index';


const API_LOAD_ANNOUCEMENT_LIST = Config.apiPath + '/annoucements';

// Worker
function* loadAnnoucementList() {
  try {
    const response = yield callNonSecureApi(API_LOAD_ANNOUCEMENT_LIST, API_CALLING_METHOD.GET);
    if (response.result === RETURN_CODE_API_CALL_SUCCESS) {
      yield put({
        type: actionTypes.REQUEST_ANNOUCEMENT_SUCCESS,
        payload: { annoucementList: response.data },
      });
    } else {
      yield put({
        type: actionTypes.REQUEST_ANNOUCEMENT_FAIL,
        payload: { data: [] },
      });
    }
  } catch (err) {
    if (err && err.response && err.response.data) {
      yield put({
        type: actionTypes.REQUEST_ANNOUCEMENT_FAIL,
        payload: { data: err.response.data },
      });
    } else {
      put({
        type: actionTypes.REQUEST_ANNOUCEMENT_FAIL,
        payload: { data: Error.transformErrorFromAxios(err) },
      });
    }
  }
}

// Watcher
export function* watchLoadAnnoucementList() {
  while (true) {
    const actionObject = yield take(actionTypes.REQUEST_ANNOUCEMENT_INITIAL);
    yield fork(loadAnnoucementList, actionObject.payload);
  }
}

export default [
  fork(watchLoadAnnoucementList),
];

