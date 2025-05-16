"use client";

import { Chip } from "@mui/material";
import { EGENDER, ERECORD_STATUS, EORDER_STATUS, EPaymentTerms } from "@/types/typeGlobals";

type EnumChipProps = {
  type: "gender" | "recordStatus" | "orderStatus" | "payment" | "companyType";
  value?: string | number | null;
};

const CHIP_STYLE: Record<string, { label: string; bg: string; color: string }> = {
  // Status
  [ERECORD_STATUS.Active]: { label: "Hoạt động", bg: "#E6F4EA", color: "#2E7D32" },
  [ERECORD_STATUS.NoActive]: { label: "Không hoạt động", bg: "#F0F0F0", color: "#616161" },
  [ERECORD_STATUS.Locked]: { label: "Đã khoá", bg: "#FFF9E1", color: "#F9A825" },
  [ERECORD_STATUS.Deleted]: { label: "Đã xoá", bg: "#FDECEA", color: "#D32F2F" },

  // Gender
  [EGENDER.MALE]: { label: "Nam", bg: "#E3F2FD", color: "#1976D2" },
  [EGENDER.FEMALE]: { label: "Nữ", bg: "#FCE4EC", color: "#C2185B" },

  // Order Status (ví dụ)
  [EORDER_STATUS.Pending]: { label: "Chờ xử lý", bg: "#FFF3E0", color: "#F57C00" },
  [EORDER_STATUS.Confirmed]: { label: "Đã xác nhận", bg: "#E3F2FD", color: "#1976D2" },
  [EORDER_STATUS.InTransit]: { label: "Đang vận chuyển", bg: "#E8F5E9", color: "#388E3C" },
  [EORDER_STATUS.Delivered]: { label: "Đã giao", bg: "#E0F7FA", color: "#00838F" },
  [EORDER_STATUS.Cancelled]: { label: "Đã huỷ", bg: "#FDECEA", color: "#D32F2F" },

  // Payment Terms
  [EPaymentTerms.Prepaid]: { label: "Trả trước", bg: "#E1F5FE", color: "#0288D1" },
  [EPaymentTerms.Postpaid]: { label: "Trả sau", bg: "#FFF8E1", color: "#FBC02D" },

  // Company Type
  Carrier: { label: "Hãng bay", bg: "#E8F5E9", color: "#388E3C" },
  Partner: { label: "Đối tác", bg: "#E3F2FD", color: "#1976D2" },
  Customer: { label: "Khách hàng", bg: "#F3E5F5", color: "#7B1FA2" },
  Supplier: { label: "Nhà cung cấp", bg: "#FFFDE7", color: "#FBC02D" },
};

export const EnumChip = ({ type, value }: EnumChipProps) => {
  if (!value && value !== 0) return null;
  const mapped = CHIP_STYLE[String(value)] || { label: String(value), bg: "#EEE", color: "#333" };

  return (
    <Chip
      label={mapped.label}
      size="small"
      sx={{
        backgroundColor: mapped.bg,
        color: mapped.color,
        fontWeight: 500,
      }}
    />
  );
};
