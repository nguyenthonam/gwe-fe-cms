"use client";

import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, Select, Stack, Grid, InputLabel, FormControl, FormControlLabel, Checkbox } from "@mui/material";
import { useState, useEffect } from "react";
import { ISalePrice } from "@/types/typeSalePrice";
import { EPRODUCT_TYPE, ECURRENCY } from "@/types/typeGlobals";
import { useNotification } from "@/contexts/NotificationProvider";
import { getCarriersApi } from "@/utils/apis/apiCarrier";
import { getPartnersApi } from "@/utils/apis/apiPartner";
import { getServicesByCarrierApi } from "@/utils/apis/apiService";
import { createSalePriceApi } from "@/utils/apis/apiSalePrice";
import NumericInput from "../Globals/NumericInput";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateSalePriceDialog({ open, onClose, onCreated }: Props) {
  const [form, setForm] = useState<ISalePrice>({
    partnerId: "",
    carrierId: "",
    serviceId: "",
    productType: EPRODUCT_TYPE.DOCUMENT,
    zone: 1,
    weightMin: 0,
    weightMax: 0,
    price: 0,
    currency: ECURRENCY.VND,
    isPricePerKG: true,
  });

  const [carriers, setCarriers] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [partners, setPartners] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const { showNotification } = useNotification();

  const fetchCarriers = async () => {
    const res = await getCarriersApi();
    setCarriers(res?.data?.data?.data || []);
  };

  const fetchPartners = async () => {
    const res = await getPartnersApi();
    setPartners(res?.data?.data?.data || []);
  };

  const fetchServices = async (carrierId: string) => {
    if (!carrierId) return;
    const res = await getServicesByCarrierApi(carrierId);
    setServices(res?.data?.data?.data || []);
  };

  useEffect(() => {
    if (open) {
      setForm({
        partnerId: "",
        carrierId: "",
        serviceId: "",
        productType: EPRODUCT_TYPE.DOCUMENT,
        zone: 1,
        weightMin: 0,
        weightMax: 0,
        price: 0,
        currency: ECURRENCY.VND,
        isPricePerKG: true,
      });
      setServices([]);
      fetchCarriers();
      fetchPartners();
    }
  }, [open]);

  useEffect(() => {
    if (form.carrierId) {
      const carrierIdStr = typeof form.carrierId === "string" ? form.carrierId : form.carrierId._id;
      if (carrierIdStr) fetchServices(carrierIdStr);
    }
  }, [form.carrierId]);

  const handleSubmit = async () => {
    if (!form.partnerId || !form.carrierId || !form.serviceId || form.zone === null || form.price === null) {
      showNotification("Vui lòng nhập đầy đủ thông tin!", "warning");
      return;
    }
    if (form.isPricePerKG && form.productType !== EPRODUCT_TYPE.PARCEL) {
      showNotification("Giá theo KG chỉ áp dụng với loại hàng PARCEL", "warning");
      return;
    }
    try {
      setLoading(true);
      await createSalePriceApi(form);
      showNotification("Tạo giá bán thành công", "success");
      onCreated();
    } catch (err: any) {
      showNotification(err.message || "Lỗi tạo giá bán", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Tạo giá bán</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <Grid container spacing={2}>
            <Grid size={6}>
              <TextField select label="Loại hàng" fullWidth size="small" value={form.productType} onChange={(e) => setForm({ ...form, productType: e.target.value as EPRODUCT_TYPE })}>
                <MenuItem value={EPRODUCT_TYPE.DOCUMENT}>DOCUMENT</MenuItem>
                <MenuItem value={EPRODUCT_TYPE.PARCEL}>PARCEL</MenuItem>
              </TextField>
            </Grid>
            <Grid size={6}>
              <TextField select label="Partner" fullWidth size="small" value={form.partnerId} onChange={(e) => setForm({ ...form, partnerId: e.target.value })}>
                {partners?.map((p) => (
                  <MenuItem key={p._id} value={p._id}>
                    {p.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={6}>
              <TextField select label="Hãng" fullWidth size="small" value={form.carrierId} onChange={(e) => setForm({ ...form, carrierId: e.target.value })}>
                {carriers?.map((c) => (
                  <MenuItem key={c._id} value={c._id}>
                    {c.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={6}>
              <TextField select label="Dịch vụ" fullWidth size="small" value={form.serviceId} onChange={(e) => setForm({ ...form, serviceId: e.target.value })}>
                {services?.map((s) => (
                  <MenuItem key={s._id} value={s._id}>
                    {s.code}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={4}>
              <NumericInput label="Zone" fullWidth size="small" value={String(form.zone)} onChange={(val) => setForm({ ...form, zone: Number(val) })} />
            </Grid>
            <Grid size={4}>
              <NumericInput label="Từ KG" fullWidth size="small" value={String(form.weightMin)} onChange={(val) => setForm({ ...form, weightMin: Number(val) })} />
            </Grid>
            <Grid size={4}>
              <NumericInput label="Đến KG" fullWidth size="small" value={String(form.weightMax)} onChange={(val) => setForm({ ...form, weightMax: Number(val) })} />
            </Grid>
            <Grid size={6}>
              <NumericInput label="Giá" fullWidth size="small" value={String(form.price)} onChange={(val) => setForm({ ...form, price: Number(val) })} />
            </Grid>
            <Grid size={6}>
              <TextField select label="Tiền tệ" fullWidth size="small" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value as ECURRENCY })}>
                {Object.values(ECURRENCY).map((cur) => (
                  <MenuItem key={cur} value={cur}>
                    {cur}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={12}>
              <FormControlLabel control={<Checkbox checked={form.isPricePerKG} onChange={(e) => setForm({ ...form, isPricePerKG: e.target.checked })} />} label="Giá theo KG" />
            </Grid>
          </Grid>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Huỷ</Button>
        <Button onClick={handleSubmit} disabled={loading} variant="contained">
          Tạo
        </Button>
      </DialogActions>
    </Dialog>
  );
}
