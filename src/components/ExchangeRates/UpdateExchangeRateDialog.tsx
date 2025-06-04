"use client";

import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, MenuItem, Select, Grid } from "@mui/material";
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

export default function UpdateExchangeRateDialog({ open, onClose, onUpdated, exchangeRate }: Props) {
  const [form, setForm] = useState<Partial<IExchangeRate>>({});
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();

  useEffect(() => {
    if (open && exchangeRate?._id) {
      setForm(exchangeRate);
    }
  }, [open, exchangeRate]);

  const handleChange = (field: keyof IExchangeRate, value: any) => {
    setForm({ ...form, [field]: value });
  };

  const handleSubmit = async () => {
    if (!exchangeRate?._id) return;

    // Kiểm tra thay đổi
    const changedFields: Partial<IExchangeRate> = {};
    const keys: (keyof IExchangeRate)[] = ["currencyFrom", "currencyTo", "rate"];

    keys.forEach((key) => {
      if (form[key] !== exchangeRate[key]) {
        changedFields[key] = form[key] as any;
      }
    });

    if (Object.keys(changedFields).length === 0) {
      showNotification("Không có thay đổi để cập nhật", "info");
      return;
    }

    try {
      setLoading(true);
      await updateExchangeRateApi(exchangeRate._id, changedFields);
      showNotification("Cập nhật thành công!", "success");
      onUpdated();
    } catch (err: any) {
      showNotification(err.message || "Lỗi cập nhật!", "error");
    } finally {
      setLoading(false);
    }
  };

  const currencyOptions = Object.keys(ECURRENCY);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Cập nhật Tỉ Giá</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <Grid container spacing={2}>
            <Grid size={6}>
              <Select value={form.currencyFrom || ""} onChange={(e) => handleChange("currencyFrom", e.target.value)} fullWidth size="small">
                <MenuItem value="">Từ tiền tệ</MenuItem>
                {currencyOptions.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </Select>
            </Grid>
            <Grid size={6}>
              <Select value={form.currencyTo || ""} onChange={(e) => handleChange("currencyTo", e.target.value)} fullWidth size="small">
                <MenuItem value="">Sang tiền tệ</MenuItem>
                {currencyOptions.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </Select>
            </Grid>
            <Grid size={12}>
              {/* <TextField label="Tỉ giá" type="number" fullWidth size="small" value={form.rate ?? ""} onChange={(e) => handleChange("rate", Number(e.target.value))} /> */}
              <NumericInput label="Tỉ giá" fullWidth size="small" value={String(form.rate ?? "")} onChange={(val) => handleChange("rate", Number(val))} />
            </Grid>
          </Grid>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Huỷ</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={loading}>
          Cập nhật
        </Button>
      </DialogActions>
    </Dialog>
  );
}
