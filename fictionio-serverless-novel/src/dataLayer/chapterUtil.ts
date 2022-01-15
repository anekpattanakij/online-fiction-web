import { fiction } from './../index';
import { Config } from '../config/index';
import * as _ from 'lodash';
import { Chapter } from '../common/chapter';
import { ShortChapter } from '../common/shortChapter';
import {
  Error,
  ERROR_CODE_DATABASE_EXECUTE_TRANSACTION,
  ERROR_CODE_DATABASE_PRE_EXECUTE_TRANSACTION,
  ERROR_CODE_DATABASE_CONNECTION,
  ERROR_CODE_PROCESS_ERROR,
  ERROR_CODE_NO_AUTHORIZE,
  ERROR_CODE_FICTION_NOT_EXIST,
  ERROR_CODE_CHAPTER_NOT_EXIST,
  ERROR_CODE_CHAPTER_ALREADY_PUBLISH,
  ERROR_CODE_MISMITCH_LANGUAGE,
} from '../common/error';
import { Fiction } from '../common/fiction';
import { AnalysisReport } from '../common/analysisReport';
import { User } from '../common/user';
import { getFirebase } from './fireBaseUtil';
import FICTION_STATUS from '../config/fictionStatusList';
import { PricingModel } from './../common/pricingModel';
import {
  setInitialValueFiction,
  returnFireStoreToFiction,
} from './fictionUtil';
import WhiteListInputContentList from '../config/whiteListInputContentList';
import { FieldValue, Timestamp } from '@google-cloud/firestore';
import {
  Comment,
  returnFireStoreComment,
  transformCommentToFirestoreObject,
  sortCommentFunction,
} from '../common/comment';

const MAX_RATING = 10;
const NUMBER_OF_TOTAL_COUNT_SHARD: number = 3;
const DEFAULT_PRICE_MODEL: string = 'FA';
const LIMIT_POSITION_PRICE_MODEL: number = 5;
export const LIMIT_RETURN_CHAPTER_LIST: number = 10;

export class ChapterUtil {
  public static getReduceChapterList(
    fictionId: string,
    authorCif: string,
    language: string,
  ): Promise<ShortChapter[]> {
    return new Promise(async (resolve, reject) => {
      if (!fictionId || !language || !authorCif) {
        // reject some error
        reject(
          new Error(
            ERROR_CODE_DATABASE_PRE_EXECUTE_TRANSACTION,
            'Invalid input',
          ),
        );
        return;
      }
      const db = getFirebase();
      const chapterListDocumentRef = db
        .collection('fictions')
        .doc(fictionId)
        .collection('chapterList')
        .doc(authorCif + '-' + language.toUpperCase());
      await chapterListDocumentRef
        .get()
        .then(async returnItem => {
          if (!returnItem.exists) {
            resolve(new Array<ShortChapter>());
            return;
          }
          const returnChapterList: ShortChapter[] = returnFireStoreToChapterList(
            returnItem,
          );

          resolve(returnChapterList);
          return;
        })
        .catch(error => {
          reject(
            new Error(
              ERROR_CODE_DATABASE_CONNECTION,
              'Error on retrieve chapter list',
            ),
          );
        });
    });
  }

  public static getChapterList(
    fictionId: string,
    includingDraft: boolean,
  ): Promise<Chapter[]> {
    return new Promise(async (resolve, reject) => {
      if (!fictionId) {
        // reject some error
        reject(
          new Error(
            ERROR_CODE_DATABASE_PRE_EXECUTE_TRANSACTION,
            'Invalid input',
          ),
        );
        return;
      }
      const db = getFirebase();
      const fictionDocumentRef = db.collection('fictions').doc(fictionId);
      let chapterCollections;
      if (includingDraft) {
        chapterCollections = db
          .collection('chapters')
          .where('fiction', '==', fictionDocumentRef)
          .where('status', '<=', FICTION_STATUS.PUBLISH);
      } else {
        chapterCollections = db
          .collection('chapters')
          .where('fiction', '==', fictionDocumentRef)
          .where('status', '==', FICTION_STATUS.PUBLISH);
      }
      await chapterCollections
        .get()
        .then(async returnItem => {
          if (returnItem.empty) {
            resolve(new Array<Chapter>());
            return;
          }
          let returnChapterList: Chapter[] = new Array<Chapter>();
          const temp = Array();
          returnItem.forEach(async returnDocument => {
            temp.push(returnDocument);
          });
          const promiseMap = temp.map(async returnDocument => {
            const chapter = await returnFireStoreToChapter(returnDocument);
            chapter.fictionId = fictionId;
            chapter.chapterContent = '';
            returnChapterList = returnChapterList.concat(chapter);
          });
          await Promise.all(promiseMap);
          returnChapterList.sort(sortChapterFunction);
          resolve(returnChapterList);
        })
        .catch(error => {
          reject(
            new Error(
              ERROR_CODE_DATABASE_CONNECTION,
              'Error on retrieve chapter list',
            ),
          );
        });
    });
  }

