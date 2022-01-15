export const withdrawRateActionTypes = {
  REQUEST_WITHDRAW_RATE_INITIAL: 'REQUEST_WITHDRAW_RATE_INITIAL',
  REQUEST_WITHDRAW_RATE_SUCCESS: 'REQUEST_WITHDRAW_RATE_SUCCESS',
  REQUEST_WITHDRAW_RATE_FAIL: 'REQUEST_WITHDRAW_RATE_FAIL',
};

// Action for dispath

export const loadWithdrawRateList = () => {
  return {
    type: withdrawRateActionTypes.REQUEST_WITHDRAW_RATE_INITIAL,
    payload: {},
  };
};
