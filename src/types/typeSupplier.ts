import { IBaseRecord } from "./typeGlobals";

export interface ISupplier extends IBaseRecord {
  companyId?: { _id?: string; name?: string; code?: string; type?: string } | string | null;
  name: string;
  code: string;
}
