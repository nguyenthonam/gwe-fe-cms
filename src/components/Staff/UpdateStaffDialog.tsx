"use client";

import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Stack, Grid, MenuItem, FormControl, InputLabel, Select } from "@mui/material";
import { useEffect, useState } from "react";
import { updateUserApi } from "@/utils/apis/apiUser";
import { EGENDER } from "@/types/typeGlobals";
import { IUpdateUserRequest } from "@/types/typeUser";
import { IUser } from "@/types/typeUser";
import { useNotification } from "@/contexts/NotificationProvider";

interface Props {
  open: boolean;
  onClose: () => void;
  onUpdated: () => void;
  user: IUser | null;
}

export default function UpdateStaffDialog({ open, onClose, onUpdated, user }: Props) {
  const [form, setForm] = useState<IUpdateUserRequest>({});
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();

  useEffect(() => {
    if (user) {
      if (!user._id) {
        showNotification("Thiếu ID!");
        return;
      }
      setForm({
        email: user.email,
        contact: user.contact,
        gender: user.gender,
        birthday: user.birthday,
        identity_key: user.identity_key,
        status: user.status,
      });
    }
  }, [user]);

  const handleChange = (field: keyof IUpdateUserRequest, value: any) => {
    if (!form) return;
    setForm({ ...form, [field]: value });
  };

  const handleNestedChange = (group: "contact" | "identity_key", key: string, value: any) => {
    setForm((prev: any) => ({
      ...prev,
      [group]: { ...(prev[group] || {}), [key]: value },
    }));
  };

  const handleSubmit = async () => {
    if (!user?._id) return;

    try {
      setLoading(true);

      const payload: IUpdateUserRequest = {};

      if (form.email !== user.email) payload.email = form.email;
      if (form.gender !== user.gender) payload.gender = form.gender;
      if (form.birthday !== user.birthday) payload.birthday = form.birthday;
      if (form.status !== user.status) payload.status = form.status;

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

      await updateUserApi(user._id, payload);
      showNotification("Cập nhật thành công!", "success");
      onUpdated();
    } catch (err: any) {
      showNotification(err.message || "Lỗi khi cập nhật!", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Cập nhật thông tin nhân viên</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <Grid container spacing={2}>
            <Grid size={6}>
              <TextField label="User ID" value={user?.userId || ""} disabled fullWidth size="small" />
            </Grid>
            <Grid size={6}>
              <TextField label="Email" value={form?.email || ""} onChange={(e) => handleChange("email", e.target.value)} fullWidth size="small" />
            </Grid>
            <Grid size={6}>
              <TextField label="Họ tên" value={form?.contact?.fullname || ""} onChange={(e) => handleNestedChange("contact", "name", e.target.value)} fullWidth size="small" />
            </Grid>
            <Grid size={6}>
              <TextField label="SĐT" value={form?.contact?.phone || ""} onChange={(e) => handleNestedChange("contact", "phone", e.target.value)} fullWidth size="small" />
            </Grid>
            <Grid size={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Giới tính</InputLabel>
                <Select label="Giới tính" value={form.gender} onChange={(e) => handleChange("gender", e.target.value)}>
                  <MenuItem value={EGENDER.MALE}>Nam</MenuItem>
                  <MenuItem value={EGENDER.FEMALE}>Nữ</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={6}>
              <TextField
                label="Ngày sinh"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={form?.birthday ? new Date(form?.birthday).toISOString().split("T")[0] : ""}
                onChange={(e) => handleChange("birthday", e.target.value)}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid size={6}>
              <TextField label="CMND/CCCD" value={form?.identity_key?.id || ""} onChange={(e) => handleNestedChange("identity_key", "id", e.target.value)} fullWidth size="small" />
            </Grid>
            <Grid size={6}>
              <TextField label="Nơi cấp" value={form?.identity_key?.address || ""} onChange={(e) => handleNestedChange("identity_key", "address", e.target.value)} fullWidth size="small" />
            </Grid>
          </Grid>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Huỷ</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={loading}>
          Cập nhật
        </Button>
      </DialogActions>
    </Dialog>
  );
}
