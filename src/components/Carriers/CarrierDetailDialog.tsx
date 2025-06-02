"use client";

import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, Typography, Box, Chip } from "@mui/material";
import { EnumChip } from "../Globals/EnumChip";
import { ICarrier } from "@/types/typeCarrier";
import { orange } from "@mui/material/colors";

interface Props {
  open: boolean;
  onClose: () => void;
  carrier: ICarrier | null;
}

export default function CarrierDetailDialog({ open, onClose, carrier }: Props) {
  if (!carrier) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle color="primary" sx={{ fontWeight: "bold" }}>
        CHI TIẾT NHÀ VẬN CHUYỂN
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid size={12}>
            <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
              CODE
            </Typography>
            <Typography>{carrier.code}</Typography>
          </Grid>
          <Grid size={12}>
            <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
              TÊN NHÀ VẬN CHUYỂN
            </Typography>
            <Typography>{carrier.name}</Typography>
          </Grid>
          <Grid size={12}>
            <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
              HÃNG BAY
            </Typography>
            <Typography>{(carrier as any).companyId?.name || carrier.companyId}</Typography>
          </Grid>
          <Grid size={12}>
            <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
              CÁCH TÍNH CÂN NẶNG
            </Typography>
            <EnumChip type="chargeWeightType" value={carrier.chargeableWeightType} />
          </Grid>
          <Grid size={12}>
            <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
              HỆ SỐ QUY ĐỔI THỂ TÍCH
            </Typography>
            <Chip
              label={carrier.volWeightRate}
              size="small"
              sx={{
                backgroundColor: orange[300],
                color: "#fff",
                fontWeight: 500,
              }}
            />
          </Grid>
          <Grid size={12}>
            <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
              TRẠNG THÁI
            </Typography>
            <EnumChip type="recordStatus" value={carrier.status} />
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
