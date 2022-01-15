import { BaseCustomClass } from './baseCustomClass';

export default class Annoucment extends BaseCustomClass {
  public language: string;
  public header: string;
  public message: string;
  public effectiveDate: Date;
  public destinationUrl: string;

  public constructor(init?: Partial<Annoucment>) {
    super();
    Object.assign(this, init);
  }

}
