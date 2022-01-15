import { ShortChapter } from './../common/shortChapter';
import { Config } from './../config/index';
import { PricingModel } from './../common/pricingModel';
import { fiction } from './../index';
import { FieldValue } from '@google-cloud/firestore';
import * as _ from 'lodash';
import { Chapter } from '../common/chapter';
import {
  Error,
  ERROR_CODE_DATABASE_EXECUTE_TRANSACTION,
  ERROR_CODE_DATABASE_PRE_EXECUTE_TRANSACTION,
  ERROR_CODE_DATABASE_CONNECTION,
  ERROR_CODE_PROCESS_ERROR,
  ERROR_CODE_FICTION_SUSPEND_OR_DELETE,
} from '../common/error';
import { Fiction } from '../common/fiction';
import { AnalysisReport } from './../common/analysisReport';
import { User } from './../common/user';
import { getFirebase } from './fireBaseUtil';
import FICTION_STATUS from '../config/fictionStatusList';
import { returnFireStoreToChapterList } from './chapterUtil';
import { Timestamp } from '@google-cloud/firestore';

const NUMBER_OF_TOTAL_COUNT_SHARD: number = 3;
const DEFAULT_PRICE_MODEL: string = 'FA';
const RETURN_FROM_CREATE_FICTION_STORE: number = 3;
const RETURN_FROM_CREATE_CHAPTER_STORE_CHAPTER_ID: number = 4;
const RETURN_FROM_CREATE_FICTION_STORE_DISPLAY_ID: number = 5;
const RETURN_FROM_CREATE_FICTION_STORE_ERROR: number = 6;
const MAX_RATING = 10;
const LIMIT_RETURN_FICTION_LIST: number = 8;
const PRICE_MODEL_THRESHOLD: number = 5;

export class FictionUtil {
  public static getFiction(fictionId: string): Promise<Fiction> {
    return new Promise(async (resolve, reject) => {
      const db = getFirebase();
      const fictionRef = db.collection('fictions').doc(fictionId);

      await fictionRef
        .get()
        .then(returnItem => {
          if (!returnItem.exists) {
            resolve(null);
          } else {
            resolve(returnFireStoreToFiction(returnItem));
          }
        })
        .catch(error => {
          reject(
            new Error(
              ERROR_CODE_DATABASE_CONNECTION,
              'Error on retrieve fiction',
            ),
          );
        });
    });
  }

  public static getFictionList(
    language: string,
    freeOnly: boolean = null,
  ): Promise<Fiction[]> {
    return new Promise(async (resolve, reject) => {
      resolve(new Array());
      /*  let queryDoc;
      if (!language) {
        reject(
          new Error(
            ERROR_CODE_DATABASE_PRE_EXECUTE_TRANSACTION,
            'Invalid input',
          ),
        );
        return;
      }
      const db = getFirebase();
      const fictionCollections = db
        .collection('fictions')
        .doc(language.toUpperCase())
        .collection('stories');
      if (authorCif) {
        // for author only, then retreive all status
        const authorRef = db.collection('users').doc(authorCif);
        queryDoc = fictionCollections.where('author', '==', authorRef);

        //queryDoc = fictionCollections;
      } else if (categoryId) {
        queryDoc = fictionCollections
          .where('categories', 'array-contains', categoryId)
          .where('status', '==', FICTION_STATUS.PUBLISH);
      } else {
        queryDoc = fictionCollections.where(
          'status',
          '==',
          FICTION_STATUS.PUBLISH,
        );
      }
      await queryDoc
        .get()
        .then(returnItem => {
          if (returnItem.empty) {
            resolve(new Array<Fiction>());
            return;
          }
          const returnFictionList: Fiction[] = new Array<Fiction>();
          returnItem.forEach(returnDocument => {
            returnFictionList.push(
              returnFireStoreToFiction(returnDocument, language),
            );
          });
          resolve(returnFictionList);
        })
        .catch(error => {
          reject(
            new Error(
              ERROR_CODE_DATABASE_CONNECTION,
              'Error on retrieve last update list',
            ),
          );
        });*/
    });
  }

