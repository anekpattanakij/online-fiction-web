import * as jwt from 'jsonwebtoken';
import * as validator from 'validator';
import {
  Error,
  ERROR_CODE_INVALID_INPUT,
  ERROR_CODE_INVALID_REFRESH_TOKEN,
  ERROR_CODE_DATABASE_CONNECTION,
  ERROR_CODE_REFRESH_EXPIRE,
} from '../common/error';
import {
  HTTP_REQUEST_SUCCESS,
  ResponseRequest,
} from '../common/responseRequest';
import { User } from '../common/user';
import { Config } from '../config';
import { UserUtil } from '../dataLayer/userUtil';
import { responseTransform } from '../util/returnResponseUtil';

export const refresh = async (request, response) => {
  let inputObject: any;
  inputObject = request.body;
  try {
    if (!request.body) {
      throw new Error(ERROR_CODE_INVALID_INPUT, 'Invalid input');
    }

    if (
      !inputObject.email ||
      !validator.isEmail(inputObject.email) ||
      !inputObject.refreshToken ||
      validator.isEmpty(inputObject.refreshToken)
    ) {
      throw new Error(ERROR_CODE_INVALID_INPUT, 'Invalid input');
    }
    // Get Refresh to token from db storage
    const currentUser = await UserUtil.getUser(inputObject.email).catch(
      error => {
        throw new Error(ERROR_CODE_DATABASE_CONNECTION, JSON.stringify(error));
      },
    );
    // If no user in database - return error
    if (!currentUser) {
      throw new Error(
        ERROR_CODE_INVALID_REFRESH_TOKEN,
        'REFRESH TOKEN and EMAIL does not match',
      );
    }
    // If refresh token is empty - return error
    if (validator.isEmpty(currentUser.refreshToken)) {
      throw new Error(
        ERROR_CODE_INVALID_REFRESH_TOKEN,
        'REFRESH TOKEN and EMAIL does not match',
      );
    }
    let newAccessToken: string;
    if (currentUser.refreshToken === inputObject.refreshToken) {
      const timeoutDate: Date = new Date();
      timeoutDate.setHours(
        timeoutDate.getHours() - Config.REFRESH_TIMEOUT_HOUR,
      );
      if (currentUser.lastLoginDate < timeoutDate) {
        throw new Error(ERROR_CODE_REFRESH_EXPIRE, 'REFRESH TOKEN has expired');
      }
      // check if refresh token has expire time
      newAccessToken = currentUser.generateAccessToken();
    } else {
      throw new Error(
        ERROR_CODE_INVALID_REFRESH_TOKEN,
        'REFRESH TOKEN and EMAIL does not match',
      );
    }

    // if pass all, put success response
    response.statusCode = HTTP_REQUEST_SUCCESS;
    responseTransform(response, false, {
      accessToken: newAccessToken,
    });
  } catch (error) {
    responseTransform(response, true, error);
  }
};

export const revoke = async (request, response) => {
  let inputObject: any;
  inputObject = request.body;
  try {
    if (
      !inputObject.cif ||
      validator.isEmpty(inputObject.cif) ||
      !inputObject.refreshToken ||
      validator.isEmpty(inputObject.refreshToken)
    ) {
      throw new Error(ERROR_CODE_INVALID_INPUT, 'Invalid input');
    }
    const result = await UserUtil.removeRefreshToken(
      inputObject.cif,
      inputObject.refreshToken,
    ).catch(error => {
      throw new Error(ERROR_CODE_DATABASE_CONNECTION, JSON.stringify(error));
    });
    // If no user in database - return error
    if (!result) {
      throw new Error(
        ERROR_CODE_INVALID_REFRESH_TOKEN,
        'REFRESH TOKEN and EMAIL does not match',
      );
    }
    // if pass all, put success response
    response.statusCode = HTTP_REQUEST_SUCCESS;
    responseTransform(response, false, {
      message: 'succesfully revoke ',
    });
  } catch (error) {
    responseTransform(response, true, error);
  }
};
