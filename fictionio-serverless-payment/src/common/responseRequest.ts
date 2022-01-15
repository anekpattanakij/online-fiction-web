import { BaseCustomClass } from './baseCustomClass';

export const HTTP_REQUEST_UNAUTHORIZE: number = 401;
export const HTTP_REQUEST_UNPROCESSABLE_ENTITY: number = 422; // include invalid request
export const HTTP_REQUEST_SUCCESS: number = 200;
export const HTTP_REQUEST_FAIL: number = 500;

export class ResponseRequest extends BaseCustomClass {
  public statusCode: number;
  public body: string;

  constructor(statusCode: number, body: string) {
    super();
    this.statusCode = statusCode;
    this.body = body;
  }
}
