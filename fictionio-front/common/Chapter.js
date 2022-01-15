import { BaseCustomClass } from './BaseCustomClass';

export default class Chapter extends BaseCustomClass {
  fictionId;
  chapterId;
  chapterNumberInFiction = 0; // running number including draft
  language;
  author;
  rate;
  chapterName;
  chapterContent;
  status;
  lastUpdate;
  coin;
  isFreeChapter = false;
  monthCount = 0;
  totalCount = 0;
  purchaseCount = 0;
  purchased = false;
  currentUserRating = 0;
  ethereumBlockAddress = null;
  bitcoinBlockAddress = null;
  ethereumClassicBlockAddress = null;
  displayChapterNumber = 0; // count only not free chapter
  fictionDisplayName = '';
  displayCover = '';
  originalChapterId = '';
  originalLanguage = '';
  originalAuthorCif = '';
  numberOfComment = 0; 

  constructor(init) {
    super();
    Object.assign(this, init);
  }
}
