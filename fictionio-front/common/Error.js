export const ERROR_CODE_REFRESH_EXPIRE = 'ERROR_CODE_REFRESH_EXPIRE';
export const ERROR_CODE_ACCESS_EXPIRE = 'ERROR_CODE_ACCESS_EXPIRE';
export const ERROR_CODE_NETWORK_ERROR = 'ERROR_CODE_NETWORK_ERROR';
export const ERROR_CODE_NOVEL_CHAPTER_NOT_PURCHASE = 'ERROR_CODE_NOVEL_CHAPTER_NOT_PURCHASE';
export const ERROR_CODE_NOT_COIN_TO_PURCHASE = 'ERROR_CODE_NOT_COIN_TO_PURCHASE';
export const ERROR_CODE_INVALID_REFRESH_TOKEN = 'ERROR_CODE_INVALID_REFRESH_TOKEN';
export const ERROR_CODE_FICTION_NOT_EXIST = 'ERROR_CODE_FICTION_NOT_EXIST';
export const ERROR_CODE_CHAPTER_NOT_EXIST = 'ERROR_CODE_CHAPTER_NOT_EXIST';
export const ERROR_CODE_FICTION_SUSPEND_OR_DELETE = 'ERROR_CODE_FICTION_SUSPEND_OR_DELETE';

export default class Error {
  transformErrorFromOmise(returnError) {
    if (returnError.response && returnError.response.data && returnError.response.data.code) {
      return new Error(returnError.response.data.code, 'Charge via omise error');
    } else {
      return returnError.response.data;
    }
  }

  transformErrorFromAxios(returnError) {
    if (!returnError.response || !returnError.response.data) {
      return new Error(ERROR_CODE_NETWORK_ERROR, 'Network Error');
    } else {
      return returnError.response.data;
    }
  }

  code;
  message;

  constructor(code, message) {
    this.code = code;
    this.message = message;
  }
}
