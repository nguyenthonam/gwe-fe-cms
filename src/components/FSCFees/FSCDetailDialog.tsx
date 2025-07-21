"use client";

import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Grid, Box, Divider, Stack } from "@mui/material";
import { IExtraFee } from "@/types/typeExtraFee";
import { EnumChip } from "../Globals/EnumChip";
import { formatCurrency } from "@/utils/hooks/hookCurrency";
import { orange } from "@mui/material/colors";
import { ECURRENCY } from "@/types/typeGlobals";

interface Props {
  open: boolean;
  onClose: () => void;
  extraFee: IExtraFee | null;
}

export default function FSCDetailDialog({ open, onClose, extraFee }: Props) {
  if (!extraFee) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle color="primary" sx={{ fontWeight: "bold" }}>
        FSC Fee Details
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <Grid container spacing={2}>
            <DetailItem label="Code" value={extraFee.code} />
            <DetailItem label="Name" value={extraFee.name} />
            <DetailItem label="Sub Carrier" value={typeof extraFee.carrierId === "object" ? extraFee.carrierId?.name : String(extraFee.carrierId)} />
            <DetailItem label="Service" value={typeof extraFee.serviceId === "object" ? extraFee.serviceId?.code : String(extraFee.serviceId)} />
            <DetailItem
              label="Value"
              value={
                <Typography component="span" sx={{ fontWeight: "bold", color: orange[500] }}>
                  {formatCurrency(extraFee.value, ECURRENCY.USD)}%
                </Typography>
              }
            />
            <DetailItem label="Start Date" value={extraFee.startDate ? new Date(extraFee.startDate).toLocaleDateString() : "-"} />
            <DetailItem label="End Date" value={extraFee.endDate ? new Date(extraFee.endDate).toLocaleDateString() : "-"} />
          </Grid>
        </Stack>

        <Divider sx={{ my: 2 }} />

        <Grid container spacing={2}>
          <Grid size={6}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
              Status
            </Typography>
            <EnumChip type="recordStatus" value={extraFee.status} />
          </Grid>
          {extraFee.createdAt && <DetailItem label="Created At" value={new Date(extraFee.createdAt).toLocaleString()} />}
          {extraFee.updatedAt && <DetailItem label="Updated At" value={new Date(extraFee.updatedAt).toLocaleString()} />}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Box flex={1} />
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// Helper sub-component for details
const DetailItem = ({ label, value }: { label: string; value?: React.ReactNode }) => (
  <Grid size={6}>
    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
      {label}
    </Typography>
    {typeof value === "string" || typeof value === "number" ? (
      <Typography variant="body2" sx={{ mb: 1 }}>
        {value ?? "-"}
      </Typography>
    ) : (
      value ?? "-"
    )}
  </Grid>
);
