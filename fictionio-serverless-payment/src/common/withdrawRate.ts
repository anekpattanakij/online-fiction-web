import { BaseCustomClass } from './baseCustomClass';

export class WithdrawRate extends BaseCustomClass {
  public static decodeWithdrawRate(json: any) {
    const rateModel: WithdrawRate = Object.create(WithdrawRate.prototype);
    try {
      return Object.assign(rateModel, json);
    } catch (err) {
      return rateModel;
    }
  }

  public rateList: Array<{ currency: string; rate: number }>;

  public constructor(init?: Partial<WithdrawRate>) {
    super();
    Object.assign(this, init);
  }
}
