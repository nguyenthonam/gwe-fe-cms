"use client";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, MenuItem, Select, Stack, Grid, InputLabel, FormControl, TextField } from "@mui/material";
import { useState, useEffect } from "react";
import { useNotification } from "@/contexts/NotificationProvider";
import { updateVATRateApi } from "@/utils/apis/apiVATRate";
import { getCarriersApi } from "@/utils/apis/apiCarrier";
import { getServicesByCarrierApi } from "@/utils/apis/apiService";
import { getSuppliersApi } from "@/utils/apis/apiSupplier";
import NumericInput from "../Globals/NumericInput";
import { ERECORD_STATUS } from "@/types/typeGlobals";
import { IVATRate } from "@/types/typeVATRate";

interface Props {
  open: boolean;
  onClose: () => void;
  onUpdated: () => void;
  vatRate: IVATRate | null;
}

export default function UpdateVATRateDialog({ open, onClose, onUpdated, vatRate }: Props) {
  const [carriers, setCarriers] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);

  const [carrierId, setCarrierId] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [value, setValue] = useState<number | string>("10");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState(ERECORD_STATUS.Active);
  const [loading, setLoading] = useState(false);

  // Thêm state validate ngày
  const [dateError, setDateError] = useState<string>("");

  const { showNotification } = useNotification();

  useEffect(() => {
    if (open && vatRate) {
      const fetchAll = async () => {
        try {
          const resC = await getCarriersApi();
          const carriersList = resC?.data?.data?.data || [];
          setCarriers(carriersList);

          const resS = await getSuppliersApi();
          setSuppliers(resS?.data?.data?.data || []);

          // Set values
          const cId = typeof vatRate.carrierId === "object" ? vatRate.carrierId?._id || "" : vatRate.carrierId || "";
          const sId = typeof vatRate.serviceId === "object" ? vatRate.serviceId?._id || "" : vatRate.serviceId || "";
          const supplierIdVal = typeof vatRate.supplierId === "object" ? vatRate.supplierId?._id || "" : vatRate.supplierId || "";

          setCarrierId(cId);
          setServiceId(sId);
          setSupplierId(supplierIdVal);
          setValue(vatRate.value?.toString() || "10");
          setStartDate(vatRate.startDate ? vatRate.startDate.slice(0, 10) : "");
          setEndDate(vatRate.endDate ? vatRate.endDate.slice(0, 10) : "");
          setStatus(vatRate.status || ERECORD_STATUS.Active);

          // Load services if carrierId
          if (cId) {
            const selected = carriersList.find((c: any) => c._id === cId);
            const companyId = typeof selected?.companyId === "object" ? selected?.companyId?._id : selected?.companyId;
            if (companyId) {
              const resSrv = await getServicesByCarrierApi(companyId);
              setServices(resSrv?.data?.data?.data || []);
            }
          } else {
            setServices([]);
          }
          // eslint-disable-next-line
        } catch (err: any) {
          showNotification("Cannot load dropdown data!", "error");
        }
      };
      fetchAll();
      setDateError("");
    }
  }, [open, vatRate, showNotification]);

  useEffect(() => {
    if (carrierId) {
      const selected = carriers.find((c: any) => c._id === carrierId);
      const companyId = typeof selected?.companyId === "object" ? selected?.companyId?._id : selected?.companyId;
      if (companyId) {
        getServicesByCarrierApi(companyId).then((res) => setServices(res?.data?.data?.data || []));
      }
    } else {
      setServices([]);
    }
    setServiceId("");
    // eslint-disable-next-line
  }, [carrierId]);

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
    if (!vatRate?._id) return;
    if (!carrierId || !serviceId || !supplierId || value === "" || !startDate || !endDate) {
      showNotification("Please enter all required fields!", "warning");
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
      await updateVATRateApi(vatRate._id, {
        carrierId,
        serviceId,
        supplierId,
        value: Number(value),
        startDate,
        endDate,
        status,
      });
      showNotification("VAT Rate updated successfully!", "success");
      onUpdated();
      onClose();
    } catch (err: any) {
      showNotification(err.message || "Failed to update VAT Rate", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Update VAT Rate</DialogTitle>
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
          Update
        </Button>
      </DialogActions>
    </Dialog>
  );
}
