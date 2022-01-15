import { sha3_256 } from 'js-sha3';
import * as sanitizeHtml from 'sanitize-html';
import * as Stampery from 'stampery';
import * as validator from 'validator';
import { authorizeService } from '../authService';
import { AnalysisReport } from '../common/analysisReport';
import { Chapter } from '../common/chapter';
import { Comment } from '../common/comment';
import { ShortChapter } from '../common/shortChapter';
import {
  Error,
  ERROR_CODE_ACCESS_EXPIRE,
  ERROR_CODE_CHAPTER_NOT_EXIST,
  ERROR_CODE_FICTION_NOT_EXIST,
  ERROR_CODE_INVALID_INPUT,
  ERROR_CODE_MISMITCH_LANGUAGE,
  ERROR_CODE_DATABASE_CONNECTION,
  ERROR_CODE_PROCESS_ERROR,
  ERROR_CODE_NO_AUTHORIZE,
  ERROR_CODE_NO_AUTHORIZE_IN_HEADER,
  ERROR_CODE_NOVEL_CHAPTER_NOT_PURCHASE,
  ERROR_CODE_FICTION_SUSPEND_OR_DELETE,
} from '../common/error';
import { Fiction } from '../common/fiction';
import {
  HTTP_REQUEST_SUCCESS,
  ResponseRequest,
} from '../common/responseRequest';
import { User } from '../common/user';
import FICTION_STATUS from '../config/fictionStatusList';
import { Config } from '../config/index';
import WhiteListInputContentList from '../config/whiteListInputContentList';
import { FictionUtil } from '../dataLayer/fictionUtil';
import {
  ChapterUtil,
  LIMIT_RETURN_CHAPTER_LIST,
  sortChapterListByLastUpdateFunction,
  sortChapterListByRateFunction,
} from '../dataLayer/chapterUtil';
import { responseTransform } from '../util/returnResponseUtil';
import { publishMessage } from '../dataLayer/pubSubDataLayer';
import {
  cleanNewLineCodeText,
  cleanHtmlTag,
  arrayFlatter,
} from '../util/dataConversionUtil';
import axios from 'axios';

export const getReduceChapterList = async (request, response) => {
  let language: string = 'EN'; // Default as language
  try {
    if (!request.query.fictionId || !request.query.author) {
      throw new Error(ERROR_CODE_INVALID_INPUT, 'Invalid input');
    }

    if (request.query && request.query.language) {
      language = request.query.language;
    }
    let hasError = null;
    const resultFromDb:
      | ShortChapter[]
      | void = await ChapterUtil.getReduceChapterList(
      request.query.fictionId,
      request.query.author,
      language,
    ).catch(error => {
      hasError = new Error(
        ERROR_CODE_DATABASE_CONNECTION,
        JSON.stringify(error),
      );
      responseTransform(response, true, hasError);
    });

    if (!hasError) {
      responseTransform(response, false, resultFromDb);
    }
  } catch (error) {
    responseTransform(response, true, error);
  }

  return response;
};

export const getNewChapterList = async (request, response) => {
  let language: string[] = ['EN']; // Default as language
  let freeOnly: boolean = false;
  try {
    if (request.query && request.query.language) {
      language = (request.query.language as string).toUpperCase().split(',');
    }
    if (request.query && request.query['free-only']) {
      freeOnly = request.query['free-only'] === 'true';
    }
    const getLanguageList = [];
    language.map((singleLanguage, key) => {
      getLanguageList.push(ChapterUtil.getNewChapter(singleLanguage, freeOnly));
    });
    let errorFound = false;
    const returnChapterList = await Promise.all(getLanguageList).catch(
      error => {
        errorFound = true;
        const returnError: Error = new Error(
          ERROR_CODE_DATABASE_CONNECTION,
          JSON.stringify(error),
        );
        responseTransform(response, true, returnError);
      },
    );
    if (!errorFound) {
      let returnResultList = [];
      if (Array.isArray(returnChapterList) && returnChapterList.length > 0) {
        returnChapterList.map(subChapterList => {
          if (Array.isArray(subChapterList)) {
            returnResultList = returnResultList.concat(...subChapterList);
          }
        });
        returnResultList.sort(sortChapterListByLastUpdateFunction);
        returnResultList = returnResultList.slice(0, LIMIT_RETURN_CHAPTER_LIST);
      }
      responseTransform(response, false, returnResultList);
    }
  } catch (error) {
    responseTransform(response, true, error);
  }

  return response;
};

