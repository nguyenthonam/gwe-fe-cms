import { ECURRENCY, EORDER_STATUS, EPRODUCT_TYPE, IBaseRecord, IBasicContactInfor, IDimension, ISearchQuery } from "./typeGlobals";

// FE alias
export type ObjectId = string;

export interface IPackageDetail {
  content: string;
  declaredWeight: number; // Weight
  quantity: number; // PCEs
  declaredValue: number; // Declared Value
  currency: ECURRENCY;
  dimensions: IDimension[]; // không cần "| []"
}

export interface ISurchargeDetail {
  name: string; // Ví dụ: "Phí gửi xe"
  amount: number;
  currency: ECURRENCY;
}

export interface IOrder extends IBaseRecord {
  trackingCode: string; // HAWB
  carrierAirWaybillCode?: string | null;

  partner: {
    partnerId: ObjectId | null; // id-thuần theo BE
    partnerName: string;
  };

  carrierId: ObjectId;
  serviceId: ObjectId | null;
  supplierId: ObjectId | null;

  productType: EPRODUCT_TYPE;
  sender: IBasicContactInfor;
  recipient: IBasicContactInfor & { attention?: string | null };
  packageDetail: IPackageDetail;
  note: string | null;
  zone: number | null;

  // KQ CW từ dimensions
  chargeableWeight: number;

  // Giá cơ bản (theo BE)
  basePrice: {
    purchasePrice: { value: number; currency: ECURRENCY | null };
    salePrice: { value: number; currency: ECURRENCY | null };
  };

  extraFees: {
    extraFeeIds: ObjectId[]; // mảng id, có thể rỗng
    fscFeePercentage: number | null;
    fscFeeValue: {
      purchaseFSCFee: number | null;
      saleFSCFee: number | null;
    };
    extraFeesTotal: number | null;
  };

  vat: {
    systemVATPercentage: number;
    customVATPercentage: number; // -1 để bỏ qua
    purchaseVATTotal: number;
    saleVATTotal: number;
  };

  surcharges: ISurchargeDetail[];
  surchargeTotal: number;

  totalPrice: {
    purchaseTotal: number;
    saleTotal: number;
  };

  orderStatus: EORDER_STATUS;
  currency: ECURRENCY | null;
}

export type IFilterOrder = ISearchQuery & {
  partnerId?: string;
  carrierId?: string;
  serviceId?: string;
  supplierId?: string;

  // các filter ManagerView đang dùng:
  orderStatus?: EORDER_STATUS; // trạng thái đơn
  productType?: EPRODUCT_TYPE; // DOX / WPX
  countryCode?: string; // recipient.country.code (điểm đến)
  trackingCode?: string; // HAWB
  carrierAirWaybillCode?: string; // CAWB / AWB

  // tiện ích cho export
  all?: boolean; // = true để lấy all (bỏ phân trang)
};

export interface ICreateOrderRequest {
  carrierAirWaybillCode?: string | null;

  /** luôn là id-thuần */
  carrierId: string;
  serviceId: string | null;
  supplierId: string | null;

  /** FE lưu name để hiển thị, BE chỉ dùng partnerId */
  partner: {
    partnerId: string | null; // id-thuần
    partnerName: string;
  } | null;

  sender: IBasicContactInfor;
  recipient: IBasicContactInfor & { attention?: string | null };

  packageDetail: IPackageDetail;

  note: string | null;
  productType: EPRODUCT_TYPE;

  /** Mảng phụ thu (nếu có) */
  surcharges: ISurchargeDetail[];

  /** Extra fee: chỉ cần ids + FSC% ở thời điểm tạo */
  extraFees: {
    extraFeeIds: string[];
    fscFeePercentage: number | null;
  };

  /** VAT tuỳ chỉnh (để -1 nếu muốn BE bỏ qua) */
  vat: {
    customVATPercentage: number; // ví dụ: 8, 0, hoặc -1 (bỏ qua)
  };
}
