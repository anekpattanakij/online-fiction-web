import { fork, put, take } from 'redux-saga/effects';
import { API_CALLING_METHOD, callNonSecureApi, callSecureApi, RETURN_CODE_API_CALL_SUCCESS } from '../../common/ApiPortal';
import Config from '../../config/index';
import { actionTypes } from '../action/index';

export const API_FICTION_URL = Config.apiPath + '/fiction';
export const API_CHAPTER_URL = Config.apiPath + '/chapter';
export const API_CHAPTER_SUFFIX_URL = '/chapter';
export const API_RATE_CHAPTER_SUFFIX_URL = '/rate';
export const API_PURCHASE_CHAPTER_SUFFIX_URL = '/purchase';
export const API_PUBLISH_CHAPTER_SUFFIX_URL = '/publish';
export const API_NEW_CHAPTER_URL = '?list=new';
export const API_TOP_CHAPTER_URL = '?list=top';
export const API_TOP_AND_RATE_FICTION_LANGUAGE_SUFFIX = '&language=';
export const API_FREE_ONLY_SUFFIX = '&free-only=true';
export const API_TRANSLATE_FICTION_URL = '/translate';

// Worker
function* loadChapterList(fictionId, language, sessionTimeoutDispatcher, updateTokenDispatcher, currentUser) {
  try {
    let chapterResponse;
    if (currentUser && currentUser.accessToken) {
      chapterResponse = yield callSecureApi(
        sessionTimeoutDispatcher,
        updateTokenDispatcher,
        currentUser,
        API_FICTION_URL + '/' + fictionId + API_CHAPTER_SUFFIX_URL,
        API_CALLING_METHOD.GET,
        { language: language },
        {},
      );
    } else {
      chapterResponse = yield callNonSecureApi(API_FICTION_URL + '/' + fictionId + API_CHAPTER_SUFFIX_URL, API_CALLING_METHOD.GET, {});
    }
    if (chapterResponse.result === RETURN_CODE_API_CALL_SUCCESS) {
      yield put({
        type: actionTypes.REQUEST_LOAD_CHAPTER_LIST_SUCCESS,
        payload: { fictionId: fictionId, chapterList: chapterResponse.data },
      });
    } else {
      throw chapterResponse;
    }
  } catch (err) {
    if (err && err.data) {
      yield put({
        type: actionTypes.REQUEST_LOAD_CHAPTER_LIST_FAIL,
        payload: err.data,
      });
    } else {
      yield put({
        type: actionTypes.REQUEST_LOAD_CHAPTER_LIST_FAIL,
      });
    }
  }
}

// Watcher
export function* watchLoadChapterList() {
  while (true) {
    const actionObject = yield take(actionTypes.REQUEST_LOAD_CHAPTER_LIST_INITIAL);
    yield fork(
      loadChapterList,
      actionObject.payload.fictionId,
      actionObject.payload.language,
      actionObject.payload.sessionTimeoutDispatcher,
      actionObject.payload.updateTokenDispatcher,
      actionObject.payload.currentUser,
    );
  }
}

// Worker
function* loadChapter(chapterId, sessionTimeoutDispatcher, updateTokenDispatcher, currentUser) {
  try {
    let response;
    if (currentUser && currentUser.accessToken) {
      response = yield callSecureApi(
        sessionTimeoutDispatcher,
        updateTokenDispatcher,
        currentUser,
        API_CHAPTER_URL + '/' + chapterId,
        API_CALLING_METHOD.GET,
        {},
        {},
      );
    } else {
      response = yield callNonSecureApi(API_CHAPTER_URL + '/' + chapterId, API_CALLING_METHOD.GET, {});
    }

    if (response.result === RETURN_CODE_API_CALL_SUCCESS) {
      yield put({
        type: actionTypes.REQUEST_LOAD_CHAPTER_SUCCESS,
        payload: { chapter: response.data },
      });
    } else {
      throw response;
    }
  } catch (err) {
    if (err && err.data) {
      yield put({
        type: actionTypes.REQUEST_LOAD_CHAPTER_FAIL,
        payload: { error: err.data, chapterId },
      });
    } else {
      yield put({
        type: actionTypes.REQUEST_LOAD_CHAPTER_FAIL,
        payload: { chapterId },
      });
    }
  }
}

// Watcher
export function* watchLoadChapter() {
  while (true) {
    const actionObject = yield take(actionTypes.REQUEST_LOAD_CHAPTER_INITIAL);
    yield fork(
      loadChapter,
      actionObject.payload.chapterId,
      actionObject.payload.sessionTimeoutDispatcher,
      actionObject.payload.updateTokenDispatcher,
      actionObject.payload.currentUser,
    );
  }
}

