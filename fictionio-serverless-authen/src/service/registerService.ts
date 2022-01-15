import axios from 'axios';
import { sha3_512 } from 'js-sha3';
import * as validator from 'validator';
import {
  Error,
  ERROR_CODE_INVALID_INPUT,
  ERROR_CODE_DATABASE_CONNECTION,
  ERROR_CODE_NETWORK_ERROR,
  ERROR_CODE_RECAPTCHA_INCORRECT,
  ERROR_CODE_USER_DUPLICATE_EMAIL,
} from '../common/error';
import {
  HTTP_REQUEST_SUCCESS,
  ResponseRequest,
} from '../common/responseRequest';
import { User } from '../common/user';
import { enumChannel, UserDataFromSso } from '../common/userFromSso';
import { Config } from '../config/index';
import { UserUtil } from '../dataLayer/userUtil';
import { responseTransform } from '../util/returnResponseUtil';

export const registerNewUser = async (request, response) => {
  try {
    let inputObject: any;
    let errorProcessing: Error;
    inputObject = request.body;
    if (
      !inputObject.email ||
      !validator.isEmail(inputObject.email) ||
      !inputObject.password ||
      validator.isEmpty(inputObject.password) ||
      !inputObject.displayName ||
      validator.isEmpty(inputObject.displayName)
    ) {
      throw new Error(ERROR_CODE_INVALID_INPUT, 'Invalid input');
    }
    //verify recaptchaToken

    if (
      !inputObject.recaptchaToken ||
      validator.isEmpty(inputObject.recaptchaToken)
    ) {
      throw new Error(ERROR_CODE_INVALID_INPUT, 'Invalid input');
    }
    const botCheckingResult = await axios.post(
      'https://www.google.com/recaptcha/api/siteverify?secret=' +
        Config.GOOGLE_RECAPTCHA_KEY +
        '&response=' +
        inputObject.recaptchaToken,
      {},
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
        },
      },
    );
    if (
      !(
        botCheckingResult &&
        botCheckingResult.data &&
        botCheckingResult.data.success
      )
    ) {
      throw new Error(
        ERROR_CODE_RECAPTCHA_INCORRECT,
        'Error on verify recaptcha code',
      );
    } else {
      if (
        botCheckingResult.data.score <
        Config.RECAPTCHA_LOGIN_REGISTER_MINIMUM_SCORE
      ) {
        throw new Error(
          ERROR_CODE_RECAPTCHA_INCORRECT,
          'Error on verify recaptcha code',
        );
      }
    }

    const inputNewUser: User = new User({
      displayName: inputObject.displayName,
      email: inputObject.email,
      password: sha3_512(Config.PASSWORD_SALT + inputObject.password),
      usertype: 1,
      coin: 0,
    });
    // Save user to database
    const checkExistingUser: User = await UserUtil.getUser(
      inputNewUser.email,
    ).catch(error => {
      errorProcessing = new Error(
        ERROR_CODE_DATABASE_CONNECTION,
        JSON.stringify(error),
      );
      return null;
    });
    if (errorProcessing) {
      throw errorProcessing;
    }
    // If duplicate user return error
    let resultUser: User;
    if (checkExistingUser) {
      throw new Error(
        ERROR_CODE_USER_DUPLICATE_EMAIL,
        'this user already exist',
      );
    } else {
      inputNewUser.stampNewRefreshToken();
      let errorSaveNewUser: Error = null;
      resultUser = await UserUtil.saveUser(inputNewUser).catch(error => {
        errorSaveNewUser = new Error(
          ERROR_CODE_DATABASE_CONNECTION,
          JSON.stringify(error),
        );
        return null;
      });
      if (errorSaveNewUser) {
        throw errorSaveNewUser;
      }
    }
    resultUser.registerDate = new Date();
    // if pass all, put success response
    response.statusCode = HTTP_REQUEST_SUCCESS;
    resultUser.generateAccessToken();
    responseTransform(response, false, {
      user: resultUser.toPlainObject(),
    });
  } catch (error) {
    responseTransform(response, true, error);
  }
  return response;
};

export const googleRegister = async (request, response) => {
  let inputObject: any;
  inputObject = request.body;
  try {
    if (
      !inputObject.accessToken ||
      validator.isEmpty(inputObject.accessToken)
    ) {
      throw new Error(ERROR_CODE_INVALID_INPUT, 'Invalid input');
    }

    const returnProfile = await axios.get(
      'https://www.googleapis.com/oauth2/v3/userinfo?access_token=' +
        inputObject.accessToken,
      {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      },
    );
    let returnUserFromSocial: UserDataFromSso;
    if (
      returnProfile &&
      returnProfile.data &&
      returnProfile.data.email &&
      returnProfile.data.sub
    ) {
      returnUserFromSocial = new UserDataFromSso();
      returnUserFromSocial.channel = enumChannel.CHANNEL_GOOGLE;
      returnUserFromSocial.email = returnProfile.data.email;
      returnUserFromSocial.socialId = returnProfile.data.sub;
      returnUserFromSocial.displayName = returnProfile.data.name;
      returnUserFromSocial.firstName = returnProfile.data.given_name;
      returnUserFromSocial.lastName = returnProfile.data.family_name;
      returnUserFromSocial.gender =
        returnProfile.data.gender === 'male'
          ? 'M'
          : returnProfile.data.gender === 'female'
          ? 'F'
          : '';
    } else {
      throw new Error(ERROR_CODE_NETWORK_ERROR, 'Network Error');
    }
    const getUser = await processUserFromSso(returnUserFromSocial);
    response.statusCode = HTTP_REQUEST_SUCCESS;
    // return user information
    getUser.generateAccessToken();
    responseTransform(response, false, {
      user: getUser.toPlainObject(),
    });
  } catch (error) {
    responseTransform(response, true, error);
  }
  return response;
};

