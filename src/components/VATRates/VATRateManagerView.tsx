"use client";

import { useState, useEffect, useMemo } from "react";
import { Box, Button, Stack, TextField, Select, MenuItem, CircularProgress, Typography } from "@mui/material";
import { Add, Download } from "@mui/icons-material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import * as XLSX from "sheetjs-style";
import debounce from "lodash/debounce";
import { IVATRate } from "@/types/typeVATRate";
import { ERECORD_STATUS } from "@/types/typeGlobals";
import { useNotification } from "@/contexts/NotificationProvider";
import { EnumChip } from "@/components/Globals/EnumChip";
import { ActionMenu } from "@/components/Globals/ActionMenu";
import { getCarriersApi } from "@/utils/apis/apiCarrier";
import { getSuppliersApi } from "@/utils/apis/apiSupplier";
import { getServicesApi, getServicesByCarrierApi } from "@/utils/apis/apiService";
import { searchVATRatesApi, deleteVATRateApi, lockVATRateApi, unlockVATRateApi } from "@/utils/apis/apiVATRate";
import CreateVATRateDialog from "./CreateVATRateDialog";
import UpdateVATRateDialog from "./UpdateVATRateDialog";
import VATRateDetailDialog from "./VATRateDetailDialog";

export default function VATRateManagerView() {
  const [rates, setRates] = useState<IVATRate[]>([]);
  const [keyword, setKeyword] = useState("");
  const [carrierIdFilter, setCarrierIdFilter] = useState("");
  const [serviceIdFilter, setServiceIdFilter] = useState("");
  const [supplierIdFilter, setSupplierIdFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | "all" | ERECORD_STATUS>("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [carriers, setCarriers] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);

  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [selected, setSelected] = useState<IVATRate | null>(null);

  const { showNotification } = useNotification();
  const debouncedSearch = useMemo(() => debounce((v) => setKeyword(v), 500), []);

  // Fetch Carriers, Suppliers on mount
  useEffect(() => {
    getCarriersApi().then((res) => setCarriers(res?.data?.data?.data || []));
    getSuppliersApi().then((res) => setSuppliers(res?.data?.data?.data || []));
  }, []);

  // Fetch Services when carrierIdFilter thay đổi
  useEffect(() => {
    if (carrierIdFilter) {
      const selectedCarrier = carriers.find((c) => c._id === carrierIdFilter);
      const companyId = typeof selectedCarrier?.companyId === "object" ? selectedCarrier?.companyId?._id : selectedCarrier?.companyId;
      if (companyId) {
        getServicesByCarrierApi(companyId).then((res) => setServices(res?.data?.data?.data || []));
      }
    } else {
      getServicesApi().then((res) => setServices(res?.data?.data?.data || []));
    }
    setServiceIdFilter(""); // reset service khi đổi carrier
  }, [carrierIdFilter, carriers]);

  // Fetch VAT Rate list
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await searchVATRatesApi({
        keyword,
        page: page + 1,
        perPage: pageSize,
        carrierId: carrierIdFilter,
        serviceId: serviceIdFilter,
        supplierId: supplierIdFilter,
        status: statusFilter,
      });
      setRates(res?.data?.data?.data || []);
      setTotal(res?.data?.data?.meta?.total || 0);
    } catch {
      showNotification("Không thể tải danh sách VAT Rate", "error");
    } finally {
      setLoading(false);
    }
  };

  // Reload data/filter
  useEffect(() => {
    fetchData();
  }, [keyword, page, pageSize, carrierIdFilter, serviceIdFilter, supplierIdFilter, statusFilter]);

  // Excel export
  const handleExportExcel = () => {
    const data = rates.map((v) => ({
      CARRIER: typeof v.carrierId === "object" ? v.carrierId?.name : v.carrierId,
      SERVICE: typeof v.serviceId === "object" ? v.serviceId?.code : v.serviceId,
      SUPPLIER: typeof v.supplierId === "object" ? v.supplierId?.name : v.supplierId,
      "VAT RATE (%)": v.value,
      STATUS: v.status,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    ws["!cols"] = Object.keys(data[0]).map(() => ({ wch: 20 }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "VAT_RATES");
    XLSX.writeFile(wb, "DanhSachThueVAT.xlsx");
  };

  // Table columns
  const columns: GridColDef[] = [
    {
      field: "_id",
      headerName: "ID",
      minWidth: 120,
      flex: 1,
      renderCell: ({ row }) => (
        <Box display="flex" alignItems="center" height="100%">
          <Typography
            color="primary"
            sx={{ cursor: "pointer", textDecoration: "underline" }}
            onClick={() => {
              setSelected(row);
              setOpenDetailDialog(true);
            }}
          >
            #{row._id?.slice(-10)}
          </Typography>
        </Box>
      ),
    },
    {
      field: "carrierId",
      headerName: "HÃNG",
      minWidth: 140,
      flex: 1,
      renderCell: ({ row }) => (typeof row.carrierId === "object" ? row.carrierId?.name : row.carrierId),
    },
    {
      field: "serviceId",
      headerName: "DỊCH VỤ",
      minWidth: 120,
      flex: 1,
      renderCell: ({ row }) => (typeof row.serviceId === "object" ? row.serviceId?.code : row.serviceId),
    },
    {
      field: "supplierId",
      headerName: "SUPPLIER",
      minWidth: 140,
      flex: 1,
      renderCell: ({ row }) => (typeof row.supplierId === "object" ? row.supplierId?.name : row.supplierId),
    },
    {
      field: "value",
      headerName: "VAT (%)",
      minWidth: 100,
      flex: 0.7,
      align: "center",
      renderCell: ({ value }) => `${value}%`,
    },
    {
      field: "status",
      headerName: "TRẠNG THÁI",
      minWidth: 110,
      flex: 0.8,
      renderCell: ({ value }) => <EnumChip type="recordStatus" value={value} />,
    },
    {
      field: "actions",
      headerName: "",
      width: 60,
      renderCell: ({ row }) => (
        <ActionMenu
          onEdit={() => {
            setSelected(row);
            setOpenUpdateDialog(true);
          }}
          onLockUnlock={() => handleLockToggle(row)}
          onDelete={() => handleDelete(row)}
          status={row.status}
        />
      ),
    },
  ];

  // Lock/Unlock/Delete logic
  const handleLockToggle = async (item: IVATRate) => {
    try {
      if (!item._id) return;
      const confirm = window.confirm(item.status === ERECORD_STATUS.Active ? "Khoá thuế này?" : "Mở khoá thuế này?");
      if (!confirm) return;
      const res = item.status === ERECORD_STATUS.Active ? await lockVATRateApi(item._id) : await unlockVATRateApi(item._id);
      showNotification(res?.data?.message || "Cập nhật thành công", "success");
      fetchData();
    } catch (err: any) {
      showNotification(err.message || "Lỗi cập nhật trạng thái", "error");
    }
  };

  const handleDelete = async (item: IVATRate) => {
    if (!item._id) return;
    if (!window.confirm("Bạn có chắc muốn xoá thuế này?")) return;
    try {
      await deleteVATRateApi(item._id);
      showNotification("Đã xoá thành công", "success");
      fetchData();
    } catch (err: any) {
      showNotification(err.message || "Lỗi khi xoá", "error");
    }
  };

  return (
    <Box className="space-y-4 p-6">
      <Box display="flex" flexWrap="wrap" gap={1} justifyContent="space-between" alignItems="center">
        <TextField placeholder="Tìm kiếm..." size="small" onChange={(e) => debouncedSearch(e.target.value)} sx={{ minWidth: 250 }} />
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<Download />} onClick={handleExportExcel}>
            Xuất Excel
          </Button>
          <Button variant="contained" startIcon={<Add />} onClick={() => setOpenCreateDialog(true)}>
            Tạo mới
          </Button>
        </Stack>
        <Stack direction="row" spacing={1}>
          <Select size="small" value={carrierIdFilter} onChange={(e) => setCarrierIdFilter(e.target.value)} displayEmpty sx={{ minWidth: 150 }}>
            <MenuItem value="">Tất cả Hãng</MenuItem>
            {carriers.map((c) => (
              <MenuItem key={c._id} value={c._id}>
                {c.name}
              </MenuItem>
            ))}
          </Select>
          <Select size="small" value={serviceIdFilter} onChange={(e) => setServiceIdFilter(e.target.value)} displayEmpty sx={{ minWidth: 140 }}>
            <MenuItem value="">Tất cả Dịch vụ</MenuItem>
            {services.map((s) => (
              <MenuItem key={s._id} value={s._id}>
                {s.code}
              </MenuItem>
            ))}
          </Select>
          <Select size="small" value={supplierIdFilter} onChange={(e) => setSupplierIdFilter(e.target.value)} displayEmpty sx={{ minWidth: 160 }}>
            <MenuItem value="">Tất cả Supplier</MenuItem>
            {suppliers.map((s) => (
              <MenuItem key={s._id} value={s._id}>
                {s.name}
              </MenuItem>
            ))}
          </Select>
          <Select size="small" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} displayEmpty sx={{ minWidth: 120 }}>
            <MenuItem value="">Mặc định</MenuItem>
            <MenuItem value="all">Tất cả</MenuItem>
            <MenuItem value={ERECORD_STATUS.Active}>Hoạt động</MenuItem>
            <MenuItem value={ERECORD_STATUS.Locked}>Đã khoá</MenuItem>
            <MenuItem value={ERECORD_STATUS.NoActive}>Không hoạt động</MenuItem>
            <MenuItem value={ERECORD_STATUS.Deleted}>Đã xoá</MenuItem>
          </Select>
        </Stack>
      </Box>
      {loading ? (
        <Box textAlign="center">
          <CircularProgress />
        </Box>
      ) : (
        <DataGrid
          rows={rates.map((r) => ({ ...r, id: r._id }))}
          columns={columns}
          paginationMode="server"
          rowCount={total}
          paginationModel={{ page, pageSize }}
          onPaginationModelChange={({ page, pageSize }) => {
            setPage(page);
            setPageSize(pageSize);
          }}
          disableRowSelectionOnClick
          autoHeight
        />
      )}
      <CreateVATRateDialog
        open={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
        onCreated={() => {
          fetchData();
          setOpenCreateDialog(false);
        }}
      />
      <UpdateVATRateDialog open={openUpdateDialog} onClose={() => setOpenUpdateDialog(false)} onUpdated={fetchData} vatRate={selected} />
      <VATRateDetailDialog open={openDetailDialog} onClose={() => setOpenDetailDialog(false)} vatRate={selected} carriers={carriers} services={services} suppliers={suppliers} />
    </Box>
  );
}