  public static getNewFiction(language: string): Promise<Fiction[]> {
    return new Promise(async (resolve, reject) => {
      if (!language) {
        reject(
          new Error(
            ERROR_CODE_DATABASE_PRE_EXECUTE_TRANSACTION,
            'Invalid input',
          ),
        );
        return;
      }

      await getFirebase()
        .collection('fictions')
        .where('availableInLanguage', 'array-contains', language.toUpperCase())
        .where('isPublished', '==', true)
        .where('isDeleted', '==', false)
        .orderBy('updatedDate', 'desc')
        .limit(LIMIT_RETURN_FICTION_LIST)
        .get()
        .then(async returnItem => {
          if (returnItem.empty) {
            resolve(new Array<Fiction>());
          }
          const returnFictionList: Fiction[] = new Array<Fiction>();
          returnItem.forEach(returnDocument => {
            returnFictionList.push(returnFireStoreToFiction(returnDocument));
          });
          resolve(returnFictionList);
        })
        .catch(error => {
          reject(
            new Error(
              ERROR_CODE_DATABASE_CONNECTION,
              'Error on retrieve last update list',
            ),
          );
        });
    });
  }

  public static getTopFiction(language: string): Promise<Fiction[]> {
    return new Promise(async (resolve, reject) => {
      if (!language) {
        reject(
          new Error(
            ERROR_CODE_DATABASE_PRE_EXECUTE_TRANSACTION,
            'Invalid input',
          ),
        );
        return;
      }

      await getFirebase()
        .collection('fictions')
        .where('availableInLanguage', 'array-contains', language.toUpperCase())
        .where('isPublished', '==', true)
        .where('isDeleted', '==', false)
        .orderBy('rating', 'desc')
        .limit(LIMIT_RETURN_FICTION_LIST)
        .get()
        .then(async returnItem => {
          if (returnItem.empty) {
            resolve(new Array<Fiction>());
          }
          const returnFictionList: Fiction[] = new Array<Fiction>();
          returnItem.forEach(returnDocument => {
            returnFictionList.push(returnFireStoreToFiction(returnDocument));
          });
          resolve(returnFictionList);
        })
        .catch(error => {
          reject(
            new Error(
              ERROR_CODE_DATABASE_CONNECTION,
              'Error on retrieve last update list',
            ),
          );
        });
    });
  }

  public static getSearchFiction(
    language: string,
    keyword: string = null,
  ): Promise<Fiction[]> {
    return new Promise(async (resolve, reject) => {
      const db = getFirebase();
      if (!language) {
        reject(
          new Error(
            ERROR_CODE_DATABASE_PRE_EXECUTE_TRANSACTION,
            'Invalid input',
          ),
        );
        return;
      }
      resolve(new Array());

      /* const rateFictionCollection = db
        .collection('users')
        .doc(rateUserCif)
        .collection('rateFictions')
        .where('language', '==', language);
      await rateFictionCollection
        .get()
        .then(async returnItem => {
          if (returnItem.empty) {
            resolve(new Array<Fiction>());
          }

          const returnFictionList: Fiction[] = new Array<Fiction>();
          const queryArray = Array();
          returnItem.forEach(async returnDocument => {
            queryArray.push(returnDocument);
          });

          const runningPromise = queryArray.map(async returnDocument => {
            await db
              .collection('fictions')
              .doc(returnDocument.data().language)
              .collection('stories')
              .doc(returnDocument.data().fiction.id)
              .get()
              .then(returnFictionDocument => {
                if (!returnFictionDocument.exists) {
                  return;
                }
                const returnFictionObject = returnFireStoreToFiction(
                  returnFictionDocument,
                  language,
                );
                if (categoryId) {
                  if (returnFictionObject.categories.indexOf(categoryId) > 0) {
                    returnFictionList.push(returnFictionObject);
                  }
                } else {
                  returnFictionList.push(returnFictionObject);
                }
              });
          });
          await Promise.all(runningPromise);
          resolve(returnFictionList);
        })
        .catch(error => {
          reject(
            new Error(
              ERROR_CODE_DATABASE_CONNECTION,
              'Error on retrieve last update list',
            ),
          );
        });*/
    });
  }

  public static startFiction(fiction: Fiction): Promise<Fiction> {
    return new Promise(async (resolve, reject) => {
      const db = getFirebase();
      if (!fiction) {
        // reject some error
        reject(
          new Error(
            ERROR_CODE_DATABASE_PRE_EXECUTE_TRANSACTION,
            'Invalid input',
          ),
        );
      } else {
        const insertFiction = transformFictionToFirestoreObject(db, fiction,true);
        await db
          .collection('fictions')
          .add(Object.assign({}, insertFiction))
          .then(insertId => {
            fiction.fictionId = insertId.id;
            resolve(fiction);
          })
          .catch(error => {
            reject(
              new Error(ERROR_CODE_PROCESS_ERROR, 'Error on save fiction'),
            );
          });
      }
    });
  }

