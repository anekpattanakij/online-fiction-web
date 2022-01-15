export const chapterActionTypes = {
  REQUEST_CREATE_NEW_CHAPTER_INITIAL: 'REQUEST_CREATE_NEW_CHAPTER_INITIAL',
  REQUEST_CREATE_NEW_CHAPTER_SUCCESS: 'REQUEST_CREATE_NEW_CHAPTER_SUCCESS',
  REQUEST_CREATE_NEW_CHAPTER_FAIL: 'REQUEST_CREATE_NEW_CHAPTER_FAIL',
  REQUEST_PUBLISH_CHAPTER_INITIAL: 'REQUEST_PUBLISH_CHAPTER_INITIAL',
  REQUEST_PUBLISH_CHAPTER_SUCCESS: 'REQUEST_PUBLISH_CHAPTER_SUCCESS',
  REQUEST_PUBLISH_CHAPTER_FAIL: 'REQUEST_PUBLISH_CHAPTER_FAIL',
  REQUEST_PURCHASE_CHAPTER_INITIAL: 'REQUEST_PURCHASE_CHAPTER_INITIAL',
  REQUEST_PURCHASE_CHAPTER_SUCCESS: 'REQUEST_PURCHASE_CHAPTER_SUCCESS',
  REQUEST_PURCHASE_CHAPTER_FAIL: 'REQUEST_PURCHASE_CHAPTER_FAIL',
  REQUEST_LOAD_CHAPTER_LIST_INITIAL: 'REQUEST_LOAD_CHAPTER_LIST_INITIAL',
  REQUEST_LOAD_CHAPTER_LIST_SUCCESS: 'REQUEST_LOAD_CHAPTER_LIST_SUCCESS',
  REQUEST_LOAD_CHAPTER_LIST_FAIL: 'REQUEST_LOAD_CHAPTER_LIST_FAIL',
  REQUEST_RESET_CURRENT_CHAPTER: 'REQUEST_RESET_CURRENT_CHAPTER',
  REQUEST_LOAD_CHAPTER_INITIAL: 'REQUEST_LOAD_CHAPTER_INITIAL',
  REQUEST_LOAD_CHAPTER_SUCCESS: 'REQUEST_LOAD_CHAPTER_SUCCESS',
  REQUEST_LOAD_CHAPTER_FAIL: 'REQUEST_LOAD_CHAPTER_FAIL',
  REQUEST_UPDATE_CHAPTER_INITIAL: 'REQUEST_UPDATE_CHAPTER_INITIAL',
  REQUEST_UPDATE_CHAPTER_SUCCESS: 'REQUEST_UPDATE_CHAPTER_SUCCESS',
  REQUEST_UPDATE_CHAPTER_FAIL: 'REQUEST_UPDATE_CHAPTER_FAIL',
  REQUEST_RATING_CHAPTER_INITIAL: 'REQUEST_RATING_CHAPTER_INITIAL',
  REQUEST_RATING_CHAPTER_SUCCESS: 'REQUEST_RATING_CHAPTER_SUCCESS',
  REQUEST_RATING_CHAPTER_FAIL: 'REQUEST_RATING_CHAPTER_FAIL',
  REQUEST_TRANSLATE_NEW_CHAPTER: 'REQUEST_TRANSLATE_NEW_CHAPTER',
  REQUEST_TRANSLATE_NEW_CHAPTER_INITIAL: 'REQUEST_TRANSLATE_NEW_CHAPTER_INITIAL',
  REQUEST_TRANSLATE_NEW_CHAPTER_SUCCESS: 'REQUEST_TRANSLATE_NEW_CHAPTER_SUCCESS',
  REQUEST_TRANSLATE_NEW_CHAPTER_FAIL: 'REQUEST_TRANSLATE_NEW_CHAPTER_FAIL',
};

// Action for dispath

export const editCurrentChapter = () => {
  return {
    type: chapterActionTypes.REQUEST_ENTER_EDIT_CHAPTER_INITIAL,
  };
};

export const saveUpdateChapter = (sessionTimeoutDispatcher, updateTokenDispatcher, currentUser, inputChapter) => {
  return {
    type: chapterActionTypes.REQUEST_UPDATE_CHAPTER_INITIAL,
    payload: {
      sessionTimeoutDispatcher,
      updateTokenDispatcher,
      currentUser,
      inputChapter,
    },
  };
};

export const resetCurrentChapter = () => {
  return {
    type: chapterActionTypes.REQUEST_RESET_CURRENT_CHAPTER,
  };
};

export const loadChapterList = (fictionId, language, sessionTimeoutDispatcher, updateTokenDispatcher, currentUser) => {
  return {
    type: chapterActionTypes.REQUEST_LOAD_CHAPTER_LIST_INITIAL,
    payload: {
      fictionId,
      language,
      sessionTimeoutDispatcher,
      updateTokenDispatcher,
      currentUser,
    },
  };
};

export const translateChapter = language => {
  return {
    type: chapterActionTypes.REQUEST_TRANSLATE_NEW_CHAPTER,
    payload: { language },
  };
};

export const saveTranslateChapter = (sessionTimeoutDispatcher, updateTokenDispatcher, currentUser, inputChapter) => {
  return {
    type: chapterActionTypes.REQUEST_TRANSLATE_NEW_CHAPTER_INITIAL,
    payload: {
      sessionTimeoutDispatcher,
      updateTokenDispatcher,
      currentUser,
      inputChapter,
    },
  };
};

export const loadChapter = (chapterId, sessionTimeoutDispatcher, updateTokenDispatcher, currentUser) => {
  return {
    type: chapterActionTypes.REQUEST_LOAD_CHAPTER_INITIAL,
    payload: {
      chapterId,
      sessionTimeoutDispatcher,
      updateTokenDispatcher,
      currentUser,
    },
  };
};

export const saveNewChapter = (sessionTimeoutDispatcher, updateTokenDispatcher, currentUser, inputChapter) => {
  return {
    type: chapterActionTypes.REQUEST_CREATE_NEW_CHAPTER_INITIAL,
    payload: {
      sessionTimeoutDispatcher,
      updateTokenDispatcher,
      currentUser,
      inputChapter,
    },
  };
};

export const publishChapter = (sessionTimeoutDispatcher, updateTokenDispatcher, currentUser, chapterId) => {
  return {
    type: chapterActionTypes.REQUEST_PUBLISH_CHAPTER_INITIAL,
    payload: {
      sessionTimeoutDispatcher,
      updateTokenDispatcher,
      currentUser,
      chapterId,
    },
  };
};

export const purchaseChapter = (sessionTimeoutDispatcher, updateTokenDispatcher, currentUser, chapterId) => {
  return {
    type: chapterActionTypes.REQUEST_PURCHASE_CHAPTER_INITIAL,
    payload: {
      sessionTimeoutDispatcher,
      updateTokenDispatcher,
      currentUser,
      chapterId,
    },
  };
};

export const rateChapter = (sessionTimeoutDispatcher, updateTokenDispatcher, currentUser, inputChapterId, rate) => {
  return {
    type: chapterActionTypes.REQUEST_RATING_CHAPTER_INITIAL,
    payload: {
      sessionTimeoutDispatcher,
      updateTokenDispatcher,
      currentUser,
      chapterId: inputChapterId,
      rate,
    },
  };
};
