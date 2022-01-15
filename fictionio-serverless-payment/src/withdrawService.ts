import {
  HTTP_REQUEST_SUCCESS,
  ResponseRequest,
} from './common/responseRequest';
import { submitWithdrawRequest } from './service/withdrawRequest';
import { allowCors } from './util/corsResponseUtil';
import { responseTransform } from './util/returnResponseUtil';
import { preflightChecking } from './preflightCheckingService';

export const withdrawService = preflightChecking(
  async (request, returnResponse) => {
    const response: ResponseRequest = new ResponseRequest(
      HTTP_REQUEST_SUCCESS,
      '',
    );


    try {
      if (request.method === 'POST') {
        await submitWithdrawRequest(request, response);
        
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
