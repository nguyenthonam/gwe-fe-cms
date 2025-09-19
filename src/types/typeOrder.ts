import { ECURRENCY, EORDER_STATUS, EPRODUCT_TYPE, IBaseRecord, IBasicContactInfor, IDimension, ISearchQuery } from "./typeGlobals";

/** --- Package detail --- */
export interface IPackageDetail {
  content: string;
  declaredWeight: number;
  quantity: number;
  declaredValue: number;
  currency: ECURRENCY;
  dimensions: IDimension[]; // always array, even if empty
}

/** --- Surcharge detail --- */
export interface ISurchargeDetail {
  name: string;
  amount: number;
  currency: ECURRENCY;
}

/** --- Manual extra fee (for UI, editing manual) --- */
export interface IManualExtraFeeItem {
  name: string;
  amount: number;
  currency: ECURRENCY;
  extraFeeId?: string;
  fromSystem?: boolean;
}

/** --- Order pricing: system/manual, currency, breakdown --- */
export interface IOrderPricing {
  extraFeeInput: {
    extraFeeIds: string[];
    manualExtraFees: IManualExtraFeeItem[];
  };
  extraFeeTotal: { system: number; manual?: number | null };
  fscPercentage: { system: number | null; manual?: number | null };
  vatPercentage: { system: number; manual?: number | null };
  basePrice: {
    purchase: {
      system: number;
      manual?: number | null;
      currency: ECURRENCY | null;
      exchangeRate: { system: number; manual?: number | null };
    };
    sale: {
      system: number;
      manual?: number | null;
      currency: ECURRENCY | null;
      exchangeRate: { system: number; manual?: number | null };
    };
  };
  fscFee: { system: number; manual?: number | null };
  vat: { system: number; manual?: number | null };
  total: {
    purchase: { system: number; manual?: number | null };
    sale: { system: number; manual?: number | null };
  };
  currency: ECURRENCY | null;
}

/** --- Order timeline entry --- */
export interface IOrderTimelineEntry {
  status: EORDER_STATUS;
  timestamp: Date;
  userId?: string;
  note?: string;
}

/** --- Main Order type --- */
export interface IOrder extends IBaseRecord {
  trackingCode: string | null;
  carrierAirWaybillCode: string | null;

  partner: {
    partnerId: { _id?: string; name?: string } | string | null; // thêm name nếu muốn đồng bộ mẫu ExtraFee
    partnerName: string;
  } | null;

  carrierId: { _id?: string; name?: string; code?: string } | string | null;
  serviceId: { _id?: string; name?: string; code?: string } | string | null;
  supplierId: { _id?: string; name?: string } | string | null;

  productType: EPRODUCT_TYPE | null;

  sender: IBasicContactInfor | null;
  recipient: ({ attention?: string | null } & IBasicContactInfor) | null;

  packageDetail: IPackageDetail | null;
  note: string | null;
  zone: number | null;
  chargeableWeight: number | null;
  exportDate: Date | null;

  pricing: IOrderPricing;

  surcharges: {
    items: ISurchargeDetail[];
    total: number;
  };

  orderStatus: EORDER_STATUS | null;
  currency: ECURRENCY | null;

  cancelReason?: string | null;
  cancelledBy?: string | null;
  cancelledAt?: Date | null;
  timeline?: IOrderTimelineEntry[];
}

/** --- Type for creating a new order --- */
export interface ICreateOrderRequest {
  carrierAirWaybillCode?: string | null;
  partner?: {
    partnerId: string | null;
    partnerName: string;
  } | null;
  carrierId: string;
  serviceId?: string | null;
  supplierId?: string | null;
  productType: EPRODUCT_TYPE;
  sender: IBasicContactInfor;
  recipient: { attention?: string | null } & IBasicContactInfor;
  packageDetail: IPackageDetail;
  note?: string | null;
  extraFees?: {
    fscFeePercentage?: number;
    extraFeeIds?: string[];
  };
  vat?: {
    customVATPercentage?: number;
  };
  surcharges?: ISurchargeDetail[];
  currency?: ECURRENCY | null;
}

/** --- Type for filtering/searching orders --- */
export type IFilterOrder = ISearchQuery & {
  carrierId?: string;
  serviceId?: string;
  supplierId?: string;
  partnerId?: string;
};
