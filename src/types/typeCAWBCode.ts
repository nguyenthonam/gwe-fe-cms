import { IBaseRecord } from "./typeGlobals";

export interface ICAWBCode extends IBaseRecord {
  carrierId?: string | { _id?: string; code?: string; name?: string };
  code?: string;
  isUsed?: boolean;
}
