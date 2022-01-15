import { Config } from './../config/index';
import { password } from './../index';
import { ChapterUtil } from './../dataLayer/chapterUtil';
import { FictionUtil } from './../dataLayer/fictionUtil';
import { sha3_512 } from 'js-sha3';
import * as validator from 'validator';
import { authorizeService } from '../authService';
import {
  Error,
  ERROR_CODE_INVALID_INPUT,
  ERROR_CODE_DATABASE_CONNECTION,
  ERROR_CODE_NO_AUTHORIZE,
  ERROR_CODE_PASSWORD_NOT_MATCH,
  ERROR_CODE_RESET_TOKEN_FOUND,
} from '../common/error';
import {
  HTTP_REQUEST_SUCCESS,
  ResponseRequest,
} from '../common/responseRequest';
import { User } from '../common/user';
import { UserUtil } from '../dataLayer/userUtil';
import { makeRandomKey } from '../util/randomUtil';
import { responseTransform } from '../util/returnResponseUtil';
import { sendingEmail } from '../util/emailUtil';
import FICTION_STATUS from '../config/fictionStatusList';

export const requestResetPassword = async (request, response) => {
  const DEFAULT_LANGUAGE: string = 'EN';
  const DEFAULT_RESET_TOKEN_LENGTH: number = 10;
  let inputObject: any;
  let messageLanguage: string = DEFAULT_LANGUAGE;
  inputObject = request.body;
  try {
    if (!inputObject.email || validator.isEmpty(inputObject.email)) {
      throw new Error(ERROR_CODE_INVALID_INPUT, 'Invalid input');
    }
    if (inputObject.langauge) {
      messageLanguage = inputObject.langauge;
    }
    const randomResetKey: string = makeRandomKey(DEFAULT_RESET_TOKEN_LENGTH);
    const resultChange: boolean | void = await UserUtil.saveResetToken(
      inputObject.email,
      randomResetKey,
    ).catch(error => {
      const returnError: Error = new Error(
        ERROR_CODE_DATABASE_CONNECTION,
        JSON.stringify(error),
      );
      responseTransform(response, true, error);
    });
    responseTransform(response, false, { result: 'success' });
    if (resultChange) {
      // Send Email
      let targetTemplateMessage = Config.EMAIL_TEMPLATE_ID_RESET_PASSWORD_EN;
      switch (messageLanguage) {
        case 'TH':
          targetTemplateMessage = Config.EMAIL_TEMPLATE_ID_RESET_PASSWORD_TH;
          break;
        default:
      }

      sendingEmail(targetTemplateMessage, inputObject.email, {
        reset_password_link:
          Config.VERIFY_RESET_PASSWORD_URL + '?resetToken=' + randomResetKey,
      });
    }
  } catch (error) {
    responseTransform(response, true, error);
  }
};

export const getPurchaseHistoryList = async (request, response) => {
  let inputObject: any;
  inputObject = request.body;
  try {
    const responseFromAuthorizer = await authorizeService(
      request,
      response,
    ).catch(error => {
      throw error;
    });

    const inputUser: User = User.decodeUser(
      JSON.parse(responseFromAuthorizer.body).resultFromJWT,
    );

    const resultList: Array<
      any
    > | void = await UserUtil.getPurchaseChapterHistory(inputUser.cif).catch(
      error => {
        responseTransform(
          response,
          true,
          new Error(ERROR_CODE_DATABASE_CONNECTION, JSON.stringify(error)),
        );
      },
    );

    responseTransform(response, false, { result: resultList });
  } catch (error) {
    responseTransform(response, true, error);
  }
};

export const getWithdrawHistoryList = async (request, response) => {
  let inputObject: any;
  inputObject = request.body;
  try {
    const responseFromAuthorizer = await authorizeService(
      request,
      response,
    ).catch(error => {
      throw error;
    });

    const inputUser: User = User.decodeUser(
      JSON.parse(responseFromAuthorizer.body).resultFromJWT,
    );

    const resultList: Array<any> | void = await UserUtil.getWithdrawHistory(
      inputUser.cif,
    ).catch(error => {
      responseTransform(
        response,
        true,
        new Error(ERROR_CODE_DATABASE_CONNECTION, JSON.stringify(error)),
      );
    });

    responseTransform(response, false, { result: resultList });
  } catch (error) {
    responseTransform(response, true, error);
  }
};

