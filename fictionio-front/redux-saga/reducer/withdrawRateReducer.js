import { actionTypes } from '../action';

export class WithdrawRateState {
  rateList = [];
  errorList = [];
  loading = false;
  lastRefresh;
}

export default (state = new WithdrawRateState(), action) => {
  switch (action.type) {
    case actionTypes.REQUEST_WITHDRAW_RATE_INITIAL:
      return {
        ...state,
        rateList: [],
        loading: true,
        errorList: [],
        lastRefresh : null,
      };

    case actionTypes.REQUEST_WITHDRAW_RATE_SUCCESS:
      return {
        ...state,
        rateList: action.payload,
        loading: false,
        errorList: [],
        lastRefresh : new Date(),
      };

    case actionTypes.REQUEST_WITHDRAW_RATE_FAIL:
      return {
        ...state,
        rateList: [],
        errorList: action.payload.data,
        loading: false,
        lastRefresh : null,
      };

    default:
      return state;
  }
};
