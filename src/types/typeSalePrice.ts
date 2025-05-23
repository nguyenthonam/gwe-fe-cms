import { ECURRENCY, EPRODUCT_TYPE, IBaseRecord } from "./typeGlobals";

export interface ISalePrice extends IBaseRecord {
  partnerId: { _id?: string; name?: string; code?: string; type?: string } | string | null; // Type: ECOMPANY_TYPE.Partner
  carrierId: { _id?: string; name?: string; code?: string; companyId?: string } | string | null;
  serviceId: { _id?: string; name?: string; code?: string; companyId?: string } | string | null;
  zone: number;
  productType: EPRODUCT_TYPE;
  weightMin: number;
  weightMax: number;
  price: number;
  currency: ECURRENCY;
  isPricePerKG: boolean; // true: giá trên kg, false: giá cố định
}