  public static editFiction(
    fiction: Fiction,
    updateAuthorCif: string,
    updateLangauge: string,
    priceModeChange: boolean,
  ): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      const db = getFirebase();
      if (!fiction) {
        // reject some error
        reject(
          new Error(
            ERROR_CODE_DATABASE_PRE_EXECUTE_TRANSACTION,
            'Invalid input',
          ),
        );
      } else {
        const updateFiction = transformFictionToFirestoreObject(db, fiction,false);
        const fictionRef = db.collection('fictions').doc(fiction.fictionId);
        //TODO may skip get chapter list if price model not change
        db.runTransaction(async transaction => {
          const chapterListRef = db
            .collection('fictions')
            .doc(fiction.fictionId)
            .collection('chapterList')
            .doc(updateAuthorCif + '-' + updateLangauge.toUpperCase());

          return await transaction
            .get(chapterListRef)
            .then(async returnItem => {
              if (!returnItem.exists) {
                return { chapterList: null };
              }
              const returnChapterList: ShortChapter[] = returnFireStoreToChapterList(
                returnItem,
              );
              returnChapterList.sort(sortChapterListFunction);
              return { chapterList: returnChapterList };
            })
            .then(async inputObject => {
              let nextTransaction = await transaction.update(
                fictionRef,
                Object.assign({}, updateFiction, {
                  updatedDate: FieldValue.serverTimestamp(),
                }),
              );
              if (inputObject.chapterList !== null) {
                const newPriceModel = fiction.pricingModel
                  .get(updateAuthorCif)
                  .get(updateLangauge).model;
                const newCoin = fiction.pricingModel
                  .get(updateAuthorCif)
                  .get(updateLangauge).coin;
                if (newPriceModel === PricingModel.F5) {
                  let countFirst5 = 0;
                  for (let i = 0; i < inputObject.chapterList.length; i++) {
                    if (!inputObject.chapterList[i].isFreeChapter) {
                      const chapterRef = db
                        .collection('chapters')
                        .doc(inputObject.chapterList[i].chapterId);
                      nextTransaction = await transaction.update(chapterRef, {
                        coin:
                          countFirst5 < PRICE_MODEL_THRESHOLD
                            ? 0
                            : Number(newCoin),
                      });
                      countFirst5++;
                    }
                  }
                } else if (newPriceModel === PricingModel.FA) {
                  for (let i = 0; i < inputObject.chapterList.length; i++) {
                    const chapterRef = db
                      .collection('chapters')
                      .doc(inputObject.chapterList[i].chapterId);
                    nextTransaction = await transaction.update(chapterRef, {
                      coin: 0,
                    });
                  }
                } else if (newPriceModel === PricingModel.L5) {
                  let countLast5 = 0;
                  for (
                    let i = inputObject.chapterList.length - 1;
                    i >= 0;
                    i--
                  ) {
                    if (!inputObject.chapterList[i].isFreeChapter) {
                      const chapterRef = db
                        .collection('chapters')
                        .doc(inputObject.chapterList[i].chapterId);
                      nextTransaction = await transaction.update(chapterRef, {
                        coin:
                          countLast5 < PRICE_MODEL_THRESHOLD
                            ? 0
                            : Number(newCoin),
                      });
                      countLast5++;
                    }
                  }
                } else if (newPriceModel === PricingModel.PA) {
                  for (let i = 0; i < inputObject.chapterList.length; i++) {
                    if (!inputObject.chapterList[i].isFreeChapter) {
                      const chapterRef = db
                        .collection('chapters')
                        .doc(inputObject.chapterList[i].chapterId);
                      nextTransaction = await transaction.update(chapterRef, {
                        coin: Number(newCoin),
                      });
                    }
                  }
                }
              }
              resolve(true);
            });
        });
      }
    });
  }

  public static rateFiction(
    fictionId: string,
    inputUserCif: string,
    rate: number,
  ): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      if (!fictionId || !inputUserCif || rate < 1 || rate > MAX_RATING) {
        // reject some error
        reject(new Error(ERROR_CODE_PROCESS_ERROR, 'Invalid input'));
        return;
      }
      const db = getFirebase();
      db.runTransaction(async transaction => {
        const currentUserRateRef = db
          .collection('users')
          .doc(inputUserCif)
          .collection('rateFictions')
          .doc(fictionId);
        const currentFictionRef = db.collection('fictions').doc(fictionId);

        return await transaction
          .get(currentUserRateRef)
          .then(async currentUserRateDocument => {
            const rateDocumentExist = currentUserRateDocument.exists;
            let currentScore = 0;
            if (rateDocumentExist) {
              if (currentUserRateDocument.data().score === rate) {
                resolve(true);
              } else {
                currentScore = currentUserRateDocument.data().score;
              }
            }

            return { score: { score: currentScore, exist: rateDocumentExist } };
          })
          .then(async inputObject => {
            let currentFiction;
            await transaction
              .get(currentFictionRef)
              .then(async currentFictionDocument => {
                if (currentFictionDocument.exists) {
                  currentFiction = returnFireStoreToFiction(
                    currentFictionDocument,
                  );
                }
              });
            return Object.assign(inputObject, { fiction: currentFiction });
          })
          .then(async inputObject => {
            const currentFiction = inputObject.fiction;
            if (
              !currentFiction.ratingDetail ||
              currentFiction.ratingDetail.length < MAX_RATING
            ) {
              currentFiction.ratingDetail = new Array();
              for (let i = 1; i <= MAX_RATING; i++) {
                currentFiction.ratingDetail.push({ rate: i, count: 0 });
              }
            }
            const fireStorUpdateTransaction = await transaction.set(
              currentUserRateRef,
              {
                score: rate,
              },
            );
            const previousScore = inputObject.score.exist
              ? inputObject.score.score
              : 0;

            // score are different update score on user and fiction

            for (let i = 0; i < currentFiction.ratingDetail.length; i++) {
              if (currentFiction.ratingDetail[i].rate === rate) {
                currentFiction.ratingDetail[i].count++;
              }
              if (currentFiction.ratingDetail[i].rate === previousScore) {
                currentFiction.ratingDetail[i].count--;
              }
            }
            const newScore = currentFiction.calculateNewRate();
            await fireStorUpdateTransaction.update(currentFictionRef, {
              rating: newScore,
              ratingDetail: currentFiction.ratingDetail,
            });
            resolve(true);
          });
      });
    });
  }

  public static updateStatusFiction(
    fictionId: string,
    authorCif: string,
    newStatus: number,
  ): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      if (!fictionId || !authorCif) {
        reject(new Error(ERROR_CODE_PROCESS_ERROR, 'Error on update fiction'));
        return;
      }
      // TODO Draft - Test
      const db = getFirebase();
      const fictionDocument = db.collection('fictions').doc(fictionId);
      await fictionDocument.update({ status: newStatus });
      resolve(true);
    });
  }
}

