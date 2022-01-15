import { BaseCustomClass } from './baseCustomClass';

// System Error
export const ERROR_SERVER_ERROR: string = 'ERROR_SERVER_ERROR';
export const ERROR_CODE_NETWORK_ERROR: string = 'ERROR_CODE_NETWORK_ERROR';

// MySql Error
export const ERROR_CODE_MYSQL_CONNECTION: string =
  'ERROR_CODE_DATABASE_CONNECTION';
export const ERROR_CODE_MYSQL_EXECUTE_TRANSACTION: string =
  'ERROR_CODE_DATABASE_EXECUTE_TRANSACTION';
export const ERROR_CODE_MYSQL_PRE_EXECUTE_TRANSACTION: string =
  'ERROR_CODE_DATABASE_PRE_EXECUTE_TRANSACTION';

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
export const ERROR_CODE_USER_DUPLICATE_EMAIL: string =
  'ERR_USER_DUPLICATE_EMAIL';

// Fiction error list

export const ERROR_CODE_FICTION_NOT_EXIST: string =
  'ERROR_CODE_FICTION_NOT_EXIST';
export const ERROR_CODE_CHAPTER_NOT_EXIST: string =
  'ERROR_CODE_CHAPTER_NOT_EXIST';
export const ERROR_CODE_NOVEL_NOT_PUBLISH_ZERO_CHAPTER: string =
  'ERROR_CODE_NOVEL_NOT_PUBLISH_ZERO_CHAPTER';

export const ERROR_CODE_NOVEL_CHAPTER_NOT_PURCHASE: string =
  'ERROR_CODE_NOVEL_CHAPTER_NOT_PURCHASE';

export class Error extends BaseCustomClass {
  public static transformErrorFromOmise(returnError: any): Error {
    if (
      returnError.response &&
      returnError.response.data &&
      returnError.response.data.code
    ) {
      return new Error(
        returnError.response.data.code,
        'Charge via omise error',
      );
    } else {
      return returnError.response.data;
    }
  }

  public static transformErrorFromAxios(returnError: any): Error {
    if (!returnError.response || !returnError.response.data) {
      return new Error(ERROR_CODE_NETWORK_ERROR, 'Network Error');
    } else {
      return returnError.response.data;
    }
  }

  public static transformErrorFromAuthorizer(input: string): Error {
    const errorFromAuthorizer = JSON.parse(input);
    return new Error(errorFromAuthorizer.code, errorFromAuthorizer.message);
  }

  public code: string;
  public message: string;

  constructor(code: string, message: string) {
    super();
    this.code = code;
    this.message = message;
  }
}
