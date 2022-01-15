import { BaseCustomClass } from './baseCustomClass';

export default class News extends BaseCustomClass {
  public language: string;
  public message: string;
  public effectiveDate: Date;

  public constructor(init?: Partial<News>) {
    super();
    Object.assign(this, init);
  }

}
