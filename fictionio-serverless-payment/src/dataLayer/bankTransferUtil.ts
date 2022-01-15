import { FieldValue } from '@google-cloud/firestore';
import { getFirebase } from './fireStoreDataLayer';
import { BankTransferTransaction } from '../common/bankTransfer';
import { User } from '../common/user';
import { getPubSub } from './pubSubDataLayer';

export class BankTransferUtil {
  public static submitBankTransfer(
    requestBankTransfer: BankTransferTransaction,
    submitUser: User,
  ): Promise<boolean> {
    const db = getFirebase();

    // Commit the batch
    return new Promise(async (resolve, reject) => {
      const writeBatch = db.batch();
      const bankTransferDocument = db.collection('bankTransfer').doc();
      const userDocument = db.collection('users').doc(submitUser.cif);
      writeBatch.create(
        bankTransferDocument,
        Object.assign({ result: 'pending' }, requestBankTransfer),
      );
      writeBatch.update(userDocument, {
        bankTopupList: FieldValue.arrayUnion(
          Object.assign({ result: 'pending' }, requestBankTransfer),
        ),
      });
      writeBatch
        .commit()
        .then(() => {
          const pubsub = getPubSub();
          const topic = pubsub.topic('submitBankTransfer');
          const sendMessage = {
            cif: submitUser.cif,
            amount: requestBankTransfer.transferAmount,
            currency: 'THB',
            date: requestBankTransfer.transferDate,
            time: requestBankTransfer.transferTime,
          };
          const data = Buffer.from(JSON.stringify(sendMessage));
          topic.publish(data, (err, messageId) => {
            if (err) {
              // Error handling omitted.
            }
            resolve(true);
          });
        })
        .catch(err => {
          resolve(false);
        });
    });
  }
}