// Worker
function* writeNewChapter(sessionTimeoutDispatcher, updateTokenDispatcher, currentUser, inputChapter) {
  try {
    const response = yield callSecureApi(
      sessionTimeoutDispatcher,
      updateTokenDispatcher,
      currentUser,
      API_FICTION_URL + '/' + inputChapter.fictionId + API_CHAPTER_SUFFIX_URL,
      API_CALLING_METHOD.POST,
      {},
      { chapter: inputChapter },
    );
    if (response.result === RETURN_CODE_API_CALL_SUCCESS) {
      yield put({
        type: actionTypes.REQUEST_CREATE_NEW_CHAPTER_SUCCESS,
        payload: { chapterId: response.data.chapterId, chapterName: inputChapter.chapterName },
      });
    } else {
      yield put({
        type: actionTypes.REQUEST_CREATE_NEW_CHAPTER_FAIL,
        payload: response.data,
      });
    }
  } catch (err) {
    yield put({
      type: actionTypes.REQUEST_CREATE_NEW_CHAPTER_FAIL,
      payload: err && err.response && err.response.data ? err.response.data : err,
    });
  }

  // TODO Do Something
}

// Watcher
export function* watchWriteNewChapter() {
  while (true) {
    const actionObject = yield take(actionTypes.REQUEST_CREATE_NEW_CHAPTER_INITIAL);
    yield fork(
      writeNewChapter,
      actionObject.payload.sessionTimeoutDispatcher,
      actionObject.payload.updateTokenDispatcher,
      actionObject.payload.currentUser,
      actionObject.payload.inputChapter,
    );
  }
}

// Worker
function* translateChapter(sessionTimeoutDispatcher, updateTokenDispatcher, currentUser, inputChapter) {
  try {
    const response = yield callSecureApi(
      sessionTimeoutDispatcher,
      updateTokenDispatcher,
      currentUser,
      API_CHAPTER_URL + '/' + inputChapter.chapterId + API_TRANSLATE_FICTION_URL,
      API_CALLING_METHOD.POST,
      {},
      { chapter: inputChapter },
    );
    if (response.result === RETURN_CODE_API_CALL_SUCCESS) {
      yield put({
        type: actionTypes.REQUEST_TRANSLATE_NEW_CHAPTER_SUCCESS,
        payload: { chapterId: response.data.chapterId, chapterName: inputChapter.chapterName },
      });
    } else {
      yield put({
        type: actionTypes.REQUEST_TRANSLATE_NEW_CHAPTER_FAIL,
        payload: response.data,
      });
    }
  } catch (err) {
    yield put({
      type: actionTypes.REQUEST_TRANSLATE_NEW_CHAPTER_FAIL,
      payload: err.response.data,
    });
  }
}

// Watcher
export function* watchTranslateChapter() {
  while (true) {
    const actionObject = yield take(actionTypes.REQUEST_TRANSLATE_NEW_CHAPTER_INITIAL);
    yield fork(
      translateChapter,
      actionObject.payload.sessionTimeoutDispatcher,
      actionObject.payload.updateTokenDispatcher,
      actionObject.payload.currentUser,
      actionObject.payload.inputChapter,
    );
  }
}

// Worker
function* rateChapter(sessionTimeoutDispatcher, updateTokenDispatcher, currentUser, chapterId, rate) {
  try {
    const response = yield callSecureApi(
      sessionTimeoutDispatcher,
      updateTokenDispatcher,
      currentUser,
      API_CHAPTER_URL + '/' + chapterId + API_RATE_CHAPTER_SUFFIX_URL,
      API_CALLING_METHOD.PUT,
      {},
      { rate: rate },
    );
    if (response.result === RETURN_CODE_API_CALL_SUCCESS) {
      yield put({
        type: actionTypes.REQUEST_RATING_CHAPTER_SUCCESS,
        payload: true,
      });
    } else {
      yield put({
        type: actionTypes.REQUEST_RATING_CHAPTER_FAIL,
        payload: response.data,
      });
    }
  } catch (err) {
    yield put({
      type: actionTypes.REQUEST_RATING_CHAPTER_FAIL,
      payload: err.response.data,
    });
  }
}

// Watcher
export function* watchRateChapter() {
  while (true) {
    const actionObject = yield take(actionTypes.REQUEST_RATING_CHAPTER_INITIAL);
    yield fork(
      rateChapter,
      actionObject.payload.sessionTimeoutDispatcher,
      actionObject.payload.updateTokenDispatcher,
      actionObject.payload.currentUser,
      actionObject.payload.chapterId,
      actionObject.payload.rate,
    );
  }
}

