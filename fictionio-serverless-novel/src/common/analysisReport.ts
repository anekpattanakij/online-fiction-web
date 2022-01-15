import { BaseCustomClass } from './baseCustomClass';

export class AnalysisReport extends BaseCustomClass {
  public currentDate: Date = null;
  public availableLanguage: string[] = new Array();
  public rateSex: Array<{
    inputType: string;
    valueCount: number;
  }> = new Array();
  public purchaseSex: Array<{
    inputType: string;
    valueCount: number;
  }> = new Array();
  public rateAge: Array<{
    inputType: string;
    valueCount: number;
  }> = new Array();
  public purchaseAge: Array<{
    inputType: string;
    valueCount: number;
  }> = new Array();
  public rateTimeSerie: Array<{
    inputDate: Date;
    valueCount: number;
  }> = new Array();
  public purchaseTimeSerie: Array<{
    inputDate: Date;
    valueCount: number;
  }> = new Array();

  public constructor(init?: Partial<AnalysisReport>) {
    super();
    Object.assign(this, init);
  }
}
