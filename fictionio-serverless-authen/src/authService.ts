import * as jwk from 'jsonwebtoken';
import { User } from './common/user';

import {
  Error,
  ERROR_CODE_ACCESS_EXPIRE,
  ERROR_CODE_INVALID_ACCESS_TOKEN,
  ERROR_CODE_NO_AUTHORIZE_IN_HEADER,
  ERROR_SERVER_ERROR,
} from './common/error';
import {
  HTTP_REQUEST_FAIL,
  HTTP_REQUEST_SUCCESS,
  HTTP_REQUEST_UNAUTHORIZE,
  ResponseRequest,
} from './common/responseRequest';
import { Config } from './config';

export const authorizeService = async (
  event,
  context,
): Promise<ResponseRequest> => {
  return new Promise<ResponseRequest>((resolve, reject) => {
    const response: ResponseRequest = new ResponseRequest(
      HTTP_REQUEST_SUCCESS,
      '',
    );
    // check Authorization in header
    try {
      if (event.headers.bearer) {
        const token = event.headers.bearer;
        // verify token first
        try {
          const decoded = jwk.verify(token, Config.SIGN_TOKEN);

          if (decoded) {
            response.statusCode = HTTP_REQUEST_SUCCESS;
            response.body = JSON.stringify({ resultFromJWT: decoded });
            resolve(response);
          } else {
            response.statusCode = HTTP_REQUEST_UNAUTHORIZE;
            response.body = JSON.stringify(
              new Error(
                ERROR_CODE_INVALID_ACCESS_TOKEN,
                'Invalid token not in store',
              ),
            );
            reject(response);
          }
        } catch (err) {
          response.statusCode = HTTP_REQUEST_UNAUTHORIZE;
          if (err.name && err.name === 'TokenExpiredError') {
            reject(
              new Error(
                ERROR_CODE_ACCESS_EXPIRE,
                'Invalid token FAIL on verify.',
              ),
            );
          } else {
            reject(
              new Error(
                ERROR_CODE_INVALID_ACCESS_TOKEN,
                'Invalid token FAIL on verify.',
              ),
            );
          }
        }
      } else {
        reject(
          new Error(
            ERROR_CODE_NO_AUTHORIZE_IN_HEADER,
            'No authorizationToken found in the header.',
          ),
        );
      }
    } catch (err) {
      reject(new Error(ERROR_SERVER_ERROR, 'Error in authservice.'));
    }
  });
};
