"use client";

import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, MenuItem, Stack, Grid } from "@mui/material";
import { useEffect, useState } from "react";
import { ICarrier } from "@/types";
import { getCompanyCarriersApi, updateCarrierApi } from "@/utils/apis/apiCarrier";
import { useNotification } from "@/contexts/NotificationProvider";
import { ECHARGEABLE_WEIGHT_TYPE } from "@/types/typeGlobals";
import { ICompany } from "@/types/typeCompany";

interface Props {
  open: boolean;
  onClose: () => void;
  onUpdated: () => void;
  carrier: ICarrier | null;
}

export default function UpdateCarrierDialog({ open, onClose, onUpdated, carrier }: Props) {
  const [form, setForm] = useState<ICarrier>({} as ICarrier);
  const [loading, setLoading] = useState(false);
  const [companyOptions, setCompanyOptions] = useState<ICompany[]>([]);
  const { showNotification } = useNotification();

  useEffect(() => {
    getCompanyCarriersApi().then((res) => setCompanyOptions(res?.data?.data?.data || []));
  }, []);

  useEffect(() => {
    if (carrier) {
      const normalizedCompanyId = typeof carrier.companyId === "object" ? carrier.companyId?._id : carrier.companyId;
      setForm({ ...carrier, companyId: normalizedCompanyId });
    }
  }, [carrier]);

  const handleChange = (field: keyof ICarrier, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      if (!form?._id) return;
      setLoading(true);
      await updateCarrierApi(form._id, form);
      showNotification("Cập nhật thành công", "success");
      onUpdated();
    } catch (err: any) {
      showNotification(err.message || "Lỗi cập nhật", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Cập nhật Nhà Vận Chuyển</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <Grid container spacing={2}>
            <Grid size={6}>
              <TextField label="Mã" value={form.code || ""} onChange={(e) => handleChange("code", e.target.value)} fullWidth size="small" />
            </Grid>
            <Grid size={6}>
              <TextField label="Tên" value={form.name || ""} onChange={(e) => handleChange("name", e.target.value)} fullWidth size="small" />
            </Grid>
            {/* <Grid size={12}>
              <TextField label="Hãng Bay" value={form.companyId || ""} onChange={(e) => handleChange("companyId", e.target.value)} fullWidth size="small" />
            </Grid> */}

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
              <TextField label="Cách tính cân nặng" select value={form.chargeableWeightType} onChange={(e) => handleChange("chargeableWeightType", +e.target.value)} fullWidth size="small">
                <MenuItem value={ECHARGEABLE_WEIGHT_TYPE.DETAIL}>Tính theo kiện</MenuItem>
                <MenuItem value={ECHARGEABLE_WEIGHT_TYPE.TOTAL}>Tính toàn bộ</MenuItem>
              </TextField>
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
