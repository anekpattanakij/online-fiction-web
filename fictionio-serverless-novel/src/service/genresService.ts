import Genres from '../common/genres';
import { Error, ERROR_CODE_DATABASE_CONNECTION } from '../common/error';
import {
  HTTP_REQUEST_SUCCESS,
  ResponseRequest,
} from '../common/responseRequest';
import { GenresUtil } from '../dataLayer/genresUtil';
import { allowCors } from '../util/corsResponseUtil';
import { responseTransform } from '../util/returnResponseUtil';

export const getGenres = async (request, response) => {
  let language: string = 'EN';
  if (request.query && request.query.language) {
    language = request.query.language;
  }

  const resultFromDb: Genres[] | void = await GenresUtil.getGenresUtil(
  ).catch(error => {
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
