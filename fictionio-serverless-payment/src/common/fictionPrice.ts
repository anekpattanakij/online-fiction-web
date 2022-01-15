import { Config } from '../config/index';
import { BaseCustomClass } from './baseCustomClass';
import { User } from './user';

export class FictionPrice extends BaseCustomClass {
  public fictionId: number;
  public language: string;
  public author: User;
  public coin: number;
  public pricingModel: string;
  public lastUpdate: Date;

  public constructor(init?:Partial<FictionPrice>) {
    super();
    Object.assign(this, init);
  }

}
