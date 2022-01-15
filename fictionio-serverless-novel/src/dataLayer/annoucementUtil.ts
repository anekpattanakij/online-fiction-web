import { getFirebase } from './fireBaseUtil';
import Annoucement from '../common/annoucement';
import {
  Error,
  ERROR_CODE_DATABASE_PRE_EXECUTE_TRANSACTION,
  ERROR_CODE_DATABASE_CONNECTION,
} from '../common/error';

export class AnnoucementUtil {
  public static getAnnoucementUtil(): Promise<Annoucement[]> {
    return new Promise(async (resolve, reject) => {
      // if input limit equal 0, change to default limit
      const db = getFirebase();
      const annoucementRef = db
        .collection('annoucement')
        .where('effectiveDate', '<=', new Date())
        .orderBy('effectiveDate', 'asc')
        .limit(1);
      await annoucementRef
        .get()
        .then(returnItem => {
          if (returnItem.empty) {
            resolve(null);
          } else {
            const returnAnnoucement: Annoucement[] = new Array();
            returnItem.forEach(returnDocument => {
              const messgeList = returnDocument.data().messages;
              messgeList.forEach(messageDocument => {
                returnAnnoucement.push(
                  new Annoucement({
                    header: messageDocument.header,
                    language: messageDocument.language,
                    message: messageDocument.message,
                    effectiveDate: returnDocument.data().effectiveDate.toDate(),
                    destinationUrl: messageDocument.destinationUrl,
                  }),
                );
              });
            });
            resolve(returnAnnoucement);
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
