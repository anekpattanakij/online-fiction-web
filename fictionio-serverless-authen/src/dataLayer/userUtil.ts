import { Config } from './../config';
import { Firestore } from '@google-cloud/firestore';
import { FieldValue } from '@google-cloud/firestore';
import * as moment from 'moment';
import {
  Error,
  ERROR_CODE_DATABASE_CONNECTION,
  ERROR_CODE_DATABASE_EXECUTE_TRANSACTION,
  ERROR_CODE_DATABASE_PRE_EXECUTE_TRANSACTION,
  ERROR_CODE_RECAPTCHA_INCORRECT,
} from '../common/error';
import { User } from '../common/user';
import { Timestamp } from '@google-cloud/firestore';

const RETURN_FROM_CREATE_USER_STORE: number = 2;

const getFirebase = () => {
  const firestore = new Firestore({
    projectId: Config.GOOGLE_PROJECT_ID,
    keyFilename: './firebase-key.json',
  });
  const settings = { timestampsInSnapshots: true };
  firestore.settings(settings);
  return firestore;
};

export class UserUtil {
  public static saveUser(inputUser: User): Promise<User> {
    const db = getFirebase();
    return new Promise(async (resolve, reject) => {
      const inputData = Object.assign({}, inputUser, {
        registerDate: FieldValue.serverTimestamp(),
        lastLoginDate: FieldValue.serverTimestamp(),
      });
      if (inputUser.dateOfBirth) {
        inputData.dateOfBirth = new Date(inputUser.dateOfBirth);
      }
      await db
        .collection('users')
        .add(inputData)
        .then(insertId => {
          inputUser.cif = insertId.id;
          resolve(inputUser);
        })
        .catch(error => {
          reject(
            new Error(ERROR_CODE_DATABASE_CONNECTION, 'Error on save user'),
          );
        });
    });
  }

  public static getUser(
    email: string,
    resetToken: string = null,
    googleUid: string = null,
    facebookUid: string = null,
  ): Promise<User> {
    return new Promise(async (resolve, reject) => {
      const db = getFirebase();
      const usersRef = db.collection('users');
      let queryDoc = usersRef.limit(1);
      if (resetToken) {
        queryDoc = usersRef
          .where('resetPasswordToken', '==', resetToken)
          .limit(1);
      } else if (googleUid) {
        queryDoc = usersRef.where('googleUid', '==', email).limit(1);
      } else if (facebookUid) {
        queryDoc = usersRef.where('facebookUid', '==', email).limit(1);
      } else if (email) {
        queryDoc = usersRef.where('email', '==', email).limit(1);
      }
      await queryDoc
        .get()
        .then(returnItem => {
          if (returnItem.empty) {
            resolve(null);
          } else {
            let returnUser: User;

            returnItem.forEach(returnDocument => {
              returnUser = UserUtil.fireBaseToUserObject(returnDocument);
            });
            resolve(returnUser);
          }
        })
        .catch(error => {
          reject(
            new Error(ERROR_CODE_DATABASE_CONNECTION, 'Error on save user'),
          );
        });
    });
  }

  public static getUserById(userId: string = null): Promise<User> {
    return new Promise(async (resolve, reject) => {
      const db = getFirebase();
      const usersRef = db.collection('users').doc(userId);
      await usersRef
        .get()
        .then(returnItem => {
          if (!returnItem.exists) {
            resolve(null);
          } else {
            resolve(UserUtil.fireBaseToUserObject(returnItem));
          }
        })
        .catch(error => {
          reject(
            new Error(ERROR_CODE_DATABASE_CONNECTION, 'Error on save user'),
          );
        });
    });
  }

