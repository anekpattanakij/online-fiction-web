/* eslint-disable no-case-declarations */
import { actionTypes } from '../action';
import { FICTION_STATUS } from '../../config/fictionStatusList';

const setInitializeChapter = () => {
  return {};
};

export class ChapterState {
  currentChapter = setInitializeChapter();
  chapterList = new Array();
  errorList = [];
  loading = false;
  loadFromFictionId = null;
  chapterListloading = false;
  loadChapterFail = false;
  editChapter = false;
  translateToLanguage = null;
  saveOrEditChapterResult = null;
  loadingRate = false;
  rateChapterResult = false;
  loadingPublish = false;
  publishChapterResult = false;
}

export default (state = new ChapterState(), action) => {
  switch (action.type) {
    case actionTypes.REQUEST_LOAD_CHAPTER_INITIAL:
    case actionTypes.REQUEST_LOAD_CHAPTER_LIST_INITIAL:
      return {
        ...state,
        errorList: [],
        currentChapter: null,
        loadChapterFail: false,
        loadFromFictionId: '',
        loading: true,
        chapterList: null,
        saveOrEditChapterResult: '',
      };

    case actionTypes.REQUEST_LOAD_CHAPTER_SUCCESS:
      return {
        ...state,
        errorList: [],
        currentChapter: action.payload.chapter,
        loadChapterFail: false,
        loading: false,
      };

    case actionTypes.REQUEST_LOAD_CHAPTER_FAIL:
      return {
        ...state,
        errorList: [action.payload.error],
        loadChapterFail: true,
        loading: false,
        chapterList: null,
      };

    case actionTypes.REQUEST_CREATE_NEW_CHAPTER_SUCCESS:
      return {
        ...state,
        loading: false,
        loadChapterFail: false,
        errorList: [],
        saveOrEditChapterResult: action.payload,
      };

    case actionTypes.REQUEST_CREATE_NEW_CHAPTER_FAIL:
      return {
        ...state,
        errorList: [action.payload],
        loading: false,
        chapterList: null,
      };

    case actionTypes.REQUEST_TRANSLATE_NEW_CHAPTER_SUCCESS:
      return {
        ...state,
        errorList: [],
        loading: false,
        saveOrEditChapterResult: action.payload,
      };

    case actionTypes.REQUEST_TRANSLATE_NEW_CHAPTER_FAIL:
      return {
        ...state,
        errorList: [action.payload],
        loading: false,
      };

    case actionTypes.REQUEST_UPDATE_CHAPTER_SUCCESS:
      return {
        ...state,
        errorList: [],
        loading: false,
        saveOrEditChapterResult: action.payload,
      };

    case actionTypes.REQUEST_UPDATE_CHAPTER_FAIL:
      return {
        ...state,
        errorList: [action.payload],
        loading: false,
      };

    case actionTypes.REQUEST_LOAD_CHAPTER_LIST_SUCCESS:
      return {
        ...state,
        loading: false,
        loadChapterFail: false,
        errorList: [],
        chapterList: action.payload.chapterList,
        loadFromFictionId: action.payload.fictionId,
      };

    case actionTypes.REQUEST_LOAD_CHAPTER_LIST_FAIL:
      return {
        ...state,
        errorList: [action.payload],
        loading: false,
        chapterList: null,
        loadChapterFail: true,
      };
    case actionTypes.REQUEST_RATING_CHAPTER_INITIAL:
      return {
        ...state,
        errorList: [],
        loadingRate: true,
        rateChapterResult: false,
      };

    case actionTypes.REQUEST_RATING_CHAPTER_SUCCESS:
      return {
        ...state,
        loadingRate: false,
        rateChapterResult: action.payload,
      };
    case actionTypes.REQUEST_RATING_CHAPTER_FAIL:
      return {
        ...state,
        errorList: [action.payload],
        loadingRate: false,
        rateChapterResult: false,
      };
    case actionTypes.REQUEST_PURCHASE_CHAPTER_INITIAL:
      return {
        ...state,
        errorList: [],
        loading: true,
      };

    case actionTypes.REQUEST_PURCHASE_CHAPTER_SUCCESS:
      return {
        ...state,
        loading: false,
        chapter: action.payload,
      };
    case actionTypes.REQUEST_PURCHASE_CHAPTER_FAIL:
      return {
        ...state,
        errorList: [action.payload],
        loading: false,
      };

    case actionTypes.REQUEST_PUBLISH_CHAPTER_INITIAL:
      return {
        ...state,
        errorList: [],
        loadingPublish: true,
        publishChapterResult: false,
      };

    case actionTypes.REQUEST_PUBLISH_CHAPTER_SUCCESS:
      // eslint-disable-next-line no-case-declarations
      const publishedChapter = state.currentChapter;
      publishedChapter.status = FICTION_STATUS.PUBLISH;
      return {
        ...state,
        currentChapter: publishedChapter,
        loadingPublish: false,
        publishChapterResult: action.payload,
      };
    case actionTypes.REQUEST_PUBLISH_CHAPTER_FAIL:
      return {
        ...state,
        errorList: [action.payload],
        loadingPublish: false,
        publishChapterResult: false,
      };
    case actionTypes.REQUEST_RESET_CURRENT_CHAPTER:
      return {
        ...state,
        errorList: [],
        loadingPublish: false,
        publishChapterResult: false,
        saveOrEditChapterResult: false,
      };

    default:
      return state;
  }
};