  public static getNewChapter(
    language: string,
    freeOnly: boolean,
  ): Promise<Chapter[]> {
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

      let queryDoc;
      const chapterCollections = getFirebase().collection('chapters');

      if (freeOnly) {
        queryDoc = chapterCollections
          .where('language', '==', language.toUpperCase())
          .where('status', '==', FICTION_STATUS.PUBLISH)
          .where('coin', '==', 0)
          .orderBy('lastUpdateDate', 'desc')
          .limit(LIMIT_RETURN_CHAPTER_LIST);
      } else {
        queryDoc = chapterCollections
          .where('language', '==', language.toUpperCase())
          .where('status', '==', FICTION_STATUS.PUBLISH)
          .orderBy('lastUpdateDate', 'desc')
          .limit(LIMIT_RETURN_CHAPTER_LIST);
      }
      await queryDoc
        .get()
        .then(async returnItem => {
          if (returnItem.empty) {
            resolve(new Array<Chapter>());
          }
          const returnChapterList: Chapter[] = new Array<Chapter>();
          returnItem.forEach(returnDocument => {
            const returnChapter = returnFireStoreToChapter(returnDocument);
            returnChapter.chapterContent = '';
            returnChapterList.push(returnChapter);
          });
          resolve(returnChapterList);
        })
        .catch(error => {
          reject(
            new Error(
              ERROR_CODE_DATABASE_CONNECTION,
              'Error on retrieve new chapter list',
            ),
          );
        });
    });
  }

  public static getTopChapter(
    language: string,
    freeOnly: boolean,
  ): Promise<Chapter[]> {
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

      let queryDoc;
      const chapterCollections = getFirebase().collection('chapters');

      if (freeOnly) {
        queryDoc = chapterCollections
          .where('language', '==', language.toUpperCase())
          .where('status', '==', FICTION_STATUS.PUBLISH)
          .where('coin', '==', 0)
          .orderBy('rating', 'desc')
          .limit(LIMIT_RETURN_CHAPTER_LIST);
      } else {
        queryDoc = chapterCollections
          .where('language', '==', language.toUpperCase())
          .where('status', '==', FICTION_STATUS.PUBLISH)
          .orderBy('rating', 'desc')
          .limit(LIMIT_RETURN_CHAPTER_LIST);
      }
      await queryDoc
        .get()
        .then(async returnItem => {
          if (returnItem.empty) {
            resolve(new Array<Chapter>());
          }
          const returnChapterList: Chapter[] = new Array<Chapter>();
          returnItem.forEach(returnDocument => {
            const returnChapter = returnFireStoreToChapter(returnDocument);
            returnChapter.chapterContent = '';
            returnChapterList.push(returnChapter);
          });
          resolve(returnChapterList);
        })
        .catch(error => {
          reject(
            new Error(
              ERROR_CODE_DATABASE_CONNECTION,
              'Error on retrieve top chapter list',
            ),
          );
        });
    });
  }

  public static getChapter(chapterId: string): Promise<Chapter> {
    return new Promise(async (resolve, reject) => {
      if (!chapterId) {
        // reject some error
        reject(
          new Error(
            ERROR_CODE_DATABASE_PRE_EXECUTE_TRANSACTION,
            'Invalid input',
          ),
        );
        return;
      }
      const db = getFirebase();
      const chapterCollections = db.collection('chapters').doc(chapterId);

      // TODO add currentUserRating: returnResult.USER_RATING,
      await chapterCollections
        .get()
        .then(async returnItem => {
          if (!returnItem.exists) {
            resolve(null);
            return;
          }
          const returnChapter: Chapter = await returnFireStoreToChapter(
            returnItem,
          );
          resolve(returnChapter);
        })
        .catch(error => {
          reject(
            new Error(
              ERROR_CODE_PROCESS_ERROR,
              'Error on retrieve chapter detail',
            ),
          );
        });
    });
  }

  public static updateChapterReadCount(
    chapterId: string,
    newMonthlyCount: number,
    newTotalCount: number,
  ): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      if (!chapterId) {
        // reject some error
        reject(
          new Error(
            ERROR_CODE_DATABASE_PRE_EXECUTE_TRANSACTION,
            'Invalid input',
          ),
        );
        return;
      }
      const db = getFirebase();
      const chapterCollections = db.collection('chapters').doc(chapterId);

      // TODO add currentUserRating: returnResult.USER_RATING,
      await chapterCollections
        .update({
          monthlyCount: newMonthlyCount,
          totalCount: newTotalCount,
        })
        .catch(error => {
          reject(
            new Error(
              ERROR_CODE_PROCESS_ERROR,
              'Error on retrieve chapter detail',
            ),
          );
        });
      resolve(true);
    });
  }

  public static getPurchaseChapter(
    chapterId: string,
    userCif: string,
    fictionId: string = null,
  ): Promise<string[]> {
    return new Promise(async (resolve, reject) => {
      if (!userCif) {
        // reject some error
        reject(
          new Error(
            ERROR_CODE_DATABASE_PRE_EXECUTE_TRANSACTION,
            'Invalid input',
          ),
        );
        return;
      }
      const db = getFirebase();
      const returnResult: string[] = new Array();
      if (chapterId && chapterId !== '') {
        const purchaseChapterCollection = db
          .collection('users')
          .doc(userCif)
          .collection('purchaseHistory')
          .doc(chapterId);
        const purchaseExist = await purchaseChapterCollection
          .get()
          .then(async purchaseChapterHistoryItem => {
            if (purchaseChapterHistoryItem.exists) {
              return true;
            } else {
              return false;
            }
          });
        if (purchaseExist) {
          returnResult.push(chapterId);
        }
      } else if (fictionId && userCif) {
        const purchaseChapterCollection = db
          .collection('users')
          .doc(userCif)
          .collection('purchasedList')
          .doc(fictionId);
        purchaseChapterCollection.get().then(async purchaseListDocument => {
          if (purchaseListDocument.exists) {
            returnResult.concat(purchaseListDocument.data().list);
          }
        });
      }
      resolve(returnResult);
    });
  }

  public static startChapter(chapter: Chapter): Promise<Chapter> {
    return new Promise(async (resolve, reject) => {
      if (!chapter) {
        // reject some error
        reject(new Error(ERROR_CODE_PROCESS_ERROR, 'Invalid input'));
        return;
      }
      const db = getFirebase();
      const fictionDocumentRef = db
        .collection('fictions')
        .doc(chapter.fictionId);
      db.runTransaction(async transaction => {
        return await transaction
          .get(fictionDocumentRef)
          .then(returnFictionDocument => {
            if (!returnFictionDocument.exists) {
              throw new Error(
                ERROR_CODE_FICTION_NOT_EXIST,
                'fiction not found',
              );
            }
            const fictionDocument = returnFireStoreToFiction(
              returnFictionDocument,
            );
            if (fictionDocument.author.cif !== chapter.author.cif) {
              throw new Error(ERROR_CODE_NO_AUTHORIZE, 'no authorize');
            }
            return { fiction: fictionDocument };
          })
          .then(async inputObject => {
            chapter.chapterNumberInFiction =
              inputObject.fiction.totalOfChapter + 1;
            if (chapter.isFreeChapter) {
              chapter.displayChapterNumber = 0;
            } else {
              chapter.displayChapterNumber =
                inputObject.fiction.lastChapter + 1;
            }
            const newChapterDocument = db.collection('chapters').doc();
            const writeObject = transformChapterToFirestoreObject(
              db,
              chapter,
              true,
            );
            writeObject.fiction = fictionDocumentRef;

            writeObject.displayCover =
              inputObject.fiction.cover &&
              inputObject.fiction.cover !== null &&
              inputObject.fiction.cover !== ''
                ? inputObject.fiction.cover
                : null;

            writeObject.fictionDisplayName = inputObject.fiction.getFictionName(
              chapter.language,
            );
            // save new chapter
            const nextTransaction = await transaction.create(
              newChapterDocument,
              writeObject,
            );
            //  update fiction => number of record
            const updateFictionObject: any = {};
            updateFictionObject.totalOfChapter =
              inputObject.fiction.totalOfChapter + 1;
            if (!chapter.isFreeChapter) {
              updateFictionObject.lastChapter =
                inputObject.fiction.lastChapter + 1;
            }
            await nextTransaction.update(
              fictionDocumentRef,
              updateFictionObject,
            );
            chapter.chapterId = newChapterDocument.id;
            resolve(chapter);
          })
          .catch(err => {
            reject(
              new Error(
                ERROR_CODE_PROCESS_ERROR,
                'Error on create new chapter',
              ),
            );
          });
      });
    });
  }

  public static editChapter(chapter: Chapter): Promise<Chapter> {
    return new Promise(async (resolve, reject) => {
      const db = getFirebase();
      if (
        !chapter.chapterId &&
        !chapter.chapterName &&
        !chapter.chapterContent
      ) {
        // reject some error
        reject(
          new Error(ERROR_CODE_PROCESS_ERROR, 'Error on input update chapter'),
        );
        return;
      }
      const chapterDocument = db.collection('chapters').doc(chapter.chapterId);
      db.runTransaction(async transaction => {
        return await transaction
          .get(chapterDocument)
          .then(async returnChapterDocument => {
            let returnChapter: Chapter = null;
            if (returnChapterDocument.exists) {
              returnChapter = await returnFireStoreToChapter(
                returnChapterDocument,
              );
            } else {
              reject(
                new Error(
                  ERROR_CODE_PROCESS_ERROR,
                  'Error on input update chapter',
                ),
              );
            }
            return { chapter: returnChapter };
          })
          .then(async inputObject => {
            // check language as same language before edit
            if (
              !WhiteListInputContentList.isCorrectLanguageOrEnglish(
                inputObject.chapter.language,
                chapter.chapterName,
              ) ||
              !WhiteListInputContentList.isCorrectLanguage(
                inputObject.chapter.language,
                chapter.chapterContent,
              )
            ) {
              throw new Error(
                ERROR_CODE_MISMITCH_LANGUAGE,
                'Language mismatch',
              );
            }

            if (chapter.author.cif !== inputObject.chapter.author.cif) {
              // throw no authorize
              throw new Error(
                ERROR_CODE_NO_AUTHORIZE,
                'no authorize to edit this chapter',
              );
            }
            await transaction.update(chapterDocument, {
              chapterName: chapter.chapterName,
              content: chapter.chapterContent,
              lastUpdateDate: FieldValue.serverTimestamp(),
            });
            resolve(chapter);
          })
          .catch(err => {
            reject(
              new Error(ERROR_CODE_PROCESS_ERROR, 'Error on update fiction'),
            );
          });
      });
    });
  }

  public static getUserRateChapter(
    chapter: Chapter,
    currentUserCif: string,
  ): Promise<number> {
    return new Promise(async (resolve, reject) => {
      if (!chapter || !currentUserCif) {
        // reject some error
        reject(new Error(ERROR_CODE_PROCESS_ERROR, 'Invalid input'));
        return null;
      }
      const rateFictionDocId =
        chapter.language.toUpperCase() + '_' + chapter.fictionId;
      const rateChapterDocId =
        chapter.chapterNumberInFiction + '_' + chapter.author.cif;
      const db = getFirebase();

      const userRateDocumentRef = db
        .collection('users')
        .doc(currentUserCif)
        .collection('rateFictions')
        .doc(rateFictionDocId)
        .collection('chapters')
        .doc(rateChapterDocId);
      userRateDocumentRef
        .get()
        .then(resultDocument => {
          if (!resultDocument.exists) {
            resolve(0);
            return;
          } else {
            resolve(resultDocument.data().rate);
            return;
          }
        })
        .catch(err => {
          resolve(null);
        });
    });
  }

  public static publishChapter(
    chapterId: string,
    user: User,
  ): Promise<Chapter> {
    const MAX_LENGTH_FIRST_LAST_LIST: number = 5;
    return new Promise(async (resolve, reject) => {
      if (!chapterId || !user) {
        // reject some error
        reject(new Error(ERROR_CODE_PROCESS_ERROR, 'Invalid input'));
        return null;
      }
      const db = getFirebase();
      const chapterDocumentRef = db.collection('chapters').doc(chapterId);
      const userDocumentRef = db.collection('users').doc(user.cif);
      let fictionDocumentRef, chapterListDocumentRef;

      db.runTransaction(async transaction => {
        return await transaction
          .get(chapterDocumentRef)
          .then(returnChapterDocument => {
            if (!returnChapterDocument.exists) {
              throw new Error(
                ERROR_CODE_CHAPTER_NOT_EXIST,
                'chapter not found',
              );
            }
            const chapterDocument = returnFireStoreToChapter(
              returnChapterDocument,
            );
            if (chapterDocument.isPublished) {
              throw new Error(
                ERROR_CODE_CHAPTER_ALREADY_PUBLISH,
                'chapter already published',
              );
            }

            // only author can publish
            if (user.cif !== chapterDocument.author.cif) {
              reject(new Error(ERROR_CODE_NO_AUTHORIZE, 'no authorize'));
            }
            return { chapter: chapterDocument };
          })
          .then(async inputObject => {
            let returnFictionDocument = null;
            const fictionDocumentRefConst = db
              .collection('fictions')
              .doc(inputObject.chapter.fictionId);
            fictionDocumentRef = fictionDocumentRefConst;
            await transaction
              .get(fictionDocumentRefConst)
              .then(fictionDocument => {
                if (!fictionDocument.exists) {
                  throw new Error(
                    ERROR_CODE_CHAPTER_NOT_EXIST,
                    'fiction not found',
                  );
                }
                returnFictionDocument = returnFireStoreToFiction(
                  fictionDocument,
                );
              });
            return Object.assign(inputObject, {
              fiction: returnFictionDocument,
            });
          })
          .then(async inputObject => {
            let returnChapterListDocument = null;
            const chapterListDocumentRefConst = db
              .collection('fictions')
              .doc(inputObject.chapter.fictionId)
              .collection('chapterList')
              .doc(
                inputObject.chapter.author.cif +
                  '-' +
                  inputObject.chapter.language.toUpperCase(),
              );
            chapterListDocumentRef = chapterListDocumentRefConst;
            await transaction
              .get(chapterListDocumentRefConst)
              .then(chapterListDocument => {
                if (!chapterListDocument.exists) {
                  returnChapterListDocument = [];
                } else {
                  returnChapterListDocument = returnFireStoreToChapterList(
                    chapterListDocument,
                  );
                }
              });
            return Object.assign(inputObject, {
              chapterList: returnChapterListDocument,
            });
          })
          .then(async inputObject => {
            let returnUserDocument = null;
            await transaction.get(userDocumentRef).then(userDocument => {
              if (!userDocument.exists) {
                returnUserDocument = null;
              } else {
                returnUserDocument = userDocument.data();
              }
            });
            return Object.assign(inputObject, {
              user: returnUserDocument,
            });
          })

          .then(async inputObject => {
            const chapter = inputObject.chapter;
            let fictionPriceModel, fictionPriceCoin;
            let updateFictionObject = false;
            if (
              inputObject.fiction.pricingModel.get(chapter.author.cif) &&
              inputObject.fiction.pricingModel
                .get(chapter.author.cif)
                .get(chapter.language.toUpperCase())
            ) {
              fictionPriceModel = inputObject.fiction.pricingModel
                .get(chapter.author.cif)
                .get(chapter.language.toUpperCase()).model;
              fictionPriceCoin = inputObject.fiction.pricingModel
                .get(chapter.author.cif)
                .get(chapter.language.toUpperCase()).coin;
            } else {
              fictionPriceModel = PricingModel.FA;
              fictionPriceCoin = 0;
              updateFictionObject = true;
              const newPriceModel = new Map<
                string,
                { model: string; coin: number }
              >();
              newPriceModel.set(chapter.language.toUpperCase(), {
                model: PricingModel.FA,
                coin: 0,
              });
              inputObject.fiction.pricingModel.set(
                chapter.author.cif,
                newPriceModel,
              );
            }

            const returnChapterListDocument = inputObject.chapterList;
            const chapterFirst5: any =
              returnChapterListDocument.length > LIMIT_POSITION_PRICE_MODEL
                ? returnChapterListDocument[LIMIT_POSITION_PRICE_MODEL - 1]
                : {};
            const chapterLast5: any =
              returnChapterListDocument.length > LIMIT_POSITION_PRICE_MODEL
                ? returnChapterListDocument[
                    returnChapterListDocument.length -
                      LIMIT_POSITION_PRICE_MODEL
                  ]
                : {};
            // add chapter to chapter list
            returnChapterListDocument.push(
              new ShortChapter({
                chapterId: chapter.chapterId,
                chapterNumberInFiction: chapter.chapterNumberInFiction,
                language: chapter.language,
                chapterName: chapter.chapterName,
                isFreeChapter: chapter.isFreeChapter,
                displayChapterNumber: chapter.displayChapterNumber,
              }),
            );
            // convert chapter list to plain object before put in firestore
            const updateChapterList = [];
            returnChapterListDocument.map((chapterItem, chapterKey) => {
              updateChapterList.push(Object.assign({}, chapterItem));
            });
            let recentUpdateTransction = await transaction.set(
              chapterListDocumentRef,
              { list: updateChapterList },
            );
            // update count chapter in fiction // for original fiction only
            const updateFictionDetail: any = {};
            if (updateFictionObject) {
              updateFictionDetail.pricingModel = {};
              inputObject.fiction.pricingModel.forEach((languageMap, key) => {
                updateFictionDetail.pricingModel[key] = {};
                languageMap.forEach((languageValue, languageKey) => {
                  updateFictionDetail.pricingModel[key][
                    languageKey
                  ] = languageValue;
                });
              });
            }
            if (
              chapter.language.toUpperCase() ===
              inputObject.fiction.originalFictionLanguage.toUpperCase()
            ) {
              // update chapter count for original language only
              if (!chapter.isFreeChapter) {
                updateFictionDetail.numberOfChapter =
                  inputObject.fiction.numberOfChapter + 1;
              }

              updateFictionDetail.status = FICTION_STATUS.PUBLISH;
              updateFictionDetail.updatedDate = FieldValue.serverTimestamp();
              updateFictionDetail.isPublished = true;
              //
            } else {
              // if translated chapter published => update translator and available language list

              if (
                Array.isArray(inputObject.fiction.translaters) &&
                inputObject.fiction.translaters.indexOf(chapter.author.cif) < 0
              ) {
                updateFictionDetail.translaters =
                  inputObject.fiction.translaters;
                updateFictionDetail.translaters.push(chapter.author.cif);
              } else {
                updateFictionDetail.translaters = [chapter.author.cif];
              }
              if (
                Array.isArray(inputObject.fiction.availableInLanguage) &&
                inputObject.fiction.availableInLanguage.indexOf(
                  chapter.language.toUpperCase(),
                ) < 0
              ) {
                updateFictionDetail.availableInLanguage =
                  inputObject.fiction.availableInLanguage;
                updateFictionDetail.availableInLanguage.push(
                  chapter.language.toUpperCase(),
                );
              }
            }

            recentUpdateTransction = await recentUpdateTransction.update(
              fictionDocumentRef,
              updateFictionDetail,
            );

            // set price base on pricing model
            const updateChapterDetail: any = {};
            let impactChapter = null;
            updateChapterDetail.coin = 0;
            if (
              fictionPriceModel !== PricingModel.FA &&
              !chapter.isFreeChapter
            ) {
              if (fictionPriceModel === PricingModel.L5) {
                if (
                  chapterLast5.displayChapterNumber <
                  chapter.displayChapterNumber
                ) {
                  impactChapter = chapterLast5.chapterId;
                  updateChapterDetail.coin = fictionPriceCoin;
                }
              }
              if (fictionPriceModel === PricingModel.F5) {
                if (
                  chapterFirst5.displayChapterNumber >
                  chapter.displayChapterNumber
                ) {
                  impactChapter = chapterFirst5.chapterId;
                  updateChapterDetail.coin = fictionPriceCoin;
                }
              } else {
                // paid all
                updateChapterDetail.coin = fictionPriceCoin;
              }
            }
            // save current update chapter
            const newPublishFiction = inputObject.fiction.isPublished
              ? false
              : true;
            Object.assign(updateChapterDetail, {
              status: FICTION_STATUS.PUBLISH,
              isPublished: true,
              lastUpdateDate: FieldValue.serverTimestamp(),
              fictionDisplayName: inputObject.fiction.getFictionName(
                chapter.language,
              ),
            });
            if (
              inputObject.fiction.cover &&
              inputObject.fiction.cover !== null &&
              inputObject.fiction.cover !== ''
            ) {
              Object.assign(updateChapterDetail, {
                displayCover: inputObject.fiction.cover,
              });
            } else {
              Object.assign(updateChapterDetail, {
                displayCover: null,
              });
            }
            recentUpdateTransction = await recentUpdateTransction.update(
              chapterDocumentRef,
              updateChapterDetail,
            );
            const updateUserObject: any = {
              publishedChapterCount:
                inputObject &&
                inputObject.user &&
                inputObject.user.publishedChapterCount
                  ? inputObject.user.publishedChapterCount + 1
                  : 1,
            };
            if (newPublishFiction) {
              if (inputObject.user && inputObject.user.publishedFictionCount) {
                updateUserObject.publishedFictionCount =
                  inputObject.user.publishedFictionCount + 1;
              } else {
                updateUserObject.publishedFictionCount = 1;
              }
            }

            recentUpdateTransction = await recentUpdateTransction.update(
              userDocumentRef,
              updateUserObject,
            );
            // save price impacted chapter
            if (impactChapter) {
              const ImpactChapterDocumentRef = db
                .collection('chapters')
                .doc(impactChapter);
              await recentUpdateTransction.update(ImpactChapterDocumentRef, {
                coin: 0,
              });
            }
            resolve(chapter);
          })
          .catch(err => {
            reject(
              new Error(ERROR_CODE_PROCESS_ERROR, 'Error on publish chapter'),
            );
          });
      });
    });
  }

  public static stamperyToken(
    chapterId: string,
    tokenId: string,
  ): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      if (!chapterId || !tokenId) {
        // reject some error
        reject(
          new Error(
            ERROR_CODE_DATABASE_PRE_EXECUTE_TRANSACTION,
            'Invalid input',
          ),
        );
        return;
      }
      const db = getFirebase();
      const chapterDocumentRef = db.collection('chapters').doc(chapterId);
      await chapterDocumentRef.update({
        stamperyId: tokenId,
        ethereumBlockAddress: null,
        bitcoinBlockAddress: null,
        ethereumClassicBlockAddress: null,
      });
      resolve(true);
    });
  }

  public static startTranslateChapter(
    originalChapterId: string,
    chapter: Chapter,
  ): Promise<Chapter> {
    return new Promise(async (resolve, reject) => {
      if (!chapter || !originalChapterId) {
        // reject some error
        reject(new Error(ERROR_CODE_PROCESS_ERROR, 'Invalid input'));
        return;
      }
      const db = getFirebase();
      const originalChapterDocumentRef = db
        .collection('chapters')
        .doc(originalChapterId);
      const chapterDocumentRef = db.collection('chapters').doc();

      // get Fiction document
      db.runTransaction(async transaction => {
        await transaction
          .get(originalChapterDocumentRef)
          .then(returnChapterDocument => {
            if (returnChapterDocument === null) {
              throw new Error(
                ERROR_CODE_PROCESS_ERROR,
                'cannot find source chapter',
              );
            }

            return { chapter: returnFireStoreToChapter(returnChapterDocument) };
          })
          .then(async inputObject => {
            let returnFictionDocument = null;
            const fictionDocumentRef = db
              .collection('fictions')
              .doc(inputObject.chapter.fictionId);
            await transaction.get(fictionDocumentRef).then(fictionDocument => {
              if (!fictionDocument.exists) {
                throw new Error(
                  ERROR_CODE_CHAPTER_NOT_EXIST,
                  'fiction not found',
                );
              }
              returnFictionDocument = returnFireStoreToFiction(fictionDocument);
            });
            return Object.assign(inputObject, {
              fiction: returnFictionDocument,
            });
          })
          .then(async inputObject => {
            if (inputObject.chapter.language === chapter.language) {
              throw new Error(
                ERROR_CODE_PROCESS_ERROR,
                'cannot translate to same as original language',
              );
            }
            // create chapter content
            inputObject.chapter.originalAuthorCif =
              inputObject.fiction.author.cif;
            inputObject.chapter.originalChapterId =
              inputObject.chapter.originalChapterId &&
              inputObject.chapter.originalChapterId !== ''
                ? inputObject.chapter.originalChapterId
                : inputObject.chapter.chapterId;
            inputObject.chapter.chapterName = chapter.chapterName;
            inputObject.chapter.chapterContent = chapter.chapterContent;
            inputObject.chapter.author = chapter.author;
            inputObject.chapter.language = chapter.language;
            inputObject.chapter.originalLanguage = inputObject.fiction.language;
            inputObject.chapter.fictionDisplayName = inputObject.fiction.getFictionName(
              inputObject.chapter.language,
            );
            inputObject.chapter.displayCover = inputObject.fiction.cover;
            inputObject.chapter.status = FICTION_STATUS.DRAFT;
            const writeObject = transformChapterToFirestoreObject(
              db,
              inputObject.chapter,
              true,
            );
            // set translate data

            await transaction.create(chapterDocumentRef, writeObject);

            inputObject.chapter.chapterId = chapterDocumentRef.id;
            resolve(inputObject.chapter);
          })
          .catch(err => {
            reject(
              new Error(ERROR_CODE_PROCESS_ERROR, 'Error on update fiction'),
            );
          });
      });
    });
  }

  public static rateChapter(
    chapterId: string,
    inputUserCif: string,
    rate: number,
  ): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      if (!chapterId || !inputUserCif || rate < 1 || rate > MAX_RATING) {
        // reject some error
        reject(new Error(ERROR_CODE_PROCESS_ERROR, 'Invalid input'));
        return;
      }
      // TODO Draft - Test
      const db = getFirebase();
      db.runTransaction(async transaction => {
        const currentUserRateRef = db
          .collection('users')
          .doc(inputUserCif)
          .collection('rateChapters')
          .doc(chapterId);
        const currentChapterRef = db.collection('chapters').doc(chapterId);

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
            let currentChapter;
            await transaction
              .get(currentChapterRef)
              .then(async currentChapterDocument => {
                if (currentChapterDocument.exists) {
                  currentChapter = returnFireStoreToChapter(
                    currentChapterDocument,
                  );
                }
              });
            return Object.assign(inputObject, { chapter: currentChapter });
          })
          .then(async inputObject => {
            const currentChapter = inputObject.chapter;
            if (!currentChapter.ratingDetail) {
              currentChapter.ratingDetail = new Array();
              for (let i = 1; i <= MAX_RATING; i++) {
                currentChapter.ratingDetail.push({ rate: i, count: 0 });
              }
            }
            const fireStoreUpdateTransaction = await transaction.set(
              currentUserRateRef,
              {
                score: rate,
              },
            );
            const previousScore = inputObject.score.exist
              ? inputObject.score.score
              : -1;

            // score are different update score on user and fiction
            for (let i = 0; i < currentChapter.ratingDetail.length; i++) {
              if (currentChapter.ratingDetail[i].rate === rate) {
                currentChapter.ratingDetail[i].count++;
              }
              if (currentChapter.ratingDetail[i].rate === previousScore) {
                currentChapter.ratingDetail[i].count--;
              }
            }
            const newScore = currentChapter.calculateNewRate();
            await fireStoreUpdateTransaction.update(currentChapterRef, {
              rating: newScore,
              ratingDetail: currentChapter.ratingDetail,
            });
            resolve(true);
          });
      });
    });
  }

  public static getCommentChapter(
    chapterId: string,
    setOfComment: number,
  ): Promise<Array<Comment>> {
    return new Promise(async (resolve, reject) => {
      try {
        if (!chapterId && setOfComment < 1) {
          // reject some error
          reject(new Error(ERROR_CODE_PROCESS_ERROR, 'Invalid input'));
          return;
        }

        const db = getFirebase();
        const currentCommentRef = db
          .collection('chapterComments')
          .doc(chapterId)
          .collection('commentList')
          .orderBy('set', 'desc')
          .limit(1);
        let lastSet: number = 0;
        let returnCommentList: Array<Comment> = [];
        await currentCommentRef.get().then(async currentCommentListDocument => {
          if (!currentCommentListDocument.empty) {
            currentCommentListDocument.forEach(async returnDocument => {
              lastSet = returnDocument.data().set;
              if (returnDocument.data().commentList instanceof Array) {
                returnDocument
                  .data()
                  .commentList.forEach(async returnDocument => {
                    returnCommentList.push(
                      returnFireStoreComment(returnDocument),
                    );
                  });
                returnCommentList.map(commentItem => {
                  commentItem.commentDate = new Timestamp(
                    returnDocument.data()[
                      'comment' + commentItem.runningNumber
                    ].seconds,
                    returnDocument.data()[
                      'comment' + commentItem.runningNumber
                    ].nanoseconds,
                  ).toDate();
                });
              }
            });
          }
        });
        returnCommentList.sort(sortCommentFunction);
        if (setOfComment > 1) {
          const ignoreSizeFromFirstSet = returnCommentList.length;
          returnCommentList = [];
          const targetCommentRef = db
            .collection('chapterComments')
            .doc(chapterId)
            .collection('commentList')
            .where('set', '==', lastSet - setOfComment + 1);

          await targetCommentRef
            .get()
            .then(async currentCommentListDocument => {
              if (!currentCommentListDocument.empty) {
                currentCommentListDocument.forEach(async returnDocument => {
                  lastSet = returnDocument.data().set;
                  if (returnDocument.data().commentList instanceof Array) {
                    returnDocument
                      .data()
                      .commentList.forEach(async returnDocument => {
                        returnCommentList.push(
                          returnFireStoreComment(returnDocument),
                        );
                      });
                    returnCommentList.map(commentItem => {
                      commentItem.commentDate = new Timestamp(
                        returnDocument.data()[
                          'comment' + commentItem.runningNumber
                        ].seconds,
                        returnDocument.data()[
                          'comment' + commentItem.runningNumber
                        ].nanoseconds,
                      ).toDate();
                    });
                  }
                });
                // returnCommentList.sort(sortCommentFunction);
              }
              returnCommentList.sort(sortCommentFunction);
              returnCommentList.splice(
                0,
                Config.MAXIMUM_COMMENT_PER_PAGE - ignoreSizeFromFirstSet,
              );
            });
        }

        if (
          returnCommentList.length < Config.MAXIMUM_COMMENT_PER_PAGE &&
          lastSet > 1
        ) {
          const additionCommentList = [];
          const additionalCommentRef = db
            .collection('chapterComments')
            .doc(chapterId)
            .collection('commentList')
            .where('set', '==', lastSet - setOfComment);
          await additionalCommentRef
            .get()
            .then(async currentCommentListDocument => {
              if (!currentCommentListDocument.empty) {
                currentCommentListDocument.forEach(async returnDocument => {
                  lastSet = returnDocument.data().set;
                  if (returnDocument.data().commentList instanceof Array) {
                    returnDocument
                      .data()
                      .commentList.forEach(async returnDocument => {
                        additionCommentList.push(
                          returnFireStoreComment(returnDocument),
                        );
                      });
                    additionCommentList.map(commentItem => {
                      commentItem.commentDate = new Timestamp(
                        returnDocument.data()[
                          'comment' + commentItem.runningNumber
                        ].seconds,
                        returnDocument.data()[
                          'comment' + commentItem.runningNumber
                        ].nanoseconds,
                      ).toDate();
                    });
                  }
                });
              }
              additionCommentList.sort(sortCommentFunction);
            });
          // fill up
          const fillUpCount = returnCommentList.length;
          for (
            let i = 0;
            i < Config.MAXIMUM_COMMENT_PER_PAGE - fillUpCount;
            i++
          ) {
            if (i >= additionCommentList.length) {
              break;
            } else {
              returnCommentList.push(additionCommentList[i]);
            }
          }
        }

        resolve(returnCommentList);
      } catch (err) {
        resolve([]);
      }
    });
  }

  public static postCommentChapter(
    chapterId: string,
    postUser: User,
    comment: string,
  ): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      if (!chapterId || !postUser || !comment) {
        // reject some error
        reject(new Error(ERROR_CODE_PROCESS_ERROR, 'Invalid input'));
        return;
      }
      let lastCommentDocument;
      const db = getFirebase();
      db.runTransaction(async transaction => {
        const currentCommentRef = db
          .collection('chapterComments')
          .doc(chapterId)
          .collection('commentList')
          .orderBy('set', 'desc')
          .limit(1);
        return await transaction
          .get(currentCommentRef)
          .then(async currentCommentListDocument => {
            let lastSet: number = 0;
            const currentCommentList: Array<Comment> = [];
            if (!currentCommentListDocument.empty) {
              currentCommentListDocument.forEach(async returnDocument => {
                lastCommentDocument = returnDocument.id;
                lastSet = returnDocument.data().set;
                if (returnDocument.data().commentList instanceof Array) {
                  returnDocument
                    .data()
                    .commentList.forEach(async returnDocument => {
                      currentCommentList.push(
                        returnFireStoreComment(returnDocument),
                      );
                    });
                }
              });
            }
            return { current: { set: lastSet, list: currentCommentList } };
          })
          .then(async inputObject => {
            const currentComment = new Comment();
            currentComment.comment = comment;
            currentComment.userCif = postUser.cif;
            currentComment.userDisplayName = postUser.displayName;
            let maxRunningNumber = 0;
            inputObject.current.list.map(commentItem => {
              if (commentItem.runningNumber > maxRunningNumber) {
                maxRunningNumber = commentItem.runningNumber;
              }
            });
            currentComment.runningNumber = maxRunningNumber + 1;
            const addToFireStoreComment = transformCommentToFirestoreObject(
              currentComment,
            );
            if (
              inputObject.current.list.length >=
                Config.MAXIMUM_COMMENT_PER_PAGE ||
              inputObject.current.list.length === 0
            ) {
              //reach threshold per set , create new set
              const newCommentRef = db
                .collection('chapterComments')
                .doc(chapterId)
                .collection('commentList')
                .doc();
              const createNewCommentListSet: any = {
                set: inputObject.current.set + 1,
                commentList: [addToFireStoreComment],
              };
              createNewCommentListSet[
                'comment' + currentComment.runningNumber
              ] = FieldValue.serverTimestamp();
              const fireStoreUpdateTransaction = await transaction.create(
                newCommentRef,
                createNewCommentListSet,
              );
            } else {
              // apppend to current set
              const newCommentList = [];
              inputObject.current.list.map(previousComment => {
                newCommentList.push(Object.assign({}, previousComment));
              });
              newCommentList.push(addToFireStoreComment);
              const updateCommentListSet: any = {
                commentList: newCommentList,
              };
              updateCommentListSet[
                'comment' + currentComment.runningNumber
              ] = FieldValue.serverTimestamp();
              const lastCommentDocumentRef = db
                .collection('chapterComments')
                .doc(chapterId)
                .collection('commentList')
                .doc(lastCommentDocument);
              const chapterDocumentRef = db
                .collection('chapters')
                .doc(chapterId);
              const updateCommentTransaction = await transaction.update(
                lastCommentDocumentRef,
                updateCommentListSet,
              );
              await updateCommentTransaction.update(chapterDocumentRef, {
                numberOfComment: currentComment.runningNumber,
              });
            }
            resolve(true);
          })
          .catch(err => {
            resolve(false);
          });
      });
    });
  }

  public static checkCoverImage(imageName: string): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      const db = getFirebase();
      resolve(true);
      const chapterCollections = db
        .collection('chapters')
        .where('displayCover', '==', imageName)
        .limit(1);
      await chapterCollections
        .get()
        .then(async returnItem => {
          if (returnItem.empty) {
            resolve(false);
            return;
          } else {
            resolve(true);
            return;
          }
        })
        .catch(err => {
          // if found some error - do not delete image for safety
          resolve(true);
        });
    });
  }
}

