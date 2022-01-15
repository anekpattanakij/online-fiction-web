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
  getChapter,
  getChapterList,
  getNewChapterList,
  getTopChapterList,
  addChapter,
  editChapter,
  translateChapter,
  publishChapter,
  rateChapter,
  updateChapterStatus,
  getCommentChapter,
  postCommentChapter,
  deleteCommentChapter,
} from './service/chapterService';
import { purchaseChapter } from './service/purchaseService';
import { extractPathFromQueryString } from './util/pathQueryUtil';

const PATH_OPTION_POSITION: number = 2;

export const chapterService = preflightChecking(
  async (request, returnResponse) => {
    const response = new ResponseRequest(HTTP_REQUEST_SUCCESS, '');
    const pathWithOptionProcessing = pathToRegexp('/:chapterId?/:pathOption?');
    let statusPath: boolean = false;
    let chapterId: string = null;
    let purchasePath: boolean = false;
    let translatePath: boolean = false;
    let publishPath: boolean = false;
    let ratePath: boolean = false;
    let unknownPath: boolean = false;
    let newChapterPath: boolean = false;
    let topChapterPath: boolean = false;
    let commentPath: boolean = false;
    let getAsList: boolean = true;
    const pathVars = pathWithOptionProcessing.exec(request.path);
    if (typeof pathVars[1] !== 'undefined' && pathVars[1]) {
      chapterId = extractPathFromQueryString(pathVars[1]);
      request.query.chapterId = chapterId;
    } else {
      if (request.query.list && request.query.list === 'new') {
        newChapterPath = true;
      } else if (request.query.list && request.query.list === 'top') {
        topChapterPath = true;
      } else {
        getAsList = true;
      }
    }
    if (
      typeof pathVars[PATH_OPTION_POSITION] !== 'undefined' &&
      pathVars[PATH_OPTION_POSITION]
    ) {
      switch (extractPathFromQueryString(pathVars[PATH_OPTION_POSITION])) {
        case 'publish':
          publishPath = true;
          break;
        case 'purchase':
          purchasePath = true;
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
        case 'comment':
          commentPath = true;
          break;
        default:
          unknownPath = true;
      }
    }
    try {
      if (request.method === 'POST') {
        if (translatePath) {
          await translateChapter(request, response);
        } else if (purchasePath) {
          await purchaseChapter(request, response);
        } else if (commentPath) {
          await postCommentChapter(request, response);
        } else {
          unknownPath = true;
        }
      } else if (request.method === 'GET') {
        if (newChapterPath) {
          await getNewChapterList(request, response);
        } else if (topChapterPath) {
          await getTopChapterList(request, response);
        } else if (commentPath) {
          await getCommentChapter(request, response);
        } else if (chapterId) {
          await getChapter(request, response);
        } else {
          unknownPath = true;
        }
      } else if (request.method === 'PUT') {
        if (ratePath) {
          await rateChapter(request, response);
        } else if (publishPath) {
          await publishChapter(request, response);
        } else if (chapterId) {
          await editChapter(request, response);
        } else if (commentPath) {
          await deleteCommentChapter(request, response);
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
