"use client";

import { Chip } from "@mui/material";
import { EGENDER, ERECORD_STATUS, EORDER_STATUS, EPaymentTerms, ECHARGEABLE_WEIGHT_TYPE, EUSER_ROLES } from "@/types/typeGlobals";
import { ECOMPANY_TYPE } from "@/types/typeCompany";

type EnumChipProps = {
  type: "gender" | "recordStatus" | "orderStatus" | "payment" | "chargeWeightType" | "companyType" | "userRole";
  value?: string | number | null;
};

const CHIP_STYLES = {
  gender: {
    [EGENDER.MALE]: { label: "Male", bg: "#E3F2FD", color: "#1976D2" },
    [EGENDER.FEMALE]: { label: "Female", bg: "#FCE4EC", color: "#C2185B" },
  },
  recordStatus: {
    [ERECORD_STATUS.Active]: { label: "Active", bg: "#E6F4EA", color: "#2E7D32" },
    [ERECORD_STATUS.NoActive]: { label: "Inactive", bg: "#F0F0F0", color: "#616161" },
    [ERECORD_STATUS.Locked]: { label: "Locked", bg: "#FFF9E1", color: "#F9A825" },
    [ERECORD_STATUS.Deleted]: { label: "Deleted", bg: "#FDECEA", color: "#D32F2F" },
  },
  orderStatus: {
    [EORDER_STATUS.Pending]: { label: "Pending", bg: "#FFF3E0", color: "#F57C00" },
    [EORDER_STATUS.Confirmed]: { label: "Confirmed", bg: "#E3F2FD", color: "#1976D2" },
    [EORDER_STATUS.InTransit]: { label: "In transit", bg: "#E8F5E9", color: "#388E3C" },
    [EORDER_STATUS.Delivered]: { label: "Delivered", bg: "#E0F7FA", color: "#00838F" },
    [EORDER_STATUS.Cancelled]: { label: "Cancelled", bg: "#FDECEA", color: "#D32F2F" },
  },
  payment: {
    [EPaymentTerms.Prepaid]: { label: "Prepaid", bg: "#E1F5FE", color: "#0288D1" },
    [EPaymentTerms.Postpaid]: { label: "Postpaid", bg: "#FFF8E1", color: "#FBC02D" },
  },
  chargeWeightType: {
    [ECHARGEABLE_WEIGHT_TYPE.DETAIL]: {
      label: "By package",
      bg: "#E1F5FE",
      color: "#0288D1",
    },
    [ECHARGEABLE_WEIGHT_TYPE.TOTAL]: {
      label: "Total weight",
      bg: "#FFF8E1",
      color: "#FBC02D",
    },
  },
  companyType: {
    [ECOMPANY_TYPE.Carrier]: { label: "Sub Carrier", bg: "#E8F5E9", color: "#388E3C" },
    [ECOMPANY_TYPE.Customer]: { label: "Partner", bg: "#E3F2FD", color: "#1976D2" },
  },
  userRole: {
    [EUSER_ROLES.Admin]: { label: "Admin", bg: "#E3F2FD", color: "#1565C0" },
    [EUSER_ROLES.OfficeStaff]: { label: "Office Staff", bg: "#FFF9E1", color: "#F9A825" },
    [EUSER_ROLES.WarehouseStaff]: { label: "Warehouse Staff", bg: "#E0F2F1", color: "#00897B" },
    [EUSER_ROLES.Partner]: { label: "Partner", bg: "#E8F5E9", color: "#388E3C" },
    [EUSER_ROLES.Customer]: { label: "Customer", bg: "#F3E5F5", color: "#7B1FA2" },
  },
} as const;

export const EnumChip = ({ type, value }: EnumChipProps) => {
  if (value === undefined || value === null) return null;

  const styleMap = CHIP_STYLES[type] as Record<string | number, { label: string; bg: string; color: string }>;
  const mapped = styleMap?.[value] || {
    label: String(value),
    bg: "#EEE",
    color: "#333",
  };

  return (
    <Chip
      label={mapped.label}
      size="small"
      sx={{
        padding: "2px 6px",
        backgroundColor: mapped.bg,
        color: mapped.color,
        fontWeight: 500,
      }}
    />
  );
};
