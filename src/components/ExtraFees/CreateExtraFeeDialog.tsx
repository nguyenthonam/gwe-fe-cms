"use client";

import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, Select, Stack, Grid, InputLabel, FormControl } from "@mui/material";
import { useEffect, useState } from "react";
import { ICarrier } from "@/types/typeCarrier";
import { EFEE_TYPE, ECURRENCY } from "@/types/typeGlobals";
import { IService } from "@/types/typeService";
import { useNotification } from "@/contexts/NotificationProvider";
import { createExtraFeeApi } from "@/utils/apis/apiExtraFee";
import { getCarriersApi } from "@/utils/apis/apiCarrier";
import { getServicesByCarrierApi } from "@/utils/apis/apiService";
import { feeTypeLabel } from "@/utils/constants/enumLabel";
import NumericInput from "../Globals/NumericInput";

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
  const [type, setType] = useState<EFEE_TYPE>(EFEE_TYPE.FIXED);
  const [value, setValue] = useState<number | string>("");
  const [currency, setCurrency] = useState<ECURRENCY>(ECURRENCY.VND);
  const [loading, setLoading] = useState(false);

  const { showNotification } = useNotification();

  const fetchCarriers = async () => {
    try {
      const res = await getCarriersApi();
      setCarriers(res?.data?.data?.data || []);
    } catch (err) {
      showNotification("Không thể tải danh sách hãng vận chuyển", "error");
    }
  };

  const fetchServices = async (carrierId: string) => {
    const selected = carriers.find((c) => c._id === carrierId);
    const companyId = typeof selected?.companyId === "object" ? selected?.companyId?._id : selected?.companyId;

    if (!companyId) return;

    try {
      const res = await getServicesByCarrierApi(companyId);
      setServices(res?.data?.data?.data || []);
    } catch (err) {
      showNotification("Không thể tải dịch vụ!", "error");
    }
  };

  useEffect(() => {
    if (open) {
      setCarrierId("");
      setServiceId("");
      setCode("");
      setName("");
      setType(EFEE_TYPE.FIXED);
      setValue("");
      setCurrency(ECURRENCY.VND);
      setServices([]);
      fetchCarriers();
    }
  }, [open]);

  useEffect(() => {
    if (carrierId) fetchServices(carrierId);
  }, [carrierId]);

  const handleSubmit = async () => {
    if (!carrierId || !serviceId || !code || !name || value === "") {
      showNotification("Vui lòng nhập đầy đủ thông tin!", "warning");
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
        applyToFeeIds: [],
      });
      showNotification("Tạo phụ phí thành công!", "success");
      onCreated();
    } catch (err: any) {
      showNotification(err.message || "Lỗi khi tạo phụ phí", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Tạo phụ phí mới</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <Grid container spacing={2}>
            <Grid size={6}>
              <TextField label="Mã phụ phí" fullWidth size="small" value={code} onChange={(e) => setCode(e.target.value)} />
            </Grid>
            <Grid size={6}>
              <TextField label="Tên phụ phí" fullWidth size="small" value={name} onChange={(e) => setName(e.target.value)} />
            </Grid>
            <Grid size={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Hãng vận chuyển</InputLabel>
                <Select label="Hãng vận chuyển" value={carrierId} onChange={(e) => setCarrierId(e.target.value)}>
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
                <InputLabel>Loại phí</InputLabel>
                <Select label="Loại phí" value={type} onChange={(e) => setType(e.target.value as EFEE_TYPE)}>
                  {Object.values(EFEE_TYPE).map((val) => (
                    <MenuItem key={val} value={val}>
                      {feeTypeLabel[val]}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
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
              <NumericInput label="Giá trị" fullWidth size="small" value={String(value)} onChange={(val) => setValue(val)} />
            </Grid>
          </Grid>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Huỷ</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={loading}>
          Tạo mới
        </Button>
      </DialogActions>
    </Dialog>
  );
}
