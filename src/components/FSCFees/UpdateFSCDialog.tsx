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

export default function UpdateFSCDialog({ open, onClose, onUpdated, extraFee }: Props) {
  const [carriers, setCarriers] = useState<ICarrier[]>([]);
  const [services, setServices] = useState<IService[]>([]);
  const [carrierId, setCarrierId] = useState<string>("");
  const [serviceId, setServiceId] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [value, setValue] = useState<number | string>("");
  const [currency, setCurrency] = useState<ECURRENCY>(ECURRENCY.VND);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const { showNotification } = useNotification();

  // Reset form when open or extraFee changes
  useEffect(() => {
    if (open && extraFee) {
      const _carrierId = typeof extraFee.carrierId === "object" ? extraFee.carrierId?._id : extraFee.carrierId;
      const _serviceId = typeof extraFee.serviceId === "object" ? extraFee.serviceId?._id : extraFee.serviceId;
      setCarrierId(_carrierId || "");
      setServiceId(_serviceId || "");
      setName(extraFee.name || "");
      setValue(extraFee.value ?? "");
      setCurrency(extraFee.currency || ECURRENCY.VND);
      setStartDate(extraFee.startDate ? extraFee.startDate.slice(0, 10) : "");
      setEndDate(extraFee.endDate ? extraFee.endDate.slice(0, 10) : "");
      fetchCarriers();
    }
    // eslint-disable-next-line
  }, [open, extraFee]);

  // Load services when carrierId changes
  useEffect(() => {
    if (carrierId && carriers.length) fetchServices(carrierId);
    // eslint-disable-next-line
  }, [carrierId, carriers]);

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
    if (!companyId) {
      setServices([]);
      return;
    }
    try {
      const res = await getServicesByCarrierApi(companyId);
      setServices(res?.data?.data?.data || []);
      // eslint-disable-next-line
    } catch (err: any) {
      showNotification("Cannot load services", "error");
      setServices([]);
    }
  };

  const handleSubmit = async () => {
    if (!extraFee?._id) return;
    if (!carrierId || !serviceId || !name || value === "" || !startDate || !endDate) {
      showNotification("Please enter all required info!", "warning");
      return;
    }

    // Build changed fields object
    const changedFields: any = {};
    if (carrierId !== (typeof extraFee.carrierId === "object" ? extraFee.carrierId?._id : extraFee.carrierId)) changedFields.carrierId = carrierId;
    if (serviceId !== (typeof extraFee.serviceId === "object" ? extraFee.serviceId?._id : extraFee.serviceId)) changedFields.serviceId = serviceId;
    if (name !== extraFee.name) changedFields.name = name;
    if (Number(value) !== Number(extraFee.value)) changedFields.value = Number(value);
    if (currency !== extraFee.currency) changedFields.currency = currency;
    if (startDate !== (extraFee.startDate?.slice(0, 10) || "")) changedFields.startDate = startDate;
    if (endDate !== (extraFee.endDate?.slice(0, 10) || "")) changedFields.endDate = endDate;

    if (Object.keys(changedFields).length === 0) {
      showNotification("No changes to update.", "info");
      return;
    }

    try {
      await updateExtraFeeApi(extraFee._id, changedFields);
      showNotification("Update successful!", "success");
      onUpdated();
      onClose();
    } catch (err: any) {
      showNotification(err.message || "Update failed!", "error");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Update FSC Fee</DialogTitle>
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
        <Button variant="contained" onClick={handleSubmit}>
          Update
        </Button>
      </DialogActions>
    </Dialog>
  );
}
