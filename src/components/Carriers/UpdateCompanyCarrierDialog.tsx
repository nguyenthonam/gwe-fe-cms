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
  const [form, setForm] = useState<ICompany>({} as ICompany);
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

      const changedFields: Partial<ICompany> = {};
      const keysToCheck: (keyof ICompany)[] = ["code", "name", "taxCode", "address"];

      keysToCheck.forEach((key) => {
        if (form[key] !== company[key]) {
          changedFields[key] = form[key] as any; // fix TS2322
        }
      });

      if (Object.keys(changedFields).length === 0) {
        showNotification("No changes to update.", "info");
        return;
      }

      await updateCompanyCarrierApi(company._id, changedFields);
      showNotification("Carrier updated successfully!", "success");
      onUpdated();
      onClose();
    } catch (err: any) {
      showNotification(err.message || "Error updating carrier!", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Update Carrier</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <Grid container spacing={2}>
            <Grid size={12}>
              <TextField label="Carrier Code" value={form.code || ""} onChange={(e) => handleChange("code", e.target.value)} fullWidth size="small" />
            </Grid>
            <Grid size={12}>
              <TextField label="Carrier Name" value={form.name || ""} onChange={(e) => handleChange("name", e.target.value)} fullWidth size="small" />
            </Grid>
            <Grid size={6}>
              <TextField label="Tax Code" value={form.taxCode || ""} onChange={(e) => handleChange("taxCode", e.target.value)} fullWidth size="small" />
            </Grid>
            <Grid size={6}>
              <TextField label="Address" value={form.address || ""} onChange={(e) => handleChange("address", e.target.value)} fullWidth size="small" />
            </Grid>
          </Grid>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={loading}>
          Update
        </Button>
      </DialogActions>
    </Dialog>
  );
}