export const returnFireStoreToChapter = (input: any): Chapter => {
  const returnChapter: Chapter = new Chapter({
    fictionId: input.data().fiction.id,
    chapterId: input.id,
    chapterNumberInFiction: input.data().chapterNumberInFiction,
    displayChapterNumber: input.data().displayChapterNumber,
    language: input.data().language,
    author: new User({
      cif: input.data().author.cif.id,
      displayName: input.data().author.name,
    }),
    originalChapterId:
      input.data().originalChapter && input.data().originalChapter.id
        ? input.data().originalChapter.id
        : null,
    originalLanguage: input.data().originalLanguage,
    originalAuthorCif: input.data().originalAuthor,
    rate: input.data().rating,
    chapterName: input.data().chapterName,
    status: input.data().status,
    isPublished: input.data().isPublished,
    isFreeChapter: input.data().isFreeChapter,
    lastUpdate: new Timestamp(
      input.data().lastUpdateDate.seconds,
      input.data().lastUpdateDate.nanoseconds,
    ).toDate(),
    createDate: new Timestamp(
      input.data().createDate.seconds,
      input.data().createDate.nanoseconds,
    ).toDate(),
    coin: input.data().coin,
    monthCount: input.data().monthlyCount,
    totalCount: input.data().totalCount,
    purchaseCount: input.data().purchaseCount,
    purchased: false,
    chapterContent: input.data().content,
    ethereumBlockAddress: input.data().ethereumBlockAddress,
    bitcoinBlockAddress: input.data().bitcoinBlockAddress,
    ethereumClassicBlockAddress: input.data().ethereumClassicBlockAddress,
    fictionDisplayName: input.data().fictionDisplayName,
    displayCover: input.data().displayCover,
    numberOfComment: input.data().numberOfComment
      ? input.data().numberOfComment
      : 0,
  });
  if (input.data().ratingDetail) {
    returnChapter.ratingDetail = new Array<{ rate: number; count: number }>();
    for (let i = 0; i < input.data().ratingDetail.length; i++) {
      returnChapter.ratingDetail.push({
        rate: input.data().ratingDetail[i].rate,
        count: input.data().ratingDetail[i].count,
      });
    }
  }
  return returnChapter;
};

