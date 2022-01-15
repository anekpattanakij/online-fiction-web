export const paymentActionTypes = {
  REQUEST_TOPUP_INITIAL: 'REQUEST_TOPUP_INITIAL',
  REQUEST_TOPUP_SUCCESS: 'REQUEST_TOPUP_SUCCESS',
  REQUEST_TOPUP_FAIL: 'REQUEST_TOPUP_FAIL',
  REQUEST_CREATE_CHARGE_TOKEN_INITIAL: 'REQUEST_CREATE_CHARGE_TOKEN_INITIAL',
  REQUEST_CREATE_CHARGE_TOKEN_START: 'REQUEST_CREATE_CHARGE_TOKEN_START',
  REQUEST_CREATE_CHARGE_TOKEN_SUCCESS: 'REQUEST_CREATE_CHARGE_TOKEN_SUCCESS',
  REQUEST_CREATE_CHARGE_TOKEN_FAIL: 'REQUEST_CREATE_CHARGE_TOKEN_FAIL',
  REQUEST_SUBMIT_BANK_TRANSFER_INITIAL: 'REQUEST_SUBMIT_BANK_TRANSFER_INITIAL',
  REQUEST_SUBMIT_BANK_TRANSFER_SUCCESS: 'REQUEST_SUBMIT_BANK_TRANSFER_SUCCESS',
  REQUEST_SUBMIT_BANK_TRANSFER_FAIL: 'REQUEST_SUBMIT_BANK_TRANSFER_FAIL',
};

// Action for dispath

export const requestTopup = (paymentChannel, amount, bonus, price, currency) => {
  return {
    type: paymentActionTypes.REQUEST_TOPUP_INITIAL,
    payload: { paymentChannel, amount, bonus, price, currency },
  };
};

export const createChargeToken = (
  sessionTimeoutDispatcher,
  updateTokenDispatcher,
  currentUser,
  creditCardHolderName,
  creditCardNumber,
  creditCardExpiryMonth,
  creditCardExpiryYear,
  creditCardCvv,
  chargeAmount,
  chargeCurrency,
) => {
  return {
    type: paymentActionTypes.REQUEST_CREATE_CHARGE_TOKEN_INITIAL,
    payload: {
      sessionTimeoutDispatcher,
      updateTokenDispatcher,
      currentUser,
      creditCardHolderName,
      creditCardNumber,
      creditCardExpiryMonth,
      creditCardExpiryYear,
      creditCardCvv,
      chargeAmount,
      chargeCurrency,
    },
  };
};

export const saveBankTransferRequest = (
  sessionTimeoutDispatcher,
  updateTokenDispatcher,
  currentUser,
  transferAmount,
  transferDate,
  transferTime,
  transferReferenceNumber,
) => {
  return {
    type: paymentActionTypes.REQUEST_SUBMIT_BANK_TRANSFER_INITIAL,
    payload: {
      sessionTimeoutDispatcher,
      updateTokenDispatcher,
      currentUser,
      transferAmount,
      transferDate,
      transferTime,
      transferReferenceNumber,
    },
  };
};
