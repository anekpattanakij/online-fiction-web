import { BaseCustomClass } from './baseCustomClass';

export default class Genres extends BaseCustomClass {
  public category: string;

  public constructor(init?: Partial<Genres>) {
    super();
    Object.assign(this, init);
  }

}
