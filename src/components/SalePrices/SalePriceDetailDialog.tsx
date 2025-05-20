"use client";

import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, Stack, InputLabel, FormControl, TextField, MenuItem, Select, FormControlLabel, Checkbox, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { ISalePrice } from "@/types/typeSalePrice";
import { ECURRENCY, EPRODUCT_TYPE } from "@/types/typeGlobals";
import { useNotification } from "@/contexts/NotificationProvider";
import { getCarriersApi } from "@/utils/apis/apiCarrier";
import { getPartnersApi } from "@/utils/apis/apiPartner";
import { getServicesByCarrierApi } from "@/utils/apis/apiService";
import { updateSalePriceApi } from "@/utils/apis/apiSalePrice";
import NumericInput from "../Globals/NumericInput";

interface Props {
  open: boolean;
  onClose: () => void;
  onUpdated: () => void;
  salePrice: ISalePrice | null;
}

export default function UpdateSalePriceDialog({ open, onClose, onUpdated, salePrice }: Props) {
  const [carriers, setCarriers] = useState<any[]>([]);
  const [partners, setPartners] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);

  const [partnerId, setPartnerId] = useState("");
  const [carrierId, setCarrierId] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [productType, setProductType] = useState<EPRODUCT_TYPE>(EPRODUCT_TYPE.DOCUMENT);
  const [zone, setZone] = useState("1");
  const [weightMin, setWeightMin] = useState("0");
  const [weightMax, setWeightMax] = useState("0");
  const [price, setPrice] = useState("0");
  const [currency, setCurrency] = useState<ECURRENCY>(ECURRENCY.VND);
  const [isPricePerKG, setIsPricePerKG] = useState(true);
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
    const selected = carriers.find((c) => c._id === carrierId);
    const companyId = typeof selected?.companyId === "object" ? selected?.companyId?._id : selected?.companyId;
    if (!companyId) return;
    const res = await getServicesByCarrierApi(companyId);
    setServices(res?.data?.data?.data || []);
  };

  useEffect(() => {
    if (open && salePrice) {
      setPartnerId(salePrice.partnerId as string);
      setCarrierId(salePrice.carrierId as string);
      setServiceId(salePrice.serviceId as string);
      setProductType(salePrice.productType);
      setZone(String(salePrice.zone));
      setWeightMin(String(salePrice.weightMin));
      setWeightMax(String(salePrice.weightMax));
      setPrice(String(salePrice.price));
      setCurrency(salePrice.currency);
      setIsPricePerKG(salePrice.isPricePerKG);
      fetchCarriers();
      fetchPartners();
    }
  }, [open, salePrice]);

  useEffect(() => {
    if (carrierId) fetchServices(carrierId);
  }, [carrierId]);

  const handleSubmit = async () => {
    if (!salePrice?._id) return;
    if (!partnerId || !carrierId || !serviceId || !zone || !price) {
      showNotification("Vui lòng nhập đầy đủ thông tin!", "warning");
      return;
    }
    if (isPricePerKG && productType !== EPRODUCT_TYPE.PARCEL) {
      showNotification("Giá theo KG chỉ áp dụng với loại hàng PARCEL", "warning");
      return;
    }
    try {
      setLoading(true);
      await updateSalePriceApi(salePrice._id, {
        partnerId,
        carrierId,
        serviceId,
        productType,
        zone: Number(zone),
        weightMin: Number(weightMin),
        weightMax: Number(weightMax),
        price: Number(price),
        currency,
        isPricePerKG,
      });
      showNotification("Cập nhật giá bán thành công", "success");
      onUpdated();
    } catch (err: any) {
      showNotification(err.message || "Lỗi cập nhật giá bán", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Cập nhật giá bán</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <Grid container spacing={2}>
            <Grid size={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Loại hàng</InputLabel>
                <Select label="Loại hàng" value={productType} onChange={(e) => setProductType(e.target.value as EPRODUCT_TYPE)}>
                  <MenuItem value={EPRODUCT_TYPE.DOCUMENT}>DOCUMENT</MenuItem>
                  <MenuItem value={EPRODUCT_TYPE.PARCEL}>PARCEL</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Partner</InputLabel>
                <Select label="Partner" value={partnerId} onChange={(e) => setPartnerId(e.target.value)}>
                  {partners?.map((p) => (
                    <MenuItem key={p._id} value={p._id}>
                      {p.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Hãng</InputLabel>
                <Select label="Hãng" value={carrierId} onChange={(e) => setCarrierId(e.target.value)}>
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
                <InputLabel>Dịch vụ</InputLabel>
                <Select label="Dịch vụ" value={serviceId} onChange={(e) => setServiceId(e.target.value)}>
                  {services?.map((s) => (
                    <MenuItem key={s._id} value={s._id}>
                      {s.code}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={4}>
              <NumericInput label="Zone" fullWidth size="small" value={zone} onChange={(val) => setZone(val)} />
            </Grid>
            <Grid size={4}>
              <NumericInput label="Từ KG" fullWidth size="small" value={weightMin} onChange={(val) => setWeightMin(val)} />
            </Grid>
            <Grid size={4}>
              <NumericInput label="Đến KG" fullWidth size="small" value={weightMax} onChange={(val) => setWeightMax(val)} />
            </Grid>
            <Grid size={6}>
              <NumericInput label="Giá" fullWidth size="small" value={price} onChange={(val) => setPrice(val)} />
            </Grid>
            <Grid size={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Tiền tệ</InputLabel>
                <Select label="Tiền tệ" value={currency} onChange={(e) => setCurrency(e.target.value as ECURRENCY)}>
                  {Object.values(ECURRENCY).map((cur) => (
                    <MenuItem key={cur} value={cur}>
                      {cur}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={isPricePerKG}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setIsPricePerKG(checked);
                      if (checked) setProductType(EPRODUCT_TYPE.PARCEL);
                    }}
                  />
                }
                label="Giá theo KG"
              />
              {isPricePerKG && productType !== EPRODUCT_TYPE.PARCEL && (
                <Typography variant="caption" color="error">
                  Giá theo KG chỉ áp dụng với loại hàng PARCEL. Đã tự động chuyển.
                </Typography>
              )}
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
