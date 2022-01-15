import { sha3_256 } from 'js-sha3';
import * as sanitizeHtml from 'sanitize-html';
import * as Stampery from 'stampery';
import * as validator from 'validator';
import { authorizeService } from '../authService';
import { AnalysisReport } from '../common/analysisReport';
import {
  Error,
  ERROR_CODE_ACCESS_EXPIRE,
  ERROR_CODE_COVER_FILE_FORMAT,
  ERROR_CODE_FICTION_NOT_EXIST,
  ERROR_CODE_INVALID_INPUT,
  ERROR_CODE_MISMITCH_LANGUAGE,
  ERROR_CODE_DATABASE_CONNECTION,
  ERROR_CODE_PROCESS_ERROR,
  ERROR_CODE_NO_AUTHORIZE,
  ERROR_CODE_NO_AUTHORIZE_IN_HEADER,
  ERROR_CODE_FICTION_NOT_COMPLETE_ZERO_CHAPTER,
  ERROR_CODE_FICTION_SUSPEND_OR_DELETE,
  ERROR_CODE_SAVE_IMAGE_COVER,
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
import { FictionUtil, setInitialValueFiction } from '../dataLayer/fictionUtil';
import { ChapterUtil } from '../dataLayer/chapterUtil';
import { responseTransform } from '../util/returnResponseUtil';
import { getStorage } from '../dataLayer/storageUtil';
import { Stream } from 'stream';
import { publishMessage } from '../dataLayer/pubSubDataLayer';
import {
  cleanNewLineCodeText,
  cleanHtmlTag,
  arrayFlatter,
  removeDupInArray,
} from '../util/dataConversionUtil';
import axios from 'axios';
import { PricingModelList } from '../common/pricingModel';
import fetch from 'node-fetch';

const MULTIPLY_NUMBER_FOR_RANDOM_NUMBER: number = 10000;

export const getFictionList = async (request, response) => {
  let language: string = 'EN'; // Default as language
  let authorCif: string = null; // Default as all author
  let freeOnly: boolean = null; // Default as all author

  try {
    if (request.query && request.query.language) {
      language = (request.query.language as string).toUpperCase();
    }
    if (request.query && request.query.cif) {
      authorCif = request.query.cif;
    }
    if (request.query && request.query.freeOnly) {
      freeOnly = request.query.freeOnly;
    }
    const resultFromDb: Fiction[] | void = await FictionUtil.getFictionList(
      language,
      freeOnly,
    ).catch(error => {
      const returnError: Error = new Error(
        ERROR_CODE_DATABASE_CONNECTION,
        JSON.stringify(error),
      );
      responseTransform(response, true, returnError);
    });
    responseTransform(
      response,
      false,
      resultFromDb && resultFromDb.length > 0 ? resultFromDb : [],
    );
  } catch (error) {
    responseTransform(response, true, error);
  }

  return response;
};

export const getTopFictionList = async (request, response) => {
  let language: string[] = ['EN']; // Default as language
  try {
    if (request.query && request.query.language) {
      language = (request.query.language as string).toUpperCase().split(',');
    }
    const getLanguageList = [];
    language.map((singleLanguage, key) => {
      getLanguageList.push(FictionUtil.getTopFiction(singleLanguage));
    });
    let errorFound = false;
    const returnFictionList = await Promise.all(getLanguageList).catch(
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
      responseTransform(
        response,
        false,
        Array.isArray(returnFictionList)
          // tslint:disable-next-line:no-magic-numbers
          ? removeDupInArray(arrayFlatter(returnFictionList), 'fictionId').sort( (a,b) => (a.rating < b.rating)?1:0 ).splice(0,10)
          : [],
      );
    }
  } catch (error) {
    responseTransform(response, true, error);
  }
  return response;
};

export const getNewFictionList = async (request, response) => {
  let language: string[] = ['EN']; // Default as language
  try {
    if (request.query && request.query.language) {
      language = (request.query.language as string).toUpperCase().split(',');
    }
    const getLanguageList = [];
    language.map((singleLanguage, key) => {
      getLanguageList.push(FictionUtil.getNewFiction(singleLanguage));
    });
    let errorFound = false;
    const returnFictionList = await Promise.all(getLanguageList).catch(
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
      responseTransform(
        response,
        false,
        Array.isArray(returnFictionList)
          // tslint:disable-next-line:no-magic-numbers
          ? removeDupInArray(arrayFlatter(returnFictionList), 'fictionId').sort( (a,b) => (a.createdDate < b.createdDate)?1:0 ).splice(0,10)
          : [],
      );
    }
  } catch (error) {
    responseTransform(response, true, error);
  }
  return response;
};

export const getSearchFictionList = async (request, response) => {
  let keyword: string = null; // Default as all author
  try {
    if (request.query && request.query.keyword) {
      keyword = request.query.keyword as string;
    }
    if (!keyword) {
      throw new Error(ERROR_CODE_INVALID_INPUT, 'Invalid input');
    }
    const returnSearchResultFictionList: Fiction[] = new Array();

    await axios({
      method: 'post',
      url: Config.SEARCH_API_PATH + '/_search',
      auth: {
        username: 'user',
        password: 'Paul_2034',
      },
      data: {
        query: { query_string: { query: keyword } },
        size: 20,
      },
      timeout: 6000,
    })
      .then(response => {
        const fictionResultList = [];
        response.data.hits.hits.forEach(element => {
          const fictionIdWithLanguage = String(element._id).split('-');
          const fictionId =
            fictionIdWithLanguage[fictionIdWithLanguage.length - 1];
          if (fictionResultList.indexOf(fictionId) < 0) {
            fictionIdWithLanguage.push(fictionId);
            const returnFiction = new Fiction();
            returnFiction.fictionId =
              fictionIdWithLanguage[fictionIdWithLanguage.length - 1];
            returnFiction.fictionName = element._source.name;
            returnFiction.shortDetail = element._source.shortDescription;
            returnSearchResultFictionList.push(returnFiction);
          }
        });
      })
      .catch(error => {
        throw new Error(
          ERROR_CODE_PROCESS_ERROR,
          'Error process on search function [E-SE-001]',
        );
      });
    // get additional information from database
    const returnFictionList: Fiction[] = new Array();
    const promiseArray = new Array();
    const fillDataFictionMap: Map<string, Fiction> = new Map();
    returnSearchResultFictionList.forEach(fictionElement => {
      promiseArray.push(
        FictionUtil.getFiction(fictionElement.fictionId).then(returnFiction => {
          if (returnFiction) {
            fillDataFictionMap.set(fictionElement.fictionId, returnFiction);
          }
        }),
      );
    });
    await Promise.all(promiseArray);
    // TODO rearrage array
    returnSearchResultFictionList.forEach(fictionElement => {
      if (fillDataFictionMap.get(fictionElement.fictionId)) {
        returnFictionList.push(
          fillDataFictionMap.get(fictionElement.fictionId),
        );
      }
    });
    responseTransform(response, false, returnFictionList);
  } catch (error) {
    responseTransform(response, true, error);
  }

  return response;
};

export const getFiction = async (request, response) => {
  try {
    if (!request.query.fictionId) {
      throw new Error(ERROR_CODE_INVALID_INPUT, 'Invalid input');
    }
    const resultFromDb: Fiction | void = await FictionUtil.getFiction(
      request.query.fictionId,
    ).catch(error => {
      const returnError: Error = new Error(
        ERROR_CODE_DATABASE_CONNECTION,
        JSON.stringify(error),
      );
      responseTransform(response, true, returnError);
    });
    if (resultFromDb) {
      if (resultFromDb.status >= FICTION_STATUS.SUSPEND_BY_ADMIN) {
        throw new Error(
          ERROR_CODE_FICTION_SUSPEND_OR_DELETE,
          'fiction has been suspended or deleted',
        );
      } else {
        responseTransform(response, false, resultFromDb.convertToPlainObject());
      }
    } else {
      throw new Error(ERROR_CODE_FICTION_NOT_EXIST, 'fiction not found');
    }
  } catch (error) {
    responseTransform(response, true, error);
  }
  return response;
};

export const startFiction = async (request, response) => {
  const inputObject: any = request.body;
  try {
    if (
      !inputObject ||
      !inputObject.fiction ||
      !inputObject.fiction.categories ||
      !((inputObject.fiction.categories as object) instanceof Array) ||
      inputObject.fiction.categories.length < 1 ||
      !inputObject.fiction.fictionName ||
      validator.isEmpty(inputObject.fiction.fictionName) ||
      !inputObject.fiction.shortDetail ||
      validator.isEmpty(inputObject.fiction.shortDetail) ||
      !inputObject.fiction.originalFictionLanguage ||
      validator.isEmpty(inputObject.fiction.originalFictionLanguage) ||
      !inputObject.fiction.pricingModel ||
      PricingModelList.indexOf(inputObject.fiction.pricingModel) < 0 ||
      !validator.isInt('' + inputObject.fiction.coin)
    ) {
      throw new Error(ERROR_CODE_INVALID_INPUT, 'Invalid input');
    }
    if (
      !WhiteListInputContentList.isCorrectLanguageOrEnglish(
        inputObject.fiction.originalFictionLanguage,
        inputObject.fiction.fictionName,
      ) ||
      !WhiteListInputContentList.isCorrectLanguage(
        inputObject.fiction.originalFictionLanguage,
        inputObject.fiction.shortDetail,
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
    const inputFiction: Fiction = new Fiction({
      fictionName: [
        {
          language: String(
            inputObject.fiction.originalFictionLanguage.toUpperCase(),
          ),
          name: blockTagInText(inputObject.fiction.fictionName),
        },
      ],
      shortDetail: [
        {
          language: String(
            inputObject.fiction.originalFictionLanguage.toUpperCase(),
          ),
          story: blockTagInText(inputObject.fiction.shortDetail),
        },
      ],
      pricingModel: new Map([
        [
          inputUser.cif,
          new Map([
            [
              inputObject.fiction.originalFictionLanguage.toUpperCase(),
              {
                model: inputObject.fiction.pricingModel,
                coin: parseInt(inputObject.fiction.coin),
              },
            ],
          ]),
        ],
      ]),
      originalFictionLanguage: inputObject.fiction.originalFictionLanguage.toUpperCase(),
      availableInLanguage: [
        inputObject.fiction.originalFictionLanguage.toUpperCase(),
      ],
      categories: inputObject.fiction.categories,
      ageRestriction: inputObject.fiction.ageRestriction
        ? inputObject.fiction.ageRestriction
        : false,
      author: inputUser,
    });
    setInitialValueFiction(inputFiction);
    if (
      inputObject.fiction.cover &&
      !validator.isEmpty(inputObject.fiction.cover)
    ) {
      let uploadImageKey: string = null;
      let errorUploadImage = null;
      await uploadCoverImageToStorage(
        '' +
          Math.floor(Math.random() * MULTIPLY_NUMBER_FOR_RANDOM_NUMBER) +
          new Date().toUTCString(),
        inputObject.fiction.cover,
      )
        .then(result => {
          uploadImageKey = result;
        })
        .catch(err => {
          errorUploadImage = err;
        });
      if (errorUploadImage) {
        throw errorUploadImage;
      }

      inputFiction.cover = uploadImageKey;
    }
    const resultFiction: void | Fiction = await FictionUtil.startFiction(
      inputFiction,
    ).catch(error => {
      const returnError: Error = new Error(
        ERROR_CODE_DATABASE_CONNECTION,
        JSON.stringify(error),
      );
      responseTransform(response, true, returnError);
    });
    if (resultFiction instanceof Fiction) {
      responseTransform(response, false, { fiction: resultFiction });
    }
  } catch (error) {
    responseTransform(response, true, error);
  }

  return response.toPlainObject();
};

export const editFiction = async (request, response) => {
  const inputObject: any = request.body;
  try {
    if (
      !inputObject ||
      !inputObject.fiction ||
      !inputObject.fiction.fictionId ||
      !inputObject.fiction.categories ||
      !((inputObject.fiction.categories as object) instanceof Array) ||
      inputObject.fiction.categories.length < 1 ||
      !inputObject.fiction.fictionName ||
      validator.isEmpty(inputObject.fiction.fictionName) ||
      !inputObject.fiction.shortDetail ||
      validator.isEmpty(inputObject.fiction.shortDetail) ||
      !inputObject.fiction.pricingModel ||
      PricingModelList.indexOf(inputObject.fiction.pricingModel) < 0 ||
      !validator.isInt('' + inputObject.fiction.coin)
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

    const fictionDetail: Fiction | void = await FictionUtil.getFiction(
      inputObject.fiction.fictionId,
    ).catch(error => {
      const returnError: Error = new Error(
        ERROR_CODE_DATABASE_CONNECTION,
        JSON.stringify(error),
      );
      responseTransform(response, true, returnError);
    });

    let currentFiction: Fiction;
    if (!fictionDetail) {
      throw new Error(ERROR_CODE_FICTION_NOT_EXIST, 'fiction not found');
    } else {
      currentFiction = fictionDetail;
    }

    if (
      !WhiteListInputContentList.isCorrectLanguageOrEnglish(
        currentFiction.originalFictionLanguage,
        inputObject.fiction.fictionName,
      ) ||
      !WhiteListInputContentList.isCorrectLanguage(
        currentFiction.originalFictionLanguage,
        inputObject.fiction.shortDetail,
      )
    ) {
      throw new Error(ERROR_CODE_MISMITCH_LANGUAGE, 'Language mismatch');
    }

    if (currentFiction.author.cif !== inputUser.cif) {
      throw new Error(ERROR_CODE_NO_AUTHORIZE, 'no authorize');
    }
    // Transfer Editable Value
    const fictionNameList = currentFiction.fictionName;
    fictionNameList.forEach((fictionNameItem, index) => {
      if (
        fictionNameItem.language.toUpperCase() ===
        currentFiction.originalFictionLanguage.toUpperCase()
      ) {
        fictionNameList[index] = {
          language: fictionNameItem.language,
          name: blockTagInText(inputObject.fiction.fictionName),
        };
      }
    });
    currentFiction.fictionName = fictionNameList;
    const fictionDescriptionList = currentFiction.shortDetail;
    fictionDescriptionList.forEach((fictionDescriptionItem, index) => {
      if (
        fictionDescriptionItem.language.toUpperCase() ===
        currentFiction.originalFictionLanguage.toUpperCase()
      ) {
        fictionDescriptionList[index] = {
          language: fictionDescriptionItem.language,
          story: blockTagInText(inputObject.fiction.shortDetail),
        };
      }
    });
    currentFiction.shortDetail = fictionDescriptionList;
    const priceModelChange =
      currentFiction.pricingModel
        .get(inputUser.cif)
        .get(currentFiction.originalFictionLanguage.toUpperCase()).model !==
        inputObject.fiction.pricingModel.toUpperCase() ||
      currentFiction.pricingModel
        .get(inputUser.cif)
        .get(currentFiction.originalFictionLanguage.toUpperCase()).coin !==
        inputObject.fiction.coin;
    currentFiction.pricingModel
      .get(inputUser.cif)
      .set(currentFiction.originalFictionLanguage.toUpperCase(), {
        model: inputObject.fiction.pricingModel.toUpperCase(),
        coin: inputObject.fiction.coin,
      });

    currentFiction.categories = inputObject.fiction.categories;
    currentFiction.ageRestriction = inputObject.fiction.categories
      ? true
      : false;

    const oldCoverFile = currentFiction.cover;
    if (
      inputObject.fiction.cover &&
      !validator.isEmpty(inputObject.fiction.cover)
    ) {
      let uploadImageKey: string = null;
      let errorUploadImage = null;
      await uploadCoverImageToStorage(
        currentFiction.fictionId,
        inputObject.fiction.cover,
      )
        .then(result => {
          uploadImageKey = result;
        })
        .catch(err => {
          errorUploadImage = err;
        });
      if (errorUploadImage) {
        throw errorUploadImage;
      }

      currentFiction.cover = uploadImageKey;
    }
    const result = await FictionUtil.editFiction(
      currentFiction,
      inputUser.cif,
      currentFiction.originalFictionLanguage.toUpperCase(),
      priceModelChange,
    ).catch(error => {
      const returnError: Error = new Error(
        ERROR_CODE_DATABASE_CONNECTION,
        JSON.stringify(error),
      );
      responseTransform(response, true, returnError);
    });
    // if has update cover file - delete old picture
    if (oldCoverFile !== currentFiction.cover) {
      // check image not attach to chapter - delete it
      const checkCoverResult = await ChapterUtil.checkCoverImage(oldCoverFile);
      if (checkCoverResult === false) {
        const coverBucket = getStorage().bucket(Config.STORAGE_BUCKET);
        const oldCover = coverBucket.file(oldCoverFile);
        await oldCover.delete().then(data => {});
      }
    }

    //TODO update search index
    if (result) {
      if (Config.UPDATE_SEARCH_CONTENT) {
        await publishMessage(
          'updateSearchContent',
          JSON.stringify({
            language: currentFiction.originalFictionLanguage.toUpperCase(),
            id: currentFiction.fictionId,
            name: cleanNewLineCodeText(
              cleanHtmlTag(
                currentFiction.getFictionName(
                  currentFiction.originalFictionLanguage,
                ),
              ),
            ),
            description: cleanNewLineCodeText(
              cleanHtmlTag(
                currentFiction.getFictionShortStory(
                  currentFiction.originalFictionLanguage,
                ),
              ),
            ),
          }),
        );
      }
    }
    responseTransform(response, false, 'success');
  } catch (error) {
    responseTransform(response, true, error);
  }
  return response.toPlainObject();
};

export const translateFiction = async (request, response) => {
  const inputObject: any = request.body;
  try {
    // only able to translate fiction name, short story
    if (
      !inputObject ||
      !inputObject.fiction ||
      !inputObject.fiction.fictionId ||
      !inputObject.fiction.fictionName ||
      validator.isEmpty(inputObject.fiction.fictionName) ||
      !inputObject.fiction.shortDetail ||
      validator.isEmpty(inputObject.fiction.shortDetail) ||
      !inputObject.fiction.language ||
      validator.isEmpty(inputObject.fiction.language) ||
      !inputObject.fiction.pricingModel ||
      PricingModelList.indexOf(inputObject.fiction.pricingModel) < 0 ||
      !validator.isInt('' + inputObject.fiction.coin)
    ) {
      throw new Error(ERROR_CODE_INVALID_INPUT, 'Invalid input');
    }
    if (
      (inputObject.fiction.fictionName &&
        !WhiteListInputContentList.isCorrectLanguageOrEnglish(
          inputObject.fiction.language,
          inputObject.fiction.fictionName,
        )) ||
      (inputObject.fiction.shortDetail &&
        !WhiteListInputContentList.isCorrectLanguage(
          inputObject.fiction.language,
          inputObject.fiction.shortDetail,
        ))
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
    const fictionDetail: void | Fiction = await FictionUtil.getFiction(
      inputObject.fiction.fictionId,
    ).catch(error => {
      const returnError: Error = new Error(
        ERROR_CODE_DATABASE_CONNECTION,
        JSON.stringify(error),
      );
      responseTransform(response, true, returnError);
    });
    let currentFiction: Fiction;
    if (!fictionDetail) {
      throw new Error(ERROR_CODE_FICTION_NOT_EXIST, 'fiction not found');
    } else {
      currentFiction = fictionDetail;
    }
    //translate logic
    const inputTranslateLanguage = String(
      inputObject.fiction.language,
    ).toUpperCase();
    // could not  translate as original langugage
    if (
      currentFiction.originalFictionLanguage.toUpperCase() ===
      inputTranslateLanguage
    ) {
      throw new Error(ERROR_CODE_INVALID_INPUT, 'Invalid input');
    }
    // if translator add translate text -> add available language
    if (
      (inputObject.fiction.fictionName || inputObject.fiction.shortDetail) &&
      currentFiction.availableInLanguage.indexOf(inputTranslateLanguage) < 0
    ) {
      currentFiction.availableInLanguage.push(inputTranslateLanguage);
    }
    if (inputObject.fiction.fictionName) {
      let currentExist = false;
      for (let i = 0; i < currentFiction.fictionName.length; i++) {
        if (
          currentFiction.fictionName[i].language.toUpperCase() ===
          inputTranslateLanguage
        ) {
          currentExist = true;
          currentFiction.fictionName[i] = {
            language: inputTranslateLanguage,
            name: inputObject.fiction.fictionName,
          };
        }
      }
      if (!currentExist) {
        currentFiction.fictionName.push({
          language: inputTranslateLanguage,
          name: inputObject.fiction.fictionName,
        });
      }
    }
    if (inputObject.fiction.shortDetail) {
      let currentExist = false;
      for (let i = 0; i < currentFiction.shortDetail.length; i++) {
        if (
          currentFiction.shortDetail[i].language.toUpperCase() ===
          inputTranslateLanguage
        ) {
          currentExist = true;
          currentFiction.shortDetail[i] = {
            language: inputTranslateLanguage,
            story: inputObject.fiction.shortDetail,
          };
        }
        if (!currentExist) {
          currentFiction.shortDetail.push({
            language: inputTranslateLanguage,
            story: inputObject.fiction.shortDetail,
          });
        }
      }
    }
    //add price model
    const inputModelObject: { model: string; coin: number } = {
      model: inputObject.fiction.pricingModel,
      coin: parseInt(inputObject.fiction.coin),
    };
    let priceModelChange = true;

    if (!currentFiction.pricingModel.get(inputUser.cif)) {
      currentFiction.pricingModel.set(
        inputUser.cif,
        new Map([[inputTranslateLanguage, inputModelObject]]),
      );
    } else {
      const languagePriceMap = currentFiction.pricingModel.get(inputUser.cif);
      languagePriceMap.set(inputTranslateLanguage, inputModelObject);
      priceModelChange =
        currentFiction.pricingModel
          .get(inputUser.cif)
          .get(inputTranslateLanguage.toUpperCase()) &&
        (currentFiction.pricingModel
          .get(inputUser.cif)
          .get(inputTranslateLanguage.toUpperCase()).model !==
          inputModelObject.model.toUpperCase() ||
          currentFiction.pricingModel
            .get(inputUser.cif)
            .get(inputTranslateLanguage.toUpperCase()).coin !==
            inputModelObject.coin);
    }
    const result = await FictionUtil.editFiction(
      currentFiction,
      inputUser.cif,
      inputTranslateLanguage.toUpperCase(),
      priceModelChange,
    ).catch(error => {
      const returnError: Error = new Error(
        ERROR_CODE_DATABASE_CONNECTION,
        JSON.stringify(error),
      );
      responseTransform(response, true, returnError);
    });
    if (result) {
      responseTransform(response, false, 'success');

      //TODO update search index
      if (Config.UPDATE_SEARCH_CONTENT) {
        await publishMessage(
          'updateSearchContent',
          JSON.stringify({
            language: currentFiction.originalFictionLanguage.toUpperCase(),
            id: currentFiction.fictionId,
            name: cleanNewLineCodeText(
              cleanHtmlTag(
                currentFiction.getFictionName(
                  inputTranslateLanguage.toUpperCase(),
                ),
              ),
            ),
            description: cleanNewLineCodeText(
              cleanHtmlTag(
                currentFiction.getFictionShortStory(
                  inputTranslateLanguage.toUpperCase(),
                ),
              ),
            ),
          }),
        );
      }
    } else {
      responseTransform(
        response,
        true,
        new Error(ERROR_CODE_NO_AUTHORIZE, 'no authorize'),
      );
    }
  } catch (error) {
    responseTransform(response, true, error);
  }
  return response.toPlainObject();
};

export const rateFiction = async (request, response) => {
  const inputObject: any = request.body;
  try {
    if (!request.query.fictionId || !validator.isInt('' + inputObject.rate)) {
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
    const resultRate: boolean | void = await FictionUtil.rateFiction(
      request.query.fictionId,
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

export const updateFictionStatus = async (request, response) => {
  const inputObject: any = request.body;
  try {
    if (
      !inputObject.fiction.fictionId ||
      !Number.isInteger(inputObject.fiction.status)
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
    const fictionDetail: void | Fiction = await FictionUtil.getFiction(
      inputObject.fiction.fictionId,
    ).catch(error => {
      const returnError: Error = new Error(
        ERROR_CODE_DATABASE_CONNECTION,
        JSON.stringify(error),
      );
      responseTransform(response, true, returnError);
    });
    if (!fictionDetail) {
      throw new Error(ERROR_CODE_FICTION_NOT_EXIST, 'fiction not found');
    }

    if (fictionDetail.author.cif !== inputUser.cif) {
      throw new Error(
        ERROR_CODE_NO_AUTHORIZE,
        'No authorize to update fiction status',
      );
    }
    // TODO this case for complete status only
    if (inputObject.fiction.status === FICTION_STATUS.COMPLETED) {
      if (!fictionDetail || fictionDetail.numberOfChapter === 0) {
        throw new Error(
          ERROR_CODE_FICTION_NOT_COMPLETE_ZERO_CHAPTER,
          'Cannot complete no chapter fiction',
        );
      }
    }

    const resultUpdate: boolean | void = await FictionUtil.updateStatusFiction(
      inputObject.fiction.fictionId,
      inputUser.cif,
      inputObject.fiction.status,
    ).catch(error => {
      const returnError: Error = new Error(
        ERROR_CODE_DATABASE_CONNECTION,
        JSON.stringify(error),
      );
      responseTransform(response, true, returnError);
    });
    if (typeof resultUpdate === 'undefined' || resultUpdate === null) {
      throw new Error(ERROR_CODE_NO_AUTHORIZE, 'No authorize to complete');
    }
    if (resultUpdate) {
      responseTransform(response, false, { result: 'Success' });
    } else {
      throw new Error(ERROR_CODE_NO_AUTHORIZE, 'No authorize to complete');
    }
  } catch (error) {
    responseTransform(response, true, error);
  }

  return response.toPlainObject();
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

const uploadCoverImageToStorage = (
  fictionId: string,
  coverImageBase64,
): Promise<string> => {
  const DATE_SUBSTR_POSITION: number = 10;
  return new Promise((resolve, reject) => {
    let contentType: string = coverImageBase64.substr(
      0,
      coverImageBase64.indexOf(';'),
    );
    contentType = contentType.split(':')[1];
    if (!contentType.match(/(\.|\/)(jpe?g|png|gif)$/i)) {
      reject(
        new Error(ERROR_CODE_COVER_FILE_FORMAT, 'Accept jpg png or gif only'),
      );
      return;
    }
    const data = new Buffer(
      coverImageBase64.replace(/^data:image\/\w+;base64,/, ''),
      'base64',
    );

    const fileExtension = contentType.split('/')[1];
    // Upload Image to S3
    const imageKey =
      fictionId +
      (new Date().toISOString().substr(0, DATE_SUBSTR_POSITION) +
        '-' +
        String(Date.now())) +
      '.' +
      fileExtension;
    // start changing to google storage
    const coverBucket = getStorage().bucket(Config.STORAGE_BUCKET);
    const file = coverBucket.file(imageKey);
    const bufferStream = new Stream.PassThrough();
    bufferStream.end(data);
    bufferStream
      .pipe(
        file.createWriteStream({
          metadata: {
            contentType: contentType,
            metadata: {
              custom: 'fiction-cover',
            },
          },
          public: true,
          validation: 'md5',
        }),
      )
      .on('error', err => {
        reject(
          new Error(
            ERROR_CODE_SAVE_IMAGE_COVER,
            'got some problem when save cover image',
          ),
        );
      })
      .on('finish', async () => {
        resolve(imageKey);
      });
  });
};
