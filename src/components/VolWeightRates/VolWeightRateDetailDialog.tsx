"use client";

import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, Typography, Stack } from "@mui/material";
import { IVolWeightRate } from "@/types/typeVolWeightRate";
import { EnumChip } from "@/components/Globals/EnumChip";

interface Props {
  open: boolean;
  onClose: () => void;
  volWeightRate: IVolWeightRate | null;
  carriers?: any[];
  suppliers?: any[];
}

const InfoRow = ({ label, value }: { label: string; value?: React.ReactNode }) => (
  <>
    <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
      {label}
    </Typography>
    <Typography sx={{ mb: 1 }}>{value ?? "-"}</Typography>
  </>
);

export default function VolWeightRateDetailDialog({ open, onClose, volWeightRate, carriers, suppliers }: Props) {
  if (!volWeightRate) return null;

  const getCarrierName = () =>
    typeof volWeightRate.carrierId === "object" ? volWeightRate.carrierId?.name : carriers?.find((c: any) => c._id === volWeightRate.carrierId)?.name || volWeightRate.carrierId;

  const getSupplierName = () =>
    typeof volWeightRate.supplierId === "object" ? volWeightRate.supplierId?.name : suppliers?.find((s: any) => s._id === volWeightRate.supplierId)?.name || volWeightRate.supplierId;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: "bold" }}>Chi tiết Tỉ Lệ Quy Đổi</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} mt={1}>
          <Grid container spacing={2}>
            <Grid size={6}>
              <InfoRow label="Hãng" value={getCarrierName()} />
            </Grid>
            <Grid size={6}>
              <InfoRow label="Supplier" value={getSupplierName()} />
            </Grid>
            <Grid size={6}>
              <InfoRow label="Tỉ lệ quy đổi" value={volWeightRate.value} />
            </Grid>
            <Grid size={6}>
              <InfoRow label="Trạng thái" value={<EnumChip type="recordStatus" value={volWeightRate.status} />} />
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
