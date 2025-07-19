import { ECURRENCY, IBaseRecord } from "./typeGlobals";

export interface IExchangeRate extends IBaseRecord {
  currencyFrom: ECURRENCY;
  currencyTo: ECURRENCY;
  rate: number;
  startDate: string;
  endDate: string;
}
