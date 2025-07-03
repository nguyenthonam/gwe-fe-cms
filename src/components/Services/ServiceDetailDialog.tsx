import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, Typography } from "@mui/material";
import { IService } from "@/types/typeService";
import { EnumChip } from "../Globals/EnumChip";

interface Props {
  open: boolean;
  onClose: () => void;
  service: IService | null;
}

export default function ServiceDetailDialog({ open, onClose, service }: Props) {
  if (!service) return null;

  const companyName = typeof service.companyId === "object" ? service.companyId?.name : String(service.companyId);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Chi tiết dịch vụ</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <Typography variant="body2">
            <strong>Mã:</strong> {service.code}
          </Typography>
          <Typography variant="body2">
            <strong>Tên:</strong> {service.name}
          </Typography>
          <Typography variant="body2">
            <strong>Hãng bay:</strong> {companyName}
          </Typography>
          {service.description && (
            <Typography variant="body2">
              <strong>Mô tả:</strong> {service.description}
            </Typography>
          )}
          <Typography variant="body2">
            <strong>Trạng thái:</strong> <EnumChip type="recordStatus" value={service.status} />
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
      </DialogActions>
    </Dialog>
  );
}
