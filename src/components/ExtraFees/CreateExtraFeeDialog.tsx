"use client";

import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, Select, Stack, Grid, InputLabel, FormControl } from "@mui/material";
import { useEffect, useState } from "react";
import { ICarrier } from "@/types/typeCarrier";
import { ECURRENCY, EFEE_TYPE } from "@/types/typeGlobals";
import { IService } from "@/types/typeService";
import { useNotification } from "@/contexts/NotificationProvider";
import { createExtraFeeApi } from "@/utils/apis/apiExtraFee";
import { getCarriersApi } from "@/utils/apis/apiCarrier";
import { getServicesByCarrierApi } from "@/utils/apis/apiService";
import NumericInput from "../Globals/NumericInput";
import dayjs from "dayjs";

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
  const [value, setValue] = useState<number | string>("");
  const [currency, setCurrency] = useState<ECURRENCY>(ECURRENCY.VND);
  const [startDate, setStartDate] = useState<string>(dayjs().format("YYYY-MM-DD"));
  const [endDate, setEndDate] = useState<string>(dayjs().add(30, "day").format("YYYY-MM-DD"));
  const [loading, setLoading] = useState(false);

  const { showNotification } = useNotification();

  // Only type = FIXED (Tiền mặt)
  const type = EFEE_TYPE.FIXED;

  const fetchCarriers = async () => {
    try {
      const res = await getCarriersApi();
      setCarriers(res?.data?.data?.data || []);
      // eslint-disable-next-line
    } catch (err: any) {
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
      // eslint-disable-next-line
    } catch (err: any) {
      showNotification("Không thể tải dịch vụ!", "error");
    }
  };

  useEffect(() => {
    if (open) {
      setCarrierId("");
      setServiceId("");
      setCode("");
      setName("");
      setValue("");
      setCurrency(ECURRENCY.VND);
      setServices([]);
      setStartDate(dayjs().format("YYYY-MM-DD"));
      setEndDate(dayjs().add(30, "day").format("YYYY-MM-DD"));
      fetchCarriers();
    }
    // eslint-disable-next-line
  }, [open]);

  useEffect(() => {
    if (carrierId) fetchServices(carrierId);
    else setServices([]);
    // eslint-disable-next-line
  }, [carrierId]);

  const handleSubmit = async () => {
    if (!carrierId || !serviceId || !code || !name || value === "" || !startDate || !endDate) {
      showNotification("Vui lòng nhập đầy đủ thông tin!", "warning");
      return;
    }
    // Validate không cho phép mã là FSC
    if (code.trim().toUpperCase() === "FSC") {
      showNotification("Mã phụ phí không được là 'FSC'. Vui lòng chọn mã khác!", "warning");
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      showNotification("Ngày bắt đầu không được lớn hơn ngày kết thúc!", "warning");
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
        startDate,
        endDate,
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
            {/* Type chỉ là FIXED (Tiền mặt), không cho chọn */}
            <Grid size={6}>
              <TextField label="Loại phí" value="Tiền mặt" fullWidth size="small" disabled />
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
            <Grid size={12} container spacing={1}>
              <Grid size={6}>
                <TextField label="Từ ngày" type="date" fullWidth size="small" value={startDate} onChange={(e) => setStartDate(e.target.value)} InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid size={6}>
                <TextField label="Đến ngày" type="date" fullWidth size="small" value={endDate} onChange={(e) => setEndDate(e.target.value)} InputLabelProps={{ shrink: true }} />
              </Grid>
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
