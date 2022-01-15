import { Error, ERROR_CODE_MYSQL_CONNECTION } from './common/error';
import {
  HTTP_REQUEST_SUCCESS,
  ResponseRequest,
} from './common/responseRequest';
import { chargeByToken } from './service/omiseCharge';
import { submitTransferRequest } from './service/bankTransfer';
import { allowCors } from './util/corsResponseUtil';
import { responseTransform } from './util/returnResponseUtil';
import * as pathToRegexp from 'path-to-regexp';
import { preflightChecking } from './preflightCheckingService';

export const paymentService = preflightChecking(
  async (request, returnResponse) => {
    const response: ResponseRequest = new ResponseRequest(
      HTTP_REQUEST_SUCCESS,
      '',
    );

    const keys = [];
    const pathProcessing = pathToRegexp('/:pathOption?', keys, {
      strict: false,
    });
    const pathVars = pathProcessing.exec(request.path);
    let bankTransfer: boolean = false;
    let creditCard: boolean = false;
    let userIdentity: string = null;
    if (pathVars) {
      if (pathVars.length > 1) {
        switch (pathVars[1]) {
          case 'bankTransfer':
            bankTransfer = true;
            break;

          case 'creditCard':
            creditCard = true;
            break;

          default:
            userIdentity = pathVars[1];
        }
      }
    }

    try {
      if (request.method === 'POST') {
        if(bankTransfer) {
            await submitTransferRequest(request, response);
        } else if(creditCard) {
            await chargeByToken(request, response);
        }
      } else if (request.method === 'PUT') {
        // for get request
      } else if (request.method === 'GET') {
        // get payment list
        // userIdentity
      }
    } catch (err) {
      responseTransform(response, true, err);
    }
    allowCors(returnResponse);
    returnResponse.status(response.statusCode).send(response.body);
  },
);
