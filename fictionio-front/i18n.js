const NextI18Next = require('next-i18next').default;
const Config = require('./config/index');

module.exports = new NextI18Next({
  defaultLanguage: Config.i18n.fallbackLng,
  otherLanguages: Config.i18n.whitelist,
  browserLanguageDetection: true,
  localeSubpaths: { th: 'th', en: 'en' },
  localePath: 'static/locales',

  react: {
    wait: true,
  },
});

/*
******
code for backend from cloud but not support ssr , should remove initial props to [] in pages
******
backend: {
    loadPath: 'https://storage.googleapis.com/fictionio-static/locales/{{lng}}/{{ns}}.json',
    crossDomain: true,
    parse: JSON.parse
},*/
