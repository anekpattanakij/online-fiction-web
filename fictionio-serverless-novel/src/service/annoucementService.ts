import Annoucement from '../common/annoucement';
import { Error, ERROR_CODE_DATABASE_CONNECTION } from '../common/error';
import {
  HTTP_REQUEST_SUCCESS,
  ResponseRequest,
} from '../common/responseRequest';
import { AnnoucementUtil } from '../dataLayer/annoucementUtil';
import { allowCors } from '../util/corsResponseUtil';
import { responseTransform } from '../util/returnResponseUtil';

export const getAnnoucement = async (request, response) => {
  const resultFromDb:
    | Annoucement[]
    | void = await AnnoucementUtil.getAnnoucementUtil().catch(error => {
    const returnError: Error = new Error(
      ERROR_CODE_DATABASE_CONNECTION,
      JSON.stringify(error),
    );
    responseTransform(response, true, error);
  });
  if (resultFromDb) {
    responseTransform(response, false, resultFromDb);
  } else {
    responseTransform(response, false, new Array());
  }
  return response;
};
