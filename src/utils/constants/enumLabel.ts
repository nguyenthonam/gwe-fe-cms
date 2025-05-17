import { ECOMPANY_TYPE } from "@/types/typeCompany";
import { EGENDER, ERECORD_STATUS, EORDER_STATUS, EPaymentTerms, EPRODUCT_TYPE, ECHARGEABLE_WEIGHT_TYPE, EFEE_TYPE } from "@/types/typeGlobals";

export const genderLabel: Record<EGENDER, string> = {
  [EGENDER.MALE]: "Nam",
  [EGENDER.FEMALE]: "Nữ",
};

export const feeTypeLabel: Record<EFEE_TYPE, string> = {
  [EFEE_TYPE.FIXED]: "Số tiền",
  [EFEE_TYPE.PERCENT]: "%",
};

export const recordStatusLabel: Record<ERECORD_STATUS, string> = {
  [ERECORD_STATUS.Active]: "Hoạt động",
  [ERECORD_STATUS.NoActive]: "Không hoạt động",
  [ERECORD_STATUS.Locked]: "Đã khoá",
  [ERECORD_STATUS.Deleted]: "Đã xoá",
};

export const orderStatusLabel: Record<EORDER_STATUS, string> = {
  [EORDER_STATUS.Pending]: "Chờ xử lý",
  [EORDER_STATUS.Confirmed]: "Đã xác nhận",
  [EORDER_STATUS.InTransit]: "Đang vận chuyển",
  [EORDER_STATUS.Delivered]: "Đã giao",
  [EORDER_STATUS.Cancelled]: "Đã huỷ",
};

export const paymentTermsLabel: Record<EPaymentTerms, string> = {
  [EPaymentTerms.Prepaid]: "Trả trước",
  [EPaymentTerms.Postpaid]: "Trả sau",
};

export const companyTypeLabel: Record<ECOMPANY_TYPE, string> = {
  [ECOMPANY_TYPE.Carrier]: "Hãng bay",
  [ECOMPANY_TYPE.Partner]: "Đối tác",
  [ECOMPANY_TYPE.Customer]: "Khách hàng",
  [ECOMPANY_TYPE.Supplier]: "Nhà cung cấp",
};

export const productTypeLabel: Record<EPRODUCT_TYPE, string> = {
  [EPRODUCT_TYPE.Document]: "Tài liệu",
  [EPRODUCT_TYPE.Parcel]: "Hàng hóa",
};

export const chargeWeightTypeLabel: Record<ECHARGEABLE_WEIGHT_TYPE, string> = {
  [ECHARGEABLE_WEIGHT_TYPE.DETAIL]: "Tính theo kiện",
  [ECHARGEABLE_WEIGHT_TYPE.TOTAL]: "Tính toàn bộ",
};
