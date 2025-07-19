"use client";

import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, Typography, Stack, Divider } from "@mui/material";
import { IVATRate } from "@/types/typeVATRate";
import { EnumChip } from "@/components/Globals/EnumChip";

interface Props {
  open: boolean;
  onClose: () => void;
  vatRate: IVATRate | null;
  carriers?: any[];
  services?: any[];
  suppliers?: any[];
}

const InfoRow = ({ label, value }: { label: string; value?: React.ReactNode }) => (
  <Stack spacing={0.3}>
    <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
      {label}
    </Typography>
    <Typography sx={{ mb: 1 }}>{value ?? "-"}</Typography>
  </Stack>
);

export default function VATRateDetailDialog({ open, onClose, vatRate, carriers, services, suppliers }: Props) {
  if (!vatRate) return null;

  const getCarrierName = () => (typeof vatRate.carrierId === "object" ? vatRate.carrierId?.name : carriers?.find((c: any) => c._id === vatRate.carrierId)?.name || vatRate.carrierId);

  const getServiceCode = () => (typeof vatRate.serviceId === "object" ? vatRate.serviceId?.code : services?.find((s: any) => s._id === vatRate.serviceId)?.code || vatRate.serviceId);

  const getSupplierName = () => (typeof vatRate.supplierId === "object" ? vatRate.supplierId?.name : suppliers?.find((s: any) => s._id === vatRate.supplierId)?.name || vatRate.supplierId);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: "bold" }}>VAT Rate Details</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} mt={1}>
          <Grid container spacing={2}>
            <Grid size={6}>
              <InfoRow label="Carrier" value={getCarrierName()} />
            </Grid>
            <Grid size={6}>
              <InfoRow label="Service" value={getServiceCode()} />
            </Grid>
            <Grid size={6}>
              <InfoRow label="Supplier" value={getSupplierName()} />
            </Grid>
            <Grid size={6}>
              <InfoRow label="VAT (%)" value={vatRate.value + "%"} />
            </Grid>
            <Grid size={6}>
              <InfoRow label="Effective From" value={vatRate.startDate ? new Date(vatRate.startDate).toLocaleDateString() : "-"} />
            </Grid>
            <Grid size={6}>
              <InfoRow label="Effective To" value={vatRate.endDate ? new Date(vatRate.endDate).toLocaleDateString() : "-"} />
            </Grid>
            <Grid size={12}>
              <InfoRow label="Status" value={<EnumChip type="recordStatus" value={vatRate.status} />} />
            </Grid>
          </Grid>
          <Divider sx={{ my: 1 }} />
          <Grid container spacing={2}>
            <Grid size={6}>
              <InfoRow label="Created At" value={vatRate.createdAt ? new Date(vatRate.createdAt).toLocaleString() : "-"} />
            </Grid>
            <Grid size={6}>
              <InfoRow label="Last Updated" value={vatRate.updatedAt ? new Date(vatRate.updatedAt).toLocaleString() : "-"} />
            </Grid>
          </Grid>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
