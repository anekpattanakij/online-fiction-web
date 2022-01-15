import axios from 'axios';
import { fork, put, take } from 'redux-saga/effects';
import { API_CALLING_METHOD, callNonSecureApi, callSecureApi, RETURN_CODE_API_CALL_SUCCESS } from '../../common/ApiPortal';
import Error from '../../common/Error';
import Config from '../../config/index';
import { actionTypes } from '../action/index';

const OMISE_API_URL = 'https://vault.omise.co/tokens';
const API_OMISE_CHARGE_TOKEN = Config.apiPath + '/chargeByToken';
const API_LOAD_TOP_UP_PRICE_LIST = Config.apiPath + '/topupPrice';
const API_LOAD_BANK_TRANSFER_SUBMIT = Config.apiPath + '/bankTransfer';
const API_LOAD_WITHDRAW_RATE_LIST = Config.apiPath + '/withdrawRate';

const BATH_TO_SATANG = 100;

// Worker
function* loadTopupPriceList() {
  try {
    const response = yield callNonSecureApi(API_LOAD_TOP_UP_PRICE_LIST, API_CALLING_METHOD.GET);
    if (response.result === RETURN_CODE_API_CALL_SUCCESS) {
      yield put({
        type: actionTypes.REQUEST_TOPUP_PRICE_SUCCESS,
        payload: { priceList: response.data },
      });
    } else {
      yield put({
        type: actionTypes.REQUEST_TOPUP_PRICE_FAIL,
        payload: { data: [] },
      });
    }
  } catch (err) {
    if (err && err.response && err.response.data) {
      yield put({
        type: actionTypes.REQUEST_TOPUP_PRICE_FAIL,
        payload: { data: err.response.data },
      });
    } else {
      put({
        type: actionTypes.REQUEST_TOPUP_PRICE_FAIL,
        payload: { data: Error.transformErrorFromAxios(err) },
      });
    }
  }
}

// Watcher
export function* watchLoadTopupPriceList() {
  while (true) {
    const actionObject = yield take(actionTypes.REQUEST_TOPUP_PRICE_INITIAL);
    yield fork(loadTopupPriceList, actionObject.payload.currency);
  }
}

// Worker
function* loadWithdrawRateList() {
  try {
    const response = yield callNonSecureApi(API_LOAD_WITHDRAW_RATE_LIST, API_CALLING_METHOD.GET);
    if (response.result === RETURN_CODE_API_CALL_SUCCESS) {
      yield put({
        type: actionTypes.REQUEST_WITHDRAW_RATE_SUCCESS,
        payload: response.data && response.data.rateList || [],
      });
    } else {
      yield put({
        type: actionTypes.REQUEST_WITHDRAW_RATE_FAIL,
        payload: { data: [] },
      });
    }
  } catch (err) {
    if (err && err.response && err.response.data) {
      yield put({
        type: actionTypes.REQUEST_WITHDRAW_RATE_FAIL,
        payload: { data: err.response.data },
      });
    } else {
      put({
        type: actionTypes.REQUEST_WITHDRAW_RATE_FAIL,
        payload: { data: Error.transformErrorFromAxios(err) },
      });
    }
  }
}

// Watcher
export function* watchLoadWithdrawRateList() {
  while (true) {
    const actionObject = yield take(actionTypes.REQUEST_WITHDRAW_RATE_INITIAL);
    yield fork(loadWithdrawRateList, actionObject.payload.currency);
  }
}

