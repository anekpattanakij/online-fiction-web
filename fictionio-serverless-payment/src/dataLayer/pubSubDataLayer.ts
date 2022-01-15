import { PubSub } from '@google-cloud/pubsub';
import { Config } from './../config';

export  const getPubSub = () => {
  const pubsub = new PubSub({
    projectId: Config.GOOGLE_PROJECT_ID,
    keyFilename: './firebase-key.json',
  });
  return pubsub;
};
