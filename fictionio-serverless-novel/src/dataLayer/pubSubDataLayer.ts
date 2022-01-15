import { PubSub } from '@google-cloud/pubsub';
import { Config } from './../config';

export const getPubSub = () => {
  const pubsub = new PubSub({
    projectId: Config.GOOGLE_PROJECT_ID,
    keyFilename: './firebase-key.json',
  });
  return pubsub;
};

export const publishMessage = (topic: string, message: string) =>
  new Promise((resolve, reject) => {
    const pubsub = getPubSub();
    const topicObject = pubsub.topic(topic);
    const data = Buffer.from(message);
    topicObject.publish(data, (err, messageId) => {
      if (err) {
        resolve(false);
      }
      resolve(true);
    });
  });
