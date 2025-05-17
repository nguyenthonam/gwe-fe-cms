"use client";

import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, Select, Stack, Grid, InputLabel, FormControl } from "@mui/material";
import { useEffect, useState } from "react";
import { EFEE_TYPE, ECURRENCY } from "@/types/typeGlobals";
import { useNotification } from "@/contexts/NotificationProvider";
import { updateExtraFeeApi } from "@/utils/apis/apiExtraFee";
import { getCarriersApi } from "@/utils/apis/apiCarrier";
import { getServicesByCarrierApi } from "@/utils/apis/apiService";
import { feeTypeLabel } from "@/utils/constants/enumLabel";
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

interface IExtraFeeForm extends Omit<IExtraFee, "value"> {
  value: string;
}

export default function UpdateExtraFeeDialog({ open, onClose, onUpdated, extraFee }: Props) {
  const [form, setForm] = useState<Partial<IExtraFeeForm>>({});
  const [carriers, setCarriers] = useState<ICarrier[]>([]);
  const [services, setServices] = useState<IService[]>([]);

  const { showNotification } = useNotification();

  useEffect(() => {
    const init = async () => {
      if (open && extraFee) {
        setForm({
          ...extraFee,
          value: String(extraFee.value ?? 0),
        });

        try {
          const carrierRes = await getCarriersApi();
          const carrierList = carrierRes?.data?.data?.data || [];
          setCarriers(carrierList);

          const carrierId = typeof extraFee.carrierId === "object" ? extraFee.carrierId?._id : extraFee.carrierId;
          const selected = carrierList.find((c: ICarrier) => c._id === carrierId);
          const companyId = typeof selected?.companyId === "object" ? selected.companyId?._id : selected?.companyId;

          if (companyId) {
            const serviceRes = await getServicesByCarrierApi(companyId);
            setServices(serviceRes?.data?.data?.data || []);
          }
        } catch {
          showNotification("Không thể tải dữ liệu hãng bay hoặc dịch vụ", "error");
        }
      }
    };

    init();
  }, [open, extraFee]);

  useEffect(() => {
    const carrierId = typeof form.carrierId === "object" ? form.carrierId?._id : form.carrierId;
    if (carrierId) fetchServices(carrierId);
  }, [form.carrierId]);

  const fetchServices = async (carrierId: string) => {
    const selected = carriers.find((c) => c._id === carrierId);
    const companyId = typeof selected?.companyId === "object" ? selected?.companyId?._id : selected?.companyId;
    if (!companyId) return;

    try {
      const res = await getServicesByCarrierApi(companyId);
      setServices(res?.data?.data?.data || []);
    } catch {
      showNotification("Không thể tải dịch vụ", "error");
    }
  };

  const handleChange = (field: keyof IExtraFee, value: any) => {
    setForm({ ...form, [field]: value });
  };

  const handleSubmit = async () => {
    if (!extraFee?._id) return;

    const changedFields: Partial<IExtraFee> = {};
    const keys: (keyof IExtraFee)[] = ["code", "name", "carrierId", "serviceId", "type", "value", "currency"];

    keys.forEach((key) => {
      if (key === "value") {
        const newVal = Number(form.value ?? "0");
        const oldVal = Number(extraFee.value ?? 0);
        if (newVal !== oldVal) {
          changedFields.value = newVal;
        }
      } else {
        const currentVal = form[key] ?? undefined;
        const originalVal = extraFee[key] ?? undefined;

        if (currentVal !== undefined && JSON.stringify(currentVal) !== JSON.stringify(originalVal)) {
          changedFields[key] = currentVal as any;
        }
      }
    });

    if (Object.keys(changedFields).length === 0) {
      showNotification("Không có thay đổi để cập nhật", "info");
      return;
    }

    try {
      await updateExtraFeeApi(extraFee._id, changedFields);
      showNotification("Cập nhật thành công!", "success");
      onUpdated();
      onClose();
    } catch (err: any) {
      showNotification(err.message || "Lỗi khi cập nhật!", "error");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Cập nhật phụ phí</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <Grid container spacing={2}>
            <Grid size={6}>
              <TextField label="Mã phụ phí" fullWidth size="small" value={form.code || ""} onChange={(e) => handleChange("code", e.target.value)} />
            </Grid>
            <Grid size={6}>
              <TextField label="Tên phụ phí" fullWidth size="small" value={form.name || ""} onChange={(e) => handleChange("name", e.target.value)} />
            </Grid>
            <Grid size={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Hãng vận chuyển</InputLabel>
                <Select label="Hãng vận chuyển" value={typeof form.carrierId === "object" ? form.carrierId?._id : form.carrierId || ""} onChange={(e) => handleChange("carrierId", e.target.value)}>
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
                <Select label="Dịch vụ" value={typeof form.serviceId === "object" ? form.serviceId?._id : form.serviceId || ""} onChange={(e) => handleChange("serviceId", e.target.value)}>
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
                <Select label="Loại phí" value={form.type || EFEE_TYPE.FIXED} onChange={(e) => handleChange("type", e.target.value)}>
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
                <Select label="Tiền tệ" value={form.currency || ECURRENCY.VND} onChange={(e) => handleChange("currency", e.target.value)}>
                  {Object.values(ECURRENCY).map((cur) => (
                    <MenuItem key={cur} value={cur}>
                      {cur}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={12}>
              <NumericInput label="Giá trị" fullWidth size="small" value={(form.value as string) || ""} onChange={(val) => handleChange("value", val)} />
            </Grid>
          </Grid>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Huỷ</Button>
        <Button variant="contained" onClick={handleSubmit}>
          Cập nhật
        </Button>
      </DialogActions>
    </Dialog>
  );
}
