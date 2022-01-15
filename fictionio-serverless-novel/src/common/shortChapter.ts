import { BaseCustomClass } from './baseCustomClass';
import { User } from './user';

export class ShortChapter extends BaseCustomClass {
  public chapterId: string;
  public chapterNumberInFiction: number = 0; // running number including draft
  public language: string;
  public chapterName: string;
  public isFreeChapter: boolean = false;
  public displayChapterNumber: number = 0; // count only not free chapter

  public constructor(init?: Partial<ShortChapter>) {
    super();
    Object.assign(this, init);
  }

  public convertToPlainObject(): object {
    const returnObject: any = Object.assign({}, this);
    return returnObject;
  }
}
