import { IBaseRecord } from "./typeGlobals";

export interface ICAWBCode extends IBaseRecord {
  carrierId?: { _id?: string; code?: string; name?: string } | string | null;
  code?: string;
  isUsed?: boolean;
}
