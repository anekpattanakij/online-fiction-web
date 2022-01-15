import { BaseCustomClass } from './baseCustomClass';

export class WithdrawRequestTransaction extends BaseCustomClass {
  public withdrawAmount: number;
  public requestDate: string;
  public transferDate: string;
  public withdrawCurrency: string;
  public withdrawChannel: string;
  public withdrawPromptPay: string;

  public constructor(init?:Partial<WithdrawRequestTransaction>) {
    super();
    Object.assign(this, init);
  }

}
