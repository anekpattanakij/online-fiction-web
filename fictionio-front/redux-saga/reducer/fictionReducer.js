/* eslint-disable no-case-declarations */
import { actionTypes } from '../action';

const setInitializeFiction = () => {
  return {};
};

export class FictionState {
  currentFiction = setInitializeFiction();
  fictionList = new Array();
  errorList = [];
  loading = false;
  saveOrEditFictionResult = '';
  loadingRate = false;
  rateFictionResult = false;
  loadingChangeStatus = false;
  changeStatusFictionResult = false;
  translateToLanguage = null;
}

export default (state = new FictionState(), action) => {
  switch (action.type) {
    case actionTypes.REQUEST_RESET_CURRENT_FICTION:
      return {
        ...state,
        errorList: [],
        currentFiction: null,
        loading: false,
        saveOrEditFictionResult: '',
      };
    case actionTypes.REQUEST_LOAD_FICTION_INITIAL:
      return {
        ...state,
        errorList: [],
        currentFiction: null,
        loading: true,
        saveOrEditFictionResult: '',
      };

    case actionTypes.REQUEST_LOAD_FICTION_SUCCESS:
      return {
        ...state,
        errorList: [],
        currentFiction: action.payload,
        loading: false,
      };

    case actionTypes.REQUEST_LOAD_FICTION_FAIL:
      return {
        ...state,
        errorList: [action.payload.error],
        currentFiction: {
          fictionId: action.payload.fictionId,
          language: action.payload.language,
        },
        loading: false,
      };

    case actionTypes.REQUEST_CREATE_NEW_FICTION_SUCCESS:
      return {
        ...state,
        loading: false,
        errorList: [],
        saveOrEditFictionResult: action.payload,
      };

    case actionTypes.REQUEST_CREATE_NEW_FICTION_FAIL:
      return {
        ...state,
        errorList: [action.payload],
        loading: false,
      };

    case actionTypes.REQUEST_UPDATE_FICTON_SUCCESS:
    case actionTypes.REQUEST_TRANSLATE_FICTION_SUCCESS:
      return {
        ...state,
        errorList: [],
        loading: false,
        saveOrEditFictionResult: action.payload,
      };

    case actionTypes.REQUEST_UPDATE_FICTON_FAIL:
    case actionTypes.REQUEST_TRANSLATE_FICTION_FAIL:
      return {
        ...state,
        errorList: [action.payload],
        loading: false,
      };

    case actionTypes.REQUEST_TRANSLATE_FICTON_SUCCESS:
      return {
        ...state,
        errorList: [],
        loading: false,
        saveOrEditFictionResult: action.payload,
      };

    case actionTypes.REQUEST_TRANSLATE_FICTON_FAIL:
      return {
        ...state,
        errorList: [action.payload],
        loading: false,
      };

    case actionTypes.REQUEST_RATE_FICTION_INITIAL:
      return {
        ...state,
        errorList: [],
        loadingRate: true,
        rateFictionResult: false,
      };

    case actionTypes.REQUEST_RATE_FICTION_SUCCESS:
      const changeRateFiction = state.currentFiction;
      changeRateFiction.rating = action.payload.rate;
      return {
        ...state,
        currentFiction: JSON.parse(JSON.stringify(changeRateFiction)),
        loadingRate: false,
        rateFictionResult: true,
      };
    case actionTypes.REQUEST_RATE_FICTION_FAIL:
      return {
        ...state,
        errorList: [action.payload],
        loadingRate: false,
        rateFictionResult: false,
      };

    case actionTypes.REQUEST_CHANGE_STATUS_FICTION_INITIAL:
      return {
        ...state,
        errorList: [],
        loadingChangeStatus: true,
        changeStatusFictionResult: false,
      };

    case actionTypes.REQUEST_CHANGE_STATUS_FICTION_SUCCESS:
      const changeStatusFiction = state.currentFiction;
      changeStatusFiction.status = action.payload.status;
      return {
        ...state,
        currentFiction: JSON.parse(JSON.stringify(changeStatusFiction)),
        loadingChangeStatus: false,
        changeStatusFictionResult: true,
      };
    case actionTypes.REQUEST_CHANGE_STATUS_FICTION_FAIL:
      return {
        ...state,
        errorList: [action.payload],
        loadingChangeStatus: false,
        changeStatusFictionResult: false,
      };

    default:
      return state;
  }
};
