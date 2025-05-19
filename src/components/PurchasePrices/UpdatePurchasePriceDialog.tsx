// UpdatePurchasePriceDialog.tsx (final - preload dropdown before setState)

"use client";

import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, Select, Stack, Grid, InputLabel, FormControl, FormControlLabel, Checkbox, Typography } from "@mui/material";
import { useState, useEffect } from "react";
import { useNotification } from "@/contexts/NotificationProvider";
import { updatePurchasePriceApi } from "@/utils/apis/apiPurchasePrice";
import { getCarriersApi } from "@/utils/apis/apiCarrier";
import { getServicesByCarrierApi } from "@/utils/apis/apiService";
import { getSuppliersApi } from "@/utils/apis/apiSupplier";
import { ECURRENCY, EPRODUCT_TYPE } from "@/types/typeGlobals";
import NumericInput from "../Globals/NumericInput";
import { IPurchasePrice } from "@/types/typePurchasePrice";

interface Props {
  open: boolean;
  onClose: () => void;
  onUpdated: () => void;
  purchasePrice: IPurchasePrice | null;
}

export default function UpdatePurchasePriceDialog({ open, onClose, onUpdated, purchasePrice }: Props) {
  const [carriers, setCarriers] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);

  const [carrierId, setCarrierId] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [productType, setProductType] = useState(EPRODUCT_TYPE.DOCUMENT);
  const [zone, setZone] = useState("1");
  const [weightMin, setWeightMin] = useState("0");
  const [weightMax, setWeightMax] = useState("0");
  const [price, setPrice] = useState("0");
  const [currency, setCurrency] = useState(ECURRENCY.VND);
  const [isPricePerKG, setIsPricePerKG] = useState(true);
  const [loading, setLoading] = useState(false);

  const { showNotification } = useNotification();

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
    if (open && purchasePrice) {
      const init = async () => {
        await fetchCarriers();
        await fetchSuppliers();

        const carrierIdVal = typeof purchasePrice.carrierId === "object" ? purchasePrice.carrierId?._id || "" : purchasePrice.carrierId || "";
        await fetchServices(carrierIdVal);

        setCarrierId(carrierIdVal);
        setServiceId(typeof purchasePrice.serviceId === "object" ? purchasePrice.serviceId?._id || "" : purchasePrice.serviceId || "");
        setSupplierId(typeof purchasePrice.supplierId === "object" ? purchasePrice.supplierId?._id || "" : purchasePrice.supplierId || "");

        setProductType(purchasePrice.productType);
        setZone(String(purchasePrice.zone));
        setWeightMin(String(purchasePrice.weightMin));
        setWeightMax(String(purchasePrice.weightMax));
        setPrice(String(purchasePrice.price));
        setCurrency(purchasePrice.currency);
        setIsPricePerKG(purchasePrice.isPricePerKG);
      };
      init();
    }
  }, [open, purchasePrice]);

  useEffect(() => {
    if (carrierId) fetchServices(carrierId);
  }, [carrierId]);

  const handleSubmit = async () => {
    if (!purchasePrice?._id) return;
    if (!carrierId || !serviceId || !supplierId || !zone || !price) {
      showNotification("Vui lòng nhập đầy đủ thông tin!", "warning");
      return;
    }
    if (isPricePerKG && productType !== EPRODUCT_TYPE.PARCEL) {
      showNotification("Giá theo KG chỉ áp dụng với loại hàng PARCEL", "warning");
      return;
    }
    try {
      setLoading(true);
      await updatePurchasePriceApi(purchasePrice._id, {
        carrierId,
        serviceId,
        supplierId,
        productType,
        zone: Number(zone),
        weightMin: Number(weightMin),
        weightMax: Number(weightMax),
        price: Number(price),
        currency,
        isPricePerKG,
      });
      showNotification("Cập nhật giá mua thành công", "success");
      onUpdated();
    } catch (err: any) {
      showNotification(err.message || "Lỗi cập nhật giá mua", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Cập nhật giá mua</DialogTitle>
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
                <InputLabel>Supplier</InputLabel>
                <Select label="Supplier" value={supplierId} onChange={(e) => setSupplierId(e.target.value)}>
                  {suppliers?.map((s) => (
                    <MenuItem key={s._id} value={s._id}>
                      {s.name}
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
              <NumericInput label="ĐẾN KG" fullWidth size="small" value={weightMax} onChange={(val) => setWeightMax(val)} />
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