const nullOrZero = (object): number => {
  return !object || isNaN(object) ? 0 : object;
};

export const returnFireStoreToFiction = (input: any): Fiction => {
  const returnFiction = new Fiction({
    fictionId: input.id,
    originalFictionLanguage: input.data().originalFictionLanguage,
    rating: input.data().rating,
    lastChapter: nullOrZero(input.data().lastChapter),
    numberOfChapter: nullOrZero(input.data().numberOfChapter),
    totalOfChapter: nullOrZero(input.data().totalOfChapter),
    purchaseCount: nullOrZero(input.data().purchaseCount),
    availableInLanguage: input.data().availableInLanguage,
    categories: input.data().categories,
    updatedDate: new Timestamp(
      input.data().updatedDate.seconds,
      input.data().updatedDate.nanoseconds,
    ).toDate(),
    createdDate: new Timestamp(
      input.data().createdDate.seconds,
      input.data().createdDate.nanoseconds,
    ).toDate(),
    ageRestriction: input.data().ageRestriction,
    status: input.data().status,
    isPublished: input.data().isPublished,
    isDeleted: input.data().isDeleted,
    cover: input.data().cover,
    author: new User({
      cif: input.data().author.cif.id,
      displayName: input.data().author.authorName,
    }),
    translaters: input.data().translaters,
  });
  returnFiction.fictionName = new Array<{ language: string; name: string }>();
  input.data().fictionName.map(fictionNameItem => {
    returnFiction.fictionName.push({
      language: String(fictionNameItem.language),
      name: String(fictionNameItem.name),
    });
  });
  returnFiction.shortDetail = new Array<{ language: string; story: string }>();
  input.data().shortDetail.map(shortDetailItem => {
    returnFiction.shortDetail.push({
      language: String(shortDetailItem.language),
      story: String(shortDetailItem.story),
    });
  });
  returnFiction.pricingModel = new Map<
    string,
    Map<string, { model: string; coin: number }>
  >();
  Object.keys(input.data().pricingModel).map(priceModelAuthorItem => {
    Object.keys(input.data().pricingModel[priceModelAuthorItem]).map(
      priceModelLanguageItem => {
        if (!returnFiction.pricingModel.get(String(priceModelAuthorItem))) {
          returnFiction.pricingModel.set(
            priceModelAuthorItem,
            new Map<string, { model: string; coin: number }>(),
          );
        }
        const inputMapModel: Map<
          string,
          { model: string; coin: number }
        > = returnFiction.pricingModel.get(String(priceModelAuthorItem));
        inputMapModel.set(priceModelLanguageItem, {
          model: String(
            input.data().pricingModel[priceModelAuthorItem][
              priceModelLanguageItem
            ].model,
          ),
          coin: parseInt(
            input.data().pricingModel[priceModelAuthorItem][
              priceModelLanguageItem
            ].coin,
          ),
        });
      },
    );
  });

  returnFiction.ratingDetail = new Array<{ rate: number; count: number }>();
  if (input.data().ratingDetail) {
    input.data().ratingDetail.map(rateDetailItem => {
      returnFiction.ratingDetail.push({
        rate: parseInt(rateDetailItem.rate),
        count: parseInt(rateDetailItem.count),
      });
    });
  }
  return returnFiction;
};

