export const fictionActionTypes = {
  REQUEST_LOAD_FICTION_INITIAL: 'REQUEST_LOAD_FICTION_INITIAL',
  REQUEST_LOAD_FICTION_SUCCESS: 'REQUEST_LOAD_FICTION_SUCCESS',
  REQUEST_LOAD_FICTION_FAIL: 'REQUEST_LOAD_FICTION_FAIL',
  REQUEST_CREATE_NEW_FICTION_INITIAL: 'REQUEST_CREATE_NEW_FICTION_INITIAL',
  REQUEST_CREATE_NEW_FICTION_SUCCESS: 'REQUEST_CREATE_NEW_FICTION_SUCCESS',
  REQUEST_CREATE_NEW_FICTION_FAIL: 'REQUEST_CREATE_NEW_FICTION_FAIL',
  REQUEST_UPDATE_FICTON_INITIAL: 'REQUEST_UPDATE_FICTON_INITIAL',
  REQUEST_UPDATE_FICTON_SUCCESS: 'REQUEST_UPDATE_FICTON_SUCCESS',
  REQUEST_UPDATE_FICTON_FAIL: 'REQUEST_UPDATE_FICTON_FAIL',
  REQUEST_TRANSLATE_FICTION_INITIAL: 'REQUEST_TRANSLATE_FICTION_INITIAL',
  REQUEST_TRANSLATE_FICTION_SUCCESS: 'REQUEST_TRANSLATE_FICTION_SUCCESS',
  REQUEST_TRANSLATE_FICTION_FAIL: 'REQUEST_TRANSLATE_FICTION_FAIL',
  REQUEST_RATE_FICTION_INITIAL: 'REQUEST_RATE_FICTION_INITIAL',
  REQUEST_RATE_FICTION_SUCCESS: 'REQUEST_RATE_FICTION_SUCCESS',
  REQUEST_RATE_FICTION_FAIL: 'REQUEST_RATE_FICTION_FAIL',
  REQUEST_CHANGE_STATUS_FICTION_INITIAL: 'REQUEST_CHANGE_STATUS_FICTION_INITIAL',
  REQUEST_CHANGE_STATUS_FICTION_SUCCESS: 'REQUEST_CHANGE_STATUS_FICTION_SUCCESS',
  REQUEST_CHANGE_STATUS_FICTION_FAIL: 'REQUEST_CHANGE_STATUS_FICTION_FAIL',
  REQUEST_RESET_CURRENT_FICTION: 'REQUEST_RESET_CURRENT_FICTION',
};

// Action for dispath


export const resetCurrentFiction = () => {
  return {
    type: fictionActionTypes.REQUEST_RESET_CURRENT_FICTION,
  };
};

export const loadFiction = fictionId => {
  return {
    type: fictionActionTypes.REQUEST_LOAD_FICTION_INITIAL,
    payload: {
      fictionId,
    },
  };
};

export const saveNewFiction = (sessionTimeoutDispatcher, updateTokenDispatcher, currentUser, inputFiction) => {
  return {
    type: fictionActionTypes.REQUEST_CREATE_NEW_FICTION_INITIAL,
    payload: {
      sessionTimeoutDispatcher,
      updateTokenDispatcher,
      currentUser,
      inputFiction,
    },
  };
};

export const saveUpdateFiction = (sessionTimeoutDispatcher, updateTokenDispatcher, currentUser, inputFiction) => {
  return {
    type: fictionActionTypes.REQUEST_UPDATE_FICTON_INITIAL,
    payload: {
      sessionTimeoutDispatcher,
      updateTokenDispatcher,
      currentUser,
      inputFiction,
    },
  };
};

export const saveTranslateFiction = (sessionTimeoutDispatcher, updateTokenDispatcher, currentUser, inputFiction) => {
  return {
    type: fictionActionTypes.REQUEST_TRANSLATE_FICTION_INITIAL,
    payload: {
      sessionTimeoutDispatcher,
      updateTokenDispatcher,
      currentUser,
      inputFiction,
    },
  };
};

export const loadReduceChapterList = (fictionId, authorCif, language) => {
  return {
    type: fictionActionTypes.REQUEST_REDUCE_CHAPTER_LIST_INITIAL,
    payload: {
      fictionId,
      authorCif,
      language,
    },
  };
};

export const rateFiction = (sessionTimeoutDispatcher, updateTokenDispatcher, currentUser, fictionId, rate) => {
  return {
    type: fictionActionTypes.REQUEST_RATE_FICTION_INITIAL,
    payload: {
      sessionTimeoutDispatcher,
      updateTokenDispatcher,
      currentUser,
      fictionId,
      rate,
    },
  };
};

export const changeStatusFiction = (sessionTimeoutDispatcher, updateTokenDispatcher, currentUser, fictionId, newStatus) => {
  return {
    type: fictionActionTypes.REQUEST_CHANGE_STATUS_FICTION_INITIAL,
    payload: {
      sessionTimeoutDispatcher,
      updateTokenDispatcher,
      currentUser,
      fictionId,
      newStatus,
    },
  };
};
