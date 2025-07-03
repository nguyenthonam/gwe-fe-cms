import { ECURRENCY, EPRODUCT_TYPE, ERECORD_STATUS, IBaseRecord } from "./typeGlobals";

export interface IPurchasePrice extends IBaseRecord {
  supplierId: { _id?: string; name?: string; code?: string; companyId?: string } | string | null;
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

export interface IPurchasePriceGroup {
  supplierId: { _id?: string; name?: string; code?: string; companyId?: string } | string | null;
  carrierId: { _id?: string; name?: string; code?: string; companyId?: string } | string | null;
  serviceId: { _id?: string; name?: string; code?: string; companyId?: string } | string | null;
  datas: Array<IPurchasePriceGroupData>;
}

export interface IPurchasePriceGroupData {
  _id?: string;
  zone: number;
  weightMin: number;
  weightMax: number;
  price: number;
  isPricePerKG: boolean;
  productType: EPRODUCT_TYPE;
  currency: ECURRENCY;
  status?: ERECORD_STATUS;
}
