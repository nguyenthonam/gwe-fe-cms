"use client";

import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, Typography, Divider, Grid, Chip } from "@mui/material";
import { IExchangeRate } from "@/types/typeExchangeRate";
import { EnumChip } from "../Globals/EnumChip";
import { formatCurrency } from "@/utils/hooks/hookCurrency";
import { ECURRENCY } from "@/types/typeGlobals";

interface Props {
  open: boolean;
  onClose: () => void;
  exchangeRate: IExchangeRate | null;
}

const formatDate = (date?: string | Date | null) => (date ? new Date(date).toLocaleDateString("en-GB") : "-");

export default function ExchangeRateDetailDialog({ open, onClose, exchangeRate }: Props) {
  if (!exchangeRate) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: "bold" }} color="primary">
        EXCHANGE RATE DETAILS
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          {/* BASIC INFO */}
          <Typography fontWeight={600}>Basic Information</Typography>
          <Grid container spacing={2}>
            <Grid size={5}>
              <Typography variant="body2">From Currency</Typography>
            </Grid>
            <Grid size={7}>
              <Chip
                label={exchangeRate.currencyFrom}
                size="small"
                sx={{
                  backgroundColor: "#4caf50",
                  color: "#fff",
                  fontWeight: 500,
                  fontSize: 15,
                }}
              />
            </Grid>
            <Grid size={5}>
              <Typography variant="body2">To Currency</Typography>
            </Grid>
            <Grid size={7}>
              <Chip
                label={exchangeRate.currencyTo}
                size="small"
                sx={{
                  backgroundColor: "#ff9800",
                  color: "#fff",
                  fontWeight: 500,
                  fontSize: 15,
                }}
              />
            </Grid>
            <Grid size={5}>
              <Typography variant="body2">Rate</Typography>
            </Grid>
            <Grid size={7}>
              <Typography fontWeight={700} fontSize={17} color="primary">
                {formatCurrency(exchangeRate.rate, exchangeRate.currencyTo as ECURRENCY)}
              </Typography>
            </Grid>
            <Grid size={5}>
              <Typography variant="body2">Effective From</Typography>
            </Grid>
            <Grid size={7}>
              <Typography fontWeight={500}>{formatDate(exchangeRate.startDate)}</Typography>
            </Grid>
            <Grid size={5}>
              <Typography variant="body2">Effective To</Typography>
            </Grid>
            <Grid size={7}>
              <Typography fontWeight={500}>{formatDate(exchangeRate.endDate)}</Typography>
            </Grid>
            <Grid size={5}>
              <Typography variant="body2">Status</Typography>
            </Grid>
            <Grid size={7}>
              <EnumChip type="recordStatus" value={exchangeRate.status} />
            </Grid>
          </Grid>

          {/* CREATED AT */}
          {exchangeRate.createdAt && (
            <>
              <Divider sx={{ my: 1 }} />
              <Grid container spacing={2}>
                <Grid size={5}>
                  <Typography variant="body2">Created At</Typography>
                </Grid>
                <Grid size={7}>
                  <Typography fontWeight={500}>{formatDate(exchangeRate.createdAt)}</Typography>
                </Grid>
              </Grid>
            </>
          )}
          {/* UPDATED AT */}
          {exchangeRate.updatedAt && (
            <Grid container spacing={2}>
              <Grid size={5}>
                <Typography variant="body2">Updated At</Typography>
              </Grid>
              <Grid size={7}>
                <Typography fontWeight={500}>{formatDate(exchangeRate.updatedAt)}</Typography>
              </Grid>
            </Grid>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
