import * as franc from 'franc-min';
import * as _ from 'lodash';

export default class WhiteListInputContentList {
  public static isInWhiteListLanguage(
    inputTargetLanguage: string,
    inputString: string,
  ): boolean {
    const THRESHOLD_LANGUAGE_SCORE: number = 0.6;
    const THRESHOLD_LANGUAGE_CHARACTOR_DETECTOR: number = 18;
    let returnResult = false;
    const whitelistLanguageMap = new Map();
    this.state.map_white_list_language.forEach(element => {
      whitelistLanguageMap.set(element[0], element[1]);
    });
    if (inputString.length <= THRESHOLD_LANGUAGE_CHARACTOR_DETECTOR) {
      return true;
    } else {
      franc.all(inputString).forEach(element => {
        if (element[0] === 'und') {
          if (element[1] > THRESHOLD_LANGUAGE_SCORE) {
            returnResult = true;
          }
        }
        const mapLanguageItem = whitelistLanguageMap.get(element[0]);
        if (mapLanguageItem !== null) {
          if (
            element[1] >= THRESHOLD_LANGUAGE_SCORE &&
            _.isEqual(inputTargetLanguage.toUpperCase(), mapLanguageItem)
          ) {
            returnResult = true;
          }
        }
      });
      return returnResult;
    }
  }

  public static isCorrectLanguage(language: string, value: any): boolean {
    return WhiteListInputContentList.isInWhiteListLanguage(language, value);
  }

  public static isCorrectLanguageOrEnglish(language: string, value: any): boolean {
    let returnValidateResult = WhiteListInputContentList.isInWhiteListLanguage(language, value);
    if( !returnValidateResult )
    {
      returnValidateResult = WhiteListInputContentList.isInWhiteListLanguage('en', value);
    } 
    return returnValidateResult;
  }

  private static state = {
    map_white_list_language: [['tha', 'TH'], ['eng', 'EN']],
  };
}
