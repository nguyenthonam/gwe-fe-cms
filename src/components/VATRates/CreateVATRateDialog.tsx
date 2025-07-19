"use client";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, Select, Stack, Grid, InputLabel, FormControl } from "@mui/material";
import { useEffect, useState } from "react";
import { useNotification } from "@/contexts/NotificationProvider";
import { createVATRateApi } from "@/utils/apis/apiVATRate";
import { getCarriersApi } from "@/utils/apis/apiCarrier";
import { getServicesByCarrierApi } from "@/utils/apis/apiService";
import { getSuppliersApi } from "@/utils/apis/apiSupplier";
import NumericInput from "../Globals/NumericInput";
import dayjs from "dayjs";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateVATRateDialog({ open, onClose, onCreated }: Props) {
  const [carriers, setCarriers] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);

  const [carrierId, setCarrierId] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [value, setValue] = useState<number | string>("10");
  const [startDate, setStartDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [endDate, setEndDate] = useState(dayjs().add(1, "month").format("YYYY-MM-DD"));
  const [loading, setLoading] = useState(false);

  // Thêm state cho lỗi ngày
  const [dateError, setDateError] = useState<string>("");

  const { showNotification } = useNotification();

  // Fetch dropdown lists
  useEffect(() => {
    if (open) {
      setCarrierId("");
      setServiceId("");
      setSupplierId("");
      setValue("10");
      setStartDate(dayjs().format("YYYY-MM-DD"));
      setEndDate(dayjs().add(1, "month").format("YYYY-MM-DD"));
      setServices([]);
      setDateError("");
      getCarriersApi().then((res) => setCarriers(res?.data?.data?.data || []));
      getSuppliersApi().then((res) => setSuppliers(res?.data?.data?.data || []));
    }
  }, [open]);

  useEffect(() => {
    if (carrierId) {
      const selected = carriers.find((c) => c._id === carrierId);
      const companyId = typeof selected?.companyId === "object" ? selected?.companyId?._id : selected?.companyId;
      if (companyId) {
        getServicesByCarrierApi(companyId).then((res) => setServices(res?.data?.data?.data || []));
      }
    } else {
      setServices([]);
    }
    setServiceId("");
  }, [carrierId, carriers]);

  // Validate khi đổi ngày
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
    if (!carrierId || !serviceId || !supplierId || value === "" || !startDate || !endDate) {
      showNotification("Please enter all required info!", "warning");
      return;
    }
    if (Number(value) < 0) {
      showNotification("VAT (%) must be greater than or equal to 0!", "warning");
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      showNotification("Start date must be before or equal to end date!", "warning");
      return;
    }
    if (dateError) {
      showNotification(dateError, "warning");
      return;
    }
    try {
      setLoading(true);
      await createVATRateApi({
        carrierId,
        serviceId,
        supplierId,
        value: Number(value),
        startDate,
        endDate,
      });
      showNotification("Created VAT Rate successfully!", "success");
      onCreated();
    } catch (err: any) {
      showNotification(err.message || "Failed to create VAT Rate", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Create VAT Rate</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <Grid container spacing={2}>
            <Grid size={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Carrier</InputLabel>
                <Select label="Carrier" value={carrierId} onChange={(e) => setCarrierId(e.target.value)}>
                  {carriers.map((c) => (
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
                <Select label="Service" value={serviceId} onChange={(e) => setServiceId(e.target.value)} disabled={!carrierId}>
                  {services.map((s) => (
                    <MenuItem key={s._id} value={s._id}>
                      {s.code}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Supplier</InputLabel>
                <Select label="Supplier" value={supplierId} onChange={(e) => setSupplierId(e.target.value)}>
                  {suppliers.map((s) => (
                    <MenuItem key={s._id} value={s._id}>
                      {s.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={6}>
              <NumericInput label="VAT (%)" fullWidth size="small" value={String(value)} onChange={setValue} />
            </Grid>
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