const transformFictionToFirestoreObject = (
  db,
  input: Fiction,
  newFiction: boolean,
): any => {
  const authorRef = db.collection('users').doc(input.author.cif);
  const returnObject: any = Object.assign(
    {},
    setInitialValueFiction(new Fiction()),
  );
  if (newFiction) {
    returnObject.createdDate = FieldValue.serverTimestamp();
  }
  returnObject.author = {
    cif: authorRef,
    authorName: input.author.displayName,
  };

  returnObject.fictionName = input.fictionName;
  returnObject.originalFictionLanguage = input.originalFictionLanguage.toUpperCase();
  returnObject.numberOfChapter = Number(input.numberOfChapter);
  returnObject.totalOfChapter = Number(input.totalOfChapter);
  returnObject.lastChapter = Number(input.lastChapter);
  returnObject.availableInLanguage = input.availableInLanguage;
  returnObject.shortDetail = input.shortDetail;
  returnObject.categories = input.categories;
  returnObject.ageRestriction = input.ageRestriction;
  returnObject.updatedDate = FieldValue.serverTimestamp();
  returnObject.status = Number(input.status);
  returnObject.isPublished = input.isPublished;
  returnObject.isDeleted = input.isDeleted;
  returnObject.cover = input.cover ? input.cover : null;
  returnObject.pricingModel = {};
  input.pricingModel.forEach((languageMap, key) => {
    returnObject.pricingModel[key] = {};
    languageMap.forEach((languageValue, languageKey) => {
      returnObject.pricingModel[key][languageKey.toUpperCase()] = languageValue;
    });
  });
  returnObject.translaters = input.translaters ? input.translaters : [];
  return returnObject;
};

export const setInitialValueFiction = input => {
  input.ageRestriction = false;
  input.numberOfChapter = 0;
  input.totalOfChapter = 0;
  input.lastChapter = 0;
  input.purchaseCount = 0;
  input.status = FICTION_STATUS.DRAFT;
  input.lastUpdateDate = FieldValue.serverTimestamp();
  input.createDate = FieldValue.serverTimestamp();
  input.rating = 0;
  input.isPublished = false;
  input.isDeleted = false;
  input.ratingDetail = [];
  for (let i = 1; i <= MAX_RATING; i++) {
    input.ratingDetail.push({ rate: i, count: 0 });
  }
};

const sortChapterListFunction = (a, b) => {
  // max to min
  if (a.chapterNumberInFiction > b.chapterNumberInFiction) {
    return -1;
  }
  if (a.chapterNumberInFiction < b.chapterNumberInFiction) {
    return 1;
  }
  return 0;
};
