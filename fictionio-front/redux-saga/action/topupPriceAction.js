export const topupPriceActionTypes = {
    REQUEST_TOPUP_PRICE_INITIAL: 'REQUEST_TOPUP_PRICE_INITIAL',
    REQUEST_TOPUP_PRICE_SUCCESS: 'REQUEST_TOPUP_PRICE_SUCCESS',
    REQUEST_TOPUP_PRICE_FAIL: 'REQUEST_TOPUP_PRICE_FAIL',
  };
  
  // Action for dispath
  
  export const loadTopupPriceList = () => {
    return {
      type: topupPriceActionTypes.REQUEST_TOPUP_PRICE_INITIAL,
      payload: {  },
    };
  };
  