export const transformChapterToFirestoreObject = (
  db,
  input: Chapter,
  isNewChapter: boolean,
): any => {
  const returnObject: any = {};
  if (isNewChapter) {
    // which is allow to change for first time only
    const authorRef = db.collection('users').doc(input.author.cif);
    returnObject.author = {
      cif: authorRef,
      name: input.author.displayName,
    };
    setInitialValueChapter(returnObject);
    returnObject.chapterNumberInFiction = Number(input.chapterNumberInFiction);
    returnObject.displayChapterNumber = Number(input.displayChapterNumber);
    returnObject.isFreeChapter =
      input.displayChapterNumber === 0 ? true : false;
    returnObject.language = input.language.toUpperCase();
  }

  returnObject.content = input.chapterContent;
  returnObject.chapterName = input.chapterName;
  returnObject.lastUpdateDate = FieldValue.serverTimestamp();
  returnObject.fictionDisplayName = input.fictionDisplayName;
  returnObject.displayCover = input.displayCover;
  returnObject.coin = Number(input.coin);
  returnObject.fiction = db.collection('fictions').doc(input.fictionId);
  if (input.originalChapterId) {
    returnObject.originalChapter = db
      .collection('chapters')
      .doc(input.originalChapterId);
  }
  if (input.originalLanguage) {
    returnObject.originalLanguage = input.originalLanguage;
  }
  if (input.originalAuthorCif) {
    returnObject.originalAuthorCif = input.originalAuthorCif;
  }

  return returnObject;
};

