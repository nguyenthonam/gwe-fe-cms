"use client";

import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, Stack } from "@mui/material";
import { IUser } from "@/types/typeUser";
import { EnumChip } from "@/components/Globals/EnumChip";

interface Props {
  open: boolean;
  onClose: () => void;
  staff: IUser | null;
}

// Component for each row
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
      <DialogTitle sx={{ fontWeight: "bold", color: "primary.main" }}>STAFF DETAILS</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={1.5}>
          <DetailItem label="User ID" value={staff.userId} />
          <DetailItem label="Email" value={staff.email} />
          <DetailItem label="Full Name" value={staff.contact?.fullname} />
          <DetailItem label="Contact Number" value={staff.contact?.phone} />
          <DetailItem label="Gender" value={<EnumChip type="gender" value={staff.gender} />} />
          <DetailItem label="Birthday" value={staff.birthday ? new Date(staff.birthday).toLocaleDateString("en-GB") : "---"} />
          <DetailItem label="National ID" value={staff.identity_key?.id} />
          <DetailItem label="Issued At" value={staff.identity_key?.address} />
          <DetailItem label="Customer Company" value={staff.companyId && typeof staff.companyId === "object" ? staff.companyId.name : String(staff.companyId || "---")} />
          <DetailItem label="Status" value={<EnumChip type="recordStatus" value={staff.status} />} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Box flex={1} />
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
