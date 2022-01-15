import { fork, put, take } from 'redux-saga/effects';
import { API_CALLING_METHOD, callNonSecureApi, callSecureApi, RETURN_CODE_API_CALL_SUCCESS } from '../../common/ApiPortal';
import Error from '../../common/Error';
import Config from '../../config/index';
import { actionTypes } from '../action/index';

const API_LOGIN_URL = Config.apiPath + '/session';
const API_GOOGLE_LOGIN_URL = Config.apiPath + '/session?auth=google';
const API_FACEBOOK_LOGIN_URL = Config.apiPath + '/session?auth=facebook';
const API_REGISTER_URL = Config.apiPath + '/user';
const API_UPDATE_PROFILE_URL = Config.apiPath + '/user';
const API_REVOKE_TOKEN_URL = Config.apiPath + '/session/revoke';
const API_CHANGEPASSWORD_URL = Config.apiPath + '/user/password';
const API_RESETPASSWORD_URL = Config.apiPath + '/password/recovery';
const API_SAVE_NEW_RESETPASSWORD_URL = Config.apiPath + '/password';

// Worker
function* registerSaga(email, password, displayName, dateOfBirth, recaptchaToken) {
  try {
    const response = yield callNonSecureApi(
      API_REGISTER_URL,
      API_CALLING_METHOD.POST,
      {},
      {
        email,
        password,
        displayName,
        dateOfBirth,
        recaptchaToken,
      },
    );
    if (response.result === RETURN_CODE_API_CALL_SUCCESS) {
      yield put({
        type: actionTypes.REGISTER_SUCCESS,
        payload: response.data,
      });
    } else {
      yield put({
        type: actionTypes.REGISTER_FAILURE,
        payload: response.data,
      });
    }
  } catch (err) {
    if (err && err.response && err.response.data) {
      yield put({
        type: actionTypes.REGISTER_FAILURE,
        payload: err.response.data,
      });
    } else {
      put({
        type: actionTypes.REGISTER_FAILURE,
        payload: Error.transformErrorFromAxios(err),
      });
    }
  }
}

// Watcher
export function* watchRegister() {
  while (true) {
    const actionObject = yield take(actionTypes.REGISTER_INITIAL);
    yield fork(
      registerSaga,
      actionObject.payload.email,
      actionObject.payload.password,
      actionObject.payload.displayName,
      actionObject.payload.dateOfBirth,
      actionObject.payload.recaptchaToken,
    );
  }
}

// Worker
function* registerByFacebookSaga(accessToken) {
  try {
    const response = yield callNonSecureApi(
      API_FACEBOOK_LOGIN_URL,
      API_CALLING_METHOD.POST,
      {},
      {
        accessToken,
      },
    );
    if (response.result === RETURN_CODE_API_CALL_SUCCESS) {
      yield put({
        type: actionTypes.FACEBOOK_REGISTER_SUCCESS,
        payload: response.data,
      });
    } else {
      yield put({
        type: actionTypes.FACEBOOK_REGISTER_FAILURE,
        payload: response.data,
      });
    }
  } catch (err) {
    yield put({
      type: actionTypes.FACEBOOK_REGISTER_FAILURE,
      payload: err.response.data,
    });
  }
}

// Watcher
export function* watchRegisterByFacebook() {
  while (true) {
    const actionObject = yield take(actionTypes.FACEBOOK_REGISTER_INITIAL);
    yield fork(registerByFacebookSaga, actionObject.payload.accessToken);
  }
}

// Worker
function* registerByGoogleSaga(accessToken) {
  try {
    const response = yield callNonSecureApi(
      API_GOOGLE_LOGIN_URL,
      API_CALLING_METHOD.POST,
      {},
      {
        accessToken,
      },
    );
    if (response.result === RETURN_CODE_API_CALL_SUCCESS) {
      yield put({
        type: actionTypes.GOOGLE_REGISTER_SUCCESS,
        payload: response.data,
      });
    } else {
      yield put({
        type: actionTypes.GOOGLE_REGISTER_FAILURE,
        payload: response.data,
      });
    }
  } catch (err) {
    yield put({
      type: actionTypes.GOOGLE_REGISTER_FAILURE,
      payload: err.response.data,
    });
  }
}

// Watcher
export function* watchRegisterByGoogle() {
  while (true) {
    const actionObject = yield take(actionTypes.GOOGLE_REGISTER_INITIAL);
    yield fork(registerByGoogleSaga, actionObject.payload.accessToken);
  }
}

