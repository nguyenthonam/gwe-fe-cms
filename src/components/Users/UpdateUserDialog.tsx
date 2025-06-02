"use client";

import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Stack, Grid, MenuItem, InputLabel, FormControl, Select } from "@mui/material";
import { useEffect, useState } from "react";
import { updateUserApi } from "@/utils/apis/apiUser";
import { EGENDER, ERECORD_STATUS, EUSER_ROLES } from "@/types/typeGlobals";
import { IUpdateUserRequest, IUser } from "@/types/typeUser";
import { useNotification } from "@/contexts/NotificationProvider";
import { genderLabel, userRoleLabel } from "@/utils/constants/enumLabel";
import { EnumChip } from "../Globals/EnumChip";

interface Props {
  open: boolean;
  onClose: () => void;
  onUpdated: () => void;
  user: IUser | null;
  companies: any[];
}

const genderOptions = Object.entries(EGENDER);
const statusOptions = Object.entries(ERECORD_STATUS);

export default function UpdateUserDialog({ open, onClose, onUpdated, user, companies }: Props) {
  const [form, setForm] = useState<IUpdateUserRequest>({});
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();

  useEffect(() => {
    if (user) {
      if (!user._id) {
        showNotification("Thiếu ID!");
        return;
      }
      setUserId(user.userId || "");
      setForm({
        email: user.email,
        companyId: typeof user.companyId === "object" ? user.companyId?._id : user.companyId,
        contact: user.contact,
        gender: user.gender,
        birthday: user.birthday ? new Date(user.birthday).toISOString().split("T")[0] : "",
        identity_key: user.identity_key,
        avatar: user.avatar,
        role: user.role,
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

      // So sánh từng trường, chỉ gửi trường đã thay đổi
      if (form.email !== user.email) payload.email = form.email;
      if (form.role !== user.role) payload.role = form.role;
      if (form.companyId !== (typeof user.companyId === "object" ? user.companyId?._id : user.companyId)) payload.companyId = form.companyId;
      if (form.gender !== user.gender) payload.gender = form.gender;
      if (form.birthday && form.birthday !== (user.birthday ? new Date(user.birthday).toISOString().split("T")[0] : "")) payload.birthday = form.birthday;
      if (form.avatar !== user.avatar) payload.avatar = form.avatar;
      if (form.status !== user.status) payload.status = form.status;

      if (form.contact?.fullname !== user.contact?.fullname || form.contact?.phone !== user.contact?.phone) {
        payload.contact = {
          fullname: form.contact?.fullname,
          phone: form.contact?.phone,
        };
      }

      if (form.identity_key?.id !== user.identity_key?.id || form.identity_key?.address !== user.identity_key?.address || form.identity_key?.createdAt !== user.identity_key?.createdAt) {
        payload.identity_key = {
          id: form.identity_key?.id || "",
          address: form.identity_key?.address || "",
          createdAt: form.identity_key?.createdAt || "",
        };
      }

      await updateUserApi(user._id, payload);
      showNotification("Cập nhật tài khoản thành công!", "success");
      onUpdated();
    } catch (err: any) {
      showNotification(err.message || "Lỗi khi cập nhật!", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Cập nhật tài khoản</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <Grid container spacing={2}>
            <Grid size={6}>
              <TextField label="User ID" value={userId} disabled fullWidth size="small" />
            </Grid>
            <Grid size={6}>
              <TextField label="Email" value={form?.email || ""} onChange={(e) => handleChange("email", e.target.value)} fullWidth size="small" />
            </Grid>
            <Grid size={6}>
              <TextField label="Họ tên" value={form?.contact?.fullname || ""} onChange={(e) => handleNestedChange("contact", "fullname", e.target.value)} fullWidth size="small" />
            </Grid>
            <Grid size={6}>
              <TextField label="SĐT" value={form?.contact?.phone || ""} onChange={(e) => handleNestedChange("contact", "phone", e.target.value)} fullWidth size="small" />
            </Grid>
            <Grid size={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Giới tính</InputLabel>
                <Select label="Giới tính" value={form?.gender} onChange={(e) => handleChange("gender", e.target.value)}>
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
                value={form?.birthday ? form.birthday : ""}
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
            <Grid size={6}>
              <TextField label="Ảnh đại diện (URL)" value={form?.avatar || ""} onChange={(e) => handleChange("avatar", e.target.value)} fullWidth size="small" />
            </Grid>
            <Grid size={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Role</InputLabel>
                <Select label="Role" value={form?.role || ""} onChange={(e) => handleChange("role", e.target.value)}>
                  {Object.values(EUSER_ROLES).map((r) => (
                    <MenuItem key={r} value={r}>
                      {/* {userRoleLabel[r]} */}
                      <EnumChip type="userRole" value={r} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            {form?.role === EUSER_ROLES.Partner && (
              <Grid size={12}>
                <FormControl fullWidth size="small">
                  <InputLabel>Company</InputLabel>
                  <Select label="Company" value={form?.companyId || ""} onChange={(e) => handleChange("companyId", e.target.value)}>
                    {companies?.map((c) => (
                      <MenuItem key={c._id} value={c._id}>
                        {c.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
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
