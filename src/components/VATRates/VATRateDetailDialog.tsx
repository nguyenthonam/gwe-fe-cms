"use client";

import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, Typography, Stack } from "@mui/material";
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
  <>
    <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
      {label}
    </Typography>
    <Typography sx={{ mb: 1 }}>{value ?? "-"}</Typography>
  </>
);

export default function VATRateDetailDialog({ open, onClose, vatRate, carriers, services, suppliers }: Props) {
  if (!vatRate) return null;

  // Helper để lấy tên từ id nếu object
  const getCarrierName = () => (typeof vatRate.carrierId === "object" ? vatRate.carrierId?.name : carriers?.find((c: any) => c._id === vatRate.carrierId)?.name || vatRate.carrierId);

  const getServiceCode = () => (typeof vatRate.serviceId === "object" ? vatRate.serviceId?.code : services?.find((s: any) => s._id === vatRate.serviceId)?.code || vatRate.serviceId);

  const getSupplierName = () => (typeof vatRate.supplierId === "object" ? vatRate.supplierId?.name : suppliers?.find((s: any) => s._id === vatRate.supplierId)?.name || vatRate.supplierId);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: "bold" }}>Chi tiết Thuế VAT</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} mt={1}>
          <Grid container spacing={2}>
            <Grid size={6}>
              <InfoRow label="Hãng" value={getCarrierName()} />
            </Grid>
            <Grid size={6}>
              <InfoRow label="Dịch vụ" value={getServiceCode()} />
            </Grid>
            <Grid size={6}>
              <InfoRow label="Supplier" value={getSupplierName()} />
            </Grid>
            <Grid size={6}>
              <InfoRow label="VAT (%)" value={vatRate.value + "%"} />
            </Grid>
            <Grid size={12}>
              <InfoRow label="Trạng thái" value={<EnumChip type="recordStatus" value={vatRate.status} />} />
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