// Worker
function* createPaymentToken(
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
) {
  try {
    yield put({
      type: actionTypes.REQUEST_CREATE_CHARGE_TOKEN_START,
    });
    const data = new FormData();
    data.append('card[name]', creditCardHolderName);
    data.append('card[number]', creditCardNumber);
    data.append('card[expiration_month]', creditCardExpiryMonth);
    data.append('card[expiration_year]', creditCardExpiryYear);
    data.append('card[security_code]', creditCardCvv);
    const response = yield axios.post(OMISE_API_URL, data, {
      auth: {
        username: Config.omiseApiKey,
        password: '',
      },
      headers: { 'content-type': 'multipart/form-data' },
    });
    if (response) {
      const responseFromCharge = yield callSecureApi(
        sessionTimeoutDispatcher,
        updateTokenDispatcher,
        currentUser,
        API_OMISE_CHARGE_TOKEN,
        API_CALLING_METHOD.POST,
        {},
        {
          card: response.data.id,
          amount: parseFloat(chargeAmount) * BATH_TO_SATANG,
          currency: chargeCurrency,
        },
      );
      if (responseFromCharge.result === RETURN_CODE_API_CALL_SUCCESS) {
        yield put({
          type: actionTypes.REQUEST_CREATE_CHARGE_TOKEN_SUCCESS,
          payload: response,
        });
      } else {
        yield put({
          type: actionTypes.REQUEST_CREATE_CHARGE_TOKEN_FAIL,
          payload: responseFromCharge.data,
        });
      }
    } else {
      yield put({ type: actionTypes.REQUEST_CREATE_CHARGE_TOKEN_FAIL });
    }
  } catch (err) {
    if (err && err.response && err.response.data && err.response.data.code) {
      yield put({
        type: actionTypes.REQUEST_CREATE_CHARGE_TOKEN_FAIL,
        payload: Error.transformErrorFromOmise(err),
      });
    } else {
      put({
        type: actionTypes.REQUEST_CREATE_CHARGE_TOKEN_FAIL,
        payload: Error.transformErrorFromAxios(err),
      });
    }
  }
  // TODO Do Something
}

// Watcher
export function* watchCreatePaymentToken() {
  while (true) {
    const actionObject = yield take(actionTypes.REQUEST_CREATE_CHARGE_TOKEN_INITIAL);
    yield fork(
      createPaymentToken,
      actionObject.payload.sessionTimeoutDispatcher,
      actionObject.payload.updateTokenDispatcher,
      actionObject.payload.currentUser,
      actionObject.payload.creditCardHolderName,
      actionObject.payload.creditCardNumber,
      actionObject.payload.creditCardExpiryMonth,
      actionObject.payload.creditCardExpiryYear,
      actionObject.payload.creditCardCvv,
      actionObject.payload.chargeAmount,
      actionObject.payload.chargeCurrency,
    );
  }
}

// Worker
function* BankTransferSubmit(
  sessionTimeoutDispatcher,
  updateTokenDispatcher,
  currentUser,
  transferAmount,
  transferDate,
  transferTime,
  transferReferenceNumber,
) {
  try {
    const response = yield callSecureApi(
      sessionTimeoutDispatcher,
      updateTokenDispatcher,
      currentUser,
      API_LOAD_BANK_TRANSFER_SUBMIT,
      API_CALLING_METHOD.POST,
      {},
      {
        amount: transferAmount,
        date: transferDate,
        time: transferTime,
        reference: transferReferenceNumber,
      },
    );
    if (response.result === RETURN_CODE_API_CALL_SUCCESS) {
      yield put({
        type: actionTypes.REQUEST_SUBMIT_BANK_TRANSFER_SUCCESS,
        payload: response.data,
      });
    } else {
      yield put({
        type: actionTypes.REQUEST_SUBMIT_BANK_TRANSFER_FAIL,
        payload: response.data,
      });
    }
  } catch (err) {
    yield put({
      type: actionTypes.REQUEST_SUBMIT_BANK_TRANSFER_FAIL,
      payload: err.response.data,
    });
  }
}

// Watcher
export function* watchBankTransferSubmit() {
  while (true) {
    const actionObject = yield take(actionTypes.REQUEST_SUBMIT_BANK_TRANSFER_INITIAL);
    yield fork(
      BankTransferSubmit,
      actionObject.payload.sessionTimeoutDispatcher,
      actionObject.payload.updateTokenDispatcher,
      actionObject.payload.currentUser,
      actionObject.payload.transferAmount,
      actionObject.payload.transferDate,
      actionObject.payload.transferTime,
      actionObject.payload.transferReferenceNumber,
    );
  }
}


export default [
  fork(watchCreatePaymentToken),
  fork(watchLoadTopupPriceList),
  fork(watchBankTransferSubmit),
  fork(watchLoadWithdrawRateList),
];
