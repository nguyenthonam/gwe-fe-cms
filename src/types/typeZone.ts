import { ECountryCode, IBaseRecord } from "./typeGlobals";

export interface IZone extends IBaseRecord {
  carrierId?: string | { _id?: string; code?: string; name?: string }; // ID của Carrier
  countryCode?: ECountryCode; // Mã vùng (ví dụ: "VN", "US", "EU")
  zone?: number; // Mã vùng (ví dụ: 1, 2, 3)
  name?: string; // Mô tả tùy chọn
}
