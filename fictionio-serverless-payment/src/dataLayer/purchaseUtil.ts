import { FieldValue } from '@google-cloud/firestore';
import { getFirebase } from './fireStoreDataLayer';

export class PurchaseUtil {
  public static purchaseCoin(
    purchaseUserCif: string,
    amount: number,
    currency: string,
    transactionId: string,
  ): Promise<boolean> {
    const db = getFirebase();

    // Commit the batch
    return new Promise(async (resolve, reject) => {
      const topupPriceDocument = db
        .collection('topupPrice')
        .where('price', '==', amount)
        .where('currency', '==', currency)
        .limit(1);
      const userDocument = db.collection('users').doc(purchaseUserCif);
      const cardTransanferDocument = db.collection('cardTransfer').doc();
      db.runTransaction(async transaction => {
        return transaction
          .get(topupPriceDocument)
          .then(returnTopupPriceDocuments => {
            if (returnTopupPriceDocuments.empty) {
              throw 'Document does not exist!';
            }

            return returnTopupPriceDocuments;
          })
          .then(async returnTopupPriceDocuments => {
            const returnUser = await transaction.get(userDocument).then(async documentUser => {
              if (!documentUser.exists) {
                throw 'Document does not exist!';
              }
              return documentUser;
            });
            return { returnTopupPriceDocuments, returnUser };
          })
          .then((returnGetList: any) => {
            returnGetList.returnTopupPriceDocuments.forEach(
              async returnTopupDocument => {
                await transaction.create(
                  cardTransanferDocument,
                  Object.assign(
                    { result: 'pending' },
                    {
                      cif: purchaseUserCif,
                      amount: returnTopupDocument.data().tokenAmount,
                      bonus: returnTopupDocument.data().bonusAmount,
                      currency,
                      transactionId,
                      transactionDate: FieldValue.serverTimestamp(),
                    },
                  ),
                );
                returnGetList.returnTopupDocument = returnTopupDocument;
              },
            );
            return returnGetList;
          })
          .then(async (returnGetList: any) => {
            await transaction.update(userDocument, {
              coin:
                returnGetList.returnUser.data().coin +
                returnGetList.returnTopupDocument.data().tokenAmount +
                returnGetList.returnTopupDocument.data().bonusAmount,
              cardTopupList: FieldValue.arrayUnion(cardTransanferDocument),
            });
            resolve(true);
          })

          .catch(err => {
            resolve(false);
          });
      });
    });
  }
}
