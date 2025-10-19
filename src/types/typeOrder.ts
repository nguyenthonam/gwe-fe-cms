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

/** --- Order pricing (UI mới) --- */
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

/** --- Legacy blocks (theo BE hiện tại) --- */
export interface ILegacyBasePrice {
  purchasePrice: { value: number; currency: ECURRENCY | null };
  salePrice: { value: number; currency: ECURRENCY | null };
}
export interface ILegacyExtraFees {
  extraFeeIds: string[]; // map từ ObjectId[]
  fscFeePercentage: number | null;
  fscFeeValue: {
    purchaseFSCFee: number | null;
    saleFSCFee: number | null;
  };
  extraFeesTotal: number | null;
}
export interface ILegacyVat {
  systemVATPercentage: number;
  customVATPercentage: number; // -1 nếu không dùng custom
  purchaseVATTotal: number;
  saleVATTotal: number;
}
export interface ILegacyTotalPrice {
  purchaseTotal: number;
  saleTotal: number;
}

/** --- Main Order type (tương thích 2 phía) --- */
export interface IOrder extends IBaseRecord {
  trackingCode: string | null;
  carrierAirWaybillCode: string | null;

  partner: {
    partnerId: { _id?: string; name?: string } | string | null;
    partnerName: string;
  } | null;

  carrierId: { _id?: string; name?: string; code?: string; companyId?: string } | string | null;
  serviceId: { _id?: string; name?: string; code?: string; companyId?: string } | string | null;
  supplierId: { _id?: string; name?: string; code?: string } | string | null;

  productType: EPRODUCT_TYPE | null;

  sender: IBasicContactInfor | null;
  recipient: ({ attention?: string | null } & IBasicContactInfor) | null;

  packageDetail: IPackageDetail | null;
  note: string | null;
  zone: number | null;
  chargeableWeight: number | null;
  exportDate: Date | null;

  /** UI mới – có thể vắng mặt khi BE trả schema cũ */
  pricing?: IOrderPricing;

  /** Surcharge:
   * - Legacy BE: trả mảng ISurchargeDetail[]
   * - UI mới: dùng object { items, total }
   * Chấp nhận cả 2 để không vấp type error.
   */
  surcharges: ISurchargeDetail[] | { items: ISurchargeDetail[]; total: number };

  /** Legacy fields từ BE – optional để không ràng buộc UI mới */
  basePrice?: ILegacyBasePrice;
  extraFees?: ILegacyExtraFees;
  vat?: ILegacyVat;
  totalPrice?: ILegacyTotalPrice;
  surchargeTotal?: number;

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

/** --- Type for filtering/searching orders (thêm CAWB) --- */
export type IFilterOrder = ISearchQuery & {
  trackingCode?: string;
  carrierAirWaybillCode?: string; // CAWB filter
  carrierId?: string;
  serviceId?: string;
  supplierId?: string;
  partnerId?: string;
  productType?: EPRODUCT_TYPE;
  orderStatus?: EORDER_STATUS;
  countryCode?: string;
  dateFrom?: Date;
  dateTo?: Date;
  exportDateFrom?: Date;
  exportDateTo?: Date;
  all?: boolean; // true => BE trả toàn bộ, không phân trang
};
