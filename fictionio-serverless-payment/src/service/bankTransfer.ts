import * as validator from 'validator';
import { authorizeService } from '../authService';
import { BankTransferTransaction } from '../common/bankTransfer';
import {
  Error,
  ERROR_CODE_INVALID_INPUT,
  ERROR_CODE_MYSQL_CONNECTION,
} from '../common/error';
import { User } from '../common/user';
import { BankTransferUtil } from '../dataLayer/bankTransferUtil';
import { responseTransform } from '../util/returnResponseUtil';

export const submitTransferRequest = async (request, response) => {
  let inputObject: any;
  inputObject = request.body;
  try {
    if (
      !inputObject.amount ||
      !inputObject.date ||
      validator.isEmpty(inputObject.date) ||
      !inputObject.time ||
      validator.isEmpty(inputObject.time) ||
      !inputObject.reference ||
      validator.isEmpty(inputObject.reference)
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
    const inputBankRequest: BankTransferTransaction = new BankTransferTransaction();
    inputBankRequest.transferAmount = inputObject.amount;
    inputBankRequest.transferDate = inputObject.date;
    inputBankRequest.transferTime = inputObject.time;
    inputBankRequest.transferReferenceNumber = inputObject.reference;
    responseTransform(response, false, { result: 'success' });
    await BankTransferUtil.submitBankTransfer(
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