// Worker
function* loginSaga(email, password, recaptchaToken) {
  try {
    const response = yield callNonSecureApi(
      API_LOGIN_URL,
      API_CALLING_METHOD.POST,
      {},
      {
        email,
        password,
        recaptchaToken,
      },
    );
    if (response.result === RETURN_CODE_API_CALL_SUCCESS) {
      yield put({
        type: actionTypes.LOGIN_SUCCESS,
        payload: response.data,
      });
    } else {
      yield put({
        type: actionTypes.LOGIN_FAILURE,
        payload: response.data,
      });
    }
  } catch (err) {
    yield put({
      type: actionTypes.LOGIN_FAILURE,
      payload: err && err.response && err.response.data ? err.response.data : '',
    });
  }
}

// Watcher
export function* watchLogin() {
  while (true) {
    const actionObject = yield take(actionTypes.LOGIN_INITIAL);
    yield fork(loginSaga, actionObject.payload.email, actionObject.payload.password, actionObject.payload.recaptchaToken);
  }
}

// Worker
function* loginByFacebookSaga(accessToken) {
  try {
    const response = yield callNonSecureApi(
      API_FACEBOOK_LOGIN_URL,
      API_CALLING_METHOD.POST,
      {},
      {
        accessToken,
      },
    );
    if (response.result === RETURN_CODE_API_CALL_SUCCESS) {
      yield put({
        type: actionTypes.FACEBOOK_LOGIN_SUCCESS,
        payload: response.data,
      });
    } else {
      yield put({
        type: actionTypes.FACEBOOK_LOGIN_FAILURE,
        payload: response.data,
      });
    }
  } catch (err) {
    yield put({
      type: actionTypes.FACEBOOK_LOGIN_FAILURE,
      payload: err.response.data,
    });
  }
}

// Watcher
export function* watchLoginByFacebook() {
  while (true) {
    const actionObject = yield take(actionTypes.FACEBOOK_LOGIN_INITIAL);
    yield fork(loginByFacebookSaga, actionObject.payload.accessToken);
  }
}

// Worker
function* loginByGoogleSaga(accessToken) {
  try {
    const response = yield callNonSecureApi(
      API_GOOGLE_LOGIN_URL,
      API_CALLING_METHOD.POST,
      {},
      {
        accessToken,
      },
    );
    if (response.result === RETURN_CODE_API_CALL_SUCCESS) {
      yield put({
        type: actionTypes.GOOGLE_LOGIN_SUCCESS,
        payload: response.data,
      });
    } else {
      yield put({
        type: actionTypes.GOOGLE_LOGIN_FAILURE,
        payload: response.data,
      });
    }
  } catch (err) {
    yield put({
      type: actionTypes.GOOGLE_LOGIN_FAILURE,
      payload: err.response.data,
    });
  }
}

// Watcher
export function* watchLoginByGoogle() {
  while (true) {
    const actionObject = yield take(actionTypes.GOOGLE_LOGIN_INITIAL);
    yield fork(loginByGoogleSaga, actionObject.payload.accessToken);
  }
}

// Worker
function* updateProfile(sessionTimeoutDispatcher, updateTokenDispatcher, user) {
  try {
    const response = yield callSecureApi(
      sessionTimeoutDispatcher,
      updateTokenDispatcher,
      user,
      API_UPDATE_PROFILE_URL,
      API_CALLING_METHOD.PUT,
      {},
      {
        email: user.email,
        preferredLanguage: user.preferredLanguage,
      },
    );
    if (response.result === RETURN_CODE_API_CALL_SUCCESS) {
      yield put({
        type: actionTypes.UPDATE_PROFILE_SUCCESS,
        payload: {
          email: user.email,
          preferredLanguage: user.preferredLanguage,
        },
      });
    } else {
      yield put({
        type: actionTypes.UPDATE_PROFILE_FAILURE,
        payload: response.data,
      });
    }
  } catch (err) {
    yield put({
      type: actionTypes.UPDATE_PROFILE_FAILURE,
      payload: err.response.data,
    });
  }
}

// Watcher
export function* watchUpdateProfile() {
  while (true) {
    const actionObject = yield take(actionTypes.UPDATE_PROFILE_INITIAL);
    yield fork(
      updateProfile,
      actionObject.payload.sessionTimeoutDispatcher,
      actionObject.payload.updateTokenDispatcher,
      actionObject.payload.user,
    );
  }
}

// Worker
function* changePassword(sessionTimeoutDispatcher, updateTokenDispatcher, currentUser, currentPassword, newPassword) {
  try {
    const response = yield callSecureApi(
      sessionTimeoutDispatcher,
      updateTokenDispatcher,
      currentUser,
      API_CHANGEPASSWORD_URL,
      API_CALLING_METHOD.PUT,
      {},
      {
        currentPassword,
        newPassword,
      },
    );
    if (response.result === RETURN_CODE_API_CALL_SUCCESS) {
      yield put({
        type: actionTypes.CHANGE_PASSWORD_SUCCESS,
        payload: response,
      });
    } else {
      yield put({
        type: actionTypes.CHANGE_PASSWORD_FAILURE,
        payload: response.data,
      });
    }
  } catch (err) {
    yield put({
      type: actionTypes.CHANGE_PASSWORD_FAILURE,
      payload: err.response.data,
    });
  }
}

