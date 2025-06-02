"use client";

import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, Typography, Stack, Chip, Divider } from "@mui/material";
import { IPurchasePrice } from "@/types/typePurchasePrice";
import { EnumChip } from "@/components/Globals/EnumChip";
import { formatCurrency } from "@/utils/hooks/hookCurrency";
import { ECURRENCY, EPRODUCT_TYPE } from "@/types/typeGlobals";
import { blue } from "@mui/material/colors";

interface Props {
  open: boolean;
  onClose: () => void;
  purchasePrice: IPurchasePrice | null;
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

export default function PurchasePriceDetailDialog({ open, onClose, purchasePrice }: Props) {
  if (!purchasePrice) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle className="uppercase" color="primary" sx={{ fontWeight: "bold" }}>
        Chi tiết Giá Mua
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} mt={1}>
          <Grid container spacing={2}>
            <Grid size={6}>
              <InfoRow label="Nhà cung cấp" value={typeof purchasePrice.supplierId === "object" ? purchasePrice.supplierId?.name : purchasePrice.supplierId} />
            </Grid>
            <Grid size={6}>
              <InfoRow label="Hãng" value={typeof purchasePrice.carrierId === "object" ? purchasePrice.carrierId?.name : purchasePrice.carrierId} />
            </Grid>
            <Grid size={6}>
              <InfoRow label="Dịch vụ" value={typeof purchasePrice.serviceId === "object" ? purchasePrice.serviceId?.code : purchasePrice.serviceId} />
            </Grid>
            <Grid size={6}>
              <InfoRow label="Loại hàng" value={productTypeLabel[purchasePrice.productType]} />
            </Grid>
            <Grid size={12}>
              <Divider sx={{ my: 1 }} />
            </Grid>
            <Grid size={4}>
              <InfoRow label="Zone" value={purchasePrice.zone} />
            </Grid>
            <Grid size={4}>
              <InfoRow label="Từ KG" value={purchasePrice.weightMin + " KG"} />
            </Grid>
            <Grid size={4}>
              <InfoRow label="Đến KG" value={purchasePrice.weightMax + " KG"} />
            </Grid>
            <Grid size={12}>
              <Divider sx={{ my: 1 }} />
            </Grid>
            <Grid size={6}>
              <InfoRow label="Giá" value={formatCurrency(purchasePrice.price, purchasePrice.currency)} />
            </Grid>
            <Grid size={6}>
              <InfoRow label="Tiền tệ" value={purchasePrice.currency} />
            </Grid>
            <Grid size={6} gap={2}>
              <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                Loại giá
              </Typography>
              <Chip label={purchasePrice.isPricePerKG ? "Giá theo KG" : "Giá theo Gói"} color={purchasePrice.isPricePerKG ? "warning" : "success"} size="small" />
            </Grid>
            <Grid size={6} gap={1}>
              <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                Trạng thái
              </Typography>
              <EnumChip type="recordStatus" value={purchasePrice.status} />
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
