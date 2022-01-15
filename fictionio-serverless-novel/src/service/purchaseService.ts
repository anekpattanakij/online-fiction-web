import * as validator from 'validator';
import { authorizeService } from '../authService';
import { Chapter } from '../common/chapter';
import {
  Error,
  ERROR_CODE_INVALID_INPUT,
  ERROR_CODE_DATABASE_CONNECTION,
  ERROR_CODE_PROCESS_ERROR,
} from '../common/error';
import {
  HTTP_REQUEST_SUCCESS,
  ResponseRequest,
} from '../common/responseRequest';
import { User } from '../common/user';
import { Config } from '../config/index';
import { ChapterUtil } from '../dataLayer/chapterUtil';
import { PurchaseUtil } from '../dataLayer/purchaseUtil';
import { responseTransform } from '../util/returnResponseUtil';

export const purchaseChapter = async (request, response) => {
  try {
    if (
      !request.query.chapterId ||
      validator.isEmpty(request.query.chapterId)
    ) {
      throw new Error(ERROR_CODE_INVALID_INPUT, 'Invalid input');
    }
    const responseFromAuthorizer = await authorizeService(
      request,
      response,
    ).catch(error => {
      throw error;
    });
    const inputUser: User = new User();
    inputUser.assignValueFromJWT(
      JSON.parse(responseFromAuthorizer.body).resultFromJWT,
    );
    let detectError = false;
    const resultPurchaseChapter:
      | boolean
      | void = await PurchaseUtil.purchaseChapter(
      inputUser.cif,
      request.query.chapterId,
    ).catch(error => {
      let returnError: Error;
      if (error instanceof Error) {
        returnError = error;
      } else {
        returnError = new Error(
          ERROR_CODE_DATABASE_CONNECTION,
          JSON.stringify(error),
        );
      }
      detectError = true;
      responseTransform(response, true, returnError);
    });
    // If purchase success , return chapter content immediately to reduce call
    if (resultPurchaseChapter) {
      const resultFromDb: Chapter | void = await ChapterUtil.getChapter(
        request.query.chapterId,
      ).catch(error => {
        const returnError: Error = new Error(
          ERROR_CODE_INVALID_INPUT,
          JSON.stringify(error),
        );
        responseTransform(response, true, returnError);
      });
      if (resultFromDb && resultFromDb instanceof Chapter) {
        resultFromDb.purchased = true;
        responseTransform(response, false, resultFromDb);
      }
    } else {
      if (!detectError) {
        responseTransform(
          response,
          true,
          new Error(ERROR_CODE_PROCESS_ERROR, 'error on purchase chapter'),
        );
      }
    }
  } catch (error) {
    responseTransform(response, true, error);
  }
  return response;
};
