import { BaseCustomClass } from './baseCustomClass';

// System Error
export const ERROR_SERVER_ERROR: string = 'ERROR_SERVER_ERROR';
export const ERROR_CODE_NETWORK_ERROR: string = 'ERROR_CODE_NETWORK_ERROR';
export const ERROR_CODE_PATH_NOT_FOUND: string = 'ERROR_CODE_PATH_NOT_FOUND';

// Firebase Error
export const ERROR_CODE_DATABASE_CONNECTION: string =
  'ERROR_CODE_DATABASE_CONNECTION';
export const ERROR_CODE_DATABASE_EXECUTE_TRANSACTION: string =
  'ERROR_CODE_DATABASE_EXECUTE_TRANSACTION';
export const ERROR_CODE_DATABASE_PRE_EXECUTE_TRANSACTION: string =
  'ERROR_CODE_DATABASE_PRE_EXECUTE_TRANSACTION';

// Stampery Error
export const ERROR_CODE_STAMPERY_PROCESS: string =
  'ERROR_CODE_STAMPERY_PROCESS';

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
export const ERROR_CODE_MISMITCH_LANGUAGE: string =
  'ERROR_CODE_MISMITCH_LANGUAGE';

export const ERROR_CODE_COVER_FILE_FORMAT: string =
  'ERROR_CODE_COVER_FILE_FORMAT';

export const ERROR_CODE_SAVE_IMAGE_COVER: string =
  'ERROR_CODE_SAVE_IMAGE_COVER';

export const ERROR_CODE_FICTION_SUSPEND_OR_DELETE: string =
  'ERROR_CODE_FICTION_SUSPEND_OR_DELETE';
export const ERROR_CODE_FICTION_NOT_EXIST: string =
  'ERROR_CODE_FICTION_NOT_EXIST';
export const ERROR_CODE_CHAPTER_NOT_EXIST: string =
  'ERROR_CODE_CHAPTER_NOT_EXIST';

  export const ERROR_CODE_CHAPTER_ALREADY_PUBLISH: string =
  'ERROR_CODE_CHAPTER_ALREADY_PUBLISH';
  
export const ERROR_CODE_FICTION_NOT_COMPLETE_ZERO_CHAPTER: string =
  'ERROR_CODE_FICTION_NOT_COMPLETE_ZERO_CHAPTER';

export const ERROR_CODE_NOVEL_CHAPTER_NOT_PURCHASE: string =
  'ERROR_CODE_NOVEL_CHAPTER_NOT_PURCHASE';

export const ERROR_CODE_NOT_ENOUGHT_COIN: string =
  'ERROR_CODE_NOT_ENOUGHT_COIN';

  export const ERROR_CODE__CHAPTER_ALREADY_PURCHASE: string =
  'ERROR_CODE__CHAPTER_ALREADY_PURCHASE';

export const ERROR_CODE_PROCESS_ERROR: string = 'ERROR_CODE_PROCESS_ERROR';

export class Error extends BaseCustomClass {
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
