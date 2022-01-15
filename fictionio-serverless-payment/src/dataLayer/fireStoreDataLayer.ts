import { Config } from './../config';
import { Firestore } from '@google-cloud/firestore';

export  const getFirebase = () => {
  const firestore = new Firestore({
    projectId: Config.GOOGLE_PROJECT_ID,
    keyFilename: './firebase-key.json',
  });
  const settings = { timestampsInSnapshots: true };
  firestore.settings(settings);
  return firestore;
};
