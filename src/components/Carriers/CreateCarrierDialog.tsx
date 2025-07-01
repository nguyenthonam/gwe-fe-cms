"use client";

import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Stack, Grid, MenuItem } from "@mui/material";
import { useEffect, useState } from "react";
import { createCarrierApi, getCompanyCarriersApi } from "@/utils/apis/apiCarrier";
import { useNotification } from "@/contexts/NotificationProvider";
import { ECHARGEABLE_WEIGHT_TYPE } from "@/types/typeGlobals";
import { ICarrier } from "@/types/typeCarrier";
import { ICompany } from "@/types/typeCompany";
import NumericInput from "../Globals/NumericInput";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateCarrierDialog({ open, onClose, onCreated }: Props) {
  const [form, setForm] = useState<Partial<ICarrier>>({ chargeableWeightType: ECHARGEABLE_WEIGHT_TYPE.DETAIL, volWeightRate: 5000 });
  const [loading, setLoading] = useState(false);
  const [companyOptions, setCompanyOptions] = useState<ICompany[]>([]);
  const { showNotification } = useNotification();

  useEffect(() => {
    getCompanyCarriersApi().then((res) => setCompanyOptions(res?.data?.data?.data || []));
  }, []);

  const handleChange = (field: keyof ICarrier, value: any) => {
    setForm({ ...form, [field]: value });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await createCarrierApi(form as ICarrier);
      showNotification("Tạo thành công", "success");
      onCreated();
      setForm({ chargeableWeightType: ECHARGEABLE_WEIGHT_TYPE.DETAIL });
    } catch (err: any) {
      showNotification(err.message || "Lỗi khi tạo mới", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Tạo Nhà Vận Chuyển</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <Grid container spacing={2}>
            <Grid size={12}>
              <TextField label="Hãng bay" select value={form.companyId || ""} onChange={(e) => handleChange("companyId", e.target.value)} fullWidth size="small">
                {companyOptions.map((c) => (
                  <MenuItem key={c._id} value={c._id}>
                    {c.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={12}>
              <TextField label="Mã code" value={form.code || ""} onChange={(e) => handleChange("code", e.target.value)} fullWidth size="small" />
            </Grid>
            <Grid size={12}>
              <TextField label="Tên nhà vận chuyển" value={form.name || ""} onChange={(e) => handleChange("name", e.target.value)} fullWidth size="small" />
            </Grid>

            <Grid size={12}>
              <TextField label="Cách tính cân nặng" select value={form.chargeableWeightType || ""} onChange={(e) => handleChange("chargeableWeightType", e.target.value)} fullWidth size="small">
                <MenuItem value={ECHARGEABLE_WEIGHT_TYPE.DETAIL}>Tính theo kiện</MenuItem>
                <MenuItem value={ECHARGEABLE_WEIGHT_TYPE.TOTAL}>Tính toàn bộ</MenuItem>
              </TextField>
            </Grid>
            <Grid size={12}>
              <NumericInput label="Hệ số quy đổi thể tích" fullWidth size="small" value={String(form.volWeightRate || "")} onChange={(val) => handleChange("volWeightRate", Number(val))} />
            </Grid>
          </Grid>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Huỷ</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={loading}>
          Tạo
        </Button>
      </DialogActions>
    </Dialog>
  );
}
