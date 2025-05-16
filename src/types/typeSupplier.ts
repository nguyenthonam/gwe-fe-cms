import { ECHARGEABLE_WEIGHT_TYPE, IBaseRecord } from "./typeGlobals";

export interface ISupplier extends IBaseRecord {
  companyId?: { _id?: string; name?: string; code?: string } | string | null;
  name: string;
  code: string;
}
