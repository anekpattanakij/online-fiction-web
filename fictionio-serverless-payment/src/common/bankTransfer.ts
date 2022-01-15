import { BaseCustomClass } from './baseCustomClass';

export class BankTransferTransaction extends BaseCustomClass {
  public transferAmount: number;
  public transferDate: string;
  public transferTime: string;
  public transferReferenceNumber: string;

  public constructor(init?:Partial<BankTransferTransaction>) {
    super();
    Object.assign(this, init);
  }

}
