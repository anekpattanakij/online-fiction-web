import { FieldValue } from '@google-cloud/firestore';
import { getFirebase } from './fireStoreDataLayer';
import { WithdrawRequestTransaction } from '../common/withdrawRequest';
import { User } from '../common/user';
import { getPubSub } from './pubSubDataLayer';

export class WithdrawRequestUtil {
  public static submitWithdrawRequest(
    requestWithdraw: WithdrawRequestTransaction,
    submitUser: User,
  ): Promise<boolean> {
    const db = getFirebase();

    // Commit the batch
    return new Promise(async (resolve, reject) => {
      const writeBatch = db.batch();
      const withdrawRequestDocument = db.collection('withdrawRequest').doc();
      const userDocument = db.collection('users').doc(submitUser.cif);
      writeBatch.create(
        withdrawRequestDocument,
        Object.assign({ result: 'pending' }, requestWithdraw, {
          requestDate: FieldValue.serverTimestamp(),
          user:userDocument,
        }),
      );
      writeBatch
        .commit()
        .then(() => {
          const pubsub = getPubSub();
          const topic = pubsub.topic('withdrawRequest');
          const sendMessage = {
            cif: submitUser.cif,
            amount: requestWithdraw.withdrawAmount,
            currency: requestWithdraw.withdrawCurrency,
            requestDate: FieldValue.serverTimestamp(),
            channel: requestWithdraw.withdrawChannel
              ? requestWithdraw.withdrawChannel
              : null,
          };
          const data = Buffer.from(JSON.stringify(sendMessage));
          topic.publish(data, (err, messageId) => {
            if (err) {
              // Error handling omitted.
              console.log(err);
            }
            resolve(true);
          });
        })
        .catch(err => {
          console.log(err);
          resolve(false);
        });
    });
  }
}
