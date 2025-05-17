import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, TextField, Select, MenuItem } from "@mui/material";
import { useEffect, useState } from "react";
import { useNotification } from "@/contexts/NotificationProvider";
import { getCompanySuppliersApi, createSupplierApi } from "@/utils/apis/apiSupplier";
import { ICompany } from "@/types/typeCompany";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateSupplierDialog({ open, onClose, onCreated }: Props) {
  const [companyId, setCompanyId] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [companies, setCompanies] = useState<ICompany[]>([]);

  const { showNotification } = useNotification();

  useEffect(() => {
    if (open) {
      // Lấy danh sách CompanySupplier từ API (chỉ các Company có type = Supplier)
      fetchCompanies();
      setCompanyId("");
      setCode("");
      setName("");
    }
  }, [open]);

  const fetchCompanies = async () => {
    try {
      const res = await getCompanySuppliersApi();
      setCompanies(res?.data?.data?.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async () => {
    if (!code || !name || !companyId) {
      showNotification("Vui lòng điền đầy đủ thông tin", "warning");
      return;
    }

    try {
      const payload = { companyId, code, name };
      const res = await createSupplierApi(payload);
      showNotification(res?.data?.message || "Tạo supplier thành công", "success");
      onCreated();
    } catch (err: any) {
      showNotification(err.message || "Lỗi tạo supplier", "error");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Tạo mới Supplier</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <Select value={companyId} onChange={(e) => setCompanyId(e.target.value)} displayEmpty fullWidth>
            <MenuItem value="">Chọn Company Supplier</MenuItem>
            {companies.map((company) => (
              <MenuItem key={company._id} value={company._id}>
                {company.name}
              </MenuItem>
            ))}
          </Select>
          <TextField label="Mã Supplier" fullWidth value={code} onChange={(e) => setCode(e.target.value)} />
          <TextField label="Tên Supplier" fullWidth value={name} onChange={(e) => setName(e.target.value)} />
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
