import { BaseCustomClass } from './BaseCustomClass';

export default class Fiction extends BaseCustomClass {
  static decodeFiction(json) {
    const fiction = Object.create(Fiction.prototype);
    try {
      return Object.assign(fiction, json, {
        lastUpdate: new Date(json.lastUpdate),
      });
    } catch (err) {
      return fiction;
    }
  }

  static displayFictionName(fiction, targetLanguage) {
    let targetText;
    let backupText;
    if (!fiction || !fiction.fictionName) {
      return '';
    }
    fiction.fictionName.map(fictionNameItem => {
      if (String(fictionNameItem.language).toUpperCase() === String(targetLanguage).toUpperCase()) {
        targetText = fictionNameItem.name;
      }
      if (String(fictionNameItem.language).toUpperCase() === String(fiction.originalFictionLanguage).toUpperCase()) {
        backupText = fictionNameItem.name;
      }
    });
    return typeof targetText !== 'undefined' ? targetText : backupText;
  }

  static displayShortDetail(fiction, targetLanguage) {
    let targetText;
    let backupText;
    if (!fiction || !fiction.shortDetail) {
      return '';
    }
    fiction.shortDetail.map(shortDetailItem => {
      if (String(shortDetailItem.language).toUpperCase() === String(targetLanguage).toUpperCase()) {
        targetText = shortDetailItem.story;
      }
      if (String(shortDetailItem.language).toUpperCase() === String(fiction.originalFictionLanguage).toUpperCase()) {
        backupText = shortDetailItem.story;
      }
    });
    return typeof targetText !== 'undefined' ? targetText : backupText;
  }

  static getTotalVoter(fiction) {
    let total = 0;
    if (!fiction || !fiction.ratingDetail) {
      return 0;
    }
    fiction.ratingDetail.map(rateItem => {
      total += rateItem.count;
    });
    return total;
  }

  static getFictionName(fiction, langauge) {
    let returnName = '';
    if (fiction && fiction.fictionName && langauge) {
      fiction.fictionName.map(fictionNameItem => {
        if (fictionNameItem.language.toUpperCase() === langauge.toUpperCase()) {
          returnName = fictionNameItem.name;
        }
      });
    }
    return returnName;
  }

  static getFictionShortStory(fiction, langauge) {
    let returnStory = '';
    if (fiction && fiction.shortDetail && langauge) {
      fiction.shortDetail.map(shortDetailItem => {
        if (shortDetailItem.language.toUpperCase() === langauge.toUpperCase()) {
          returnStory = shortDetailItem.story;
        }
      });
    }
    return returnStory;
  }

  fictionId;
  fictionName;
  originalFictionLanguage;
  author;
  ageRestriction;
  rating;
  ratingDetail;
  numberOfChapter;
  lastChapter;
  availableInLanguage;
  shortDetail;
  categories;
  updatedDate;
  createdDate;
  status;
  cover;
  pricingModel;
  translaters;
  chatperOrderList;

  constructor(init) {
    super();
    Object.assign(this, init);
  }
}
