import { Storage } from '@google-cloud/storage';

export const getStorage = () => {
    const storageRoot = new Storage({
      projectId: 'fictionio-dev',
      keyFilename: './firebase-key.json',
    });

    return storageRoot;
  };
