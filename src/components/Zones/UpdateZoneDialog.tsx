"use client";

import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Stack, MenuItem } from "@mui/material";
import { useState, useEffect } from "react";
import { updateZoneApi } from "@/utils/apis/apiZone";
import { IZone } from "@/types/typeZone";
import { useNotification } from "@/contexts/NotificationProvider";
import { ICarrier } from "@/types/typeCarrier";
import { ECountryCode } from "@/types/typeGlobals";
import { COUNTRIES } from "@/utils/constants";
import NumericInput from "../Globals/NumericInput";
import CountrySelect from "../Globals/CountrySelect";

export default function UpdateZoneDialog({ open, onClose, onUpdated, zone, carriers }: { open: boolean; onClose: () => void; onUpdated: () => void; zone: IZone | null; carriers: ICarrier[] }) {
  const [form, setForm] = useState<IZone>({
    zone: 1,
    countryCode: ECountryCode.VN,
    name: "",
    carrierId: "",
  });
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();

  useEffect(() => {
    if (zone) {
      setForm({
        zone: zone.zone,
        countryCode: zone.countryCode,
        name: zone.name || "",
        carrierId: typeof zone.carrierId === "object" ? zone.carrierId._id : zone.carrierId,
      });
    }
  }, [zone]);

  const handleSubmit = async () => {
    try {
      if (!zone?._id) return;
      setLoading(true);
      await updateZoneApi(zone._id, form);
      showNotification("Cập nhật Zone thành công", "success");
      onUpdated();
    } catch (err: any) {
      showNotification(err.message || "Lỗi cập nhật Zone", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>Cập nhật Zone</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField label="Carrier" select value={form.carrierId} onChange={(e) => setForm({ ...form, carrierId: e.target.value })} fullWidth>
            {carriers.map((c) => (
              <MenuItem key={c._id} value={c._id}>
                {c.name}
              </MenuItem>
            ))}
          </TextField>
          <CountrySelect value={form.countryCode} onChange={(val) => setForm({ ...form, countryCode: val as ECountryCode })} label="Quốc gia" required />
          <NumericInput label="Zone" value={String(form.zone)} onChange={(val) => setForm({ ...form, zone: Number(val) })} fullWidth />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Huỷ</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          Cập nhật
        </Button>
      </DialogActions>
    </Dialog>
  );
}
