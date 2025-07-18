"use client";

import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, MenuItem, Select, Grid, TextField, FormHelperText } from "@mui/material";
import { useEffect, useState } from "react";
import { IExchangeRate } from "@/types/typeExchangeRate";
import { ECURRENCY } from "@/types/typeGlobals";
import { useNotification } from "@/contexts/NotificationProvider";
import { updateExchangeRateApi } from "@/utils/apis/apiExchangeRate";
import NumericInput from "../Globals/NumericInput";

interface Props {
  open: boolean;
  onClose: () => void;
  onUpdated: () => void;
  exchangeRate: IExchangeRate | null;
}

type ExchangeRateForm = Omit<IExchangeRate, "rate"> & { rate?: string };

export default function UpdateExchangeRateDialog({ open, onClose, onUpdated, exchangeRate }: Props) {
  const [form, setForm] = useState<Partial<ExchangeRateForm>>({});
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();

  useEffect(() => {
    if (open && exchangeRate?._id) {
      setForm({
        ...exchangeRate,
        startDate: exchangeRate.startDate ? exchangeRate.startDate.slice(0, 10) : "",
        endDate: exchangeRate.endDate ? exchangeRate.endDate.slice(0, 10) : "",
        rate: exchangeRate.rate !== undefined ? String(exchangeRate.rate) : "",
      });
    } else if (!open) {
      setForm({});
    }
  }, [open, exchangeRate]);

  const handleChange = (field: keyof ExchangeRateForm, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // Validate date logic
  const isDateInvalid = !!form.startDate && !!form.endDate && new Date(form.startDate) > new Date(form.endDate);

  const canSubmit = form.currencyFrom && form.currencyTo && form.rate && form.startDate && form.endDate && form.currencyFrom !== form.currencyTo && !isDateInvalid;

  const handleSubmit = async () => {
    if (!exchangeRate?._id || !canSubmit) {
      showNotification("Please fill in all required fields correctly!", "warning");
      return;
    }

    // Build changedFields only with actual changes, correct types for API
    const changedFields: Partial<IExchangeRate> = {};

    if (form.currencyFrom && form.currencyFrom !== exchangeRate.currencyFrom) {
      changedFields.currencyFrom = form.currencyFrom;
    }
    if (form.currencyTo && form.currencyTo !== exchangeRate.currencyTo) {
      changedFields.currencyTo = form.currencyTo;
    }
    if (typeof form.rate === "string" && form.rate !== "" && Number(form.rate) !== exchangeRate.rate) {
      changedFields.rate = Number(form.rate);
    }
    if (typeof form.startDate === "string" && form.startDate !== "" && form.startDate !== exchangeRate.startDate?.slice(0, 10)) {
      changedFields.startDate = form.startDate;
    }
    if (typeof form.endDate === "string" && form.endDate !== "" && form.endDate !== exchangeRate.endDate?.slice(0, 10)) {
      changedFields.endDate = form.endDate;
    }

    if (Object.keys(changedFields).length === 0) {
      showNotification("No changes to update.", "info");
      return;
    }

    try {
      setLoading(true);
      await updateExchangeRateApi(exchangeRate._id, changedFields);
      showNotification("Update successful!", "success");
      onUpdated();
    } catch (err: any) {
      showNotification(err.message || "Failed to update exchange rate!", "error");
    } finally {
      setLoading(false);
    }
  };

  const currencyOptions = Object.keys(ECURRENCY);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Update Exchange Rate</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <Grid container spacing={2}>
            <Grid size={6}>
              <Select value={form.currencyFrom || ""} onChange={(e) => handleChange("currencyFrom", e.target.value)} fullWidth size="small">
                <MenuItem value="">From currency</MenuItem>
                {currencyOptions.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </Select>
            </Grid>
            <Grid size={6}>
              <Select value={form.currencyTo || ""} onChange={(e) => handleChange("currencyTo", e.target.value)} fullWidth size="small">
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
                value={form.startDate || ""}
                onChange={(e) => handleChange("startDate", e.target.value)}
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
                error={isDateInvalid}
              />
            </Grid>
            <Grid size={6}>
              <TextField
                type="date"
                label="End Date"
                value={form.endDate || ""}
                onChange={(e) => handleChange("endDate", e.target.value)}
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
                error={isDateInvalid}
              />
            </Grid>
            {isDateInvalid && (
              <Grid size={12}>
                <FormHelperText error>{`"Start Date" must be less than or equal to "End Date"`}</FormHelperText>
              </Grid>
            )}
            <Grid size={12}>
              <NumericInput label="Exchange Rate" fullWidth size="small" value={form.rate ?? ""} onChange={(val) => handleChange("rate", val)} />
            </Grid>
          </Grid>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={loading || !canSubmit}>
          Update
        </Button>
      </DialogActions>
    </Dialog>
  );
}
