import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, TextField, Select, MenuItem } from "@mui/material";
import { useEffect, useState } from "react";
import { useNotification } from "@/contexts/NotificationProvider";
import { createServiceApi } from "@/utils/apis/apiService";
import { ICompany } from "@/types/typeCompany";
import { getCompanyCarriersApi } from "@/utils/apis/apiCarrier";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateServiceDialog({ open, onClose, onCreated }: Props) {
  const [companyId, setCompanyId] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [companies, setCompanies] = useState<ICompany[]>([]);

  const { showNotification } = useNotification();

  useEffect(() => {
    if (open) {
      fetchCompanies();
      setCode("");
      setName("");
      setDescription("");
      setCompanyId("");
    }
  }, [open]);

  const fetchCompanies = async () => {
    try {
      const res = await getCompanyCarriersApi();
      setCompanies(res?.data?.data?.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async () => {
    if (!code || !name || !companyId) {
      showNotification("Vui lòng điền đầy đủ Mã, Tên và Hãng bay", "warning");
      return;
    }

    try {
      const res = await createServiceApi({ code, name, description, companyId });
      showNotification(res?.data?.message || "Tạo dịch vụ thành công", "success");
      onCreated();
    } catch (err: any) {
      showNotification(err.message || "Lỗi tạo dịch vụ", "error");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Tạo dịch vụ mới</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <Select value={companyId} onChange={(e) => setCompanyId(e.target.value)} displayEmpty fullWidth>
            <MenuItem value="">Chọn hãng bay</MenuItem>
            {companies.map((c) => (
              <MenuItem key={c._id} value={c._id}>
                {c.name}
              </MenuItem>
            ))}
          </Select>

          <TextField label="Mã dịch vụ" fullWidth value={code} onChange={(e) => setCode(e.target.value)} />

          <TextField label="Tên dịch vụ" fullWidth value={name} onChange={(e) => setName(e.target.value)} />

          <TextField label="Mô tả" fullWidth value={description} onChange={(e) => setDescription(e.target.value)} multiline minRows={3} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Huỷ</Button>
        <Button variant="contained" onClick={handleSubmit}>
          Tạo mới
        </Button>
      </DialogActions>
    </Dialog>
  );
}
