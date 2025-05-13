import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Grid, MenuItem } from "@mui/material";
import { ECOMPANY_TYPE } from "@/types/typeCompany";

interface PartnerFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: any;
}

export default function PartnerFormDialog({ open, onClose, onSubmit, initialData }: PartnerFormDialogProps) {
  const [formData, setFormData] = React.useState({
    code: "",
    name: "",
    taxCode: "",
    address: "",
    type: ECOMPANY_TYPE.Customer,
  });

  React.useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{initialData ? "Cập nhật Công ty" : "Tạo Công ty mới"}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid size={{xs: 12, md: 6}}>
            <TextField label="Mã công ty" name="code" value={formData.code} onChange={handleChange} fullWidth size="small" />
          </Grid>
          <Grid size={{xs: 12, md: 6}}>
            <TextField label="Tên công ty" name="name" value={formData.name} onChange={handleChange} fullWidth size="small" />
          </Grid>
          <Grid size={{xs: 12, md: 6}}>
            <TextField label="Mã số thuế" name="taxCode" value={formData.taxCode} onChange={handleChange} fullWidth size="small" />
          </Grid>
          <Grid size={{xs: 12, md: 6}}>
            <TextField label="Địa chỉ" name="address" value={formData.address} onChange={handleChange} fullWidth size="small" />
          </Grid>
          <Grid size={12}>
            <TextField label="Loại công ty" name="type" value={formData.type} onChange={handleChange} select fullWidth size="small">
              {Object.entries(ECOMPANY_TYPE).map(([key, label]) => (
                <MenuItem key={key} value={key}>
                  {label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button onClick={handleSubmit} variant="contained">
          {initialData ? "Cập nhật" : "Tạo mới"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
