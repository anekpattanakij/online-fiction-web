const DEFAULT_PORT = '3000';

class DefaultConfig {}
DefaultConfig.host = process.env.NODE_HOST || 'localhost';
DefaultConfig.port = process.env.PORT || DEFAULT_PORT;

DefaultConfig.apiPath = 'http://localhost:8010/fictionio-dev/us-central1';

DefaultConfig.persistKey = 'storeDevKey';

DefaultConfig.googleClientId = 'xxxx';
DefaultConfig.facebookAppId = 'xxxx';

DefaultConfig.staticFilePath = '/static';
DefaultConfig.coverImagePath = 'https://storage.googleapis.com/fictionio-dev-cover/';
DefaultConfig.omiseApiKey = 'xxxx';
DefaultConfig.enableAnalyticZone = false;
DefaultConfig.calendarConfiguration = {
  height: 300,
};
DefaultConfig.facebookPage = 'https://www.facebook.com/fictionio/';
DefaultConfig.i18n = {
  whitelist: ['th', 'en'],
  fallbackLng: 'en',
  debug: false,
};
DefaultConfig.googleReCaptchaKey = 'xxxx';
DefaultConfig.googleAnalyticKey = 'xxxx';

module.exports = DefaultConfig;
