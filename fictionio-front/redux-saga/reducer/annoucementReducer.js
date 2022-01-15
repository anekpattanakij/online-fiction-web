import { actionTypes } from '../action';

export class AnnoucementState {
  annoucementList = [];
  errorList = [];
  loading = false;
  lastRefresh;
}

export default (state = new AnnoucementState(), action) => {
  switch (action.type) {
    case actionTypes.REQUEST_ANNOUCEMENT_INITIAL:
      return {
        ...state,
        annoucementList: [],
        loading: true,
        errorList: [],
        lastRefresh: null,
      };

    case actionTypes.REQUEST_ANNOUCEMENT_SUCCESS:
      return {
        ...state,
        annoucementList: action.payload.annoucementList,
        loading: false,
        errorList: [],
        lastRefresh: new Date(),
      };

    case actionTypes.REQUEST_ANNOUCEMENT_FAIL:
      return {
        ...state,
        annoucementList: [],
        errorList: action.payload.data,
        loading: false,
        lastRefresh: null,
      };

    default:
      return state;
  }
};
