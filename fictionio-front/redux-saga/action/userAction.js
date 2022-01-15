export const userProfileActionTypes = {
  FAILURE: 'FAILURE',
  LOAD_DATA: 'LOAD_DATA',
  LOAD_DATA_SUCCESS: 'LOAD_DATA_SUCCESS',
  UPDATE_ACCESS_TOKEN: 'UPDATE_ACCESS_TOKEN',

  SESSION_TIMEOUT: 'SESSION_TIMEOUT',
  RESET_SESSION_TIMEOUT: 'RESET_SESSION_TIMEOUT',

  LOGIN_INITIAL: 'LOGIN_INITIAL',
  LOGIN_REQUESTING: 'LOGIN_REQUESTING',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',

  GOOGLE_LOGIN_INITIAL: 'GOOGLE_LOGIN_INITIAL',
  GOOGLE_LOGIN_REQUESTING: 'GOOGLE_LOGIN_REQUESTING',
  GOOGLE_LOGIN_SUCCESS: 'GOOGLE_LOGIN_SUCCESS',
  GOOGLE_LOGIN_FAILURE: 'GOOGLE_LOGIN_FAILURE',

  FACEBOOK_LOGIN_INITIAL: 'FACEBOOK_LOGIN_INITIAL',
  FACEBOOK_LOGIN_REQUESTING: 'FACEBOOK_LOGIN_REQUESTING',
  FACEBOOK_LOGIN_SUCCESS: 'FACEBOOK_LOGIN_SUCCESS',
  FACEBOOK_LOGIN_FAILURE: 'FACEBOOK_LOGIN_FAILURE',

  LOGOUT_INITIAL: 'LOGOUT_INITIAL',
  LOGOUT_REQUESTING: 'LOGOUT_REQUESTING',
  LOGOUT_SUCCESS: 'LOGOUT_SUCCESS',
  LOGOUT_FAILURE: 'LOGOUT_FAILURE',
  RESET_LOGOUT: 'RESET_LOGOUT',

  REGISTER_INITIAL: 'REGISTER_INITIAL',
  REGISTER_REQUESTING: 'REGISTER_REQUESTING',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS',
  REGISTER_FAILURE: 'REGISTER_FAILURE',

  GOOGLE_REGISTER_INITIAL: 'GOOGLE_REGISTER_INITIAL',
  GOOGLE_REGISTER_REQUESTING: 'GOOGLE_REGISTER_REQUESTING',
  GOOGLE_REGISTER_SUCCESS: 'GOOGLE_REGISTER_SUCCESS',
  GOOGLE_REGISTER_FAILURE: 'GOOGLE_REGISTER_FAILURE',

  FACEBOOK_REGISTER_INITIAL: 'FACEBOOK_REGISTER_INITIAL',
  FACEBOOK_REGISTER_REQUESTING: 'FACEBOOK_REGISTER_REQUESTING',
  FACEBOOK_REGISTER_SUCCESS: 'FACEBOOK_REGISTER_SUCCESS',
  FACEBOOK_REGISTER_FAILURE: 'FACEBOOK_REGISTER_FAILURE',

  UPDATE_PROFILE_INITIAL: 'UPDATE_PROFILE_INITIAL',
  UPDATE_PROFILE_REQUESTING: 'UPDATE_PROFILE_REQUESTING',
  UPDATE_PROFILE_SUCCESS: 'UPDATE_PROFILE_SUCCESS',
  UPDATE_PROFILE_FAILURE: 'UPDATE_PROFILE_FAILURE',

  CHANGE_PASSWORD_INITIAL: 'CHANGE_PASSWORD_INITIAL',
  CHANGE_PASSWORD_REQUESTING: 'CHANGE_PASSWORD_REQUESTING',
  CHANGE_PASSWORD_SUCCESS: 'CHANGE_PASSWORD_SUCCESS',
  CHANGE_PASSWORD_FAILURE: 'CHANGE_PASSWORD_FAILURE',

  RESET_PASSWORD_INITIAL: 'RESET_PASSWORD_INITIAL',
  RESET_PASSWORD_REQUESTING: 'RESET_PASSWORD_REQUESTING',
  RESET_PASSWORD_SUCCESS: 'RESET_PASSWORD_SUCCESS',
  RESET_PASSWORD_FAILURE: 'RESET_PASSWORD_FAILURE',

  SET_NEW_PASSWORD_FROM_RESET_INITIAL: 'SET_NEW_PASSWORD_FROM_RESET_INITIAL',
  SET_NEW_PASSWORD_FROM_RESET__REQUESTING: 'SET_NEW_PASSWORD_FROM_RESET__REQUESTING',
  SET_NEW_PASSWORD_FROM_RESET_SUCCESS: 'SET_NEW_PASSWORD_FROM_RESET_SUCCESS',
  SET_NEW_PASSWORD_FROM_RESET_FAILURE: 'SET_NEW_PASSWORD_FROM_RESET_FAILURE',

  RESET_CURRENT_USER_ACTION: 'RESET_CURRENT_USER_ACTION',

  UPDATE_CURRENT_USER_COIN_ACTION: 'UPDATE_CURRENT_USER_COIN_ACTION',

  REDUCE_COIN_AFTER_PURCHASED: 'REDUCE_COIN_AFTER_PURCHASED',
};

