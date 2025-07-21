import { ECOMPANY_TYPE } from "@/types/typeCompany";
import { EGENDER, ERECORD_STATUS, EORDER_STATUS, EPaymentTerms, EPRODUCT_TYPE, ECHARGEABLE_WEIGHT_TYPE, EFEE_TYPE, EUSER_ROLES } from "@/types/typeGlobals";

export const genderLabel: Record<EGENDER, string> = {
  [EGENDER.MALE]: "Male",
  [EGENDER.FEMALE]: "Female",
};

export const feeTypeLabel: Record<EFEE_TYPE, string> = {
  [EFEE_TYPE.FIXED]: "Fixed amount",
  [EFEE_TYPE.PERCENT]: "%",
};

export const recordStatusLabel: Record<ERECORD_STATUS, string> = {
  [ERECORD_STATUS.Active]: "Active",
  [ERECORD_STATUS.NoActive]: "Inactive",
  [ERECORD_STATUS.Locked]: "Locked",
  [ERECORD_STATUS.Deleted]: "Deleted",
};

export const orderStatusLabel: Record<EORDER_STATUS, string> = {
  [EORDER_STATUS.Pending]: "Pending",
  [EORDER_STATUS.Confirmed]: "Confirmed",
  [EORDER_STATUS.InTransit]: "In transit",
  [EORDER_STATUS.Delivered]: "Delivered",
  [EORDER_STATUS.Cancelled]: "Cancelled",
};

export const paymentTermsLabel: Record<EPaymentTerms, string> = {
  [EPaymentTerms.Prepaid]: "Prepaid",
  [EPaymentTerms.Postpaid]: "Postpaid",
};

export const companyTypeLabel: Record<ECOMPANY_TYPE, string> = {
  [ECOMPANY_TYPE.Carrier]: "Carrier",
  [ECOMPANY_TYPE.Customer]: "Customer",
};

export const productTypeLabel: Record<EPRODUCT_TYPE, string> = {
  [EPRODUCT_TYPE.DOCUMENT]: "Document",
  [EPRODUCT_TYPE.PARCEL]: "Parcel",
};

export const chargeWeightTypeLabel: Record<ECHARGEABLE_WEIGHT_TYPE, string> = {
  [ECHARGEABLE_WEIGHT_TYPE.DETAIL]: "Per package",
  [ECHARGEABLE_WEIGHT_TYPE.TOTAL]: "Total",
};

export const userRoleLabel: Record<EUSER_ROLES, string> = {
  [EUSER_ROLES.Admin]: "Admin",
  [EUSER_ROLES.OfficeStaff]: "Office Staff",
  [EUSER_ROLES.WarehouseStaff]: "Warehouse Staff",
  [EUSER_ROLES.Partner]: "Partner",
  [EUSER_ROLES.Customer]: "Customer",
};
