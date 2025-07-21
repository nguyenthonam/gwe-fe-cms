"use client";

import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Stack, Grid, MenuItem, FormControl, InputLabel, Select } from "@mui/material";
import { useEffect, useState } from "react";
import { updateUserApi } from "@/utils/apis/apiUser";
import { getPartnersApi } from "@/utils/apis/apiPartner";
import { EGENDER, EUSER_ROLES } from "@/types/typeGlobals";
import { IUpdateUserRequest, IUser } from "@/types/typeUser";
import { ICompany } from "@/types/typeCompany";
import { useNotification } from "@/contexts/NotificationProvider";

interface Props {
  open: boolean;
  onClose: () => void;
  onUpdated: () => void;
  user: IUser | null;
}

export default function UpdateStaffDialog({ open, onClose, onUpdated, user }: Props) {
  const [form, setForm] = useState<IUpdateUserRequest>({
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

  useEffect(() => {
    if (user && open) {
      setForm({
        email: user.email || "",
        companyId: typeof user.companyId === "object" ? user.companyId?._id : user.companyId,
        contact: {
          fullname: user.contact?.fullname || "",
          phone: user.contact?.phone || "",
        },
        gender: user.gender || EGENDER.MALE,
        birthday: user.birthday || null,
        identity_key: {
          id: user.identity_key?.id || "",
          address: user.identity_key?.address || "",
          createdAt: user.identity_key?.createdAt || "",
        },
        role: user.role || EUSER_ROLES.Partner,
      });
    }
    if (!open) {
      setForm({
        email: "",
        companyId: "",
        contact: { fullname: "", phone: "" },
        gender: EGENDER.MALE,
        birthday: null,
        identity_key: { id: "", createdAt: "", address: "" },
        role: EUSER_ROLES.Partner,
      });
    }
  }, [user, open]);

  const handleChange = (field: keyof IUpdateUserRequest, value: any) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNestedChange = (group: "contact" | "identity_key", key: string, value: any) => {
    setForm((prev) => ({
      ...prev,
      [group]: { ...(prev[group] || {}), [key]: value },
    }));
  };

  // Only send changed fields compared to the original user data
  const handleSubmit = async () => {
    if (!user?._id) return;
    try {
      setLoading(true);

      const payload: IUpdateUserRequest = {};

      if (form.email !== user.email) payload.email = form.email;
      if (form.companyId && (typeof user.companyId === "object" ? form.companyId !== user.companyId?._id : form.companyId !== user.companyId)) {
        payload.companyId = form.companyId;
      }
      if (form.gender !== user.gender) payload.gender = form.gender;
      if (form.birthday !== user.birthday) payload.birthday = form.birthday;
      if (form.role && form.role !== user.role) payload.role = form.role;

      if (form.contact?.fullname !== user.contact?.fullname || form.contact?.phone !== user.contact?.phone) {
        payload.contact = {
          fullname: form.contact?.fullname,
          phone: form.contact?.phone,
        };
      }

      if (form.identity_key?.id !== user.identity_key?.id || form.identity_key?.address !== user.identity_key?.address) {
        payload.identity_key = {
          id: form.identity_key?.id || "",
          address: form.identity_key?.address || "",
          createdAt: user.identity_key?.createdAt || "",
        };
      }

      if (Object.keys(payload).length === 0) {
        showNotification("No changes detected!", "info");
        return;
      }

      await updateUserApi(user._id, payload);
      showNotification("Update successful!", "success");
      onUpdated();
    } catch (err: any) {
      showNotification(err.message || "Update failed!", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Update Staff Information</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <Grid container spacing={2}>
            {/* User ID */}
            <Grid size={12}>
              <TextField label="User ID" value={user?.userId || ""} fullWidth size="small" disabled />
            </Grid>
            {/* Partner/Company */}
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
              <TextField label="Phone Number" value={form.contact?.phone || ""} onChange={(e) => handleNestedChange("contact", "phone", e.target.value)} fullWidth size="small" />
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
              <TextField label="Identity Number" value={form.identity_key?.id || ""} onChange={(e) => handleNestedChange("identity_key", "id", e.target.value)} fullWidth size="small" />
            </Grid>
            <Grid size={6}>
              <TextField label="Issued Place" value={form.identity_key?.address || ""} onChange={(e) => handleNestedChange("identity_key", "address", e.target.value)} fullWidth size="small" />
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
