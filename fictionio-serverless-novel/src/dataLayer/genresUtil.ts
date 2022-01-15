import { getFirebase } from './fireBaseUtil';
import Genres from '../common/genres';
import {
  Error,
  ERROR_CODE_DATABASE_PRE_EXECUTE_TRANSACTION,
  ERROR_CODE_DATABASE_CONNECTION,
} from '../common/error';

export class GenresUtil {
  public static getGenresUtil(): Promise<Genres[]> {
    return new Promise(async (resolve, reject) => {
      // if input limit equal 0, change to default limit
      const db = getFirebase();
      const genresRef = db
        .collection('genres')
        .limit(1);
      await genresRef
        .get()
        .then(returnItem => {
          if (returnItem.empty) {
            resolve(null);
          } else {
            const returnGenres: Genres[] = new Array();
            returnItem.forEach(returnDocument => {
              const messgeList = returnDocument.data().genresList;
              messgeList.forEach(messageDocument => {
                returnGenres.push(
                  new Genres({
                    category: messageDocument,
                  }),
                );
              });
            });
            resolve(returnGenres);
          }
        })
        .catch(error => {
          reject(
            new Error(
              ERROR_CODE_DATABASE_CONNECTION,
              'Error on get genres',
            ),
          );
        });
    });
  }
}
