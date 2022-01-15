import * as moment from 'moment';
import * as _ from 'lodash';
import * as franc from 'franc-min';

export const DISPLAY_DATE_FORMAT = 'DD MM YYYY';

const map_white_list_language = [['tha', 'TH'], ['eng', 'EN']];

const isInWhiteListLanguage = (inputTargetLanguage, inputString) => {
  const THRESHOLD_LANGUAGE_SCORE = 0.6;
  let returnResult = false;
  const whitelistLanguageMap = new Map();
  if (inputString && inputString.length <= 18) {
    return true;
  } else {
    map_white_list_language.forEach(element => {
      whitelistLanguageMap.set(element[0], element[1]);
    });
    franc.all(inputString).forEach(element => {
      if (element[0] === 'und') {
        if (element[1] > THRESHOLD_LANGUAGE_SCORE) {
          returnResult = true;
        }
      }
      const mapLanguageItem = whitelistLanguageMap.get(element[0]);
      if (mapLanguageItem !== null) {
        if (element[1] >= THRESHOLD_LANGUAGE_SCORE && _.isEqual(inputTargetLanguage.toUpperCase(), mapLanguageItem)) {
          returnResult = true;
        }
      }
    });
    return returnResult;
  }
};

const validateEmail = email => {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

export const minLength = min => value => value.toString().length >= min;

export const maxLength = max => value => value.toString().length <= max;

export const isLengthBetween = (min, max) => value => {
  return value.toString().length >= min && value.toString().length <= max;
};

export const matchLanguage = language => value => isInWhiteListLanguage(language, value);

export const matchLanguageOrEnglish = language => value => isInWhiteListLanguage(language, value) || isInWhiteListLanguage('EN', value);

export const required = value => value !== undefined;

export const isEmail = value => validateEmail(value);

export const isCorrectDateFormat = value => moment(value, DISPLAY_DATE_FORMAT).isValid();

export const composeValidators = (...validators) => value => validators.reduce((error, validator) => error || validator(value), undefined);

export const getErrorMessage = (t, i18nKey, fieldName, params) => {
  return isValid => {
    return isValid ? undefined : t(i18nKey, { field: t(fieldName), ...params });
  };
};
