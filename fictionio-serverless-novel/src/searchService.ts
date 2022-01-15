import {
  HTTP_REQUEST_SUCCESS,
  ResponseRequest,
} from './common/responseRequest';
import { allowCors } from './util/corsResponseUtil';
import { responseTransform } from './util/returnResponseUtil';
import { preflightChecking } from './preflightCheckingService';
import { getSearchFictionList } from './service/fictionService';

export const searchService = preflightChecking(
  async (request, returnResponse) => {
    const response = new ResponseRequest(HTTP_REQUEST_SUCCESS, '');

    try {
      if (request.method === 'GET') {
        await getSearchFictionList(request, response);
      }
    } catch (err) {
      responseTransform(response, true, err);
    }
    allowCors(returnResponse);
    returnResponse.status(response.statusCode).send(response.body);
  },
);
