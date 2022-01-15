import { getFirebase } from './fireStoreDataLayer';
import { Error, ERROR_CODE_MYSQL_CONNECTION } from '../common/error';
import { TopupPrice } from '../common/topupPrice';

const channelList: string[] = ['BT', 'CC'];
export class TopupPriceUtil {
  public static getPriceList(): Promise<
    { channel: string; priceList: TopupPrice[] }[]
  > {
    const returnResult: {
      channel: string;
      priceList: TopupPrice[];
    }[] = [];
    return new Promise(async (resolve, reject) => {
      const db = getFirebase();
      const priceListPromiseList = [];
      channelList.forEach(async (element: string) => {
        priceListPromiseList.push( db
          .collection('topupPrice')
          .where('channel', '==', element)
          .where('effectiveDate', '<=', new Date())
          .orderBy('effectiveDate', 'asc')
          .limit(1)
          .get()
          .then(async returnItem => {
            if (returnItem.empty) {
              return { channel: element, priceList: [] };
            } else {
              const returnChannelPriceResult: TopupPrice[] = new Array();

              returnItem.forEach(returnPriceListDocuments => {
                returnPriceListDocuments.data().priceList.forEach(returnDocument => {
                const TopupPriceItem: TopupPrice = new TopupPrice();
                (TopupPriceItem.tokenAmount = returnDocument.amount),
                  (TopupPriceItem.bonusAmount = returnDocument.bonus),
                  (TopupPriceItem.price = returnDocument.price),
                  (TopupPriceItem.currency = returnDocument.currency),
                  returnChannelPriceResult.push(TopupPriceItem);
                });
              });
              returnChannelPriceResult.sort(comparePrice);
              return { channel: element, priceList: returnChannelPriceResult } ;
            }
          })
          .catch(error => {
            reject(
              new Error(
                ERROR_CODE_MYSQL_CONNECTION,
                'Error on get topup price list',
              ),
            );
          }));
          
      });
      await Promise.all(priceListPromiseList).then(values=> resolve(values));
    });
  }
}

const comparePrice = (a, b) => {
  if (a.price < b.price) {
    return -1;
  }
  if (a.price > b.price) {
    return 1;
  }
  return 0;
};
