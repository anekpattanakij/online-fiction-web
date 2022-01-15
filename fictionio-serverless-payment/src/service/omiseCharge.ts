import * as httpRequest from 'request';
import * as validator from 'validator';
import { authorizeService } from '../authService';
import {
  Error,
  ERROR_CODE_INVALID_INPUT,
  ERROR_CODE_MYSQL_CONNECTION,
  ERROR_CODE_NETWORK_ERROR,
} from '../common/error';
import { User } from '../common/user';
import { Config } from '../config/index';
import { PurchaseUtil } from '../dataLayer/purchaseUtil';
import { responseTransform } from '../util/returnResponseUtil';

const OMISE_API_URL_CHARGE = 'https://api.omise.co/charges';
const DECIMAL_TO_INT: number = 100;

export const chargeByToken = async (request, response) => {
  let inputObject: any;
  inputObject = request.body;
  try {
    if (
      !inputObject.amount ||
      !inputObject.currency ||
      validator.isEmpty(inputObject.currency) ||
      !inputObject.card ||
      validator.isEmpty(inputObject.card)
    ) {
      throw new Error(ERROR_CODE_INVALID_INPUT, 'Invalid input');
    }

    const responseFromAuthorizer = await authorizeService (request, response).catch(
      error => {
        throw error;
      },
    );
    const inputUser: User = new User();
    inputUser.assignValueFromJWT(
      JSON.parse(responseFromAuthorizer.body).resultFromJWT,
    );
    const formData = {
      amount: inputObject.amount,
      currency: inputObject.currency,
      card: inputObject.card,
    };
    const promiseRequest = new Promise((resolve, reject) => {
      httpRequest.post(
        {
          url: OMISE_API_URL_CHARGE,
          auth: {
            username: Config.OMISE_API_KEY,
            password: '',
          },
          formData,
        },
        async (err, httpResponse, body) => {
          if (err) {
            responseTransform(
              response,
              true,
              new Error(ERROR_CODE_NETWORK_ERROR, err),
            );
          } else {
            const returnResult = JSON.parse(body);
            if ('' + httpResponse.statusCode !== '200') {
              responseTransform(
                response,
                true,
                new Error(returnResult.code, returnResult.message),
              );
            } else {
              // charge successs
              const responseOmiseObject = JSON.parse(body);
              // topup to account
              const resultCreateNewPricing:
                | boolean
                | void = await PurchaseUtil.purchaseCoin(
                inputUser.cif,
                inputObject.amount / DECIMAL_TO_INT,
                inputObject.currency,
                responseOmiseObject.transaction,
              ).catch(error => {
                let returnError: Error;
                if (error instanceof Error) {
                  returnError = error;
                } else {
                  returnError = new Error(
                    ERROR_CODE_MYSQL_CONNECTION,
                    JSON.stringify(error),
                  );
                }
                responseTransform(response, true, returnError);
                reject(false);
              });
              responseTransform(response, false, { result: 'success' });
              resolve(true);
            }
          }
          return response;
        },
      );
    });
    await promiseRequest.then(() => {

    });

  } catch (error) {
    responseTransform(response, true, error);
    return response;
  }
};
