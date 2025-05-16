import { IBaseRecord } from "./typeGlobals";

export interface ICAWBCode extends IBaseRecord {
  carrierId: string;
  code: string;
  isUsed: boolean;
}
