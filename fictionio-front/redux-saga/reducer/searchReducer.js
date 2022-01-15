import { actionTypes } from '../action';

export class SearchState {
  searchText = null;
}

export default (state = new SearchState(), action) => {
  switch (action.type) {
    case actionTypes.REQUEST_SEARCH_REQUEST:
      return {
        ...state,
        searchText: action.payload.searchText,
      };

    default:
      return state;
  }
};
