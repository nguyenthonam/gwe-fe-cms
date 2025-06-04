"use client";

import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, MenuItem, Select, Grid } from "@mui/material";
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
  const [rate, setRate] = useState<number | "">("");
  const [loading, setLoading] = useState(false);

  const { showNotification } = useNotification();

  const handleSubmit = async () => {
    if (!currencyFrom || !currencyTo || !rate || currencyFrom === currencyTo) {
      showNotification("Vui lòng nhập đầy đủ thông tin hợp lệ!", "warning");
      return;
    }

    try {
      setLoading(true);
      await createExchangeRateApi({ currencyFrom, currencyTo, rate: Number(rate) });
      showNotification("Tạo tỉ giá thành công!", "success");
      onCreated();
    } catch (err: any) {
      showNotification(err.message || "Lỗi khi tạo tỉ giá!", "error");
    } finally {
      setLoading(false);
    }
  };

  const currencyOptions = Object.keys(ECURRENCY);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Tạo Tỉ Giá Mới</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <Grid container spacing={2}>
            <Grid size={6}>
              <Select value={currencyFrom} onChange={(e) => setCurrencyFrom(e.target.value as ECURRENCY)} fullWidth displayEmpty size="small">
                <MenuItem value="">Từ tiền tệ</MenuItem>
                {currencyOptions.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </Select>
            </Grid>
            <Grid size={6}>
              <Select value={currencyTo} onChange={(e) => setCurrencyTo(e.target.value as ECURRENCY)} fullWidth displayEmpty size="small">
                <MenuItem value="">Sang tiền tệ</MenuItem>
                {currencyOptions.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </Select>
            </Grid>
            <Grid size={12}>
              {/* <TextField label="Tỉ giá" fullWidth size="small" type="number" value={rate} onChange={(e) => setRate(Number(e.target.value))} /> */}
              <NumericInput label="Tỉ giá" fullWidth size="small" value={String(rate)} onChange={(val) => setRate(Number(val))} />
            </Grid>
          </Grid>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Huỷ</Button>
        <Button onClick={handleSubmit} disabled={loading} variant="contained">
          Tạo mới
        </Button>
      </DialogActions>
    </Dialog>
  );
}
