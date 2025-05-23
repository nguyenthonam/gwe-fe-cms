import { ECURRENCY, EORDER_STATUS, EPRODUCT_TYPE, IBaseRecord, IBasicContactInfor, IDimension } from "./typeGlobals";

export interface IPackageDetail {
  content: string;
  declaredWeight: number; // Weight
  quantity: number; // PCEs
  declaredValue: number; // Declared Value
  currency: ECURRENCY;
  dimensions: IDimension[] | []; // Chi tiết kích thước của từng kiện hàng
}

export interface ISurchargeDetail {
  name: string; // Ví dụ: "Phí gửi xe"
  amount: number;
  currency: ECURRENCY;
}

export interface IOrder extends IBaseRecord {
  trackingCode: string; // Mã vận đơn của đơn hàng HAWBCode
  carrierAirWaybillCode?: string | null; // Mã vận đơn của Carrier tự động lấy trong DB  của cawbCodes theo carrierId.
  partner: {
    partnerId: { _id?: string; name?: string; code?: string; type?: string } | string | null; // Lấy trong Companies với  Type: Partner. Dùng để tính giá SalePrice
    partnerName: string;
  };
  carrierId: { _id?: string; name?: string; code?: string; companyId?: string } | string | null;
  serviceId: { _id?: string; name?: string; code?: string; companyId?: string } | string | null;
  supplierId: { _id?: string; name?: string; code?: string; companyId?: string } | string | null;
  productType: EPRODUCT_TYPE; // DOX: Documents, WPX: Parcels
  sender: IBasicContactInfor;
  recipient: { attention?: string | null } & IBasicContactInfor;
  packageDetail: IPackageDetail;
  note: string | null;
  zone: number | null;
  chargeableWeight: number; // Kết quả CW được tính từ dimensions
  basePrice: {
    purchasePrice: {
      value: number;
      currency: ECURRENCY | null;
    };
    salePrice: {
      value: number;
      currency: ECURRENCY | null;
    };
  }; // Giá cơ bản được tính từ bảng pricelists theo carrierId, serviceId, supplierId, zoneId, productType, chargeableWeight
  extraFees: {
    extraFeeIds: [string];
    fscFeePercentage: number | null;
    fscFeeValue: {
      purchaseFSCFee: number | null;
      saleFSCFee: number | null;
    };
    extraFeesTotal: number | null;
  };
  vat: {
    systemVATPercentage: number; // Phí VAT được tính từ bảng vatRates theo carrierId, serviceId, supplierId
    privateVATPercentage: number; // Phí VAT được áp dụng riêng cho từng đơn hàng. Lưu ý: phí VAT này sẻ thay thế systemVAT nếu nó khác -1
    purchaseVATTotal: number;
    saleVATTotal: number;
  };
  surcharges: ISurchargeDetail[]; // Thay đổi từ surcharge thành surcharges
  surchargeTotal: number;
  totalPrice: {
    purchaseTotal: number;
    saleTotal: number;
  };
  orderStatus: EORDER_STATUS;
  currency: ECURRENCY | null;
}

export interface ICreateOrderRequest {
  partner?: {
    partnerId: { _id?: string; name?: string; code?: string; type?: string } | string | null; // Lấy trong Companies với  Type: Partner. Dùng để tính giá SalePrice
    partnerName: string;
  };
  carrierId: string;
  serviceId?: string;
  supplierId?: string;
  productType: EPRODUCT_TYPE; // DOX: Documents, WPX: Parcels
  sender: IBasicContactInfor;
  recipient: { attention?: string | null } & IBasicContactInfor;
  packageDetail: IPackageDetail;
  note: string | null;
  // zone: number | null;
}
