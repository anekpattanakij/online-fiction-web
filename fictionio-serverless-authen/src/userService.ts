import {
  registerNewUser,
  googleRegister,
  facebookRegister,
} from './service/registerService';
import {
  changePassword,
  updateUserProfile,
  getPurchaseHistoryList,
  getWithdrawHistoryList,
  getChapterList,
  getFictionList,
  getUserProfileAsViewer,
  getTranslateList,
} from './service/userProfileService';
import { Error } from './common/error';
import {
  HTTP_REQUEST_SUCCESS,
  ResponseRequest,
} from './common/responseRequest';
import { User } from './common/user';
import { allowCors } from './util/corsResponseUtil';
import { responseTransform } from './util/returnResponseUtil';
import * as pathToRegexp from 'path-to-regexp';
import { preflightChecking } from './preflightCheckingService';

const PATH_OPTION_POSITION: number = 2;

export const userService = preflightChecking(
  async (request, returnResponse) => {
    const response = new ResponseRequest(HTTP_REQUEST_SUCCESS, '');

    const keys = [];
    const pathProcessing = pathToRegexp('/:fictionId?/:pathOption?', keys, {
      strict: false,
    });
    const pathVars = pathProcessing.exec(request.path);
    let targetPath = '';
    if (
      typeof pathVars[PATH_OPTION_POSITION] !== 'undefined' &&
      pathVars[PATH_OPTION_POSITION]
    ) {
      request.query.userId = pathVars[1];
      targetPath = pathVars[PATH_OPTION_POSITION];
    } else {
      targetPath = pathVars[1];
    }

    let fictionPath: boolean = false;
    let chapterPath: boolean = false;
    let passwordPath: boolean = false;
    let purchasePath: boolean = false;
    let withdrawPath: boolean = false;
    let translatePath: boolean = false;
    let userIdentity: string = null;

    switch (targetPath) {
      case 'fiction':
        fictionPath = true;
        break;
      case 'chapter':
        chapterPath = true;
        break;
      case 'password':
        passwordPath = true;
        break;
      case 'purchase':
        purchasePath = true;
        break;
      case 'withdraw':
        withdrawPath = true;
        break;
      case 'translate':
        translatePath = true;
        break;

      default:
        userIdentity = pathVars[1];
        request.query.userId = userIdentity;
    }

    try {
      if (request.method === 'POST') {
        await registerNewUser(request, response);
      } else if (request.method === 'PUT') {
        if (passwordPath) {
          await changePassword(request, response);
        } else {
          await updateUserProfile(request, response);
        }
        // do nothing = no support option
      } else if (request.method === 'GET') {
        // do nothing = no support option
        if (fictionPath) {
          await getFictionList(request, response);
        } else if (chapterPath) {
          await getChapterList(request, response);
        } else if (purchasePath) {
          await getPurchaseHistoryList(request, response);
        } else if (withdrawPath) {
          await getWithdrawHistoryList(request, response);
        } else if (translatePath) {
          await getTranslateList(request, response);
        } else {
          await getUserProfileAsViewer(request, response);
        }
      }
    } catch (err) {
      responseTransform(response, true, err);
    }
    allowCors(returnResponse);
    returnResponse.status(response.statusCode).send(response.body);
  },
);