// Action for dispath

export const signup = (email, password, displayName, dateOfBirth, recaptchaToken) => {
  return {
    type: userProfileActionTypes.REGISTER_INITIAL,
    payload: { email, password, displayName, dateOfBirth, recaptchaToken },
  };
};

export const signupByGoogle = accessToken => {
  return {
    type: userProfileActionTypes.GOOGLE_REGISTER_INITIAL,
    payload: { accessToken },
  };
};

export const signupByFacebook = accessToken => {
  return {
    type: userProfileActionTypes.FACEBOOK_REGISTER_INITIAL,
    payload: { accessToken },
  };
};

export const login = (email, password, recaptchaToken) => {
  return {
    type: userProfileActionTypes.LOGIN_INITIAL,
    payload: { email, password, recaptchaToken },
  };
};

export const loginByGoogle = accessToken => {
  return {
    type: userProfileActionTypes.GOOGLE_LOGIN_INITIAL,
    payload: { accessToken },
  };
};

export const loginByFacebook = accessToken => {
  return {
    type: userProfileActionTypes.FACEBOOK_LOGIN_INITIAL,
    payload: { accessToken },
  };
};

export const logout = (cif, refreshToken) => {
  return {
    type: userProfileActionTypes.LOGOUT_REQUESTING,
    payload: { cif, refreshToken },
  };
};

export const resetLogout = () => {
  return {
    type: userProfileActionTypes.RESET_LOGOUT,
  };
};

export const sessionTimeout = () => {
  return {
    type: userProfileActionTypes.SESSION_TIMEOUT,
  };
};

export const resetSessionTimeout = () => {
  return {
    type: userProfileActionTypes.RESET_SESSION_TIMEOUT,
  };
};

export const updateAccessToken = accessToken => {
  return {
    type: userProfileActionTypes.UPDATE_ACCESS_TOKEN,
    payload: accessToken,
  };
};

export const updateProfile = (sessionTimeoutDispatcher, updateTokenDispatcher, user) => {
  return {
    type: userProfileActionTypes.UPDATE_PROFILE_INITIAL,
    payload: {
      sessionTimeoutDispatcher,
      updateTokenDispatcher,
      user,
    },
  };
};

export const updateProfileRequesting = () => {
  return {
    type: userProfileActionTypes.UPDATE_PROFILE_REQUESTING,
  };
};

export const resetCurrentUserAction = () => {
  return {
    type: userProfileActionTypes.RESET_CURRENT_USER_ACTION,
  };
};

export const changePassword = (sessionTimeoutDispatcher, updateTokenDispatcher, currentUser, currentPassword, newPassword) => {
  return {
    type: userProfileActionTypes.CHANGE_PASSWORD_INITIAL,
    payload: {
      sessionTimeoutDispatcher,
      updateTokenDispatcher,
      currentUser,
      currentPassword,
      newPassword,
    },
  };
};

export const resetPassword = (email, langauge) => {
  return {
    type: userProfileActionTypes.RESET_PASSWORD_INITIAL,
    payload: {
      email,
      langauge,
    },
  };
};

export const setPasswordFromReset = (email, password, resetToken) => {
  return {
    type: userProfileActionTypes.SET_NEW_PASSWORD_FROM_RESET_INITIAL,
    payload: {
      email,
      password,
      resetToken,
    },
  };
};
