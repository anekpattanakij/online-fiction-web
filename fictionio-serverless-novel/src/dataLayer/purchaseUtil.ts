import { chapter } from './../index';
import { getFirebase } from './fireBaseUtil';
import { FieldValue } from '@google-cloud/firestore';
import { Chapter } from '../common/chapter';
import {
  Error,
  ERROR_CODE_PROCESS_ERROR,
  ERROR_CODE_NOT_ENOUGHT_COIN,
  ERROR_CODE_FICTION_NOT_EXIST,
  ERROR_CODE_CHAPTER_NOT_EXIST,
  ERROR_CODE__CHAPTER_ALREADY_PURCHASE,
} from '../common/error';
import { Fiction } from '../common/fiction';
import { nullOrZero } from '../util/dataConversionUtil';
import INCOME_RATE from '../config/incomeRate';
import { returnFireStoreToFiction } from './fictionUtil';
import { returnFireStoreToChapter } from './chapterUtil';

const RETURN_FROM_CREATE_FICTION_STORE: number = 3;

export class PurchaseUtil {
  public static purchaseChapter(
    purchaseUserCif: string,
    chapterId: string,
  ): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      if (!purchaseUserCif || !chapterId) {
        // reject some error
        reject(new Error(ERROR_CODE_PROCESS_ERROR, 'Invalid input'));
        return;
      }
      const db = getFirebase();
      const userDocumentRef = db.collection('users').doc(purchaseUserCif);
      const chapterDocumentRef = db.collection('chapters').doc(chapterId);
      let authorDocumentRef, translatorDocumentRef;
      db.runTransaction(async transaction => {
        return transaction
          .get(userDocumentRef)
          .then(userDocument => {
            if (!userDocument.exists) {
              reject(new Error(ERROR_CODE_PROCESS_ERROR, 'Invalid input'));
            }
            if (
              !userDocument.data().coin ||
              (userDocument.data().coin === 0 &&
                userDocument.data().withDrawableCoin === 0)
            ) {
              reject(new Error(ERROR_CODE_NOT_ENOUGHT_COIN, 'Not enough coin'));
            }
            return { user: userDocument };
          })
          .then(async inputObject => {
            let chapterDocument;
            await transaction
              .get(chapterDocumentRef)
              .then(returnChapterDocument => {
                if (!returnChapterDocument.exists) {
                  throw new Error(
                    ERROR_CODE_CHAPTER_NOT_EXIST,
                    'chapter not found',
                  );
                }
                chapterDocument = returnFireStoreToChapter(
                  returnChapterDocument,
                );
                if (!chapterDocument.isPublished) {
                  throw new Error(
                    ERROR_CODE_CHAPTER_NOT_EXIST,
                    'chapter not found',
                  );
                }
                if (
                  inputObject.user.data().coin +
                    inputObject.user.data().withDrawableCoin <
                  chapterDocument.coin
                ) {
                  reject(
                    new Error(ERROR_CODE_NOT_ENOUGHT_COIN, 'Not enought coin'),
                  );
                }
              });
            return Object.assign(inputObject, {
              chapter: chapterDocument,
            });
          })
          .then(async inputObject => {
            const fictionDocumentRef = db
              .collection('fictions')
              .doc(inputObject.chapter.fictionId);
            let returnFictionDocument;
            await transaction
              .get(fictionDocumentRef)
              .then(async fictionDocument => {
                if (!fictionDocument.exists) {
                  reject(
                    new Error(
                      ERROR_CODE_FICTION_NOT_EXIST,
                      'Fiction does not exist',
                    ),
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
            const purchasedChapterDocumentRef = db
              .collection('users')
              .doc(purchaseUserCif)
              .collection('purchaseHistory')
              .doc(inputObject.chapter.chapterId);
            await transaction
              .get(purchasedChapterDocumentRef)
              .then(returnPurchasedChapterDocument => {
                if (returnPurchasedChapterDocument.exists) {
                  throw new Error(
                    ERROR_CODE__CHAPTER_ALREADY_PURCHASE,
                    'already purchased',
                  );
                }
              });
            return Object.assign(inputObject);
          })
          .then(async inputObject => {
            const purchasedListDocumentRef = db
              .collection('users')
              .doc(purchaseUserCif)
              .collection('purchasedList')
              .doc(inputObject.chapter.fictionId);
            const returnPurchaseList = new Array();
            await transaction
              .get(purchasedListDocumentRef)
              .then(returnPurchasedListDocument => {
                if (returnPurchasedListDocument.exists) {
                  // add to list
                  returnPurchaseList.concat(
                    returnPurchasedListDocument.data().list,
                  );
                }
              });
            return Object.assign(inputObject, {
              purchasedList: returnPurchaseList,
            });
          })
          .then(async inputObject => {
            const authorDocumentRefConst = db
              .collection('users')
              .doc(inputObject.fiction.author.cif);
            authorDocumentRef = authorDocumentRefConst;

            let authorDocument = null;
            authorDocument = await transaction
              .get(authorDocumentRefConst)
              .then(async authorUserDocument => {
                if (!authorUserDocument.exists) {
                  throw new Error(
                    ERROR_CODE_CHAPTER_NOT_EXIST,
                    'User does not exist',
                  );
                  return;
                }
                return authorUserDocument;
              });

            let translatorDocument = null;
            if (
              inputObject.fiction.originalFictionLanguage.toUpperCase() !==
              inputObject.chapter.language.toUpperCase()
            ) {
              // If different person get more information
              const translatorDocumentRefConst = db
                .collection('users')
                .doc(inputObject.chapter.author.cif);
              translatorDocumentRef = translatorDocumentRefConst;
              translatorDocument = await transaction
                .get(translatorDocumentRefConst)
                .then(async translatorUserDocument => {
                  if (!translatorUserDocument.exists) {
                    throw new Error(
                      ERROR_CODE_CHAPTER_NOT_EXIST,
                      'User does not exist',
                    );
                    return;
                  }
                  return translatorUserDocument;
                });
            }
            return Object.assign(inputObject, {
              authorDocument,
              translatorDocument,
            });
          })
          .then(async inputObject => {
            let nextTransaction;
            // minus coin deposit first
            let updateCoinObject;
            if (inputObject.user.data().coin < inputObject.chapter.coin) {
              const newWithdrawAbleCoin =
                inputObject.user.data().withDrawableCoin +
                inputObject.user.data().coin -
                inputObject.chapter.coin;
              updateCoinObject = {
                coin: 0,
                withDrawableCoin: newWithdrawAbleCoin,
              };
            } else {
              updateCoinObject = {
                coin: inputObject.user.data().coin - inputObject.chapter.coin,
              };
            }
            nextTransaction = await transaction.update(
              userDocumentRef,
              updateCoinObject,
            );
            if (
              inputObject.fiction.originalFictionLanguage.toUpperCase() !==
              inputObject.chapter.language.toUpperCase()
            ) {
              if (
                inputObject.fiction.author.cif !==
                inputObject.chapter.author.cif
              ) {
                //if translator and author different persone
                nextTransaction = await nextTransaction.update(
                  translatorDocumentRef,
                  {
                    totalIncomeAsAuthor:
                      nullOrZero(
                        inputObject.translatorDocument.data()
                          .totalIncomeAsAuthor,
                      ) +
                      inputObject.chapter.coin *
                        INCOME_RATE.TRANSLATE_FICTION_TO_TRANSLATOR,
                    withDrawableCoin:
                      nullOrZero(
                        inputObject.translatorDocument.data().withDrawableCoin,
                      ) +
                      inputObject.chapter.coin *
                        INCOME_RATE.TRANSLATE_FICTION_TO_TRANSLATOR,
                  },
                );
                nextTransaction = await nextTransaction.update(
                  authorDocumentRef,
                  {
                    totalIncomeFromTranslated:
                      nullOrZero(
                        inputObject.authorDocument.data()
                          .totalIncomeFromTranslated,
                      ) +
                      inputObject.chapter.coin *
                        INCOME_RATE.TRANSLATE_FICTION_TO_AUTHOR,
                    withDrawableCoin:
                      nullOrZero(
                        inputObject.authorDocument.data().withDrawableCoin,
                      ) +
                      inputObject.chapter.coin *
                        INCOME_RATE.TRANSLATE_FICTION_TO_AUTHOR,
                  },
                );
              } else {
                // if translator is the same as author
                nextTransaction = await nextTransaction.update(
                  authorDocumentRef,
                  {
                    totalIncomeFromTranslated:
                      nullOrZero(
                        inputObject.authorDocument.data()
                          .totalIncomeFromTranslated,
                      ) +
                      inputObject.chapter.coin *
                        INCOME_RATE.TRANSLATE_FICTION_TO_AUTHOR,
                    totalIncomeAsAuthor:
                      nullOrZero(
                        inputObject.authorDocument.data().totalIncomeAsAuthor,
                      ) +
                      inputObject.chapter.coin *
                        INCOME_RATE.TRANSLATE_FICTION_TO_TRANSLATOR,
                    withDrawableCoin:
                      nullOrZero(
                        inputObject.authorDocument.data().withDrawableCoin,
                      ) +
                      inputObject.chapter.coin *
                        INCOME_RATE.TRANSLATE_FICTION_TO_AUTHOR +
                      inputObject.chapter.coin *
                        INCOME_RATE.TRANSLATE_FICTION_TO_TRANSLATOR,
                  },
                );
              }
            } else {
              nextTransaction = await nextTransaction.update(
                authorDocumentRef,
                {
                  totalIncomeAsAuthor:
                    nullOrZero(
                      inputObject.authorDocument.data().totalIncomeAsAuthor,
                    ) +
                    inputObject.chapter.coin *
                      INCOME_RATE.ORIGINAL_FICTION_TO_AUTHOR,
                  withDrawableCoin:
                    nullOrZero(
                      inputObject.authorDocument.data().withDrawableCoin,
                    ) +
                    inputObject.chapter.coin *
                      INCOME_RATE.ORIGINAL_FICTION_TO_AUTHOR,
                },
              );
            }
            const userPurchaseDocument = db
              .collection('users')
              .doc(purchaseUserCif)
              .collection('purchaseHistory')
              .doc(inputObject.chapter.chapterId);
            const fictionDocumentRef = db
              .collection('fictions')
              .doc(inputObject.fiction.fictionId);
            nextTransaction = await nextTransaction.create(
              userPurchaseDocument,
              {
                chapter: chapterDocumentRef,
                chapterName: inputObject.chapter.chapterName,
                displayChapterNumber: inputObject.chapter.displayChapterNumber,
                fiction: fictionDocumentRef,
                fictionName: inputObject.fiction.getFictionName(
                  inputObject.chapter.language,
                ),
                language: inputObject.chapter.language,
                coin: inputObject.chapter.coin,
                purchaseDate: FieldValue.serverTimestamp(),
                authorCif : inputObject.chapter.author.cif,
                authorDisplayName : inputObject.chapter.author.displayName,
              },
            );
            const purchasedListDocumentRef = db
              .collection('users')
              .doc(purchaseUserCif)
              .collection('purchasedList')
              .doc(inputObject.fiction.fictionId);

            const newPurchaseList = inputObject.purchasedList;
            newPurchaseList.push(inputObject.chapter.chapterId);
            nextTransaction = await nextTransaction.set(
              purchasedListDocumentRef,
              {
                list: newPurchaseList,
              },
            );

            // update purchased count
            nextTransaction = await nextTransaction.update(chapterDocumentRef, {
              purchaseCount: (inputObject.chapter.purchaseCount || 0) + 1,
            });
            nextTransaction = await nextTransaction.update(fictionDocumentRef, {
              purchaseCount: (inputObject.fiction.purchaseCount || 0) + 1,
            });
            resolve(true);
          })
          .catch(err => {
            if (err instanceof Error) {
              reject(err);
            } else {
              resolve(false);
            }
          });
      });
    });
  }
}
