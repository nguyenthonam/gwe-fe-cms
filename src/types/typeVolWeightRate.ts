import { IBaseRecord } from "./typeGlobals";

export interface IVolWeightRate extends IBaseRecord {
  carrierId: { _id?: string; code?: string; name?: string } | string | null;
  supplierId: { _id?: string; code?: string; name?: string } | string | null;
  value: number;
}
