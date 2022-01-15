import {
  Error,
  ERROR_CODE_DATABASE_CONNECTION,
  ERROR_CODE_NETWORK_ERROR,
  ERROR_CODE_PATH_NOT_FOUND,
} from './common/error';
import {
  HTTP_REQUEST_SUCCESS,
  ResponseRequest,
} from './common/responseRequest';
import { allowCors } from './util/corsResponseUtil';
import { responseTransform } from './util/returnResponseUtil';
import * as pathToRegexp from 'path-to-regexp';
import { preflightChecking } from './preflightCheckingService';
import {
  getFiction,
  getFictionList,
  getNewFictionList,
  getTopFictionList,
  startFiction,
  editFiction,
  translateFiction,
  rateFiction,
  updateFictionStatus,
} from './service/fictionService';
import {
  addChapter,
  getChapterList,
  getReduceChapterList,
} from './service/chapterService';
import { extractPathFromQueryString } from './util/pathQueryUtil';

const PATH_OPTION_POSITION: number = 2;

export const fictionService = preflightChecking(
  async (request, returnResponse) => {
    const response = new ResponseRequest(HTTP_REQUEST_SUCCESS, '');
    const pathWithOptionProcessing = pathToRegexp('/:fictionId?/:pathOption?');
    let statusPath: boolean = false;
    let fictionId: string = null;
    let getAsList: boolean = false;
    let reduceChapterPath: boolean = false;
    let chapterPath: boolean = false;
    let translatePath: boolean = false;
    let ratePath: boolean = false;
    let newPath: boolean = false;
    let topPath: boolean = false;
    let unknownPath: boolean = false;
    const pathVars = pathWithOptionProcessing.exec(request.path);
    if (typeof pathVars[1] !== 'undefined' && pathVars[1]) {
      fictionId = extractPathFromQueryString(pathVars[1]);
      request.query.fictionId = fictionId;
    } else {
      if (request.query.list && request.query.list === 'new') {
        newPath = true;
      } else if (request.query.list && request.query.list === 'top') {
        topPath = true;
      } else {
        getAsList = true;
      }
    }
    if (
      typeof pathVars[PATH_OPTION_POSITION] !== 'undefined' &&
      pathVars[PATH_OPTION_POSITION]
    ) {
      switch (extractPathFromQueryString(pathVars[PATH_OPTION_POSITION])) {
        case 'reduce-chapter':
          reduceChapterPath = true;
          break;
        case 'chapter':
          chapterPath = true;
          break;
        case 'translate':
          translatePath = true;
          break;
        case 'rate':
          ratePath = true;
          break;
        case 'status':
          statusPath = true;
          break;
        default:
          unknownPath = true;
      }
    }
    try {
      if (request.method === 'POST') {
        if (chapterPath) {
          await addChapter(request, response);
        } else {
          await startFiction(request, response);
        }
      } else if (request.method === 'GET') {
        if (reduceChapterPath) {
          await getReduceChapterList(request, response);
        } else if (newPath) {
          await getNewFictionList(request, response);
        } else if (topPath) {
          await getTopFictionList(request, response);
        } else if (getAsList) {
          await getFictionList(request, response);
        } else if (chapterPath) {
          await getChapterList(request, response);
        } else if (fictionId) {
          await getFiction(request, response);
        } else {
          unknownPath = true;
        }
      } else if (request.method === 'PUT') {
        if (translatePath) {
          await translateFiction(request, response);
        } else if (ratePath) {
          await rateFiction(request, response);
        } else if (statusPath) {
          await updateFictionStatus(request, response);
        } else if (fictionId) {
          await editFiction(request, response);
        } else {
          unknownPath = true;
        }
      }
      if (unknownPath) {
        responseTransform(
          response,
          true,
          new Error(ERROR_CODE_PATH_NOT_FOUND, 'Path not found'),
        );
      }
    } catch (err) {
      responseTransform(response, true, err);
    }
    allowCors(returnResponse);
    returnResponse.status(response.statusCode).send(response.body);
  },
);
