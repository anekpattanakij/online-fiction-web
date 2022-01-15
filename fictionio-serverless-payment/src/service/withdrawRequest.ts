import { chargeByToken } from './omiseCharge';
import * as validator from 'validator';
import { authorizeService } from '../authService';
import { WithdrawRequestTransaction } from '../common/withdrawRequest';
import {
  Error,
  ERROR_CODE_INVALID_INPUT,
  ERROR_CODE_MYSQL_CONNECTION,
} from '../common/error';
import { User } from '../common/user';
import { WithdrawRequestUtil } from '../dataLayer/withdrawRequestUtil';
import { responseTransform } from '../util/returnResponseUtil';

export const submitWithdrawRequest = async (request, response) => {
  let inputObject: any;
  inputObject = request.body;
  try {
    if (
      !inputObject.amount ||
      !inputObject.currency ||
      validator.isEmpty(inputObject.currency) ||
      !inputObject.channel ||
      validator.isEmpty(inputObject.channel)
    ) {
      throw new Error(ERROR_CODE_INVALID_INPUT, 'Invalid input');
    }

    const responseFromAuthorizer = await authorizeService(
      request,
      response,
    ).catch(error => {
      throw error;
    });
    const inputUser: User = new User();
    inputUser.assignValueFromJWT(
      JSON.parse(responseFromAuthorizer.body).resultFromJWT,
    );
    const inputBankRequest: WithdrawRequestTransaction = new WithdrawRequestTransaction();
    inputBankRequest.withdrawAmount = inputObject.amount;
    inputBankRequest.withdrawCurrency = inputObject.currency;
    inputBankRequest.withdrawChannel = inputObject.channel;
    inputBankRequest.withdrawPromptPay = inputObject.accountNumber
      ? inputObject.accountNumber
      : null;

    responseTransform(response, false, { result: 'success' });
    await WithdrawRequestUtil.submitWithdrawRequest(
      inputBankRequest,
      inputUser,
    ).catch(error => {
      const returnError: Error = new Error(
        ERROR_CODE_MYSQL_CONNECTION,
        JSON.stringify(error),
      );
      responseTransform(response, true, returnError);
    });

    return response;
  } catch (error) {
    responseTransform(response, true, error);
    return response;
  }
};
