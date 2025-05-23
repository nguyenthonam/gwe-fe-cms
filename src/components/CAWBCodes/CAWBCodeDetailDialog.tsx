import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, Typography } from "@mui/material";
import { ICAWBCode } from "@/types/typeCAWBCode";
import { EnumChip } from "../Globals/EnumChip";
import { CheckCircle as CheckedIcon, RadioButtonUnchecked as NoCheckIcon } from "@mui/icons-material";

interface Props {
  open: boolean;
  onClose: () => void;
  cawbCode: ICAWBCode | null;
}

export default function CAWBCodeDetailDialog({ open, onClose, cawbCode }: Props) {
  if (!cawbCode) return null;

  const carrierName = typeof cawbCode.carrierId === "object" ? cawbCode.carrierId?.name : String(cawbCode.carrierId);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Chi tiết mã CAWBCode</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <Typography variant="body2">
            <strong>Mã:</strong> {cawbCode.code}
          </Typography>
          <Typography variant="body2">
            <strong>Carrier:</strong> {carrierName}
          </Typography>
          <Typography variant="body2">
            <strong>Đã dùng:</strong> {cawbCode.isUsed ? <CheckedIcon fontSize="small" sx={{ color: "#2E7D32" }} /> : <NoCheckIcon fontSize="small" sx={{ color: "#616161" }} />}
          </Typography>
          <Typography variant="body2">
            <strong>Trạng thái:</strong> <EnumChip type="recordStatus" value={cawbCode.status} />
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
      </DialogActions>
    </Dialog>
  );
}