export const getTopChapterList = async (request, response) => {
  let language: string[] = ['EN']; // Default as language
  let freeOnly: boolean = false;
  try {
    if (request.query && request.query.language) {
      language = (request.query.language as string).toUpperCase().split(',');
    }
    if (request.query && request.query['free-only']) {
      freeOnly = request.query['free-only'] === 'true';
    }
    const getLanguageList = [];
    language.map((singleLanguage, key) => {
      getLanguageList.push(ChapterUtil.getTopChapter(singleLanguage, freeOnly));
    });
    let errorFound = false;
    const returnChapterList = await Promise.all(getLanguageList).catch(
      error => {
        errorFound = true;
        const returnError: Error = new Error(
          ERROR_CODE_DATABASE_CONNECTION,
          JSON.stringify(error),
        );
        responseTransform(response, true, returnError);
      },
    );
    
    if (!errorFound) {
      let returnResultList = [];
      if (Array.isArray(returnChapterList) && returnChapterList.length > 0) {
        returnChapterList.map(subChapterList => {
          if (Array.isArray(subChapterList)) {
            returnResultList = returnResultList.concat(...subChapterList);
          }
        });
        returnResultList.sort(sortChapterListByRateFunction);
        returnResultList = returnResultList.slice(0, LIMIT_RETURN_CHAPTER_LIST);
      }
      responseTransform(response, false, returnResultList);
    }
  } catch (error) {
    responseTransform(response, true, error);
  }

  return response;
};

export const getChapterList = async (request, response) => {
  let language: string = 'EN'; // Default as language
  try {
    if (!request.query.fictionId) {
      throw new Error(ERROR_CODE_INVALID_INPUT, 'Invalid input');
    }

    if (request.query && request.query.language) {
      language = request.query.language;
    }
    let responseFromAuthorizer = null;
    if (request.headers.bearer) {
      responseFromAuthorizer = await authorizeService(request, response);
    }
    if (responseFromAuthorizer instanceof ResponseRequest) {
      try {
        const inputUser: User = new User();
        inputUser.assignValueFromJWT(
          JSON.parse(responseFromAuthorizer.body).resultFromJWT,
        );

        const resultFromDb: Chapter[] | void = await ChapterUtil.getChapterList(
          request.query.fictionId,
          true,
        ).catch(error => {
          responseTransform(
            response,
            true,
            new Error(ERROR_CODE_DATABASE_CONNECTION, JSON.stringify(error)),
          );
        });
        const resultPurchaseChapterList = await ChapterUtil.getPurchaseChapter(
          null,
          inputUser.cif,
          request.query.fictionId,
        ).catch(error => {
          const returnError: Error = new Error(
            ERROR_CODE_DATABASE_CONNECTION,
            JSON.stringify(error),
          );
          responseTransform(response, true, returnError);
        });
        let purchasedChapterList = new Array();
        if (
          resultPurchaseChapterList &&
          resultPurchaseChapterList instanceof Array
        ) {
          purchasedChapterList = resultPurchaseChapterList;
        }

        // filter out -> draft not by this user
        if (resultFromDb && resultFromDb instanceof Array) {
          const resultChapterList = resultFromDb;
          const filterOutChapterList: Chapter[] = new Array();
          resultChapterList.map((chapterItem, key) => {
            if (
              chapterItem.status === FICTION_STATUS.PUBLISH ||
              (chapterItem.status === FICTION_STATUS.DRAFT &&
                chapterItem.author.cif === inputUser.cif)
            ) {
              if (purchasedChapterList.indexOf(chapterItem.chapterId) > 0) {
                chapterItem.purchased = true;
              }
              filterOutChapterList.push(chapterItem);
            }
          });
          responseTransform(response, false, filterOutChapterList);
        }
      } catch (error) {
        responseTransform(response, true, error);
      }
    } else {
      const resultFromDb: Chapter[] | void = await ChapterUtil.getChapterList(
        request.query.fictionId,
        false,
      ).catch(error => {
        const returnError: Error = new Error(
          ERROR_CODE_DATABASE_CONNECTION,
          JSON.stringify(error),
        );
        responseTransform(response, true, returnError);
      });
      responseTransform(response, false, resultFromDb);
    }
  } catch (error) {
    responseTransform(response, true, error);
  }

  return response;
};