// Worker
function* purchaseChapter(sessionTimeoutDispatcher, updateTokenDispatcher, currentUser, chapterId) {
  try {
    const response = yield callSecureApi(
      sessionTimeoutDispatcher,
      updateTokenDispatcher,
      currentUser,
      API_CHAPTER_URL + '/' + chapterId + API_PURCHASE_CHAPTER_SUFFIX_URL,
      API_CALLING_METHOD.POST,
      {},
      {},
    );
    if (response.result === RETURN_CODE_API_CALL_SUCCESS) {
      yield put({
        type: actionTypes.REQUEST_PURCHASE_CHAPTER_SUCCESS,
        payload: response.data,
      });
      yield put({
        type: actionTypes.REDUCE_COIN_AFTER_PURCHASED,
        payload: response.data.coin,
      });

      yield put({
        type: actionTypes.REQUEST_LOAD_CHAPTER_INITIAL,
        payload: { chapterId, sessionTimeoutDispatcher, updateTokenDispatcher, currentUser },
      });
    } else {
      yield put({
        type: actionTypes.REQUEST_PURCHASE_CHAPTER_FAIL,
        payload: response.data,
      });
    }
  } catch (err) {
    yield put({
      type: actionTypes.REQUEST_PURCHASE_CHAPTER_FAIL,
      payload: err.response.data,
    });
  }
}

// Watcher
export function* watchPurchaseChapter() {
  while (true) {
    const actionObject = yield take(actionTypes.REQUEST_PURCHASE_CHAPTER_INITIAL);
    yield fork(
      purchaseChapter,
      actionObject.payload.sessionTimeoutDispatcher,
      actionObject.payload.updateTokenDispatcher,
      actionObject.payload.currentUser,
      actionObject.payload.chapterId,
    );
  }
}

// Worker
function* publishChapter(sessionTimeoutDispatcher, updateTokenDispatcher, currentUser, chapterId) {
  try {
    const response = yield callSecureApi(
      sessionTimeoutDispatcher,
      updateTokenDispatcher,
      currentUser,
      API_CHAPTER_URL + '/' + chapterId + API_PUBLISH_CHAPTER_SUFFIX_URL,
      API_CALLING_METHOD.PUT,
      {},
      {},
    );
    if (response.result === RETURN_CODE_API_CALL_SUCCESS) {
      yield put({
        type: actionTypes.REQUEST_PUBLISH_CHAPTER_SUCCESS,
        payload: true,
      });
    } else {
      yield put({
        type: actionTypes.REQUEST_PUBLISH_CHAPTER_FAIL,
        payload: response.data,
      });
    }
  } catch (err) {
    yield put({
      type: actionTypes.REQUEST_PUBLISH_CHAPTER_FAIL,
      payload: err.response.data,
    });
  }
}

// Watcher
export function* watchPublishChapter() {
  while (true) {
    const actionObject = yield take(actionTypes.REQUEST_PUBLISH_CHAPTER_INITIAL);
    yield fork(
      publishChapter,
      actionObject.payload.sessionTimeoutDispatcher,
      actionObject.payload.updateTokenDispatcher,
      actionObject.payload.currentUser,
      actionObject.payload.chapterId,
    );
  }
}

// Worker
function* editChapter(sessionTimeoutDispatcher, updateTokenDispatcher, currentUser, inputChapter) {
  try {
    const response = yield callSecureApi(
      sessionTimeoutDispatcher,
      updateTokenDispatcher,
      currentUser,
      API_CHAPTER_URL + '/' + inputChapter.chapterId,
      API_CALLING_METHOD.PUT,
      {},
      { chapter: inputChapter },
    );
    if (response.result === RETURN_CODE_API_CALL_SUCCESS) {
      yield put({
        type: actionTypes.REQUEST_UPDATE_CHAPTER_SUCCESS,
        payload: { chapterId: response.data.chapterId, chapterName: inputChapter.chapterName },
      });
    } else {
      yield put({
        type: actionTypes.REQUEST_UPDATE_CHAPTER_FAIL,
        payload: response.data,
      });
    }
  } catch (err) {
    yield put({
      type: actionTypes.REQUEST_UPDATE_CHAPTER_FAIL,
      payload: err.response.data,
    });
  }
}

// Watcher
export function* watchEditChapter() {
  while (true) {
    const actionObject = yield take(actionTypes.REQUEST_UPDATE_CHAPTER_INITIAL);
    yield fork(
      editChapter,
      actionObject.payload.sessionTimeoutDispatcher,
      actionObject.payload.updateTokenDispatcher,
      actionObject.payload.currentUser,
      actionObject.payload.inputChapter,
    );
  }
}

export default [
  fork(watchLoadChapterList),
  fork(watchLoadChapter),
  fork(watchWriteNewChapter),
  fork(watchTranslateChapter),
  fork(watchPurchaseChapter),
  fork(watchPublishChapter),
  fork(watchEditChapter),
  fork(watchRateChapter),
];
