"use client";

import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Stack, Grid, MenuItem, FormControl, InputLabel, Select } from "@mui/material";
import { useEffect, useState } from "react";
import { createUserApi } from "@/utils/apis/apiUser";
import { EGENDER, EUSER_ROLES } from "@/types/typeGlobals";
import { useNotification } from "@/contexts/NotificationProvider";
import { ICreateUserRequest, IUser } from "@/types/typeUser";
import { ICompany } from "@/types/typeCompany";
import { getPartnersApi } from "@/utils/apis/apiPartner";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateStaffDialog({ open, onClose, onCreated }: Props) {
  const [form, setForm] = useState<ICreateUserRequest>({
    email: "",
    companyId: "",
    contact: { fullname: "", phone: "" },
    gender: EGENDER.MALE,
    birthday: null,
    identity_key: { id: "", createdAt: "", address: "" },
    role: EUSER_ROLES.Partner,
  });
  const [loading, setLoading] = useState(false);
  const [partners, setPartners] = useState<ICompany[]>([]);
  const { showNotification } = useNotification();

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const res = await getPartnersApi();
        setPartners(res?.data?.data?.data || []);
      } catch (err) {
        console.error("Failed to load partners", err);
      }
    };
    fetchPartners();
  }, []);

  const handleChange = (field: keyof IUser, value: any) => {
    setForm({ ...form, [field]: value });
  };

  const handleNestedChange = (group: "contact" | "identity_key", key: string, value: any) => {
    setForm((prev) => ({
      ...prev,
      [group]: { ...(prev[group] || {}), [key]: value },
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const res = await createUserApi(form);
      showNotification(res?.data?.message || "Created successfully!", "success");
      onCreated();
      setForm({
        email: "",
        contact: { fullname: "", phone: "" },
        gender: EGENDER.MALE,
        birthday: null,
        identity_key: { id: "", createdAt: "", address: "" },
        role: EUSER_ROLES.Partner,
      });
    } catch (err: any) {
      showNotification(err.message || "Failed to create staff!", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Create New Staff</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <Grid container spacing={2}>
            <Grid size={12}>
              <TextField select label="Customer" value={form.companyId || ""} onChange={(e) => handleChange("companyId", e.target.value)} fullWidth size="small">
                {partners.map((p) => (
                  <MenuItem key={p._id} value={p._id}>
                    {p.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={12}>
              <TextField label="Email" value={form.email} onChange={(e) => handleChange("email", e.target.value)} fullWidth size="small" />
            </Grid>
            <Grid size={6}>
              <TextField label="Full Name" value={form.contact?.fullname || ""} onChange={(e) => handleNestedChange("contact", "fullname", e.target.value)} fullWidth size="small" />
            </Grid>
            <Grid size={6}>
              <TextField label="Phone" value={form.contact?.phone || ""} onChange={(e) => handleNestedChange("contact", "phone", e.target.value)} fullWidth size="small" />
            </Grid>
            <Grid size={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Gender</InputLabel>
                <Select label="Gender" value={form.gender} onChange={(e) => handleChange("gender", e.target.value)}>
                  <MenuItem value={EGENDER.MALE}>Male</MenuItem>
                  <MenuItem value={EGENDER.FEMALE}>Female</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={6}>
              <TextField
                label="Birthday"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={form.birthday ? new Date(form.birthday).toISOString().split("T")[0] : ""}
                onChange={(e) => handleChange("birthday", e.target.value)}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid size={6}>
              <TextField label="CMND/CCCD" value={form.identity_key?.id || ""} onChange={(e) => handleNestedChange("identity_key", "id", e.target.value)} fullWidth size="small" />
            </Grid>
            <Grid size={6}>
              <TextField label="{Place}" value={form.identity_key?.address || ""} onChange={(e) => handleNestedChange("identity_key", "address", e.target.value)} fullWidth size="small" />
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
