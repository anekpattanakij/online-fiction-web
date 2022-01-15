const DefaultConfig = require('./default');

class ProductionConfig extends DefaultConfig {}
ProductionConfig.coverImagePath = 'https://storage.googleapis.com/fictionio-cover/';
ProductionConfig.staticFilePath = 'https://storage.googleapis.com/fictionio-static';
ProductionConfig.apiPath = 'https://us-central1-fictionio-prod.cloudfunctions.net';
ProductionConfig.omiseApiKey = '';
ProductionConfig.persistKey = '';
module.exports = ProductionConfig;
