import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';
import { Config } from '../config/index';
import { BaseCustomClass } from './baseCustomClass';
import { User } from './user';

export class Fiction extends BaseCustomClass {
  public fictionId: number;
  public fictionName: string;
  public language: string;
  public author: User;
  public rating: number;
  public numberOfChapter: number;
  public translateInLanguage: number;
  public shortDetail: string;
  public category: string[];
  public originalLanguage: string;
  public lastUpdate: Date;
  public monthCount: number;
  public totalCount: number;
  public purchaseCount: number;

  public constructor(init?:Partial<Fiction>) {
    super();
    Object.assign(this, init);
  }

}
