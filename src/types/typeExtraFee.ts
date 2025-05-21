import { ECURRENCY, EFEE_TYPE, IBaseRecord } from "./typeGlobals";

export interface IExtraFee extends IBaseRecord {
  carrierId: { _id?: string; name?: string; code?: string; type?: string } | string | null;
  serviceId: { _id?: string; name?: string; code?: string; type?: string } | string | null;
  name: string; // Phụ phí xăng dầu
  code: string; // FSC
  type: EFEE_TYPE; // PERCENT
  value: number; // 40
  currency: ECURRENCY;
  applyToFeeIds: string[]; // Thêm trường để chỉ định các phụ phí mà Percent áp dụng
}
