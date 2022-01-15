import { BaseCustomClass } from './baseCustomClass';

export class TopupPrice extends BaseCustomClass {
  public static decodeTopupPrice(json: any) {
    const priceModel: TopupPrice = Object.create(TopupPrice.prototype);
    try {
      return Object.assign(priceModel, json);
    } catch (err) {
      return priceModel;
    }
  }

  public tokenAmount: number;
  public bonusAmount: number;
  public price: number;
  public currency: string;

  public constructor(init?: Partial<TopupPrice>) {
    super();
    Object.assign(this, init);
  }
}
