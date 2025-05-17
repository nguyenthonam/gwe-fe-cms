"use client";

import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, Stack } from "@mui/material";
import { IUser } from "@/types/typeUser";
import { EnumChip } from "@/components/Globals/EnumChip";

interface Props {
  open: boolean;
  onClose: () => void;
  staff: IUser | null;
}

// Component dùng cho từng dòng thông tin
const DetailItem = ({ label, value }: { label: string; value?: string | number | React.ReactNode }) => (
  <Stack direction="row" spacing={1}>
    <Typography fontWeight="bold" sx={{ width: 130, minWidth: 130 }}>
      {label}:
    </Typography>
    <Typography>{value || "---"}</Typography>
  </Stack>
);

export default function StaffDetailDialog({ open, onClose, staff }: Props) {
  if (!staff) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: "bold", color: "primary.main" }}>CHI TIẾT NHÂN VIÊN</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={1.5}>
          <DetailItem label="User ID" value={staff.userId} />
          <DetailItem label="Email" value={staff.email} />
          <DetailItem label="Họ tên" value={staff.contact?.fullname} />
          <DetailItem label="SĐT" value={staff.contact?.phone} />
          <DetailItem label="Giới tính" value={<EnumChip type="gender" value={staff.gender} />} />
          <DetailItem label="Ngày sinh" value={staff.birthday ? new Date(staff.birthday).toLocaleDateString("vi-VN") : "---"} />
          <DetailItem label="CMND/CCCD" value={staff.identity_key?.id} />
          <DetailItem label="Nơi cấp" value={staff.identity_key?.address} />
          <DetailItem label="Công ty" value={staff.companyId && typeof staff.companyId === "object" ? staff.companyId.name : String(staff.companyId || "---")} />
          <DetailItem label="Trạng thái" value={<EnumChip type="recordStatus" value={staff.status} />} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Box flex={1} />
        <Button onClick={onClose}>Đóng</Button>
      </DialogActions>
    </Dialog>
  );
}