export const getChapter = async (request, response) => {
  try {
    if (!request.query.chapterId) {
      throw new Error(ERROR_CODE_INVALID_INPUT, 'Invalid input');
    }
    let responseFromAuthorizer = null;
    const inputUser: User = new User();
    if (request.headers.bearer) {
      responseFromAuthorizer = await authorizeService(request, response);
      inputUser.assignValueFromJWT(
        JSON.parse(responseFromAuthorizer.body).resultFromJWT,
      );
    }
    const resultFromDb: Chapter | void = await ChapterUtil.getChapter(
      request.query.chapterId,
    ).catch(error => {
      const returnError: Error = new Error(
        ERROR_CODE_DATABASE_CONNECTION,
        JSON.stringify(error),
      );
      responseTransform(response, true, returnError);
    });
    if (resultFromDb && resultFromDb instanceof Chapter) {
      if (!inputUser || !inputUser.cif) {
        // If not login and chapter not free -> disable chapter content
        if (resultFromDb.coin > 0) {
          resultFromDb.chapterContent = '';
        }
      }
      responseTransform(response, false, resultFromDb);
      if (resultFromDb.author.cif !== inputUser.cif) {
        if (resultFromDb.status === FICTION_STATUS.PUBLISH) {
          if (inputUser.cif) {
            resultFromDb.currentUserRating = await ChapterUtil.getUserRateChapter(
              resultFromDb,
              inputUser.cif,
            );
          }
          if (inputUser.cif && resultFromDb.coin > 0) {
            // check if customer purchase or not
            const resultPurchaseChapterList = await ChapterUtil.getPurchaseChapter(
              request.query.chapterId,
              inputUser.cif,
            ).catch(error => {
              const returnError: Error = new Error(
                ERROR_CODE_DATABASE_CONNECTION,
                JSON.stringify(error),
              );
              responseTransform(response, true, returnError);
            });
            if (resultPurchaseChapterList) {
              resultPurchaseChapterList.forEach(purchaseChapter => {
                if (purchaseChapter === resultFromDb.chapterId) {
                  resultFromDb.purchased = true;
                }
              });
            }
            if (!resultFromDb.purchased) {
              // If customer didn't puchase / hide this chapter
              resultFromDb.chapterContent = '';
              responseTransform(response, false, resultFromDb);
            }
          }
        } else {
          throw new Error(ERROR_CODE_CHAPTER_NOT_EXIST, 'Chapter not exist');
        }
      }
      if (resultFromDb.chapterContent !== '') {
        resultFromDb.monthCount = resultFromDb.monthCount + 1;
        resultFromDb.totalCount = resultFromDb.totalCount + 1;
        await ChapterUtil.updateChapterReadCount(
          resultFromDb.chapterId,
          resultFromDb.monthCount,
          resultFromDb.totalCount,
        );
        responseTransform(response, false, resultFromDb);
      }
    } else {
      throw new Error(ERROR_CODE_CHAPTER_NOT_EXIST, 'Chapter not exist');
    }
  } catch (error) {
    responseTransform(response, true, error);
  }
  return response;
};

