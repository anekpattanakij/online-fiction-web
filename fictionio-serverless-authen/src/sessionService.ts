import {
  login,
  googleLogin,
  facebookLogin,
} from './service/loginService';
import{
  refresh,
  revoke,
} from './service/refreshTokenService';
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
import {preflightChecking} from './preflightCheckingService';

export const sessionService = preflightChecking(
  async (request, returnResponse) => {
    const response = new ResponseRequest(HTTP_REQUEST_SUCCESS, '');

    try {
      const keys = [];
      const pathProcessing = pathToRegexp('/:pathOption?', keys, {
        strict: false,
      });
      const pathVars = pathProcessing.exec(request.path);
      let refreshTokenService: boolean = false;
      let revokeTokenService: boolean = false;
      let userIdentity: string = null;

      if (request.method === 'POST') {
        if (pathVars) {
          if (pathVars.length > 1) {
            switch (pathVars[1]) {
              case 'refresh':
                refreshTokenService = true;
                break;
              default:
                userIdentity = pathVars[1];
            }
          }
        }
        if(refreshTokenService) {
          await refresh(request, response);
        } else if (request.query && request.query.auth && request.query.auth === 'google') {
          await googleLogin(request, response);
        } else if (request.query && request.query.auth && request.query.auth === 'facebook') {
          await facebookLogin(request, response);
        } else {
          await login(request, response);
        }
      } else if (request.method === 'PUT') {
        if (pathVars) {
          if (pathVars.length > 1) {
            switch (pathVars[1]) {
              case 'revoke' :
              revokeTokenService = true;
              break;
              default:
                userIdentity = pathVars[1];
            }
          }
        }
        if(revokeTokenService) {
          await revoke(request, response);
        }
        // asd
      } else if (request.method === 'GET') {
        // asd
      }
    } catch (err) {
      responseTransform(response, true, err);
    }
    allowCors(returnResponse);
    returnResponse.status(response.statusCode).send(response.body);
  },
);
