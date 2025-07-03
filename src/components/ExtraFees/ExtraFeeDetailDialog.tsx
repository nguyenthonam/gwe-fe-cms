"use client";

import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Grid, Box, Chip } from "@mui/material";
import { IExtraFee } from "@/types/typeExtraFee";
import { EnumChip } from "@/components/Globals/EnumChip"; // tạo file này hoặc nhét vào utils
import { EFEE_TYPE } from "@/types/typeGlobals";
import { Percent as PercentIcon, Payments as PaymentsIcon } from "@mui/icons-material";
import { formatCurrency } from "@/utils/hooks/hookCurrency";
import { green, orange, red } from "@mui/material/colors";

interface Props {
  open: boolean;
  onClose: () => void;
  extraFee: IExtraFee | null;
}

export default function ExtraFeeDetailDialog({ open, onClose, extraFee }: Props) {
  if (!extraFee) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle color="primary" sx={{ fontWeight: "bold" }}>
        CHI TIẾT PHỤ PHÍ
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid size={6}>
            <InfoRow label="Mã phụ phí" value={extraFee.code} />
          </Grid>
          <Grid size={6}>
            <InfoRow label="Tên phụ phí" value={extraFee.name} />
          </Grid>
          <Grid size={6}>
            <InfoRow label="Hãng vận chuyển" value={typeof extraFee.carrierId === "object" ? extraFee.carrierId?.name : String(extraFee.carrierId)} />
          </Grid>
          <Grid size={6}>
            <InfoRow label="Dịch vụ" value={typeof extraFee.serviceId === "object" ? extraFee.serviceId?.code : String(extraFee.serviceId)} />
          </Grid>
          <Grid size={6}>
            <InfoRow label="Loại phí" value={extraFee.type === EFEE_TYPE.PERCENT ? <PercentIcon sx={{ color: red[500] }} /> : <PaymentsIcon sx={{ color: orange[500] }} />} />
          </Grid>
          <Grid size={6}>
            <InfoRow
              label="Tiền tệ"
              value={
                <Chip
                  label={extraFee.currency}
                  size="small"
                  sx={{
                    backgroundColor: green[700],
                    color: "#fff",
                    fontWeight: 500,
                  }}
                />
              }
            />
          </Grid>
          <Grid size={12}>
            <InfoRow label="Giá trị" value={<Typography sx={{ fontWeight: "bold", color: orange[500] }}>{formatCurrency(extraFee.value, extraFee.currency)}</Typography>} />
          </Grid>
          <Grid size={12}>
            <InfoRow label="Trạng thái" value={<EnumChip type="recordStatus" value={extraFee.status} />} />
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
    <Typography sx={{ mb: 1 }}>{value ?? "-"}</Typography>
  </>
);
