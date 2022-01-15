import axios from 'axios';
import Config from './../config/index';
import Error, { ERROR_CODE_ACCESS_EXPIRE, ERROR_CODE_NETWORK_ERROR, ERROR_CODE_INVALID_REFRESH_TOKEN } from './Error';

export const RETURN_CODE_API_CALL_FAILURE = 'RETURN_CODE_API_CALL_FAILURE';
export const RETURN_CODE_API_CALL_SESSION_TIMEOUT = 'ERROR_CODE_REFRESH_EXPIRE';
export const RETURN_CODE_API_CALL_SUCCESS = 'RETURN_CODE_API_CALL_SUCCESS';

const API_REFRESH_TOKEN_URL = Config.apiPath + '/session/refresh';

export const API_CALLING_METHOD = {
  GET: 'get',
  POST: 'post',
  PUT: 'put',
};

const callNonSecureApi = async (apiUrl, method, params, data) => {
  let callingMethod = 'get';
  if (method === API_CALLING_METHOD.POST) {
    callingMethod = 'post';
  } else if (method === API_CALLING_METHOD.PUT) {
    callingMethod = 'put';
  }
  return await axios({
    method: callingMethod,
    url: apiUrl,
    params,
    data,
    timeout: 60000,
  })
    .then(returnResult => {
      if (returnResult.data && returnResult.data.result && returnResult.data.data) {
        if (returnResult.data.result === 'success') {
          return {
            result: RETURN_CODE_API_CALL_SUCCESS,
            data: returnResult.data.data,
          };
        } else {
          return {
            result: RETURN_CODE_API_CALL_FAILURE,
            data: returnResult.data.data,
          };
        }
      } else {
        throw new Error(ERROR_CODE_NETWORK_ERROR, 'Network Error');
      }
    })
    .catch(error => {
      if (!(error && error.response && error.response.data)) {
        // network error
        return {
          result: RETURN_CODE_API_CALL_FAILURE,
          data: new Error(ERROR_CODE_NETWORK_ERROR, 'Network Error'),
        };
      } else {
        return {
          result: RETURN_CODE_API_CALL_FAILURE,
          data: error.response && error.response.data ? error.response.data : error,
        };
      }
    });
};

const callingToApi = async (user, apiUrl, method, params, data) => {
  let callingMethod = 'get';
  if (method === API_CALLING_METHOD.POST) {
    callingMethod = 'post';
  } else if (method === API_CALLING_METHOD.PUT) {
    callingMethod = 'put';
  }
  return await axios({
    method: callingMethod,
    url: apiUrl,
    params,
    data,
    timeout: 60000,
    headers: {
      bearer: user && user.accessToken? user.accessToken : '',
      'Content-Type': 'application/json',
    },
  })
    .then(returnResult => {
      if (returnResult.data && returnResult.data.result && returnResult.data.data) {
        if (returnResult.data.result === 'success') {
          return {
            result: RETURN_CODE_API_CALL_SUCCESS,
            data: returnResult.data.data,
          };
        } else {
          return {
            result: RETURN_CODE_API_CALL_FAILURE,
            data: returnResult.data.data,
          };
        }
      } else {
        throw new Error(ERROR_CODE_NETWORK_ERROR, 'Network Error');
      }
    })
    .catch(error => {
      return {
        result: RETURN_CODE_API_CALL_FAILURE,
        data: error.response && error.response.data ? error.response.data : error,
      };
    });
};

const callSecureApi = async (sessionTimeoutDispatcher, updateUserTokenDispatcher, user, apiUrl, method, params, data) => {
  const resultFirstCall = await callingToApi(user, apiUrl, method, params, data);
  if (resultFirstCall.result === RETURN_CODE_API_CALL_SUCCESS) {
    return resultFirstCall;
  }
  // If not success check error first
  const error = resultFirstCall.data;
  if (error.code === ERROR_CODE_ACCESS_EXPIRE) {
    // Refresh Token First
    
    const resultFromRefreshToken = await callingToApi(user, API_REFRESH_TOKEN_URL, API_CALLING_METHOD.POST, null, user);
    if (resultFromRefreshToken.result === RETURN_CODE_API_CALL_SUCCESS) {
      user.accessToken = resultFromRefreshToken.data.accessToken;
      updateUserTokenDispatcher(resultFromRefreshToken.data.accessToken);
      return await callingToApi(user, apiUrl, method, params, data);
    } else {
      if (
        resultFromRefreshToken.data &&
        (resultFromRefreshToken.data.code === RETURN_CODE_API_CALL_SESSION_TIMEOUT ||
          resultFromRefreshToken.data.code === ERROR_CODE_INVALID_REFRESH_TOKEN)
      ) {
        sessionTimeoutDispatcher();
      } else {
        return {
          result: RETURN_CODE_API_CALL_FAILURE,
          data: resultFromRefreshToken.data,
        };
      }
    }
  } else {
    return {
      result: RETURN_CODE_API_CALL_FAILURE,
      data: error,
    };
  }
};

export { callNonSecureApi, callSecureApi };