export const verifyResetPasswordToken = async (request, response) => {
  let inputObject: any;
  inputObject = request.body;
  try {
    if (!inputObject.resetToken || validator.isEmpty(inputObject.resetToken)) {
      throw new Error(ERROR_CODE_INVALID_INPUT, 'Invalid input');
    }

    const resultUser: User | void = await UserUtil.getUser(
      null,
      inputObject.resetToken,
    ).catch(error => {
      const returnError: Error = new Error(
        ERROR_CODE_DATABASE_CONNECTION,
        JSON.stringify(error),
      );
      responseTransform(response, true, returnError);
    });

    if (!resultUser) {
      throw new Error(ERROR_CODE_RESET_TOKEN_FOUND, 'Reset Token Not found');
    }
    responseTransform(response, false, { email: resultUser.email });
  } catch (error) {
    responseTransform(response, true, error);
  }
};

export const setNewPassword = async (request, response) => {
  let inputObject: any;
  inputObject = request.body;
  try {
    if (
      !inputObject.email ||
      validator.isEmpty(inputObject.email) ||
      !inputObject.resetToken ||
      validator.isEmpty(inputObject.resetToken) ||
      !inputObject.password ||
      validator.isEmpty(inputObject.password)
    ) {
      throw new Error(ERROR_CODE_INVALID_INPUT, 'Invalid input');
    }

    const resultUpdate: boolean | void = await UserUtil.setNewPassword(
      inputObject.resetToken,
      sha3_512(Config.PASSWORD_SALT + inputObject.password),
      inputObject.email,
    ).catch(error => {
      const returnError: Error = new Error(
        ERROR_CODE_DATABASE_CONNECTION,
        JSON.stringify(error),
      );
      responseTransform(response, true, returnError);
    });
    if (resultUpdate) {
      responseTransform(response, false, { result: 'success' });
    } else {
      throw new Error(ERROR_CODE_RESET_TOKEN_FOUND, 'Reset Token not match');
    }
  } catch (error) {
    responseTransform(response, true, error);
  }
};

export const changePassword = async (request, response) => {
  let inputObject: any;
  inputObject = request.body;
  try {
    if (
      !inputObject.currentPassword ||
      validator.isEmpty(inputObject.currentPassword) ||
      !inputObject.newPassword ||
      validator.isEmpty(inputObject.newPassword)
    ) {
      throw new Error(ERROR_CODE_INVALID_INPUT, 'Invalid input');
    }

    const responseFromAuthorizer = await authorizeService(
      request,
      response,
    ).catch(error => {
      throw error;
    });

    const inputUser: User = User.decodeUser(
      JSON.parse(responseFromAuthorizer.body).resultFromJWT,
    );
    const resultChange: boolean | void = await UserUtil.changePassword(
      sha3_512(Config.PASSWORD_SALT + inputObject.currentPassword),
      sha3_512(Config.PASSWORD_SALT + inputObject.newPassword),
      inputUser.cif,
    ).catch(error => {
      const returnError: Error = new Error(
        ERROR_CODE_DATABASE_CONNECTION,
        JSON.stringify(error),
      );
      responseTransform(response, true, returnError);
    });
    if (resultChange) {
      responseTransform(response, false, { result: 'success' });
    } else {
      throw new Error(ERROR_CODE_PASSWORD_NOT_MATCH, 'Password not match');
    }
  } catch (error) {
    responseTransform(response, true, error);
  }
};

export const updateUserProfile = async (request, response) => {
  let inputObject: any;
  inputObject = request.body;
  try {
    if (
      !inputObject.email ||
      validator.isEmpty(inputObject.email) ||
      !Array.isArray(inputObject.preferredLanguage)
    ) {
      throw new Error(ERROR_CODE_INVALID_INPUT, 'Invalid input');
    }
    const responseFromAuthorizer = await authorizeService(
      request,
      response,
    ).catch(error => {
      throw error;
    });

    const inputUser: User = User.decodeUser(
      JSON.parse(responseFromAuthorizer.body).resultFromJWT,
    );

    inputUser.email = inputObject.email;
    inputUser.preferredLanguage = inputObject.preferredLanguage;
    const resultUser: void | User = await UserUtil.updateUserProfile(
      inputUser,
    ).catch(error => {
      const returnError: Error = new Error(
        ERROR_CODE_DATABASE_CONNECTION,
        JSON.stringify(error),
      );
      responseTransform(response, true, returnError);
    });
    if (resultUser instanceof User) {
      responseTransform(response, false, { result: true });
    }
  } catch (error) {
    responseTransform(response, true, error);
  }
};

