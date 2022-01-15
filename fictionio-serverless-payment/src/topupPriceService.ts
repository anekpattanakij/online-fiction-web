import { Error, ERROR_CODE_MYSQL_CONNECTION } from './common/error';
import {
  HTTP_REQUEST_SUCCESS,
  ResponseRequest,
} from './common/responseRequest';
import { TopupPrice } from './common/topupPrice';
import { TopupPriceUtil } from './dataLayer/topupPriceUtil';
import { allowCors } from './util/corsResponseUtil';
import { responseTransform } from './util/returnResponseUtil';
import { preflightChecking } from './preflightCheckingService';

export const topupPriceService = preflightChecking(
  async (request, returnResponse) => {
    const response: ResponseRequest = new ResponseRequest(
      HTTP_REQUEST_SUCCESS,
      '',
    );
    try {
      if (request.method === 'POST') {
        // for post request
      } else if (request.method === 'PUT') {
        // for get request
      } else if (request.method === 'GET') {
        const resultFromDb:
          | { channel: string; priceList: TopupPrice[] }[]
          | void = await TopupPriceUtil.getPriceList().catch(error => {
          const returnError: Error = new Error(
            ERROR_CODE_MYSQL_CONNECTION,
            JSON.stringify(error),
          );
          responseTransform(response, true, returnError);
        });
        if (resultFromDb) {
          responseTransform(response, false, resultFromDb);
        }
      }
    } catch (err) {
      responseTransform(response, true, err);
    }
    allowCors(returnResponse);
    returnResponse.status(response.statusCode).send(response.body);
  },
);
