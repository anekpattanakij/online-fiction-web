import { Config } from './../config/index';
import { FieldValue } from '@google-cloud/firestore';
import * as _ from 'lodash';
import { Chapter } from '../common/chapter';
import {
  Error,
  ERROR_CODE_DATABASE_EXECUTE_TRANSACTION,
  ERROR_CODE_DATABASE_PRE_EXECUTE_TRANSACTION,
  ERROR_CODE_DATABASE_CONNECTION,
  ERROR_CODE_PROCESS_ERROR,
} from '../common/error';
import { Fiction } from '../common/fiction';
import { User } from './../common/user';
import { getFirebase } from './fireBaseUtil';
import FICTION_STATUS from '../config/fictionStatusList';
import { Timestamp } from '@google-cloud/firestore';

const NUMBER_OF_TOTAL_COUNT_SHARD: number = 3;
const DEFAULT_PRICE_MODEL: string = 'FA';
const RETURN_FROM_CREATE_FICTION_STORE: number = 3;
const RETURN_FROM_CREATE_CHAPTER_STORE_CHAPTER_ID: number = 4;
const RETURN_FROM_CREATE_FICTION_STORE_DISPLAY_ID: number = 5;
const RETURN_FROM_CREATE_FICTION_STORE_ERROR: number = 6;
const MAX_RATING = 10;

export class FictionUtil {
  public static getFictionList(currentUserCif: string): Promise<Fiction[]> {
    return new Promise(async (resolve, reject) => {
      if (!currentUserCif) {
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
      const currentUserDocumentRef = db.collection('users').doc(currentUserCif);
      const fictionCollectionsRef = db
        .collection('fictions')
        .where('author.cif', '==', currentUserDocumentRef);
      await fictionCollectionsRef.get().then(async returnItem => {
        if (returnItem.empty) {
          resolve(new Array<Fiction>());
          return;
        } else {
        }

        let returnFictionList: Fiction[] = new Array<Fiction>();
        const temp = Array();
        returnItem.forEach(async returnDocument => {
          temp.push(returnDocument);
        });
        const promiseMap = temp.map(async returnDocument => {
          const fiction = await returnFireStoreToFiction(returnDocument);
          returnFictionList = returnFictionList.concat(fiction);
        });
        await Promise.all(promiseMap);
        returnFictionList.sort(sortFictionFunction);
        resolve(returnFictionList);
      });
    });
  }

  public static getTranslateFictionList(
    currentUserCif: string,
  ): Promise<Fiction[]> {
    return new Promise(async (resolve, reject) => {
      if (!currentUserCif) {
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
      const fictionCollectionsRef = db
        .collection('fictions')
        .where('translaters', 'array-contains', currentUserCif);
      await fictionCollectionsRef.get().then(async returnItem => {
        if (returnItem.empty) {
          resolve(new Array<Fiction>());
          return;
        } else {
        }
        let returnFictionList: Fiction[] = new Array<Fiction>();
        const temp = Array();
        returnItem.forEach(async returnDocument => {
          temp.push(returnDocument);
        });
        const promiseMap = temp.map(async returnDocument => {
          const fiction = await returnFireStoreToFiction(returnDocument);
          returnFictionList = returnFictionList.concat(fiction);
        });
        await Promise.all(promiseMap);
        returnFictionList.sort(sortFictionFunction);
        resolve(returnFictionList);
      });
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
    isPublished: input.data().isPublished,
    isDeleted: input.data().isDeleted,
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
    cover: input.data().cover,
    author: new User({
      cif: input.data().author.cif.id,
      displayName: input.data().author.authorName,
    }),
    translators: input.data().translators,
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

const sortFictionFunction = (a, b) => {
  if (a.createdDate > b.createdDate) {
    return -1;
  }
  if (a.createdDate < b.createdDate) {
    return 1;
  }
  return 0;
};
