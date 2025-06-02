import { IBaseRecord } from "./typeGlobals";

export interface IVATRate extends IBaseRecord {
  carrierId: { _id?: string; name?: string; code?: string } | string | null;
  serviceId: { _id?: string; name?: string; code?: string } | string | null;
  supplierId: { _id?: string; name?: string; code?: string } | string | null;
  value: number; // Tỷ lệ VAT(%)
}
