const defaultConfig = require('./default');
const prodConfig = require('./prod');

module.exports = Object.assign(defaultConfig, process.env.NODE_ENV !== 'production' ? null : prodConfig);
