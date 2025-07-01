"use client";

import { Dialog, DialogTitle, DialogContent, DialogActions, Button, MenuItem, Select, Stack, Grid, InputLabel, FormControl } from "@mui/material";
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
  const [value, setValue] = useState("10");
  const [status, setStatus] = useState(ERECORD_STATUS.Active);
  const [loading, setLoading] = useState(false);

  const { showNotification } = useNotification();

  // Fetch and preload dropdowns before fill
  const fetchCarriers = async () => {
    const res = await getCarriersApi();
    setCarriers(res?.data?.data?.data || []);
  };
  const fetchSuppliers = async () => {
    const res = await getSuppliersApi();
    setSuppliers(res?.data?.data?.data || []);
  };
  const fetchServices = async (carrierId: string) => {
    const selected = carriers.find((c) => c._id === carrierId);
    const companyId = typeof selected?.companyId === "object" ? selected?.companyId?._id : selected?.companyId;
    if (!companyId) return;
    const res = await getServicesByCarrierApi(companyId);
    setServices(res?.data?.data?.data || []);
  };

  useEffect(() => {
    if (open && vatRate) {
      const init = async () => {
        await fetchCarriers();
        await fetchSuppliers();

        const carrierIdVal = typeof vatRate.carrierId === "object" ? vatRate.carrierId?._id || "" : vatRate.carrierId || "";
        await fetchServices(carrierIdVal);

        setCarrierId(carrierIdVal);
        setServiceId(typeof vatRate.serviceId === "object" ? vatRate.serviceId?._id || "" : vatRate.serviceId || "");
        setSupplierId(typeof vatRate.supplierId === "object" ? vatRate.supplierId?._id || "" : vatRate.supplierId || "");
        setValue(vatRate.value?.toString() || "10");
        setStatus(vatRate.status || ERECORD_STATUS.Active);
      };
      init();
    }
  }, [open, vatRate]);

  useEffect(() => {
    if (carrierId) fetchServices(carrierId);
    else setServices([]);
    // eslint-disable-next-line
  }, [carrierId]);

  const handleSubmit = async () => {
    if (!vatRate?._id) return;
    if (!carrierId || !serviceId || !supplierId || !value) {
      showNotification("Vui lòng nhập đầy đủ thông tin!", "warning");
      return;
    }
    try {
      setLoading(true);
      await updateVATRateApi(vatRate._id, {
        carrierId,
        serviceId,
        supplierId,
        value: Number(value),
        status,
      });
      showNotification("Cập nhật Thuế VAT thành công", "success");
      onUpdated();
    } catch (err: any) {
      showNotification(err.message || "Lỗi cập nhật VAT Rate", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Cập nhật Thuế VAT</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <Grid container spacing={2}>
            <Grid size={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Hãng</InputLabel>
                <Select label="Hãng" value={carrierId} onChange={(e) => setCarrierId(e.target.value)}>
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
                <InputLabel>Dịch vụ</InputLabel>
                <Select label="Dịch vụ" value={serviceId} onChange={(e) => setServiceId(e.target.value)}>
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
              <NumericInput label="VAT (%)" fullWidth size="small" value={value} onChange={setValue} />
            </Grid>
          </Grid>
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
