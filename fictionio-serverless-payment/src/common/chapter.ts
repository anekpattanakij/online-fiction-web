import * as jwt from 'jsonwebtoken';
import { Config } from '../config/index';
import { BaseCustomClass } from './baseCustomClass';
import { User } from './user';

export class Chapter extends BaseCustomClass {
  public fictionId: number;
  public chapterNumberInFiction: number;
  public language: string;
  public author: User;
  public rating: number;
  public chapterName: string;
  public chapterContent: string;
  public status: number;
  public lastUpdate: Date;
  public coin: number;
  public monthCount: number = 0;
  public totalCount: number = 0;
  public purchaseCount: number = 0;
  public purchased: boolean = false;

  public constructor(init?: Partial<Chapter>) {
    super();
    Object.assign(this, init);
  }
}
