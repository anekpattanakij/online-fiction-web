import { actionTypes } from '../action';

export class PaymentState {
  topupAmount = 0;
  topupBonus = 0;
  topupPrice = 0;
  topupCurrency = 'USD';
  paymentChannel = '';
  errorList = [];
  loading = false;
  topupSuccess = false;
  topupOnlineSuccess = false;
}

export default (state = new PaymentState(), action) => {
  switch (action.type) {
    case actionTypes.REQUEST_TOPUP_INITIAL:
      return {
        ...state,
        loading: false,
        topupAmount: action.payload.amount,
        topupBonus: action.payload.bonus,
        topupPrice: action.payload.price,
        topupCurrency: action.payload.currency,
        paymentChannel: action.payload.paymentChannel,
        topupSuccess: false,
        topupOnlineSuccess: false,
      };
    case actionTypes.REQUEST_CREATE_CHARGE_TOKEN_START:
    case actionTypes.REQUEST_SUBMIT_BANK_TRANSFER_INITIAL:
      return {
        ...state,
        loading: true,
        errorList: [],
        topupSuccess: false,
        topupOnlineSuccess: false,
      };

    case actionTypes.REQUEST_SUBMIT_BANK_TRANSFER_SUCCESS:
      return {
        ...state,
        errorList: [],
        loading: false,
        topupSuccess: true,
      };

    case actionTypes.REQUEST_CREATE_CHARGE_TOKEN_SUCCESS:
      return {
        ...state,
        errorList: [],
        loading: false,
        topupOnlineSuccess: true,
      };

    case actionTypes.REQUEST_CREATE_CHARGE_TOKEN_FAIL:
    case actionTypes.REQUEST_SUBMIT_BANK_TRANSFER_FAIL:
      return {
        ...state,
        errorList: [action.payload],
        loading: false,
        topupSuccess: false,
        topupOnlineSuccess: false,
      };

    default:
      return state;
  }
};
