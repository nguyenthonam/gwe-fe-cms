"use client";

import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, MenuItem, Stack, Grid } from "@mui/material";
import { useEffect, useState } from "react";
import { ISupplier } from "@/types/typeSupplier";
import { EPaymentTerms } from "@/types/typeGlobals";
import { updateSupplierApi } from "@/utils/apis/apiSupplier";
import { useNotification } from "@/contexts/NotificationProvider";

interface Props {
  open: boolean;
  onClose: () => void;
  onUpdated: () => void;
  supplier: ISupplier | null;
}

const paymentOptions = Object.entries(EPaymentTerms);

export default function UpdateSupplierDialog({ open, onClose, onUpdated, supplier }: Props) {
  const [form, setForm] = useState<ISupplier>({});
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();

  useEffect(() => {
    if (supplier) setForm(supplier);
  }, [supplier]);

  const handleChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
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

  // Only send changed fields (optional, like your Partner version)
  const buildUpdatePayload = () => {
    if (!supplier) return {};
    const payload: any = {};
    for (const key in form) {
      const value = form[key as keyof ISupplier];
      const original = supplier[key as keyof ISupplier];

      if (typeof value !== "object" && value !== original) {
        payload[key] = value;
      }

      if (["representative", "contact", "contract"].includes(key)) {
        const group: any = value;
        const originalGroup: any = original || {};
        const changed: any = {};

        for (const field in group) {
          if (group[field] !== originalGroup[field]) {
            changed[field] = group[field];
          }
        }
        if (Object.keys(changed).length > 0) {
          payload[key] = changed;
        }
      }
    }
    return payload;
  };

  const handleSubmit = async () => {
    if (!supplier?._id) return;
    setLoading(true);
    try {
      const payload = buildUpdatePayload();
      await updateSupplierApi(supplier._id, payload);
      showNotification("Supplier updated successfully!", "success");
      setForm({});
      onClose();
      onUpdated();
    } catch (err: any) {
      showNotification(`Update failed! ${err.message}`, "error");
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
      <DialogTitle>Update Supplier</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <Grid container spacing={2}>
            <Grid size={12}>
              <TextField label="Supplier Code" value={form.code || ""} onChange={(e) => handleChange("code", e.target.value)} fullWidth size="small" />
            </Grid>
            <Grid size={12}>
              <TextField label="Supplier Name" value={form.name || ""} onChange={(e) => handleChange("name", e.target.value)} fullWidth size="small" />
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
                <MenuItem value="">Select payment terms</MenuItem>
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
          Update
        </Button>
      </DialogActions>
    </Dialog>
  );
}
