"use client";

import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, Typography, Stack, Chip, Divider } from "@mui/material";
import { ISalePrice } from "@/types/typeSalePrice";
import { EnumChip } from "@/components/Globals/EnumChip";
import { formatCurrency } from "@/utils/hooks/hookCurrency";
import { EPRODUCT_TYPE } from "@/types/typeGlobals";

interface Props {
  open: boolean;
  onClose: () => void;
  salePrice: ISalePrice | null;
}

const productTypeLabel: Record<EPRODUCT_TYPE, string> = {
  [EPRODUCT_TYPE.DOCUMENT]: "Document",
  [EPRODUCT_TYPE.PARCEL]: "Parcel",
};

const InfoRow = ({ label, value }: { label: string; value?: React.ReactNode }) => (
  <>
    <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
      {label}
    </Typography>
    <Typography sx={{ mb: 1 }}>{value ?? "-"}</Typography>
  </>
);

export default function SalePriceDetailDialog({ open, onClose, salePrice }: Props) {
  if (!salePrice) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle className="uppercase" color="primary" sx={{ fontWeight: "bold" }}>
        Chi tiết Giá Bán
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} mt={1}>
          <Grid container spacing={2}>
            <Grid size={6}>
              <InfoRow label="Partner" value={typeof salePrice.partnerId === "object" ? salePrice.partnerId?.name : salePrice.partnerId} />
            </Grid>
            <Grid size={6}>
              <InfoRow label="Hãng" value={typeof salePrice.carrierId === "object" ? salePrice.carrierId?.name : salePrice.carrierId} />
            </Grid>
            <Grid size={6}>
              <InfoRow label="Dịch vụ" value={typeof salePrice.serviceId === "object" ? salePrice.serviceId?.code : salePrice.serviceId} />
            </Grid>
            <Grid size={6}>
              <InfoRow label="Loại hàng" value={productTypeLabel[salePrice.productType]} />
            </Grid>
            <Grid size={12}>
              <Divider sx={{ my: 1 }} />
            </Grid>
            <Grid size={4}>
              <InfoRow label="Zone" value={salePrice.zone} />
            </Grid>
            <Grid size={4}>
              <InfoRow label="Từ KG" value={salePrice.weightMin + " KG"} />
            </Grid>
            <Grid size={4}>
              <InfoRow label="Đến KG" value={salePrice.weightMax + " KG"} />
            </Grid>
            <Grid size={12}>
              <Divider sx={{ my: 1 }} />
            </Grid>
            <Grid size={6}>
              <InfoRow label="Giá" value={formatCurrency(salePrice.price, salePrice.currency)} />
            </Grid>
            <Grid size={6}>
              <InfoRow label="Tiền tệ" value={salePrice.currency} />
            </Grid>
            <Grid size={6}>
              <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                Loại giá
              </Typography>
              <Chip label={salePrice.isPricePerKG ? "Giá theo KG" : "Giá theo Gói"} color={salePrice.isPricePerKG ? "warning" : "success"} size="small" />
            </Grid>
            <Grid size={6}>
              <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                Trạng thái
              </Typography>
              <EnumChip type="recordStatus" value={salePrice.status} />
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