export const addChapter = async (request, response) => {
  const inputObject: any = request.body;
  try {
    if (
      !request.query.fictionId ||
      !inputObject.chapter ||
      !inputObject.chapter.language ||
      validator.isEmpty(inputObject.chapter.language) ||
      !inputObject.chapter.chapterName ||
      validator.isEmpty(inputObject.chapter.chapterName) ||
      !inputObject.chapter.chapterContent ||
      validator.isEmpty(inputObject.chapter.chapterContent)
    ) {
      throw new Error(ERROR_CODE_INVALID_INPUT, 'Invalid input');
    }
    if (
      !WhiteListInputContentList.isCorrectLanguageOrEnglish(
        inputObject.chapter.language,
        inputObject.chapter.chapterName,
      ) ||
      !WhiteListInputContentList.isCorrectLanguage(
        inputObject.chapter.language,
        inputObject.chapter.chapterContent,
      )
    ) {
      throw new Error(ERROR_CODE_MISMITCH_LANGUAGE, 'Language mismatch');
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
    // Remark check fiction author to be the same input user in util to reduce firestore call
    const inputChapter: Chapter = new Chapter({
      fictionId: request.query.fictionId,
      language: inputObject.chapter.language,
      displayChapterNumber: request.query.displayChapterNumber,
      chapterName: blockTagInText(inputObject.chapter.chapterName),
      chapterContent: sanitizeInputText(inputObject.chapter.chapterContent),
      isFreeChapter: inputObject.chapter.isFreeChapter,
      author: inputUser,
    });
    const resultChapter: void | Chapter = await ChapterUtil.startChapter(
      inputChapter,
    ).catch(error => {
      responseTransform(response, true, error);
    });
    if (resultChapter && resultChapter instanceof Chapter) {
      responseTransform(response, false, inputChapter);
    }
  } catch (error) {
    responseTransform(response, true, error);
  }
  return response;
};

export const editChapter = async (request, response) => {
  const inputObject: any = request.body;
  try {
    if (
      !request.query.chapterId ||
      !inputObject.chapter ||
      !inputObject.chapter.chapterName ||
      validator.isEmpty(inputObject.chapter.chapterName) ||
      !inputObject.chapter.chapterContent ||
      validator.isEmpty(inputObject.chapter.chapterContent)
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
    const inputChapter: Chapter = new Chapter({
      chapterId: request.query.chapterId,
      chapterName: blockTagInText(inputObject.chapter.chapterName),
      chapterContent: sanitizeInputText(inputObject.chapter.chapterContent),
      author: inputUser,
    });

    const resultChapter: void | Chapter = await ChapterUtil.editChapter(
      inputChapter,
    ).catch(error => {
      const returnError: Error = new Error(
        ERROR_CODE_DATABASE_CONNECTION,
        JSON.stringify(error),
      );
      responseTransform(response, true, returnError);
    });
    if (resultChapter && resultChapter instanceof Chapter) {
      responseTransform(response, false, inputChapter);
    }
  } catch (error) {
    responseTransform(response, true, error);
  }

  return response;
};

export const publishChapter = async (request, response) => {
  const inputObject: any = request.body;
  try {
    if (!request.query.chapterId) {
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
    const resultPublish: void | Chapter = await ChapterUtil.publishChapter(
      request.query.chapterId,
      inputUser,
    ).catch(error => {
      const returnError: Error = new Error(
        ERROR_CODE_DATABASE_CONNECTION,
        JSON.stringify(error),
      );
      responseTransform(response, true, returnError);
    });
    // if success
    if (Config.CONNECT_TO_STEMPERY && resultPublish) {
      // Post to block chain
      if (resultPublish && resultPublish instanceof Chapter) {
        const hashContent = sha3_256(resultPublish.chapterContent);
        const stamper = new Stampery(Config.STAMPERY_API_KEY);
        let stampResult;
        await stamper
          .stamp(hashContent)
          .then(stamp => {
            stampResult = stamp;
          })
          .catch(err => {
            // TODO add some logging but not throw error because not mandatory process
          });
        if (stampResult) {
          ChapterUtil.stamperyToken(
            resultPublish.chapterId,
            stampResult.id,
          ).catch(error => {
            // TODO add some logging but not throw error because not mandatory process
          });
        }
      }
    }
    if (resultPublish && Config.UPDATE_SEARCH_CONTENT) {
      if (resultPublish && resultPublish instanceof Chapter) {
        if (resultPublish.displayChapterNumber === 1) {
          const resultFromDb: Fiction | void = await FictionUtil.getFiction(
            resultPublish.fictionId,
          ).catch(error => {
            const returnError: Error = new Error(
              ERROR_CODE_DATABASE_CONNECTION,
              JSON.stringify(error),
            );
            responseTransform(response, true, returnError);
          });
          if (resultFromDb) {
            await publishMessage(
              'updateSearchContent',
              JSON.stringify({
                language: resultPublish.language.toUpperCase(),
                id: resultFromDb.fictionId,
                name: cleanNewLineCodeText(
                  cleanHtmlTag(
                    resultFromDb.getFictionName(
                      resultPublish.language.toUpperCase(),
                    ),
                  ),
                ),
                description: cleanNewLineCodeText(
                  cleanHtmlTag(
                    resultFromDb.getFictionShortStory(
                      resultPublish.language.toUpperCase(),
                    ),
                  ),
                ),
              }),
            );
          }
        }
      }
    }
    if (resultPublish) {
      responseTransform(response, false, { result: 'success' });
    } else {
      responseTransform(
        response,
        true,
        new Error(ERROR_CODE_PROCESS_ERROR, 'Error on publish chapter'),
      );
    }
  } catch (error) {
    responseTransform(response, true, error);
  }

  return response;
};

export const updateChapterStatus = async (request, response) => {
  const inputObject: any = request.body;
  try {
    if (
      !request.query.fictionId ||
      !request.query.chapterId ||
      !inputObject.chapter.language ||
      validator.isEmpty(inputObject.chapter.language)
    ) {
      throw new Error(ERROR_CODE_INVALID_INPUT, 'Invalid input');
    }
    responseTransform(response, false, { result: 'success' });
  } catch (error) {
    responseTransform(response, true, error);
  }

  return response;
};

export const translateChapter = async (request, response) => {
  const inputObject: any = request.body;
  try {
    if (
      !request.query.chapterId ||
      !inputObject.chapter ||
      !inputObject.chapter.language ||
      validator.isEmpty(inputObject.chapter.language) ||
      !inputObject.chapter.chapterName ||
      validator.isEmpty(inputObject.chapter.chapterName) ||
      !inputObject.chapter.chapterContent ||
      validator.isEmpty(inputObject.chapter.chapterContent)
    ) {
      throw new Error(ERROR_CODE_INVALID_INPUT, 'Invalid input');
    }
    if (
      !WhiteListInputContentList.isCorrectLanguageOrEnglish(
        inputObject.chapter.language,
        inputObject.chapter.chapterName,
      ) ||
      !WhiteListInputContentList.isCorrectLanguage(
        inputObject.chapter.language,
        inputObject.chapter.chapterContent,
      )
    ) {
      throw new Error(ERROR_CODE_MISMITCH_LANGUAGE, 'Language mismatch');
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

    const inputChapter: Chapter = new Chapter({
      language: inputObject.chapter.language,
      chapterName: blockTagInText(inputObject.chapter.chapterName),
      chapterContent: sanitizeInputText(inputObject.chapter.chapterContent),
      author: inputUser,
    });
    const resultChapter: void | Chapter = await ChapterUtil.startTranslateChapter(
      request.query.chapterId,
      inputChapter,
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
      responseTransform(response, true, returnError);
    });
    responseTransform(response, false, resultChapter);
  } catch (error) {
    responseTransform(response, true, error);
  }

  return response;
};

export const rateChapter = async (request, response) => {
  const inputObject: any = request.body;
  try {
    if (!request.query.chapterId || !validator.isInt('' + inputObject.rate)) {
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

    const resultRate: boolean | void = await ChapterUtil.rateChapter(
      request.query.chapterId,
      inputUser.cif,
      inputObject.rate,
    ).catch(error => {
      if (error instanceof Error) {
        responseTransform(response, true, error);
      } else {
        const returnError: Error = new Error(
          ERROR_CODE_DATABASE_CONNECTION,
          JSON.stringify(error),
        );
        responseTransform(response, true, returnError);
      }
    });

    if (resultRate) {
      responseTransform(response, false, { result: 'Success' });
    }
  } catch (error) {
    responseTransform(response, true, error);
  }

  return response.toPlainObject();
};

export const getCommentChapter = async (request, response) => {
  try {
    if (!request.query.chapterId) {
      throw new Error(ERROR_CODE_INVALID_INPUT, 'Invalid input');
    }
    let retrieveSet: number = 1;
    if (request.query.page && Number.isInteger(parseInt(request.query.page))) {
      retrieveSet = request.query.page;
    }
    const resultList: Array<
      Comment
    > | void = await ChapterUtil.getCommentChapter(
      request.query.chapterId,
      retrieveSet,
    ).catch(error => {
      if (error instanceof Error) {
        responseTransform(response, true, error);
      } else {
        const returnError: Error = new Error(
          ERROR_CODE_DATABASE_CONNECTION,
          JSON.stringify(error),
        );
        responseTransform(response, true, returnError);
      }
    });

    if (resultList) {
      responseTransform(response, false, { result: resultList });
    } else {
      responseTransform(response, false, { result: [] });
    }
  } catch (error) {
    responseTransform(response, true, error);
  }
  return response;
};

export const postCommentChapter = async (request, response) => {
  const inputObject: any = request.body;
  try {
    if (!request.query.chapterId || !inputObject.comment) {
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
    const resultPost: boolean | void = await ChapterUtil.postCommentChapter(
      request.query.chapterId,
      inputUser,
      inputObject.comment,
    ).catch(error => {
      if (error instanceof Error) {
        responseTransform(response, true, error);
      } else {
        const returnError: Error = new Error(
          ERROR_CODE_DATABASE_CONNECTION,
          JSON.stringify(error),
        );
        responseTransform(response, true, returnError);
      }
    });

    if (resultPost) {
      responseTransform(response, false, { result: 'Success' });
    }
  } catch (error) {
    responseTransform(response, true, error);
  }
  return response;
};

export const deleteCommentChapter = async (request, response) => {
  const inputObject: any = request.body;
  return response;
};

const sanitizeInputText = (inputText: string): string => {
  return sanitizeHtml(inputText, {
    allowedTags: [
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'ul',
      'ol',
      'p',
      'blockquote',
      'pre',
      'code',
      'u',
      'strong',
    ],
  });
};

const blockTagInText = (inputText: string): string => {
  return sanitizeHtml(inputText, {
    allowedTags: [],
  });
};
