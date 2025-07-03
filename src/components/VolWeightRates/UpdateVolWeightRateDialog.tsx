"use client";

import { Dialog, DialogTitle, DialogContent, DialogActions, Button, MenuItem, Select, Stack, Grid, InputLabel, FormControl } from "@mui/material";
import { useState, useEffect } from "react";
import { useNotification } from "@/contexts/NotificationProvider";
import { updateVolWeightRateApi } from "@/utils/apis/apiVolWeightRate";
import { getCarriersApi } from "@/utils/apis/apiCarrier";
import { getSuppliersApi } from "@/utils/apis/apiSupplier";
import NumericInput from "../Globals/NumericInput";
import { IVolWeightRate } from "@/types/typeVolWeightRate";

interface Props {
  open: boolean;
  onClose: () => void;
  onUpdated: () => void;
  volWeightRate: IVolWeightRate | null;
}

export default function UpdateVolWeightRateDialog({ open, onClose, onUpdated, volWeightRate }: Props) {
  const [carriers, setCarriers] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [carrierId, setCarrierId] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [value, setValue] = useState("5000");
  const [loading, setLoading] = useState(false);

  const { showNotification } = useNotification();

  useEffect(() => {
    if (open && volWeightRate) {
      getCarriersApi().then((res) => setCarriers(res?.data?.data?.data || []));
      getSuppliersApi().then((res) => setSuppliers(res?.data?.data?.data || []));
      setCarrierId(typeof volWeightRate.carrierId === "object" ? volWeightRate.carrierId?._id || "" : volWeightRate.carrierId || "");
      setSupplierId(typeof volWeightRate.supplierId === "object" ? volWeightRate.supplierId?._id || "" : volWeightRate.supplierId || "");
      setValue(volWeightRate.value?.toString() || "5000");
    }
  }, [open, volWeightRate]);

  const handleSubmit = async () => {
    if (!volWeightRate?._id) return;
    if (!carrierId || !supplierId || !value) {
      showNotification("Vui lòng nhập đầy đủ thông tin!", "warning");
      return;
    }
    try {
      setLoading(true);
      await updateVolWeightRateApi(volWeightRate._id, {
        carrierId,
        supplierId,
        value: Number(value),
      });
      showNotification("Cập nhật tỉ lệ quy đổi thành công", "success");
      onUpdated();
    } catch (err: any) {
      showNotification(err.message || "Lỗi cập nhật VolWeightRate", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Cập nhật Tỉ Lệ Quy Đổi</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <Grid container spacing={2}>
            <Grid size={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Hãng</InputLabel>
                <Select label="Hãng" value={carrierId} onChange={(e) => setCarrierId(e.target.value)}>
                  {carriers.map((c) => (
                    <MenuItem key={c._id} value={c._id}>
                      {c.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Supplier</InputLabel>
                <Select label="Supplier" value={supplierId} onChange={(e) => setSupplierId(e.target.value)}>
                  {suppliers.map((s) => (
                    <MenuItem key={s._id} value={s._id}>
                      {s.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={6}>
              <NumericInput label="Tỉ lệ quy đổi" fullWidth size="small" value={value} onChange={setValue} />
            </Grid>
          </Grid>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Huỷ</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          Cập nhật
        </Button>
      </DialogActions>
    </Dialog>
  );
}