export const getFictionList = async (request, response) => {
  let inputObject: any;
  inputObject = request.body;
  let targetCif = '';
  let getAsViewer = true;
  try {
    if (request.query.userId) {
      targetCif = request.query.userId;
    } else {
      getAsViewer = false;
    }
    
    if (!getAsViewer) {
      const responseFromAuthorizer = await authorizeService(
        request,
        response,
      ).catch(error => {
        throw error;
      });

      const inputUser: User = User.decodeUser(
        JSON.parse(responseFromAuthorizer.body).resultFromJWT,
      );
      targetCif = inputUser.cif;
    }
    const resultList: Array<any> | void = await FictionUtil.getFictionList(
      targetCif,
    ).catch(error => {
      responseTransform(
        response,
        true,
        new Error(ERROR_CODE_DATABASE_CONNECTION, JSON.stringify(error)),
      );
    });
    if (getAsViewer && resultList instanceof Array) {
      // for viewer - remove draft item
      for (let i = 0; i < resultList.length; i++) {
        if (!resultList[i].isPublished || resultList[i].isDeleted) {
          resultList.splice(i, 1);
        }
      }
    }
    responseTransform(response, false, { result: resultList });
  } catch (error) {
    responseTransform(response, true, error);
  }
};

export const getTranslateList = async (request, response) => {
  let inputObject: any;
  inputObject = request.body;
  try {
    const resultList: Array<
      any
    > | void = await FictionUtil.getTranslateFictionList(
      request.query.userId,
    ).catch(error => {
      responseTransform(
        response,
        true,
        new Error(ERROR_CODE_DATABASE_CONNECTION, JSON.stringify(error)),
      );
    });
    // for viewer - remove draft item
    if (resultList && resultList instanceof Array) {
      for (let i = 0; i < resultList.length; i++) {
        if (!(resultList[i].isPublished && !resultList[i].isDeleted)) {
          resultList.splice(i, 1);
        }
      }
    }
    responseTransform(response, false, { result: resultList });
  } catch (error) {
    responseTransform(response, true, error);
  }
};

export const getChapterList = async (request, response) => {
  let inputObject: any;
  inputObject = request.body;
  try {
    const responseFromAuthorizer = await authorizeService(
      request,
      response,
    ).catch(error => {
      throw error;
    });

    const inputUser: User = User.decodeUser(
      JSON.parse(responseFromAuthorizer.body).resultFromJWT,
    );

    const resultList: Array<any> | void = await ChapterUtil.getChapterList(
      inputUser.cif,
    ).catch(error => {
      responseTransform(
        response,
        true,
        new Error(ERROR_CODE_DATABASE_CONNECTION, JSON.stringify(error)),
      );
    });

    responseTransform(response, false, { result: resultList });
  } catch (error) {
    responseTransform(response, true, error);
  }
};

export const getUserProfileAsViewer = async (request, response) => {
  let inputObject: any;
  inputObject = request.body;
  try {
    if (!request.query.userId) {
      throw new Error(ERROR_CODE_INVALID_INPUT, 'Invalid input');
    }
    const resultUser: User | void = await UserUtil.getUserById(
      request.query.userId,
    ).catch(error => {
      responseTransform(
        response,
        true,
        new Error(ERROR_CODE_DATABASE_CONNECTION, JSON.stringify(error)),
      );
    });
    // remove sensitive data before return
    if (resultUser instanceof User) {
      resultUser.password = '';
      resultUser.coin = 0;
      resultUser.refreshToken = '';
      resultUser.usertype = 1;
      resultUser.email = '';
    }
    responseTransform(response, false, { result: resultUser });
  } catch (error) {
    responseTransform(response, true, error);
  }
};
