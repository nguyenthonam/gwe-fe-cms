"use client";

import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, Typography, Stack, Divider, Avatar } from "@mui/material";
import { IUser } from "@/types/typeUser";
import { EnumChip } from "@/components/Globals/EnumChip";
import { userRoleLabel } from "@/utils/constants/enumLabel";
import { ERECORD_STATUS, EGENDER, EUSER_ROLES } from "@/types/typeGlobals";

interface Props {
  open: boolean;
  onClose: () => void;
  user: IUser | null;
}

const InfoRow = ({ label, value }: { label: string; value?: React.ReactNode }) => (
  <>
    <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
      {label}
    </Typography>
    <Typography sx={{ mb: 1 }}>{value ?? "-"}</Typography>
  </>
);

export default function UserDetailDialog({ open, onClose, user }: Props) {
  if (!user) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle className="uppercase" color="primary" sx={{ fontWeight: "bold" }}>
        Chi tiết tài khoản
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} mt={1}>
          <Grid container spacing={2}>
            <Grid size={3}>
              <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                Avatar
              </Typography>
              {user.avatar ? <Avatar src={user.avatar} sx={{ width: 56, height: 56 }} /> : "-"}
            </Grid>
            <Grid size={9}>
              <InfoRow label="User ID" value={user.userId} />
              <InfoRow label="Email" value={user.email} />
            </Grid>
            <Grid size={6}>
              <InfoRow label="Role" value={<EnumChip type="userRole" value={user.role} />} />
            </Grid>
            <Grid size={6}>
              <InfoRow label="Trạng thái" value={<EnumChip type="recordStatus" value={user.status} />} />
            </Grid>
            <Grid size={6}>
              <InfoRow label="Công ty" value={typeof user.companyId === "object" ? user.companyId?.name : user.companyId} />
            </Grid>
            <Grid size={6}>
              <InfoRow label="Tên liên hệ" value={user.contact?.fullname} />
            </Grid>
            <Grid size={6}>
              <InfoRow label="SĐT" value={user.contact?.phone} />
            </Grid>
            <Grid size={6}>
              <InfoRow label="Giới tính" value={user.gender === EGENDER.MALE ? "Nam" : user.gender === EGENDER.FEMALE ? "Nữ" : "-"} />
            </Grid>
            <Grid size={6}>
              <InfoRow label="Ngày sinh" value={user.birthday ? new Date(user.birthday).toLocaleDateString("vi-VN") : "-"} />
            </Grid>
            <Grid size={6}>
              <InfoRow label="CMND/CCCD" value={user.identity_key?.id} />
            </Grid>
            <Grid size={6}>
              <InfoRow label="Ngày cấp" value={user.identity_key?.createdAt} />
            </Grid>
            <Grid size={12}>
              <InfoRow label="Nơi cấp" value={user.identity_key?.address} />
            </Grid>
          </Grid>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
      </DialogActions>
    </Dialog>
  );
}
