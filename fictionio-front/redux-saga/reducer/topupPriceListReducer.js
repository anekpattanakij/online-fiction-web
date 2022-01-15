import { actionTypes } from '../action';

const setInitializeTopupPrice = () => {
  return new Array();
};

export class TopupPriceListState {
  topupPriceList = setInitializeTopupPrice();
  loadedCurrency = null;
  errorList = [];
  loading = false;
  lastRefresh;
}

export default (state = new TopupPriceListState(), action) => {
  switch (action.type) {
    case actionTypes.REQUEST_TOPUP_PRICE_INITIAL:
      return {
        ...state,
        loadedCurrency: action.payload.currency,
        topupPriceList: null,
        loading: true,
        errorList: [],
        lastRefresh : null,
      };

    case actionTypes.REQUEST_TOPUP_PRICE_SUCCESS:
      return {
        ...state,
        topupPriceList: action.payload.priceList,
        loadedCurrency: action.payload.currency,
        loading: false,
        errorList: [],
        lastRefresh : new Date(),
      };

    case actionTypes.REQUEST_TOPUP_PRICE_FAIL:
      return {
        ...state,
        topupPriceList: [],
        loadedCurrency: action.payload.currency,
        errorList: action.payload.data,
        loading: false,
        lastRefresh : null,
      };

    default:
      return state;
  }
};
