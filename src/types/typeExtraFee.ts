import { ECURRENCY, EFEE_TYPE, IBaseRecord, ISearchQuery } from "./typeGlobals";

// Chuẩn hóa để đồng bộ với backend (FE, BE đều giống nhau)
export interface IExtraFee extends IBaseRecord {
  carrierId: { _id?: string; name?: string; code?: string } | string | null;
  serviceId: { _id?: string; name?: string; code?: string } | string | null;
  name: string; // Example: Fuel surcharge
  code: string; // Example: FSC
  type: EFEE_TYPE; // Example: PERCENT, FIXED
  value: number; // Example: 40
  currency: ECURRENCY;
  startDate: string; // ISO date string, e.g., "2025-08-01"
  endDate: string; // ISO date string, e.g., "2025-08-31"
}

export interface ISearchExtraFeeQuery extends ISearchQuery {
  carrierId?: string;
  serviceId?: string;
  code?: string;
  startDate?: string;
  endDate?: string;
}