export const returnFireStoreToChapterList = (input: any): ShortChapter[] => {
  const returnShortChapterList: ShortChapter[] = new Array();
  if (input.data().list) {
    input.data().list.map(shortChapterItem => {
      returnShortChapterList.push(
        new ShortChapter({
          chapterId: String(shortChapterItem.chapterId),
          chapterNumberInFiction: parseInt(
            shortChapterItem.chapterNumberInFiction,
          ),
          displayChapterNumber: parseInt(shortChapterItem.displayChapterNumber),
          chapterName: String(shortChapterItem.chapterName),
          isFreeChapter: shortChapterItem.isFreeChapter,
          language: String(shortChapterItem.language),
        }),
      );
    });
  }
  return returnShortChapterList;
};

const setInitialValueChapter = input => {
  input.createDate = FieldValue.serverTimestamp();
  input.lastUpdateDate = FieldValue.serverTimestamp();
  input.status = FICTION_STATUS.DRAFT;
  input.purchaseCount = 0;
  input.totalRateUser = 0;
  input.monthlyCount = 0;
  input.totalCount = 0;
  input.coin = 0;
  input.rating = 0;
  input.isPublished = false;
  input.ratingDetail = [];
  input.fictionDisplayName = '';
  input.displayCover = '';
  input.stamperyId = null;
  for (let i = 1; i <= MAX_RATING; i++) {
    input.ratingDetail.push({ rate: i, count: 0 });
  }
};

