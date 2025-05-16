"use client";

import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Stack, Grid, MenuItem } from "@mui/material";
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

const genderOptions = Object.entries(EGENDER);

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
      showNotification(res?.data?.message || "Tạo thành công!", "success");
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
      showNotification(err.message || "Lỗi khi tạo nhân viên!", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Tạo nhân viên mới</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <Grid container spacing={2}>
            <Grid size={12}>
              <TextField select label="Đối tác" value={form.companyId || ""} onChange={(e) => handleChange("companyId", e.target.value)} fullWidth size="small">
                {partners.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={12}>
              <TextField label="Email" value={form.email} onChange={(e) => handleChange("email", e.target.value)} fullWidth size="small" />
            </Grid>
            <Grid size={6}>
              <TextField label="Họ tên" value={form.contact?.fullname || ""} onChange={(e) => handleNestedChange("contact", "fullname", e.target.value)} fullWidth size="small" />
            </Grid>
            <Grid size={6}>
              <TextField label="SĐT" value={form.contact?.phone || ""} onChange={(e) => handleNestedChange("contact", "phone", e.target.value)} fullWidth size="small" />
            </Grid>
            <Grid size={6}>
              <TextField label="Giới tính" select value={form.gender} onChange={(e) => handleChange("gender", e.target.value)} fullWidth size="small">
                {genderOptions.map(([k, v]) => (
                  <MenuItem key={k} value={v}>
                    {k}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={6}>
              <TextField
                label="Ngày sinh"
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
              <TextField label="Nơi cấp" value={form.identity_key?.address || ""} onChange={(e) => handleNestedChange("identity_key", "address", e.target.value)} fullWidth size="small" />
            </Grid>
          </Grid>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Huỷ</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={loading}>
          Tạo
        </Button>
      </DialogActions>
    </Dialog>
  );
}
