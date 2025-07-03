"use client";

import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, Typography, Box } from "@mui/material";
import { ICompany } from "@/types/typeCompany";
import { EnumChip } from "@/components/Globals/EnumChip";

interface Props {
  open: boolean;
  onClose: () => void;
  company: ICompany | null;
}

export default function CompanySupplierDetailDialog({ open, onClose, company }: Props) {
  if (!company) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle color="primary" sx={{ fontWeight: "bold" }}>
        CHI TIẾT CÔNG TY CUNG ỨNG
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid size={12}>
            <InfoRow label="Mã Công Ty" value={company.code} />
          </Grid>
          <Grid size={12}>
            <InfoRow label="Tên Công Ty" value={company.name} />
          </Grid>
          <Grid size={12}>
            <InfoRow label="Mã số thuế" value={company.taxCode} />
          </Grid>
          <Grid size={12}>
            <InfoRow label="Địa chỉ" value={company.address} />
          </Grid>
          <Grid size={12}>
            <InfoRow label="Trạng thái" value={<EnumChip type="recordStatus" value={company.status} />} />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Box flex={1} />
        <Button onClick={onClose}>Đóng</Button>
      </DialogActions>
    </Dialog>
  );
}

const InfoRow = ({ label, value }: { label: string; value?: React.ReactNode }) => (
  <>
    <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
      {label}
    </Typography>
    <Typography sx={{ mb: 1 }}>{value || "-"} </Typography>
  </>
);
