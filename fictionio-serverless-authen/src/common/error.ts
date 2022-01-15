import { BaseCustomClass } from './baseCustomClass';

// System Error
export const ERROR_SERVER_ERROR: string = 'ERROR_SERVER_ERROR';
export const ERROR_CODE_NETWORK_ERROR: string = 'ERROR_CODE_NETWORK_ERROR';

// Recatpcha error
export const ERROR_CODE_RECAPTCHA_INCORRECT: string =
  'ERROR_CODE_RECAPTCHA_INCORRECT';

// MySql Error
export const ERROR_CODE_DATABASE_PRE_EXECUTE_TRANSACTION: string =
  'ERROR_CODE_DATABASE_PRE_EXECUTE_TRANSACTION';
export const ERROR_CODE_DATABASE_CONNECTION: string =
  'ERROR_CODE_DATABASE_CONNECTION';
export const ERROR_CODE_DATABASE_EXECUTE_TRANSACTION: string =
  'ERROR_CODE_DATABASE_EXECUTE_TRANSACTION';

// Input or Token error

export const ERROR_CODE_INVALID_INPUT: string = 'ERROR_CODE_INVALID_INPUT';
export const ERROR_CODE_INVALID_TOKEN: string = 'ERROR_CODE_INVALID_TOKEN';
export const ERROR_CODE_NO_AUTHORIZE: string = 'ERROR_CODE_NO_AUTHORIZE';
export const ERROR_CODE_NO_AUTHORIZE_IN_HEADER: string =
  'ERROR_CODE_NO_AUTHORIZE_IN_HEADER';
export const ERROR_CODE_REFRESH_EXPIRE: string = 'ERROR_CODE_REFRESH_EXPIRE';
export const ERROR_CODE_INVALID_REFRESH_TOKEN: string =
  'ERROR_CODE_INVALID_REFRESH_TOKEN';
export const ERROR_CODE_ACCESS_EXPIRE: string = 'ERROR_CODE_ACCESS_EXPIRE';
export const ERROR_CODE_INVALID_ACCESS_TOKEN: string =
  'ERROR_CODE_INVALID_ACCESS_TOKEN';

// User error list
export const ERROR_CODE_RESET_TOKEN_FOUND: string =
  'ERROR_CODE_RESET_TOKEN_FOUND';
export const ERROR_CODE_USER_DUPLICATE_EMAIL: string =
  'ERROR_CODE_USER_DUPLICATE_EMAIL';

export const ERROR_CODE_PASSWORD_NOT_MATCH: string =
  'ERROR_CODE_PASSWORD_NOT_MATCH';
export const ERROR_CODE_SOCIAL_LOGIN_EMAIL_IN_USE: string =
  'ERROR_CODE_SOCIAL_LOGIN_EMAIL_IN_USE';

export const ERROR_CODE_PROCESS_ERROR: string = 'ERROR_CODE_PROCESS_ERROR';

export class Error extends BaseCustomClass {
  public static transformErrorFromAxios(returnError: any): Error {
    if (!returnError.response || !returnError.response.data) {
      return new Error(ERROR_CODE_NETWORK_ERROR, 'Network Error');
    } else {
      return returnError.response.data;
    }
  }

  public code: string;
  public message: string;

  constructor(code: string, message: string) {
    super();
    this.code = code;
    this.message = message;
  }
}
