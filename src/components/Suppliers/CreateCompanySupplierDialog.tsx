"use client";

import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Stack, Grid } from "@mui/material";
import { useState } from "react";
import { createCompanySupplierApi } from "@/utils/apis/apiSupplier";
import { useNotification } from "@/contexts/NotificationProvider";
import { ECOMPANY_TYPE, ICompany } from "@/types/typeCompany";
import { ERECORD_STATUS } from "@/types/typeGlobals";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateCompanySupplierDialog({ open, onClose, onCreated }: Props) {
  const [form, setForm] = useState<ICompany>({
    code: "",
    name: "",
    taxCode: "",
    address: "",
    status: ERECORD_STATUS.Active,
    type: ECOMPANY_TYPE.Supplier,
  });
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();

  const handleChange = (field: keyof ICompany, value: any) => {
    setForm({ ...form, [field]: value });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await createCompanySupplierApi(form);
      showNotification("Tạo Công ty Cung Ứng thành công!", "success");
      onCreated();
      onClose();
    } catch (err: any) {
      showNotification(err.message || "Lỗi khi tạo!", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Tạo Công ty Cung Ứng mới</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <Grid container spacing={2}>
            <Grid size={12}>
              <TextField label="Mã Công ty" value={form.code || ""} onChange={(e) => handleChange("code", e.target.value)} fullWidth size="small" />
            </Grid>
            <Grid size={12}>
              <TextField label="Tên Công ty" value={form.name || ""} onChange={(e) => handleChange("name", e.target.value)} fullWidth size="small" />
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
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          Tạo mới
        </Button>
      </DialogActions>
    </Dialog>
  );
}
