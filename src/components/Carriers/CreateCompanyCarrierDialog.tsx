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
    // Reset form when dialog closes
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
      showNotification("Carrier created successfully!", "success");
      onCreated();
      onClose();
    } catch (err: any) {
      showNotification(err.message || "Error creating carrier!", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Create New Carrier</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <Grid container spacing={2}>
            <Grid size={12}>
              <TextField label="Carrier Code" value={form.code || ""} onChange={(e) => handleChange("code", e.target.value)} fullWidth size="small" />
            </Grid>
            <Grid size={12}>
              <TextField label="Carrier Name" value={form.name || ""} onChange={(e) => handleChange("name", e.target.value)} fullWidth size="small" />
            </Grid>
            <Grid size={12}>
              <TextField label="Tax Code" value={form.taxCode || ""} onChange={(e) => handleChange("taxCode", e.target.value)} fullWidth size="small" />
            </Grid>
            <Grid size={12}>
              <TextField label="Address" value={form.address || ""} onChange={(e) => handleChange("address", e.target.value)} fullWidth size="small" />
            </Grid>
          </Grid>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
}
