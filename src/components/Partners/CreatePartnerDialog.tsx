"use client";

import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, MenuItem, Stack, Grid } from "@mui/material";
import { useState } from "react";
import { ICompany } from "@/types/typeCompany";
import { EPaymentTerms } from "@/types/typeGlobals";
import { createPartnerApi } from "@/utils/apis/apiPartner";
import { useNotification } from "@/contexts/NotificationProvider";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const paymentOptions = Object.entries(EPaymentTerms);

export default function CreateCustomerDialog({ open, onClose, onCreated }: Props) {
  const [form, setForm] = useState<ICompany>({});
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();

  const handleChange = (field: string, value: any) => {
    setForm({ ...form, [field]: value });
  };

  type NestedGroup = "representative" | "contact" | "contract";
  const handleNestedChange = (group: NestedGroup, field: string, value: any) => {
    setForm((prev) => ({
      ...prev,
      [group]: {
        ...(prev[group] || {}),
        [field]: value,
      },
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await createPartnerApi(form);
      showNotification("Customer created successfully!", "success");
      setForm({});
      onClose();
      onCreated();
    } catch (err: any) {
      console.log(err);
      showNotification("Failed to create customer!", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setForm({});
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create New Customer</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <Grid container spacing={2}>
            <Grid size={12}>
              <TextField label="Code" value={form.code || ""} onChange={(e) => handleChange("code", e.target.value)} fullWidth size="small" />
            </Grid>
            <Grid size={12}>
              <TextField label="Name" value={form.name || ""} onChange={(e) => handleChange("name", e.target.value)} fullWidth size="small" />
            </Grid>
            <Grid size={12}>
              <TextField label="Address" value={form.address || ""} onChange={(e) => handleChange("address", e.target.value)} fullWidth size="small" />
            </Grid>
            <Grid size={6}>
              <TextField label="Representative Name" value={form.representative?.name || ""} onChange={(e) => handleNestedChange("representative", "name", e.target.value)} fullWidth size="small" />
            </Grid>
            <Grid size={6}>
              <TextField label="Representative Phone" value={form.representative?.phone || ""} onChange={(e) => handleNestedChange("representative", "phone", e.target.value)} fullWidth size="small" />
            </Grid>
            <Grid size={6}>
              <TextField label="Hotline" value={form.contact?.hotline || ""} onChange={(e) => handleNestedChange("contact", "hotline", e.target.value)} fullWidth size="small" />
            </Grid>
            <Grid size={6}>
              <TextField label="Tax Code" value={form.taxCode || ""} onChange={(e) => handleChange("taxCode", e.target.value)} fullWidth size="small" />
            </Grid>
            <Grid size={6}>
              <TextField label="Contact Email" value={form.contact?.email || ""} onChange={(e) => handleNestedChange("contact", "email", e.target.value)} fullWidth size="small" />
            </Grid>
            <Grid size={6}>
              <TextField label="Website" value={form.contact?.website || ""} onChange={(e) => handleNestedChange("contact", "website", e.target.value)} fullWidth size="small" />
            </Grid>
            <Grid size={12}>
              <TextField label="Payment Terms" select value={form.contract?.paymentTerms || ""} onChange={(e) => handleNestedChange("contract", "paymentTerms", e.target.value)} fullWidth size="small">
                {paymentOptions.map(([k, v]) => (
                  <MenuItem key={k} value={v}>
                    {k}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
}
