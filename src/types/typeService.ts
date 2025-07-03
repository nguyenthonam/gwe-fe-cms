import { IBaseRecord } from "./typeGlobals";

export interface IService extends IBaseRecord {
  companyId?: { _id?: string; name?: string; code?: string; type?: string } | string | null;
  code: string; // Mã dịch vụ (unique)
  name: string; // Tên dịch vụ
  description?: string; // Mô tả dịch vụ (optional)
}
