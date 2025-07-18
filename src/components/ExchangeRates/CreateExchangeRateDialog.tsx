"use client";

import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, MenuItem, Select, Grid, TextField, FormHelperText } from "@mui/material";
import { useState } from "react";
import { ECURRENCY } from "@/types/typeGlobals";
import { useNotification } from "@/contexts/NotificationProvider";
import { createExchangeRateApi } from "@/utils/apis/apiExchangeRate";
import NumericInput from "../Globals/NumericInput";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateExchangeRateDialog({ open, onClose, onCreated }: Props) {
  const [currencyFrom, setCurrencyFrom] = useState<ECURRENCY | "">("");
  const [currencyTo, setCurrencyTo] = useState<ECURRENCY | "">("");
  const [rate, setRate] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const { showNotification } = useNotification();

  // Realtime validate date
  const isDateInvalid = !!startDate && !!endDate && new Date(startDate) > new Date(endDate);

  const canSubmit = currencyFrom && currencyTo && rate && startDate && endDate && currencyFrom !== currencyTo && !isDateInvalid;

  const handleSubmit = async () => {
    if (!canSubmit) {
      showNotification("Please fill in all required fields correctly!", "warning");
      return;
    }
    try {
      setLoading(true);
      await createExchangeRateApi({
        currencyFrom,
        currencyTo,
        rate: Number(rate),
        startDate,
        endDate,
      });
      showNotification("Exchange rate created successfully!", "success");
      onCreated();
      setCurrencyFrom("");
      setCurrencyTo("");
      setRate("");
      setStartDate("");
      setEndDate("");
    } catch (err: any) {
      showNotification(err.message || "Failed to create exchange rate!", "error");
    } finally {
      setLoading(false);
    }
  };

  const currencyOptions = Object.keys(ECURRENCY);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Create Exchange Rate</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <Grid container spacing={2}>
            <Grid size={6}>
              <Select value={currencyFrom} onChange={(e) => setCurrencyFrom(e.target.value as ECURRENCY)} fullWidth displayEmpty size="small">
                <MenuItem value="">From currency</MenuItem>
                {currencyOptions.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </Select>
            </Grid>
            <Grid size={6}>
              <Select value={currencyTo} onChange={(e) => setCurrencyTo(e.target.value as ECURRENCY)} fullWidth displayEmpty size="small">
                <MenuItem value="">To currency</MenuItem>
                {currencyOptions.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </Select>
            </Grid>
            <Grid size={6}>
              <TextField
                type="date"
                label="Start Date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
                error={isDateInvalid}
              />
            </Grid>
            <Grid size={6}>
              <TextField type="date" label="End Date" value={endDate} onChange={(e) => setEndDate(e.target.value)} fullWidth size="small" InputLabelProps={{ shrink: true }} error={isDateInvalid} />
            </Grid>
            {isDateInvalid && (
              <Grid size={12}>
                <FormHelperText error>{`"Start Date" must be less than or equal to "End Date"`}</FormHelperText>
              </Grid>
            )}
            <Grid size={12}>
              <NumericInput label="Exchange Rate" fullWidth size="small" value={rate} onChange={(val) => setRate(val)} />
            </Grid>
          </Grid>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} disabled={loading || !canSubmit} variant="contained">
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
}
