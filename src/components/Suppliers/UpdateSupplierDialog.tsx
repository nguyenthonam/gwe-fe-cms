import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, TextField, Select, MenuItem } from "@mui/material";
import { useEffect, useState } from "react";
import { useNotification } from "@/contexts/NotificationProvider";
import { getCompanySuppliersApi, updateSupplierApi } from "@/utils/apis/apiSupplier";
import { ISupplier } from "@/types/typeSupplier";
import { ICompany } from "@/types/typeCompany";

interface Props {
  open: boolean;
  onClose: () => void;
  onUpdated: () => void;
  supplier: ISupplier | null;
}

export default function UpdateSupplierDialog({ open, onClose, onUpdated, supplier }: Props) {
  const [companyId, setCompanyId] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [companies, setCompanies] = useState<ICompany[]>([]);
  const { showNotification } = useNotification();

  useEffect(() => {
    if (open && supplier) {
      setCompanyId(typeof supplier.companyId === "object" ? supplier.companyId?._id || "" : supplier.companyId || "");
      setCode(supplier.code);
      setName(supplier.name);
      fetchCompanies();
    }
  }, [open, supplier]);

  const fetchCompanies = async () => {
    try {
      const res = await getCompanySuppliersApi();
      setCompanies(res?.data?.data?.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async () => {
    if (!supplier?._id || !code || !name || !companyId) {
      showNotification("Vui lòng điền đầy đủ thông tin", "warning");
      return;
    }

    try {
      const payload = { companyId, code, name };
      const res = await updateSupplierApi(supplier._id, payload);
      showNotification(res?.data?.message || "Cập nhật thành công", "success");
      onUpdated();
    } catch (err: any) {
      showNotification(err.message || "Lỗi cập nhật", "error");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Cập nhật Supplier</DialogTitle>
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
          Cập nhật
        </Button>
      </DialogActions>
    </Dialog>
  );
}
