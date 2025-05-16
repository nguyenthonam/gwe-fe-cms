"use client";

import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Stack, Grid } from "@mui/material";
import { useEffect, useState } from "react";
import { ICompany } from "@/types/typeCompany";
import { updateCompanyCarrierApi } from "@/utils/apis/apiCarrier";
import { useNotification } from "@/contexts/NotificationProvider";

interface Props {
  open: boolean;
  onClose: () => void;
  onUpdated: () => void;
  company: ICompany | null;
}

export default function UpdateCompanyCarrierDialog({ open, onClose, onUpdated, company }: Props) {
  const [form, setForm] = useState<ICompany>({});
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();

  useEffect(() => {
    if (company?._id) setForm(company);
  }, [company]);

  const handleChange = (field: keyof ICompany, value: any) => {
    setForm({ ...form, [field]: value });
  };

  const handleSubmit = async () => {
    try {
      if (!company?._id) return;
      setLoading(true);
      await updateCompanyCarrierApi(company._id, form);
      showNotification("Cập nhật thành công!", "success");
      onUpdated();
      onClose();
    } catch (err: any) {
      showNotification(err.message || "Lỗi khi cập nhật!", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Cập nhật Hãng Bay</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <Grid container spacing={2}>
            <Grid size={12}>
              <TextField label="Mã Hãng Bay" value={form.code || ""} onChange={(e) => handleChange("code", e.target.value)} fullWidth size="small" />
            </Grid>
            <Grid size={12}>
              <TextField label="Tên Hãng Bay" value={form.name || ""} onChange={(e) => handleChange("name", e.target.value)} fullWidth size="small" />
            </Grid>
            <Grid size={6}>
              <TextField label="Mã số thuế" value={form.taxCode || ""} onChange={(e) => handleChange("taxCode", e.target.value)} fullWidth size="small" />
            </Grid>
            <Grid size={6}>
              <TextField label="Địa chỉ" value={form.address || ""} onChange={(e) => handleChange("address", e.target.value)} fullWidth size="small" />
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
