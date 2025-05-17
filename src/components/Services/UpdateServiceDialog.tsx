import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, TextField, Select, MenuItem } from "@mui/material";
import { useEffect, useState } from "react";
import { useNotification } from "@/contexts/NotificationProvider";
import { updateServiceApi } from "@/utils/apis/apiService";
import { ICompany } from "@/types/typeCompany";
import { IService } from "@/types/typeService";
import { getCompanyCarriersApi } from "@/utils/apis/apiCarrier";

interface Props {
  open: boolean;
  onClose: () => void;
  onUpdated: () => void;
  service: IService | null;
}

export default function UpdateServiceDialog({ open, onClose, onUpdated, service }: Props) {
  const [companyId, setCompanyId] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [companies, setCompanies] = useState<ICompany[]>([]);

  const { showNotification } = useNotification();

  useEffect(() => {
    if (open && service) {
      setCode(service.code);
      setName(service.name);
      setDescription(service.description || "");
      setCompanyId(typeof service.companyId === "object" ? service.companyId?._id || "" : service.companyId || "");
      fetchCompanies();
    }
  }, [open, service]);

  const fetchCompanies = async () => {
    try {
      const res = await getCompanyCarriersApi();
      setCompanies(res?.data?.data?.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async () => {
    if (!code || !name || !companyId || !service?._id) {
      showNotification("Vui lòng điền đầy đủ thông tin", "warning");
      return;
    }

    try {
      const res = await updateServiceApi(service._id, {
        code,
        name,
        description,
        companyId,
      });
      showNotification(res?.data?.message || "Cập nhật thành công", "success");
      onUpdated();
    } catch (err: any) {
      showNotification(err.message || "Lỗi cập nhật dịch vụ", "error");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Cập nhật dịch vụ</DialogTitle>
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
          Cập nhật
        </Button>
      </DialogActions>
    </Dialog>
  );
}
