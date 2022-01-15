import { chapterActionTypes } from './chapterAction';
import { fictionActionTypes } from './fictionAction';
import { userProfileActionTypes } from './userAction';
import { annoucementActionTypes } from './annoucementAction';
import { topupPriceActionTypes } from './topupPriceAction';
import { paymentActionTypes } from './paymentAction';
import { withdrawRateActionTypes } from './withdrawAction';
import { searchActionTypes } from './searchAction';


export const actionTypes = {
  ...chapterActionTypes,
  ...fictionActionTypes,
  ...userProfileActionTypes,
  ...annoucementActionTypes,
  ...topupPriceActionTypes,
  ...paymentActionTypes,
  ...withdrawRateActionTypes,
  ...searchActionTypes,
};
