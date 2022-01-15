import chapterReducer, { ChapterState } from './chapterReducer';
import fictionReducer, { FictionState } from './fictionReducer';
import userReducer, { UserState } from './userReducer';
import topupPriceReducer, { TopupPriceListState } from './topupPriceListReducer';
import annoucementReducer, { AnnoucementState } from './annoucementReducer';
import paymentReducer, { PaymentState } from './paymentReducer';
import withdrawRateReducer, { WithdrawRateState } from './withdrawRateReducer';
import searchReducer, { SearchState } from './searchReducer';

export class State {
  chapter = new ChapterState();
  fiction = new FictionState();
  user = new UserState();
  topupPrice = new TopupPriceListState();
  annoucement = new AnnoucementState();
  payment = new PaymentState();
  withdrawRate = new WithdrawRateState();
  search  = new SearchState()
}

export const reducerList = {
  chapter: chapterReducer,
  fiction: fictionReducer,
  user: userReducer,
  topupPrice: topupPriceReducer,
  withdrawRate: withdrawRateReducer,
  annoucement: annoucementReducer,
  payment: paymentReducer,
  search: searchReducer,
};
