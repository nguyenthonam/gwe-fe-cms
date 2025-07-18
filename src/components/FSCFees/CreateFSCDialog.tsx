"use client";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, Select, Stack, Grid, InputLabel, FormControl } from "@mui/material";
import { useEffect, useState } from "react";
import { ICarrier } from "@/types/typeCarrier";
import { ECURRENCY } from "@/types/typeGlobals";
import { IService } from "@/types/typeService";
import { useNotification } from "@/contexts/NotificationProvider";
import { createExtraFeeApi } from "@/utils/apis/apiExtraFee";
import { getCarriersApi } from "@/utils/apis/apiCarrier";
import { getServicesByCarrierApi } from "@/utils/apis/apiService";
import NumericInput from "../Globals/NumericInput";
import { EFEE_TYPE } from "@/types/typeGlobals";
import { getMonthRange } from "@/utils/hooks/hookDate";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateFSCDIalog({ open, onClose, onCreated }: Props) {
  const [carriers, setCarriers] = useState<ICarrier[]>([]);
  const [services, setServices] = useState<IService[]>([]);
  const [carrierId, setCarrierId] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [name, setName] = useState("");
  const [value, setValue] = useState<number | string>("");
  const [currency, setCurrency] = useState<ECURRENCY>(ECURRENCY.VND);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);

  const { showNotification } = useNotification();
  const { start, end } = getMonthRange();

  const fetchCarriers = async () => {
    try {
      const res = await getCarriersApi();
      setCarriers(res?.data?.data?.data || []);
      // eslint-disable-next-line
    } catch (err: any) {
      showNotification("Cannot load carriers", "error");
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
      showNotification("Cannot load services", "error");
    }
  };

  useEffect(() => {
    if (open) {
      setCarrierId("");
      setServiceId("");
      setName("");
      setValue("");
      setCurrency(ECURRENCY.VND);
      setStartDate(start);
      setEndDate(end);
      setServices([]);
      fetchCarriers();
    }
  }, [open]);

  useEffect(() => {
    if (carrierId) fetchServices(carrierId);
  }, [carrierId]);

  const handleSubmit = async () => {
    if (!carrierId || !serviceId || !name || value === "" || !startDate || !endDate) {
      showNotification("Please enter all required info!", "warning");
      return;
    }
    try {
      setLoading(true);
      await createExtraFeeApi({
        carrierId,
        serviceId,
        code: "FSC",
        name,
        type: EFEE_TYPE.PERCENT,
        value: Number(value),
        currency,
        startDate,
        endDate,
      });
      showNotification("Created FSC successfully!", "success");
      onCreated();
    } catch (err: any) {
      showNotification(err.message || "Failed to create FSC", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Create FSC Fee</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <Grid container spacing={2}>
            <Grid size={12}>
              <TextField label="Code" value="FSC" size="small" fullWidth disabled />
            </Grid>
            <Grid size={12}>
              <TextField label="Name" fullWidth size="small" value={name} onChange={(e) => setName(e.target.value)} />
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

            <Grid size={12}>
              <NumericInput label="Value (%)" fullWidth size="small" value={String(value)} onChange={setValue} />
            </Grid>

            <Grid size={6}>
              <TextField type="date" label="Start date" value={startDate} onChange={(e) => setStartDate(e.target.value)} size="small" InputLabelProps={{ shrink: true }} fullWidth />
            </Grid>
            <Grid size={6}>
              <TextField type="date" label="End date" value={endDate} onChange={(e) => setEndDate(e.target.value)} size="small" InputLabelProps={{ shrink: true }} fullWidth />
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
