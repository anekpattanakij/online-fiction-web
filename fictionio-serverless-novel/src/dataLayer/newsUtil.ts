import { getFirebase } from './fireBaseUtil';
import News from '../common/news';
import {
  Error,
  ERROR_CODE_DATABASE_PRE_EXECUTE_TRANSACTION,
  ERROR_CODE_DATABASE_CONNECTION,
} from '../common/error';

export class NewsUtil {
  public static getNewsUtil(): Promise<News[]> {
    return new Promise(async (resolve, reject) => {
      // if input limit equal 0, change to default limit
      const db = getFirebase();
      const newsRef = db
        .collection('news')
        .where('effectiveDate', '<=', new Date())
        .orderBy('effectiveDate', 'asc')
        .limit(1);
      await newsRef
        .get()
        .then(returnItem => {
            
          if (returnItem.empty) {
            resolve(null);
          } else {
            const returnNews: News[] = new Array();
            returnItem.forEach(returnDocument => {
              const messgeList = returnDocument.data().messages;
              messgeList.forEach(messageDocument => {
                returnNews.push(
                  new News({
                    language: messageDocument.language,
                    message: messageDocument.message,
                    effectiveDate: returnDocument.data().effectiveDate.toDate(),    
                  }),
                );
              });
            });
            resolve(returnNews);
          }
        })
        .catch(error => {
          reject(
            new Error(
              ERROR_CODE_DATABASE_CONNECTION,
              'Error on get annoucement',
            ),
          );
        });
    });
  }
}