export const facebookRegister = async (request, response) => {
  let inputObject: any;
  inputObject = request.body;
  try {
    if (
      !inputObject.accessToken ||
      validator.isEmpty(inputObject.accessToken)
    ) {
      throw new Error(ERROR_CODE_INVALID_INPUT, 'Invalid input');
    }
    const returnProfile = await axios
      .get(
        'https://graph.facebook.com/v3.1/me?fields=id%2Cname%2Cemail%2Cfirst_name%2Clast_name&access_token=' +
          inputObject.accessToken,
        {
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
          },
        },
      )
      .then(returnResult => {
        if (returnResult.data) {
          return returnResult.data;
        } else {
          throw new Error(ERROR_CODE_NETWORK_ERROR, 'Network Error');
        }
      })
      .catch(error => {
        responseTransform(
          response,
          true,
          new Error(ERROR_CODE_NETWORK_ERROR, 'Network Error'),
        );
      });
    let returnUserFromSocial: UserDataFromSso;
    if (returnProfile && returnProfile.email && returnProfile.id) {
      returnUserFromSocial = new UserDataFromSso();
      returnUserFromSocial.channel = enumChannel.CHANNEL_FACEBOOK;
      returnUserFromSocial.email = returnProfile.email;
      returnUserFromSocial.socialId = returnProfile.id;
      returnUserFromSocial.displayName = returnProfile.name;
      returnUserFromSocial.firstName = returnProfile.first_name;
      returnUserFromSocial.lastName = returnProfile.last_name;
    } else {
      throw new Error(ERROR_CODE_NETWORK_ERROR, 'Network Error');
    }
    const getUser = await processUserFromSso(returnUserFromSocial);
    response.statusCode = HTTP_REQUEST_SUCCESS;
    // return user information
    getUser.generateAccessToken();
    responseTransform(response, false, {
      user: getUser.toPlainObject(),
    });
  } catch (error) {
    responseTransform(response, true, error);
  }
  return response;
};

const processUserFromSso = async (inputUser: UserDataFromSso) => {
  // store token in as session
  let getUser: User = await UserUtil.getUser(
    inputUser.email,
    null,
    enumChannel.CHANNEL_GOOGLE === inputUser.channel
      ? inputUser.socialId
      : null,
    enumChannel.CHANNEL_FACEBOOK === inputUser.channel
      ? inputUser.socialId
      : null,
  ).catch(error => {
    throw new Error(ERROR_CODE_DATABASE_CONNECTION, JSON.stringify(error));
  });
  if (getUser === null) {
    getUser = await UserUtil.getUser(inputUser.email, null, null, null).catch(
      error => {
        throw new Error(ERROR_CODE_DATABASE_CONNECTION, JSON.stringify(error));
      },
    );
  }
  if (getUser && !getUser.googleUid && !getUser.facebookUid) {
    UserUtil.updateSocialId(
      getUser.cif,
      enumChannel.CHANNEL_GOOGLE === inputUser.channel
        ? inputUser.socialId
        : null,
      enumChannel.CHANNEL_FACEBOOK === inputUser.channel
        ? inputUser.socialId
        : null,
    );
  }

  // TODO If no found existing user - create new user automatically.
  if (getUser === null) {
    const inputNewUser: User = new User({
      displayName: inputUser.displayName,
      email: inputUser.email,
      firstName: inputUser.firstName,
      lastName: inputUser.lastName,
      password: '',
      usertype: 1,
      coin: 0,
      dateOfBirth: inputUser.dataOfBirth ? inputUser.dataOfBirth : null,
      googleUid:
        enumChannel.CHANNEL_GOOGLE === inputUser.channel
          ? inputUser.socialId
          : null,
      facebookUid:
        enumChannel.CHANNEL_FACEBOOK === inputUser.channel
          ? inputUser.socialId
          : null,
      withDrawableCoin: 0,
      totalIncomeAsAuthor: 0,
      totalIncomeFromTranslated: 0,
      publishedChapterCount: 0,
      publishedFictionCount: 0,
    });
    inputNewUser.stampNewRefreshToken();
    await UserUtil.saveUser(inputNewUser).catch(error => {
      throw new Error(ERROR_CODE_DATABASE_CONNECTION, JSON.stringify(error));
    });

    getUser = inputNewUser;
  } else {
    // Stamp last login date and refresh token
    getUser.stampNewRefreshToken();
    await UserUtil.updateRefreshTokenAndLastLogin(
      getUser.cif,
      getUser.refreshToken,
    ).catch(error => {
      throw new Error(ERROR_CODE_DATABASE_CONNECTION, JSON.stringify(error));
    });
  }
  return getUser;
};
