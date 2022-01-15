import * as jwt from 'jsonwebtoken';
import { Config } from '../config/index';
import { BaseCustomClass } from './baseCustomClass';
import { User } from './user';

export class Chapter extends BaseCustomClass {
  public fictionId: string;
  public chapterId: string;
  public originalChapterId: string;
  public originalLanguage: string;
  public originalAuthorCif: string;
  public chapterNumberInFiction: number = 0; // running number including draft
  public language: string;
  public author: User;
  public rate: number;
  public ratingDetail: { rate: number; count: number }[];
  public chapterName: string;
  public chapterContent: string;
  public status: number;
  public isPublished: boolean = false;
  public lastUpdate: Date;
  public createDate: Date;
  public coin: number;
  public isFreeChapter: boolean = false;
  public monthCount: number = 0;
  public totalCount: number = 0;
  public purchaseCount: number = 0;
  public purchased: boolean = false;
  public currentUserRating: number = 0;
  public ethereumBlockAddress: string = null;
  public bitcoinBlockAddress: string = null;
  public ethereumClassicBlockAddress: string = null;
  public displayChapterNumber: number = 0; // count only not free chapter
  public fictionDisplayName: string;
  public displayCover: string;
  public numberOfComment:number; 
  
  public constructor(init?: Partial<Chapter>) {
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
    this.rate = resultScore / totalCount;
    return resultScore / totalCount;
  }
}
