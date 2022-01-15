export const searchActionTypes = {
  REQUEST_SEARCH_REQUEST: 'REQUEST_SEARCH_REQUEST',
};

// Action for dispath

export const searchFiction = searchText => {
  return {
    type: searchActionTypes.REQUEST_SEARCH_REQUEST,
    payload: { searchText },
  };
};
