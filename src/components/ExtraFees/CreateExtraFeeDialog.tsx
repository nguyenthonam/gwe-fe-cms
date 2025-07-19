"use client";

import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, Select, Stack, Grid, InputLabel, FormControl } from "@mui/material";
import { useEffect, useState } from "react";
import { ICarrier } from "@/types/typeCarrier";
import { ECURRENCY, EFEE_TYPE } from "@/types/typeGlobals";
import { IService } from "@/types/typeService";
import { useNotification } from "@/contexts/NotificationProvider";
import { createExtraFeeApi } from "@/utils/apis/apiExtraFee";
import { getCarriersApi } from "@/utils/apis/apiCarrier";
import { getServicesByCarrierApi } from "@/utils/apis/apiService";
import NumericInput from "../Globals/NumericInput";
import dayjs from "dayjs";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateExtraFeeDialog({ open, onClose, onCreated }: Props) {
  const [carriers, setCarriers] = useState<ICarrier[]>([]);
  const [services, setServices] = useState<IService[]>([]);
  const [carrierId, setCarrierId] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [value, setValue] = useState<number | string>("");
  const [currency, setCurrency] = useState<ECURRENCY>(ECURRENCY.VND);
  const [startDate, setStartDate] = useState<string>(dayjs().format("YYYY-MM-DD"));
  const [endDate, setEndDate] = useState<string>(dayjs().add(30, "day").format("YYYY-MM-DD"));
  const [loading, setLoading] = useState(false);

  // Date error state
  const [dateError, setDateError] = useState<string>("");

  const { showNotification } = useNotification();

  // Only type = FIXED (Cash)
  const type = EFEE_TYPE.FIXED;

  useEffect(() => {
    if (open) {
      setCarrierId("");
      setServiceId("");
      setCode("");
      setName("");
      setValue("");
      setCurrency(ECURRENCY.VND);
      setServices([]);
      setStartDate(dayjs().format("YYYY-MM-DD"));
      setEndDate(dayjs().add(30, "day").format("YYYY-MM-DD"));
      setDateError("");
      fetchCarriers();
    }
    // eslint-disable-next-line
  }, [open]);

  const fetchCarriers = async () => {
    try {
      const res = await getCarriersApi();
      setCarriers(res?.data?.data?.data || []);
      // eslint-disable-next-line
    } catch (err: any) {
      showNotification("Cannot load carriers list", "error");
    }
  };

  const fetchServices = async (carrierId: string) => {
    const selected = carriers.find((c) => c._id === carrierId);
    const companyId = typeof selected?.companyId === "object" ? selected?.companyId?._id : selected?.companyId;
    if (!companyId) return;
    try {
      const res = await getServicesByCarrierApi(companyId);
      setServices(res?.data?.data?.data || []);
      // eslint-disable-next-line
    } catch (err: any) {
      showNotification("Cannot load services!", "error");
    }
  };

  useEffect(() => {
    if (carrierId) fetchServices(carrierId);
    else setServices([]);
    setServiceId("");
    // eslint-disable-next-line
  }, [carrierId]);

  // Validate date on change
  useEffect(() => {
    if (startDate && endDate) {
      if (new Date(startDate) > new Date(endDate)) {
        setDateError("Start date must be before or equal to end date!");
      } else {
        setDateError("");
      }
    }
  }, [startDate, endDate]);

  const handleSubmit = async () => {
    if (!carrierId || !serviceId || !code || !name || value === "" || !startDate || !endDate) {
      showNotification("Please enter all required information!", "warning");
      return;
    }
    if (code.trim().toUpperCase() === "FSC") {
      showNotification("Fee code cannot be 'FSC'. Please use another code!", "warning");
      return;
    }
    if (dateError) {
      showNotification(dateError, "warning");
      return;
    }
    try {
      setLoading(true);
      await createExtraFeeApi({
        carrierId,
        serviceId,
        code,
        name,
        type,
        value: Number(value),
        currency,
        startDate,
        endDate,
      });
      showNotification("Extra fee created successfully!", "success");
      onCreated();
      onClose();
    } catch (err: any) {
      showNotification(err.message || "Failed to create extra fee", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Create New Extra Fee</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <Grid container spacing={2}>
            <Grid size={6}>
              <TextField label="Fee Code" fullWidth size="small" value={code} onChange={(e) => setCode(e.target.value)} />
            </Grid>
            <Grid size={6}>
              <TextField label="Fee Name" fullWidth size="small" value={name} onChange={(e) => setName(e.target.value)} />
            </Grid>
            <Grid size={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Carrier</InputLabel>
                <Select label="Carrier" value={carrierId} onChange={(e) => setCarrierId(e.target.value)}>
                  {carriers?.map((c) => (
                    <MenuItem key={c._id} value={c._id}>
                      {c.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Service</InputLabel>
                <Select label="Service" value={serviceId} onChange={(e) => setServiceId(e.target.value)}>
                  {services.map((s) => (
                    <MenuItem key={s._id} value={s._id}>
                      {s.code}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={6}>
              <NumericInput label="Value" fullWidth size="small" value={String(value)} onChange={setValue} />
            </Grid>
            <Grid size={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Currency</InputLabel>
                <Select label="Currency" value={currency} onChange={(e) => setCurrency(e.target.value as ECURRENCY)}>
                  {Object.values(ECURRENCY).map((cur) => (
                    <MenuItem key={cur} value={cur}>
                      {cur}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={12} container spacing={1}>
              <Grid size={6}>
                <TextField
                  label="Start date"
                  type="date"
                  fullWidth
                  size="small"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
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
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  error={!!dateError}
                  helperText={dateError}
                />
              </Grid>
            </Grid>
          </Grid>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={loading || !!dateError}>
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
}
