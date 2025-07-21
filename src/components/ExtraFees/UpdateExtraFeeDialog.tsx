"use client";

import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, Select, Stack, Grid, InputLabel, FormControl } from "@mui/material";
import { useEffect, useState } from "react";
import { ECURRENCY } from "@/types/typeGlobals";
import { useNotification } from "@/contexts/NotificationProvider";
import { updateExtraFeeApi } from "@/utils/apis/apiExtraFee";
import { getCarriersApi } from "@/utils/apis/apiCarrier";
import { getServicesByCarrierApi } from "@/utils/apis/apiService";
import { IExtraFee } from "@/types/typeExtraFee";
import { ICarrier } from "@/types/typeCarrier";
import { IService } from "@/types/typeService";
import NumericInput from "../Globals/NumericInput";

interface Props {
  open: boolean;
  onClose: () => void;
  onUpdated: () => void;
  extraFee: IExtraFee | null;
}

interface IExtraFeeForm extends Omit<IExtraFee, "value"> {
  value: string;
}

export default function UpdateExtraFeeDialog({ open, onClose, onUpdated, extraFee }: Props) {
  const [form, setForm] = useState<Partial<IExtraFeeForm>>({});
  const [carriers, setCarriers] = useState<ICarrier[]>([]);
  const [services, setServices] = useState<IService[]>([]);
  const [dateError, setDateError] = useState<string>(""); // ADD

  const { showNotification } = useNotification();

  useEffect(() => {
    const init = async () => {
      if (open && extraFee) {
        const startDate = extraFee.startDate && typeof extraFee.startDate === "string" && extraFee.startDate.length >= 10 ? extraFee.startDate.slice(0, 10) : "";
        const endDate = extraFee.endDate && typeof extraFee.endDate === "string" && extraFee.endDate.length >= 10 ? extraFee.endDate.slice(0, 10) : "";
        setForm({
          ...extraFee,
          value: String(extraFee.value ?? 0),
          startDate,
          endDate,
        });
        setDateError(""); // reset error

        try {
          const carrierRes = await getCarriersApi();
          const carrierList = carrierRes?.data?.data?.data || [];
          setCarriers(carrierList);

          const carrierId = typeof extraFee.carrierId === "object" ? extraFee.carrierId?._id : extraFee.carrierId;
          const selected = carrierList.find((c: ICarrier) => c._id === carrierId);
          const companyId = typeof selected?.companyId === "object" ? selected.companyId?._id : selected?.companyId;

          if (companyId) {
            const serviceRes = await getServicesByCarrierApi(companyId);
            setServices(serviceRes?.data?.data?.data || []);
          }
        } catch {
          showNotification("Failed to load carriers or services data", "error");
        }
      } else if (!open) {
        setForm({});
        setCarriers([]);
        setServices([]);
        setDateError(""); // reset error
      }
    };

    init();
    // eslint-disable-next-line
  }, [open, extraFee]);

  useEffect(() => {
    const carrierId = typeof form.carrierId === "object" ? form.carrierId?._id : form.carrierId;
    if (carrierId) fetchServices(carrierId);
    // eslint-disable-next-line
  }, [form.carrierId]);

  // Validate date realtime
  useEffect(() => {
    if (form.startDate && form.endDate) {
      if (new Date(form.startDate) > new Date(form.endDate)) {
        setDateError("Start date must be before or equal to end date!");
      } else {
        setDateError("");
      }
    } else {
      setDateError("");
    }
  }, [form.startDate, form.endDate]);

  const fetchServices = async (carrierId: string) => {
    const selected = carriers.find((c) => c._id === carrierId);
    const companyId = typeof selected?.companyId === "object" ? selected?.companyId?._id : selected?.companyId;
    if (!companyId) return;

    try {
      const res = await getServicesByCarrierApi(companyId);
      setServices(res?.data?.data?.data || []);
    } catch {
      showNotification("Failed to load services", "error");
    }
  };

  const handleChange = (field: keyof IExtraFeeForm, value: any) => {
    setForm({ ...form, [field]: value });
  };

  const handleSubmit = async () => {
    if (!extraFee?._id) return;

    if ((form.code ?? "").trim().toUpperCase() === "FSC") {
      showNotification("Fee code cannot be 'FSC'. Please use another code!", "warning");
      return;
    }

    // Validate date again before submit
    if (dateError) {
      showNotification(dateError, "warning");
      return;
    }

    const changedFields: Partial<IExtraFee> = {};
    const keys: (keyof IExtraFeeForm)[] = ["code", "name", "carrierId", "serviceId", "type", "value", "currency", "startDate", "endDate"];

    keys.forEach((key) => {
      if (key === "value") {
        const newVal = Number(form.value ?? "0");
        const oldVal = Number(extraFee.value ?? 0);
        if (newVal !== oldVal) {
          changedFields.value = newVal;
        }
      } else {
        const currentVal = form[key] ?? undefined;
        const originalVal = (extraFee as any)[key] ?? undefined;
        if (
          (key === "startDate" || key === "endDate") &&
          currentVal &&
          typeof currentVal === "string" &&
          originalVal &&
          typeof originalVal === "string" &&
          currentVal.slice(0, 10) !== originalVal.slice(0, 10)
        ) {
          changedFields[key] = currentVal;
        } else if (currentVal !== undefined && JSON.stringify(currentVal) !== JSON.stringify(originalVal)) {
          if (key !== "startDate" && key !== "endDate") changedFields[key] = currentVal as any;
        }
      }
    });

    if (Object.keys(changedFields).length === 0) {
      showNotification("No changes to update", "info");
      return;
    }

    try {
      await updateExtraFeeApi(extraFee._id, changedFields);
      showNotification("Updated successfully!", "success");
      onUpdated();
      onClose();
    } catch (err: any) {
      showNotification(err.message || "Failed to update!", "error");
    }
  };

  // Disable code input if code is FSC
  const isFSC = String(extraFee?.code).trim().toUpperCase() === "FSC";

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Update Extra Fee</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Fee Code" fullWidth size="small" value={form.code || ""} onChange={(e) => handleChange("code", e.target.value)} disabled={isFSC} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Fee Name" fullWidth size="small" value={form.name || ""} onChange={(e) => handleChange("name", e.target.value)} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Sub Carrier</InputLabel>
                <Select label="Sub Carrier" value={typeof form.carrierId === "object" ? form.carrierId?._id : form.carrierId || ""} onChange={(e) => handleChange("carrierId", e.target.value)}>
                  {carriers.map((c) => (
                    <MenuItem key={c._id} value={c._id}>
                      {c.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Service</InputLabel>
                <Select label="Service" value={typeof form.serviceId === "object" ? form.serviceId?._id : form.serviceId || ""} onChange={(e) => handleChange("serviceId", e.target.value)}>
                  {services.map((s) => (
                    <MenuItem key={s._id} value={s._id}>
                      {s.code}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <NumericInput label="Value" fullWidth size="small" value={form.value || ""} onChange={(val) => handleChange("value", val)} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Currency</InputLabel>
                <Select label="Currency" value={form.currency || ECURRENCY.VND} onChange={(e) => handleChange("currency", e.target.value)}>
                  {Object.values(ECURRENCY).map((cur) => (
                    <MenuItem key={cur} value={cur}>
                      {cur}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={6}>
              <TextField
                label="Start date"
                type="date"
                fullWidth
                size="small"
                value={form.startDate || ""}
                onChange={(e) => handleChange("startDate", e.target.value)}
                InputLabelProps={{ shrink: true }}
                error={!!dateError}
              />
            </Grid>
            <Grid size={6}>
              <TextField
                label="End date"
                type="date"
                fullWidth
                size="small"
                value={form.endDate || ""}
                onChange={(e) => handleChange("endDate", e.target.value)}
                InputLabelProps={{ shrink: true }}
                error={!!dateError}
                helperText={dateError}
              />
            </Grid>
          </Grid>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={!!dateError}>
          Update
        </Button>
      </DialogActions>
    </Dialog>
  );
}
