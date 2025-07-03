import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Stack, MenuItem, Select, Checkbox, FormControlLabel } from "@mui/material";
import { useEffect, useState } from "react";
import { useNotification } from "@/contexts/NotificationProvider";
import { updateCAWBCodeApi } from "@/utils/apis/apiCAWBCode";
import { ICAWBCode } from "@/types/typeCAWBCode";
import { ICarrier } from "@/types/typeCarrier";
import { getCarriersApi } from "@/utils/apis/apiCarrier";

interface Props {
  open: boolean;
  onClose: () => void;
  onUpdated: () => void;
  cawbCode: ICAWBCode | null;
}

export default function UpdateCAWBCodeDialog({ open, onClose, onUpdated, cawbCode }: Props) {
  const [carrierId, setCarrierId] = useState("");
  const [code, setCode] = useState("");
  const [isUsed, setIsUsed] = useState(false);
  const [carriers, setCarriers] = useState<ICarrier[]>([]);
  const { showNotification } = useNotification();

  useEffect(() => {
    if (open && cawbCode) {
      setCarrierId(typeof cawbCode?.carrierId === "object" ? cawbCode?.carrierId?._id || "" : cawbCode?.carrierId || "");
      setCode(cawbCode?.code || "");
      setIsUsed(!!cawbCode?.isUsed);
      fetchCarriers();
    }
  }, [open, cawbCode]);

  const fetchCarriers = async () => {
    try {
      const res = await getCarriersApi();
      setCarriers(res?.data?.data?.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdate = async () => {
    if (!code || !carrierId || !cawbCode?._id) return;

    try {
      const res = await updateCAWBCodeApi(cawbCode._id, {
        code,
        carrierId,
        isUsed,
      });
      showNotification(res?.data?.message || "Cập nhật thành công", "success");
      onUpdated();
    } catch (err: any) {
      showNotification(err.message || "Lỗi cập nhật", "error");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Cập nhật mã CAWBCode</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <Select fullWidth value={carrierId} onChange={(e) => setCarrierId(e.target.value)}>
            {carriers.map((carrier) => (
              <MenuItem key={carrier._id} value={carrier._id}>
                {carrier.name}
              </MenuItem>
            ))}
          </Select>

          <TextField fullWidth label="Mã Code" value={code} onChange={(e) => setCode(e.target.value)} />

          <FormControlLabel control={<Checkbox checked={isUsed} onChange={(e) => setIsUsed(e.target.checked)} />} label="Đã dùng" />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Huỷ</Button>
        <Button onClick={handleUpdate} variant="contained">
          Cập nhật
        </Button>
      </DialogActions>
    </Dialog>
  );
}