  private static fireBaseToUserObject(returnDocument: any): User {
    return new User({
      cif: returnDocument.id,
      displayName: returnDocument.data().displayName,
      firstName: returnDocument.data().firstName,
      lastName: returnDocument.data().lastName,
      sex: returnDocument.data().sex,
      email: returnDocument.data().email,
      password: returnDocument.data().password,
      usertype: returnDocument.data().usertype,
      dateOfBirth: returnDocument.data().dateOfBirth
        ? returnDocument.data().dateOfBirth.toDate()
        : null,
      refreshToken: returnDocument.data().refreshToken,
      lastLoginDate: new Timestamp(
        returnDocument.data().lastLoginDate.seconds,
        returnDocument.data().lastLoginDate.nanoseconds,
      ).toDate(),
      registerDate: new Timestamp(
        returnDocument.data().registerDate.seconds,
        returnDocument.data().registerDate.nanoseconds,
      ).toDate(),
      coin: returnDocument.data().coin,
      googleUid: returnDocument.data().googleUid,
      facebookUid: returnDocument.data().facebookUid,
      withDrawableCoin: returnDocument.data().withDrawableCoin,
      totalIncomeAsAuthor: returnDocument.data().totalIncomeAsAuthor,
      totalIncomeFromTranslated: returnDocument.data()
        .totalIncomeFromTranslated,
      publishedChapterCount: returnDocument.data().publishedChapterCount,
      publishedFictionCount: returnDocument.data().publishedFictionCount,
      preferredLanguage: returnDocument.data().preferredLanguage,
    });
  }
  public static updateSocialId(
    cif: string,
    googleId: string,
    facebookId: string,
  ): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      try {
        const db = getFirebase();
        const userRef = db.collection('users').doc(cif);
        const updateObject: any = {};
        if (facebookId) {
          updateObject.facebookUid = facebookId;
        }
        if (googleId) {
          updateObject.googleUid = googleId;
        }
        await userRef
          .update(updateObject)
          .then(() => {
            resolve(true);
          })
          .catch(() => {
            resolve(false);
          });
      } catch (err) {
        resolve(false);
      }
    });
  }

  public static saveResetToken(email: string, token: string): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      try {
        const db = getFirebase();
        const userDocument = db
          .collection('users')
          .where('email', '==', email)
          .limit(1);
        db.runTransaction(transaction => {
          return transaction
            .get(userDocument)
            .then(returnUserDocument => {
              if (returnUserDocument.empty) {
                throw 'Document does not exist!';
              }
              returnUserDocument.forEach(returnDocument => {
                transaction.update(
                  db.collection('users').doc(returnDocument.id),
                  { resetPasswordToken: token },
                );
              });
              resolve(true);
            })
            .catch(err => {
              resolve(false);
            });
        });
      } catch (err) {
        resolve(false);
      }
    });
  }

  public static changePassword(
    currentPassword: string,
    newPassword: string,
    cif: string,
  ): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      try {
        const db = getFirebase();
        const userDocument = db.collection('users').doc(cif);
        db.runTransaction(transaction => {
          return transaction.get(userDocument).then(returnUserDocument => {
            let checkError: boolean = false;
            if (!returnUserDocument.exists) {
              checkError = true;
            }
            if (returnUserDocument.data().password !== currentPassword) {
              checkError = true;
            }
            if (!checkError) {
              transaction.update(
                db.collection('users').doc(returnUserDocument.id),
                { password: newPassword },
              );
              resolve(true);
            } else {
              resolve(false);
            }
          });
        });
      } catch (err) {
        resolve(false);
      }
    });
  }

  public static setNewPassword(
    resetToken: string,
    newPassword: string,
    email: string,
  ): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      try {
        const db = getFirebase();
        const userDocument = db
          .collection('users')
          .where('email', '==', email)
          .limit(1);
        db.runTransaction(transaction => {
          return transaction
            .get(userDocument)
            .then(returnUserDocument => {
              if (returnUserDocument.empty) {
                throw 'Document does not exist!';
              }
              let updateSuccess = false;
              returnUserDocument.forEach(returnDocument => {
                if (returnDocument.data().resetPasswordToken === resetToken) {
                  updateSuccess = true;
                  transaction.update(
                    db.collection('users').doc(returnDocument.id),
                    { password: newPassword, resetPasswordToken: null },
                  );
                }
              });
              resolve(updateSuccess);
            })
            .catch(err => {
              reject(false);
            });
        });
      } catch (err) {
        resolve(false);
      }
    });
  }

  public static updateUserProfile(user: User): Promise<User> {
    return new Promise(async (resolve, reject) => {
      try {
        const db = getFirebase();
        const userRef = db.collection('users').doc(user.cif);
        await userRef
          .update({
            email: user.email,
            preferredLanguage: user.preferredLanguage,
          })
          .then(() => {
            resolve(user);
          })
          .catch(() => {
            resolve(null);
          });
      } catch (err) {
        resolve(null);
      }
    });
  }

  public static updateRefreshTokenAndLastLogin(
    cif: string,
    refreshToken: string,
  ): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      try {
        const db = getFirebase();
        const userRef = db.collection('users').doc(cif);
        await userRef
          .update({ refreshToken, lastLoginDate: FieldValue.serverTimestamp() })
          .then(() => {
            resolve(true);
          })
          .catch(() => {
            resolve(false);
          });
      } catch (err) {
        resolve(false);
      }
    });
  }

  public static removeRefreshToken(
    cif: string,
    refreshToken: string,
  ): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      try {
        const db = getFirebase();
        const userRef = db.collection('users').doc(cif);
        await userRef
          .update({ refreshToken: null })
          .then(() => {
            resolve(true);
          })
          .catch(() => {
            resolve(false);
          });
      } catch (err) {
        resolve(false);
      }
    });
  }

  public static getPurchaseChapterHistory(
    userCif: string,
  ): Promise<Array<any>> {
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
      const returnResult = new Array();
      const purchaseChapterHistoryCollection = db
        .collection('users')
        .doc(userCif)
        .collection('purchaseHistory')
        .orderBy('purchaseDate', 'asc');
      const purchaseList = await purchaseChapterHistoryCollection
        .get()
        .then(async purchaseChapterHistoryList => {
          if (!purchaseChapterHistoryList.empty) {
            purchaseChapterHistoryList.forEach(purchaseChapterHistoryItem => {
              returnResult.push({
                chapter: purchaseChapterHistoryItem.data().chapter.id,
                chapterName: purchaseChapterHistoryItem.data().chapterName,
                displayChapterNumber: purchaseChapterHistoryItem.data()
                  .displayChapterNumber,
                fiction: purchaseChapterHistoryItem.data().fiction.id,
                ficitionName: purchaseChapterHistoryItem.data().fictionName,
                language: purchaseChapterHistoryItem.data().language,
                coin: purchaseChapterHistoryItem.data().coin,
                purchaseDate: new Timestamp(
                  purchaseChapterHistoryItem.data().purchaseDate.seconds,
                  purchaseChapterHistoryItem.data().purchaseDate.nanoseconds,
                ).toDate(),
                authorCif: purchaseChapterHistoryItem.data().authorCif,
                authorDisplayName: purchaseChapterHistoryItem.data()
                  .authorDisplayName,
              });
            });
          }
        });
      resolve(returnResult);
    });
  }

  public static getWithdrawHistory(userCif: string): Promise<Array<any>> {
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
      const returnResult = new Array();
      const userDocRef = db.collection('users').doc(userCif);
      const withdrawHistoryCollection = db
        .collection('withdrawRequest')
        .where('user', '==', userDocRef)
        .orderBy('requestDate', 'asc');
      const withdrawListList = await withdrawHistoryCollection
        .get()
        .then(async withdrawHistoryList => {
          if (!withdrawHistoryList.empty) {
            withdrawHistoryList.forEach(withdrawHistoryItem => {
              returnResult.push({
                withdrawCurrency: withdrawHistoryItem.data().withdrawCurrency,
                withdrawChannel: withdrawHistoryItem.data().withdrawChannel,
                withdrawAmount: withdrawHistoryItem.data().withdrawAmount,
                result: withdrawHistoryItem.data().result,
                requestDate: new Timestamp(
                  withdrawHistoryItem.data().requestDate.seconds,
                  withdrawHistoryItem.data().requestDate.nanoseconds,
                ).toDate(),
              });
            });
          }
        });
      resolve(returnResult);
    });
  }
}
