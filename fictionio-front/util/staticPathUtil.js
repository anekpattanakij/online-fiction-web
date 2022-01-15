import Config from '../config/index';

export const generateStaticPath = src => {
  return Config.staticFilePath + src;
};

export const generateCoverPath = src => {
  return Config.coverImagePath + src;
};
