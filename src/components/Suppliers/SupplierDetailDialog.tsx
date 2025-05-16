import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, Typography } from "@mui/material";
import { ISupplier } from "@/types/typeSupplier";
import { EnumChip } from "../Globals/EnumChip";

interface Props {
  open: boolean;
  onClose: () => void;
  supplier: ISupplier | null;
}

export default function SupplierDetailDialog({ open, onClose, supplier }: Props) {
  if (!supplier) return null;

  const companyName = typeof supplier.companyId === "object" ? supplier.companyId?.name : String(supplier.companyId);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Chi tiết Supplier</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <Typography variant="body2">
            <strong>Mã:</strong> {supplier.code}
          </Typography>
          <Typography variant="body2">
            <strong>Tên:</strong> {supplier.name}
          </Typography>
          <Typography variant="body2">
            <strong>Công ty:</strong> {companyName}
          </Typography>
          <Typography variant="body2">
            <strong>Trạng thái:</strong> <EnumChip type="recordStatus" value={supplier.status} />
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
      </DialogActions>
    </Dialog>
  );
}
