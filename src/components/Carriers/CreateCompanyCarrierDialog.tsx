"use client";

import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Stack, Grid } from "@mui/material";
import { useEffect, useState } from "react";
import { createCompanyCarrierApi } from "@/utils/apis/apiCarrier";
import { useNotification } from "@/contexts/NotificationProvider";
import { ECOMPANY_TYPE, ICompany } from "@/types/typeCompany";
import { ERECORD_STATUS } from "@/types/typeGlobals";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const defaultForm: ICompany = {
  code: "",
  name: "",
  taxCode: "",
  address: "",
  status: ERECORD_STATUS.Active,
  type: ECOMPANY_TYPE.Carrier,
};

export default function CreateCompanyCarrierDialog({ open, onClose, onCreated }: Props) {
  const [form, setForm] = useState<ICompany>(defaultForm);
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();

  useEffect(() => {
    // if (!open) setForm(defaultForm);

    return () => {
      setForm(defaultForm);
    };
  }, [open]);

  const handleChange = (field: keyof ICompany, value: any) => {
    setForm({ ...form, [field]: value });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await createCompanyCarrierApi(form);
      showNotification("Tạo Hãng Bay thành công!", "success");
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
      <DialogTitle>Tạo Hãng Bay mới</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <Grid container spacing={2}>
            <Grid size={12}>
              <TextField label="Mã Hãng Bay" value={form.code || ""} onChange={(e) => handleChange("code", e.target.value)} fullWidth size="small" />
            </Grid>
            <Grid size={12}>
              <TextField label="Tên Hãng Bay" value={form.name || ""} onChange={(e) => handleChange("name", e.target.value)} fullWidth size="small" />
            </Grid>
            <Grid size={12}>
              <TextField label="Mã số thuế" value={form.taxCode || ""} onChange={(e) => handleChange("taxCode", e.target.value)} fullWidth size="small" />
            </Grid>
            <Grid size={12}>
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
