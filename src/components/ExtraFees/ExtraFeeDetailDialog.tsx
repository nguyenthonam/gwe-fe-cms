"use client";

import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Grid, Box, Chip, Divider } from "@mui/material";
import { IExtraFee } from "@/types/typeExtraFee";
import { EnumChip } from "@/components/Globals/EnumChip";
import { formatCurrency } from "@/utils/hooks/hookCurrency";
import { green, orange } from "@mui/material/colors";

interface Props {
  open: boolean;
  onClose: () => void;
  extraFee: IExtraFee | null;
}

const formatDate = (date?: string | Date | null) => (date ? new Date(date).toLocaleDateString("en-GB") : "-");

export default function ExtraFeeDetailDialog({ open, onClose, extraFee }: Props) {
  if (!extraFee) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle color="primary" sx={{ fontWeight: "bold" }}>
        Extra Fee Details
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          <InfoRow label="Fee Code" value={extraFee.code} />
          <InfoRow label="Fee Name" value={extraFee.name} />
          <InfoRow label="Sub Carrier" value={typeof extraFee.carrierId === "object" ? extraFee.carrierId?.name : String(extraFee.carrierId)} />
          <InfoRow label="Service" value={typeof extraFee.serviceId === "object" ? extraFee.serviceId?.code : String(extraFee.serviceId)} />

          <InfoRow
            label="Value"
            value={
              <Box display="flex" alignItems="center" gap={1}>
                <Typography sx={{ fontWeight: "bold", color: orange[500] }}>{formatCurrency(extraFee.value, extraFee.currency)}</Typography>
                <Chip
                  label={extraFee.currency}
                  size="small"
                  sx={{
                    backgroundColor: green[700],
                    color: "#fff",
                    fontWeight: 500,
                  }}
                />
              </Box>
            }
          />
          {/* Effective Dates */}
          <InfoRow label="Effective From" value={formatDate((extraFee as any).startDate)} />
          <InfoRow label="Effective To" value={formatDate((extraFee as any).endDate)} />
          <InfoRow label="Status" value={<EnumChip type="recordStatus" value={extraFee.status} />} />
        </Grid>
        {(extraFee.createdAt || extraFee.updatedAt) && (
          <>
            <Divider sx={{ my: 1 }} />
            <Grid container spacing={2}>
              {extraFee.createdAt && <InfoRow label="Created At" value={formatDate(extraFee.createdAt)} />}
              {extraFee.updatedAt && <InfoRow label="Last Updated" value={formatDate(extraFee.updatedAt)} />}
            </Grid>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Box flex={1} />
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

// InfoRow - Correct Grid usage, no <p> nesting
const InfoRow = ({ label, value }: { label: string; value?: React.ReactNode }) => (
  <>
    <Grid size={5}>
      <Typography variant="body2" fontWeight={600}>
        {label}
      </Typography>
    </Grid>
    <Grid size={7}>{typeof value === "string" || typeof value === "number" || value == null ? <Typography sx={{ mb: 1 }}>{value ?? "-"}</Typography> : <Box sx={{ mb: 1 }}>{value}</Box>}</Grid>
  </>
);
