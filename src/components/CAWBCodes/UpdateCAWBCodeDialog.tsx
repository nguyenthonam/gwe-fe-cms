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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      showNotification(res?.data?.message || "Updated successfully!", "success");
      onUpdated();
    } catch (err: any) {
      showNotification(err.message || "Failed to update", "error");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Update CAWB Code</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <Select fullWidth value={carrierId} onChange={(e) => setCarrierId(e.target.value)} displayEmpty>
            <MenuItem value="" disabled>
              Select Sub Carrier
            </MenuItem>
            {carriers.map((carrier) => (
              <MenuItem key={carrier._id} value={carrier._id}>
                {carrier.name}
              </MenuItem>
            ))}
          </Select>

          <TextField fullWidth label="Code" value={code} onChange={(e) => setCode(e.target.value)} />

          <FormControlLabel control={<Checkbox checked={isUsed} onChange={(e) => setIsUsed(e.target.checked)} />} label="Used" />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleUpdate} variant="contained">
          Update
        </Button>
      </DialogActions>
    </Dialog>
  );
}
