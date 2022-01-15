import {
  requestResetPassword,
  verifyResetPasswordToken,
  setNewPassword,
} from './service/userProfileService';
import {
  Error,
  ERROR_CODE_DATABASE_CONNECTION,
  ERROR_CODE_NETWORK_ERROR,
} from './common/error';
import {
  HTTP_REQUEST_SUCCESS,
  ResponseRequest,
} from './common/responseRequest';
import { User } from './common/user';
import { allowCors } from './util/corsResponseUtil';
import { responseTransform } from './util/returnResponseUtil';
import * as pathToRegexp from 'path-to-regexp';
import { preflightChecking } from './preflightCheckingService';

export const passwordService = preflightChecking(
  async (request, returnResponse) => {
    const response = new ResponseRequest(HTTP_REQUEST_SUCCESS, '');

    const keys = [];
    const pathProcessing = pathToRegexp('/:pathOption?', keys, {
      strict: false,
    });
    const pathVars = pathProcessing.exec(request.path);
    let recoveryPath: boolean = false;
    let verifyPath: boolean = null;
    let userIdentity: string = null;
    if (pathVars) {
      if (pathVars.length > 1) {
        switch (pathVars[1]) {
          case 'recovery':
            recoveryPath = true;
            break;
          case 'verify':
            verifyPath = true;
            break;
          default:
            userIdentity = pathVars[1];
        }
      }
    }

    try {
      request.body = Object.assign(
        request.body ? request.body : {},
        request.query,
      );
      if (request.method === 'POST') {
        if (recoveryPath) {
          await requestResetPassword(request, response);
        } else if (verifyPath) {
          await verifyResetPasswordToken(request, response);
        } else {
          await setNewPassword(request, response);
        }
      }
    } catch (err) {
      responseTransform(response, true, err);
    }
    allowCors(returnResponse);
    returnResponse.status(response.statusCode).send(response.body);
  },
);