const nullOrZero = (object): number => {
  return !object || isNaN(object) ? 0 : object;
};

const sortChapterFunction = (a, b) => {
  if (a.chapterNumberInFiction > b.chapterNumberInFiction) {
    return -1;
  }
  if (a.chapterNumberInFiction < b.chapterNumberInFiction) {
    return 1;
  }
  return 0;
};

/* 
For future use if split view count to shard

const getTotalCountFromShard = async input => {
  let totalCount = 0;
  return await input
    .get()
    .then(snapshot => {
      if (!snapshot.empty) {
        snapshot.forEach(doc => {
          totalCount += doc.data().count;
        });
      }

      return totalCount;
    })
    .catch(err => {
      return 0;
    });
};

const updateTotalCountFromShard = async (db, input) => {
  const shard_id = Math.floor(
    Math.random() * NUMBER_OF_TOTAL_COUNT_SHARD,
  ).toString();
  const shard_ref = input.doc(shard_id);
  // Update count in a transaction
  return await db.runTransaction(t => {
    return t.get(shard_ref).then(doc => {
      if (doc.exists) {
        const new_count = doc.data().count + 1;
        t.update(shard_ref, { count: new_count });
      } else {
        t.create(shard_ref, { count: 1 });
      }
    });
  });
}; */

export const sortChapterListByLastUpdateFunction = (a, b) => {
  // max to min
  if (a.lastUpdate > b.lastUpdate) {
    return -1;
  }
  if (a.lastUpdate < b.lastUpdate) {
    return 1;
  }
  return 0;
};

export const sortChapterListByRateFunction = (a, b) => {
  // max to min
  if (a.rate > b.rate) {
    return -1;
  }
  if (a.rate < b.rate) {
    return 1;
  }
  return 0;
};
