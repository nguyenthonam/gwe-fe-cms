"use client";

import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Stack, MenuItem } from "@mui/material";
import { useState } from "react";
import { createZoneApi } from "@/utils/apis/apiZone";
import { useNotification } from "@/contexts/NotificationProvider";
import { ICarrier } from "@/types/typeCarrier";
import { ECountryCode } from "@/types/typeGlobals";
import { IZone } from "@/types/typeZone";
import { COUNTRIES } from "@/utils/constants";
import NumericInput from "../Globals/NumericInput";

export default function CreateZoneDialog({ open, onClose, onCreated, carriers }: { open: boolean; onClose: () => void; onCreated: () => void; carriers: ICarrier[] }) {
  const [form, setForm] = useState<IZone>({ zone: 1, countryCode: ECountryCode.VN, name: "", carrierId: "" });
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await createZoneApi(form);
      showNotification("Tạo Zone thành công", "success");
      onCreated();
    } catch (err: any) {
      showNotification(err.message || "Lỗi tạo Zone", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>Tạo Zone mới</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField label="Carrier" select value={form.carrierId} onChange={(e) => setForm({ ...form, carrierId: e.target.value })} fullWidth>
            {carriers.map((c) => (
              <MenuItem key={c._id} value={c._id}>
                {c.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField label="Quốc gia" select value={form.countryCode} onChange={(e) => setForm({ ...form, countryCode: e.target.value as ECountryCode })} fullWidth>
            {COUNTRIES.map((c) => (
              <MenuItem key={c.code} value={c.code}>
                {c.name}
              </MenuItem>
            ))}
          </TextField>
          <NumericInput label="Zone" value={String(form.zone)} onChange={(val) => setForm({ ...form, zone: Number(val) })} fullWidth />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Huỷ</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          Tạo
        </Button>
      </DialogActions>
    </Dialog>
  );
}
