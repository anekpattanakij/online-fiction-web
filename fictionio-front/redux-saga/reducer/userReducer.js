import { actionTypes } from '../action';
import User from '../../common/User';

const setInitializeUser = () => {
  return {};
};

export class UserState {
  user = setInitializeUser();
  errorList = [];
  loading = false;
  isSessionTimeout = false;
  isLoggingOut = false;
  currentActionSuccess = false;
  updateProfileSuccess = false;
  updateProfileErrorList = [];
  changePasswordSuccess = false;
  changePasswordErrorList = [];
}

export default (state = new UserState(), action) => {
  switch (action.type) {
    case actionTypes.REGISTER_INITIAL:
    case actionTypes.FACEBOOK_REGISTER_INITIAL:
    case actionTypes.GOOGLE_REGISTER_INITIAL:
    case actionTypes.LOGIN_INITIAL:
    case actionTypes.FACEBOOK_LOGIN_INITIAL:
    case actionTypes.GOOGLE_LOGIN_INITIAL:
      return {
        ...state,
        loading: true,
      };

    case actionTypes.REGISTER_SUCCESS:
    case actionTypes.FACEBOOK_REGISTER_SUCCESS:
    case actionTypes.GOOGLE_REGISTER_SUCCESS:
    case actionTypes.LOGIN_SUCCESS:
    case actionTypes.FACEBOOK_LOGIN_SUCCESS:
    case actionTypes.GOOGLE_LOGIN_SUCCESS:
      // eslint-disable-next-line no-case-declarations
      const returnUser = User.decodeUser(action.payload.user);
      returnUser.logonStatus = true;
      return {
        ...state,
        user: returnUser,
        loading: false,
        errorList: [],
        isSessionTimeout: false,
      };

    case actionTypes.RESET_CURRENT_USER_ACTION:
      return {
        ...state,
        loading: false,
        currentActionSuccess: false,
        errorList: [],
        updateProfileSuccess: false,
        changePasswordErrorList: [],
      };

    case actionTypes.CHANGE_PASSWORD_INITIAL:
    case actionTypes.RESET_PASSWORD_INITIAL:
      return {
        ...state,
        changePasswordErrorList: [],
        isSessionTimeout: false,
        loading: true,
        changePasswordSuccess: false,
      };

    case actionTypes.UPDATE_PROFILE_INITIAL:
      return {
        ...state,
        updateProfileErrorList: [],
        isSessionTimeout: false,
        loading: true,
        updateProfileSuccess: false,
      };

    case actionTypes.UPDATE_PROFILE_SUCCESS:
      // eslint-disable-next-line no-case-declarations
      const updateProfileUser = state.user;
      updateProfileUser.email = action.payload.email;
      updateProfileUser.preferredLanguage = action.payload.preferredLanguage;
      return {
        ...state,
        updateProfileErrorList: [],
        user: updateProfileUser,
        loading: false,
        updateProfileSuccess: true,
      };

    case actionTypes.UPDATE_PROFILE_FAILURE:
      return {
        ...state,
        updateProfileErrorList: [action.payload],
        loading: false,
        updateProfileSuccess: false,
      };

    case actionTypes.RESET_PASSWORD_SUCCESS:
    case actionTypes.SET_NEW_PASSWORD_FROM_RESET_SUCCESS:
      return {
        ...state,
        loading: false,
        currentActionSuccess: true,
      };

    case actionTypes.CHANGE_PASSWORD_SUCCESS:
      return {
        ...state,
        loading: false,
        changePasswordSuccess: true,
        changePasswordErrorList: [],
      };

    case actionTypes.REGISTER_FAILURE:
    case actionTypes.LOGIN_FAILURE:
    case actionTypes.RESET_PASSWORD_FAILURE:
    case actionTypes.SET_NEW_PASSWORD_FROM_RESET_FAILURE:
      return {
        ...state,
        errorList: [action.payload],
        loading: false,
        currentActionSuccess: false,
      };

    case actionTypes.CHANGE_PASSWORD_FAILURE:
      return {
        ...state,
        changePasswordErrorList: [action.payload],
        loading: false,
        changePasswordSuccess: false,
      };

    case actionTypes.FAILURE:
      return {
        ...state,
        errorList: [action.payload],
        loading: false,
      };

    case actionTypes.SESSION_TIMEOUT:
      return {
        ...state,
        user: null,
        errorList: [],
        loading: false,
        isSessionTimeout: true,
      };

    case actionTypes.RESET_SESSION_TIMEOUT:
    case actionTypes.RESET_LOGOUT:
      return {
        ...state,
        user: null,
        errorList: [],
        loading: false,
        isSessionTimeout: false,
        isLoggingOut: false,
      };

    case actionTypes.LOGOUT_SUCCESS:
    case actionTypes.LOGOUT_FAILURE:
      return {
        ...state,
        isLoggingOut: true,
        user: null,
        loading: false,
      };
    case actionTypes.UPDATE_ACCESS_TOKEN:
      // eslint-disable-next-line no-case-declarations
      const returnUserFromUpdateToken = state.user;
      returnUserFromUpdateToken.accessToken = action.payload;
      return {
        ...state,
        user: returnUserFromUpdateToken,
      };
    case actionTypes.REDUCE_COIN_AFTER_PURCHASED:
      // eslint-disable-next-line no-case-declarations
      const returnUserFromPurchased = state.user;
      returnUserFromPurchased.coin = returnUserFromPurchased.coin - (action.payload || 0);
      return {
        ...state,
        user: returnUserFromPurchased,
      };
    case actionTypes.UPDATE_CURRENT_USER_COIN_ACTION:
      // eslint-disable-next-line no-case-declarations
      const currentUser = state.user;
      // eslint-disable-next-line no-case-declarations
      const addCoin = action.payload;
      currentUser.coin = currentUser.coin + addCoin;
      return {
        ...state,
        user: currentUser,
      };
    default:
      return state;
  }
};
