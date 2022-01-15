import { Config } from '../config/index';
import { FieldValue } from '@google-cloud/firestore';
import * as _ from 'lodash';
import { User } from '../common/user';
import { Chapter } from '../common/chapter';
import {
  Error,
  ERROR_CODE_DATABASE_EXECUTE_TRANSACTION,
  ERROR_CODE_DATABASE_PRE_EXECUTE_TRANSACTION,
  ERROR_CODE_DATABASE_CONNECTION,
  ERROR_CODE_PROCESS_ERROR,
  ERROR_CODE_NO_AUTHORIZE,
} from '../common/error';
import { getFirebase } from './fireBaseUtil';
import { returnFireStoreToFiction } from './fictionUtil';
import { Timestamp } from '@google-cloud/firestore';

const MAX_RATING = 10;
const NUMBER_OF_TOTAL_COUNT_SHARD: number = 3;
const DEFAULT_PRICE_MODEL: string = 'FA';
const LIMIT_POSITION_PRICE_MODEL: number = 5;
const LOAD_CHAPTER_CHUNK: number = 20;
export class ChapterUtil {
  public static getChapterList(currentUserCif: string): Promise<Chapter[]> {
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
      const chapterCollectionsRef = db
        .collection('chapters')
        .where('author.cif', '==', currentUserDocumentRef)
        .limit(LOAD_CHAPTER_CHUNK);
      await chapterCollectionsRef.get().then(async returnItem => {
        if (returnItem.empty) {
          resolve(new Array<Chapter>());
          return;
        } else {
          let returnChapterList: Chapter[] = new Array<Chapter>();
          const temp = Array();
          returnItem.forEach(async returnDocument => {
            temp.push(returnDocument);
          });
          const promiseMap = temp.map(async returnDocument => {
            const chapter = await returnFireStoreToChapter(returnDocument);
            chapter.chapterContent = '';
            returnChapterList = returnChapterList.concat(chapter);
          });
          await Promise.all(promiseMap);
          returnChapterList.sort(sortChapterFunction);
          resolve(returnChapterList);
        }
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
    rate: input.data().rate,
    chapterName: input.data().chapterName,
    status: input.data().status,
    isPublished: input.data().isPublished,
    lastUpdate: new Timestamp(
      input.data().lastUpdateDate.seconds,
      input.data().lastUpdateDate.nanoseconds,
    ).toDate(),
    coin: input.data().coin,
    monthCount: input.data().monthlyCount,
    totalCount: input.data().totalCount,
    purchaseCount: input.data().purchaseCount,
    purchased: false,
    chapterContent: input.data().content,
    ethereumBlockAddress: input.data().ethereumBlockAddress,
    bitcoinBlockAddress: input.data().bitcoinBlockAddress,
    fictionDisplayName: input.data().fictionDisplayName,
    displayCover: input.data().displayCover,
  });

  return returnChapter;
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
