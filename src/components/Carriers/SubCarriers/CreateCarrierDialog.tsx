"use client";

import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Stack, Grid, MenuItem } from "@mui/material";
import { useEffect, useState } from "react";
import { createCarrierApi, getCompanyCarriersApi } from "@/utils/apis/apiCarrier";
import { useNotification } from "@/contexts/NotificationProvider";
import { ECHARGEABLE_WEIGHT_TYPE } from "@/types/typeGlobals";
import { ICarrier } from "@/types/typeCarrier";
import { ICompany } from "@/types/typeCompany";
import NumericInput from "../../Globals/NumericInput";

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
      showNotification("Created successfully", "success");
      onCreated();
      setForm({ chargeableWeightType: ECHARGEABLE_WEIGHT_TYPE.DETAIL, volWeightRate: 5000 });
    } catch (err: any) {
      showNotification(err.message || "Failed to create", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>CREATE SUB CARRIER</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <Grid container spacing={2}>
            <Grid size={12}>
              <TextField label="Carrier" select value={form.companyId || ""} onChange={(e) => handleChange("companyId", e.target.value)} fullWidth size="small">
                {companyOptions.map((c) => (
                  <MenuItem key={c._id} value={c._id}>
                    {c.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={12}>
              <TextField label="Sub Carrier Code" value={form.code || ""} onChange={(e) => handleChange("code", e.target.value)} fullWidth size="small" />
            </Grid>
            <Grid size={12}>
              <TextField label="Sub Carrier Name" value={form.name || ""} onChange={(e) => handleChange("name", e.target.value)} fullWidth size="small" />
            </Grid>
            <Grid size={12}>
              <TextField label="Charge Weight Type" select value={form.chargeableWeightType || ""} onChange={(e) => handleChange("chargeableWeightType", e.target.value)} fullWidth size="small">
                <MenuItem value={ECHARGEABLE_WEIGHT_TYPE.DETAIL}>By Piece</MenuItem>
                <MenuItem value={ECHARGEABLE_WEIGHT_TYPE.TOTAL}>Total</MenuItem>
              </TextField>
            </Grid>
            <Grid size={12}>
              <NumericInput label="Volume Conversion Rate" fullWidth size="small" value={String(form.volWeightRate || "")} onChange={(val) => handleChange("volWeightRate", Number(val))} />
            </Grid>
          </Grid>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={loading}>
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
}