// Watcher
export function* watchChangePassword() {
  while (true) {
    const actionObject = yield take(actionTypes.CHANGE_PASSWORD_INITIAL);
    yield fork(
      changePassword,
      actionObject.payload.sessionTimeoutDispatcher,
      actionObject.payload.updateTokenDispatcher,
      actionObject.payload.currentUser,
      actionObject.payload.currentPassword,
      actionObject.payload.newPassword,
    );
  }
}

// Worker
function* resetPassword(email, langauge) {
  try {
    const response = yield callNonSecureApi(
      API_RESETPASSWORD_URL,
      API_CALLING_METHOD.POST,
      {},
      {
        email,
        langauge,
      },
    );
    if (response.result === RETURN_CODE_API_CALL_SUCCESS) {
      yield put({
        type: actionTypes.RESET_PASSWORD_SUCCESS,
        payload: response.data,
      });
    } else {
      yield put({
        type: actionTypes.RESET_PASSWORD_FAILURE,
        payload: response.data,
      });
    }
  } catch (err) {
    yield put({
      type: actionTypes.RESET_PASSWORD_FAILURE,
      payload: err.response.data,
    });
  }
}

// Watcher
export function* watchResetPassword() {
  while (true) {
    const actionObject = yield take(actionTypes.RESET_PASSWORD_INITIAL);
    yield fork(resetPassword, actionObject.payload.email, actionObject.payload.langauge);
  }
}

// Worker
function* setNewPasswordFromReset(email, password, resetToken) {
  try {
    const response = yield callNonSecureApi(
      API_SAVE_NEW_RESETPASSWORD_URL,
      API_CALLING_METHOD.POST,
      {},
      {
        email,
        password,
        resetToken,
      },
    );
    if (response.result === RETURN_CODE_API_CALL_SUCCESS) {
      yield put({
        type: actionTypes.SET_NEW_PASSWORD_FROM_RESET_SUCCESS,
        payload: response.data,
      });
    } else {
      yield put({
        type: actionTypes.SET_NEW_PASSWORD_FROM_RESET_FAILURE,
        payload: response.data,
      });
    }
  } catch (err) {
    yield put({
      type: actionTypes.SET_NEW_PASSWORD_FROM_RESET_FAILURE,
      payload: err.response.data,
    });
  }
}

// Watcher
export function* watchSetNewPasswordFromReset() {
  while (true) {
    const actionObject = yield take(actionTypes.SET_NEW_PASSWORD_FROM_RESET_INITIAL);
    yield fork(setNewPasswordFromReset, actionObject.payload.email, actionObject.payload.resetToken, actionObject.payload.password);
  }
}

// Worker
function* revokeToken(cif, refreshToken) {
  try {
    const response = yield callNonSecureApi(
      API_REVOKE_TOKEN_URL,
      API_CALLING_METHOD.PUT,
      {},
      {
        cif,
        refreshToken,
      },
    );
    if (response.result === RETURN_CODE_API_CALL_SUCCESS) {
      yield put({
        type: actionTypes.LOGOUT_SUCCESS,
        payload: response.data,
      });
    } else {
      yield put({
        type: actionTypes.LOGOUT_FAILURE,
        payload: response.data,
      });
    }
  } catch (err) {
    if (err && err.response && err.response.data) {
      yield put({
        type: actionTypes.LOGOUT_FAILURE,
        payload: err.response.data,
      });
    } else {
      put({
        type: actionTypes.LOGOUT_FAILURE,
        payload: Error.transformErrorFromAxios(err),
      });
    }
  }
}

// Watcher
export function* watchrevokeToken() {
  while (true) {
    const actionObject = yield take(actionTypes.LOGOUT_REQUESTING);
    yield fork(revokeToken, actionObject.payload.cif, actionObject.payload.refreshToken);
  }
}

export default [
  fork(watchRegister),
  fork(watchRegisterByFacebook),
  fork(watchRegisterByGoogle),
  fork(watchLogin),
  fork(watchLoginByFacebook),
  fork(watchLoginByGoogle),
  fork(watchUpdateProfile),
  fork(watchChangePassword),
  fork(watchrevokeToken),
  fork(watchResetPassword),
  fork(watchSetNewPasswordFromReset),
];
