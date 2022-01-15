import { getFirebase } from './fireStoreDataLayer';
import { Error, ERROR_CODE_MYSQL_CONNECTION } from '../common/error';
import { WithdrawRate } from '../common/withdrawRate';

const DEFAULT_USD_RATE: number = 0.03;
export class WithdrawRateUtil {
  public static getRateList(): Promise<WithdrawRate> {
    const returnResult: WithdrawRate = new WithdrawRate({
      rateList: [
        { currency: 'USD', rate: DEFAULT_USD_RATE },
        { currency: 'THB', rate: 1 },
      ],
    });
    return new Promise(async (resolve, reject) => {
      const db = getFirebase();
      await db
        .collection('withdrawRate')
        .where('effectiveDate', '<=', new Date())
        .orderBy('effectiveDate', 'asc')
        .limit(1)
        .get()
        .then(async returnItem => {
          if (returnItem.empty) {
            resolve(returnResult);
          } else {
            const returnResult = new WithdrawRate({ rateList: [] });
            returnItem.forEach(returnPriceListDocuments => {
              returnPriceListDocuments.data().rate.forEach(returnDocument => {
                returnResult.rateList.push({
                  currency: returnDocument.currency,
                  rate: returnDocument.rate,
                });
              });
            });
            resolve(returnResult);
          }
        })
        .catch(error => {
          reject(
            new Error(
              ERROR_CODE_MYSQL_CONNECTION,
              'Error on get withdraw rate list',
            ),
          );
        });
    });
  }
}
