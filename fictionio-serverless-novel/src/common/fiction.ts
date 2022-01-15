import * as jwt from 'jsonwebtoken';
import { Config } from '../config/index';
import { BaseCustomClass } from './baseCustomClass';
import { User } from './user';

export class Fiction extends BaseCustomClass {
  public fictionId: string;
  public fictionName: { language: string; name: string }[];
  public originalFictionLanguage: string;
  public author: User;
  public rating: number;
  public ratingDetail: { rate: number; count: number }[];
  public ageRestriction: boolean;
  public numberOfChapter: number; // only publish chapter, exclude free chapter
  public lastChapter: number; // including draft, exclude free chapter
  public totalOfChapter: number; // including draft and free chapter
  public availableInLanguage: string[];
  public shortDetail: { language: string; story: string }[];
  public categories: string[];
  public updatedDate: Date;
  public createdDate: Date;
  public purchaseCount: number;
  public status: number;
  public cover: string;
  public isPublished: boolean;
  public isDeleted: boolean;
  public pricingModel: Map<
    string,
    Map<string, { model: string; coin: number }>
  >;
  public translaters: Array<string>;
  
  public constructor(init?: Partial<Fiction>) {
    super();
    Object.assign(this, init);
  }

  public calculateNewRate(): number {
    let resultScore: number = 0;
    let totalCount: number = 0;
    for (let i = 0; this.ratingDetail && i < this.ratingDetail.length; i++) {
      resultScore += this.ratingDetail[i].rate * this.ratingDetail[i].count;
      totalCount += this.ratingDetail[i].count;
    }
    this.rating = resultScore / totalCount;
    return resultScore / totalCount;
  }
  
  public convertToPlainObject(): object {
    const returnObject: any = Object.assign({}, this);
    
    returnObject.pricingModel = {};
    if (this.pricingModel instanceof Map) {
      this.pricingModel.forEach((priceModelItem, priceModelKey) => {
        returnObject.pricingModel[priceModelKey] = {};
        this.pricingModel
          .get(priceModelKey)
          .forEach((priceModelLanguageItem, priceModelLanguageKey) => {
            returnObject.pricingModel[priceModelKey][
              priceModelLanguageKey
            ] = priceModelLanguageItem;
          });
      });
    }
    return returnObject;
  }

  public getFictionName(langauge) {
    let returnName = '';
    let originalName = '';
    this.fictionName.map(fictionNameItem => {
      if (fictionNameItem.language.toUpperCase() === langauge.toUpperCase()) {
        returnName = fictionNameItem.name;
      }
      if (
        fictionNameItem.language.toUpperCase() ===
        this.originalFictionLanguage.toUpperCase()
      ) {
        originalName = fictionNameItem.name;
      }
    });

    return returnName !== '' ? returnName : originalName;
  }

  public getFictionShortStory(langauge) {
    let returnStory = '';
    let originalStory = '';
    this.shortDetail.map(shortDetailItem => {
      if (
        shortDetailItem.language.toUpperCase() ===
        this.originalFictionLanguage.toUpperCase()
      ) {
        returnStory = shortDetailItem.story;
      }
      if (
        shortDetailItem.language.toUpperCase() ===
        this.originalFictionLanguage.toUpperCase()
      ) {
        originalStory = shortDetailItem.story;
      }
    });

    return returnStory !== '' ? returnStory : originalStory;
  }
}
