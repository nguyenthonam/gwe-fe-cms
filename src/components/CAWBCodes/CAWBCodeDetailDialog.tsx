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
      <DialogTitle>CAWB Code Detail</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <Typography variant="body2">
            <strong>CAWB Code:</strong> {cawbCode.code}
          </Typography>
          <Typography variant="body2">
            <strong>Sub Carrier:</strong> {carrierName}
          </Typography>
          <Typography variant="body2">
            <strong>Used:</strong> {cawbCode.isUsed ? <CheckedIcon fontSize="small" sx={{ color: "#2E7D32" }} /> : <NoCheckIcon fontSize="small" sx={{ color: "#616161" }} />}
          </Typography>
          <Typography variant="body2">
            <strong>Status:</strong> <EnumChip type="recordStatus" value={cawbCode.status} />
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
