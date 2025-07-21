"use client";

import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, Typography, Stack, Avatar } from "@mui/material";
import { IUser } from "@/types/typeUser";
import { EnumChip } from "@/components/Globals/EnumChip";
import { EGENDER } from "@/types/typeGlobals";

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
        User Details
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
              <InfoRow label="Status" value={<EnumChip type="recordStatus" value={user.status} />} />
            </Grid>
            <Grid size={6}>
              <InfoRow label="Company" value={typeof user.companyId === "object" ? user.companyId?.name : user.companyId} />
            </Grid>
            <Grid size={6}>
              <InfoRow label="Contact Name" value={user.contact?.fullname} />
            </Grid>
            <Grid size={6}>
              <InfoRow label="Contact Number" value={user.contact?.phone} />
            </Grid>
            <Grid size={6}>
              <InfoRow label="Gender" value={user.gender === EGENDER.MALE ? "Male" : user.gender === EGENDER.FEMALE ? "Female" : "-"} />
            </Grid>
            <Grid size={6}>
              <InfoRow label="Birthday" value={user.birthday ? new Date(user.birthday).toLocaleDateString("en-GB") : "-"} />
            </Grid>
            <Grid size={6}>
              <InfoRow label="ID Number" value={user.identity_key?.id} />
            </Grid>
            <Grid size={6}>
              <InfoRow label="Issued Date" value={user.identity_key?.createdAt} />
            </Grid>
            <Grid size={12}>
              <InfoRow label="Issued By" value={user.identity_key?.address} />
            </Grid>
          </Grid>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
