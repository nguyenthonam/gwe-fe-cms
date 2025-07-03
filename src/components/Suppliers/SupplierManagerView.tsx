"use client";

import { Box, Button, CircularProgress, MenuItem, Select, Stack, TextField, Typography } from "@mui/material";
import { Add, Download } from "@mui/icons-material";
import { useEffect, useMemo, useState } from "react";
import debounce from "lodash/debounce";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import * as XLSX from "sheetjs-style";

import { ISupplier } from "@/types/typeSupplier";
import { ERECORD_STATUS } from "@/types/typeGlobals";
import { EnumChip } from "../Globals/EnumChip";
import { ActionMenu } from "../Globals/ActionMenu";
import { useNotification } from "@/contexts/NotificationProvider";
import { searchSuppliersApi, deleteSupplierApi, lockSupplierApi, unlockSupplierApi } from "@/utils/apis/apiSupplier";
import { recordStatusLabel } from "@/utils/constants/enumLabel";
import CreateSupplierDialog from "./CreateSupplierDialog";
import UpdateSupplierDialog from "./UpdateSupplierDialog";
import SupplierDetailDialog from "./SupplierDetailDialog";

export default function SupplierManagerView() {
  const [suppliers, setSuppliers] = useState<ISupplier[]>([]);
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | "all" | ERECORD_STATUS>("");

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<ISupplier | null>(null);

  const { showNotification } = useNotification();
  const debouncedSearch = useMemo(() => debounce((v) => setKeyword(v), 500), []);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const res = await searchSuppliersApi({
        keyword,
        page: page + 1,
        perPage: pageSize,
        status: statusFilter,
      });
      setSuppliers(res?.data?.data?.data || []);
      setTotal(res?.data?.data?.meta?.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, [keyword, page, pageSize, statusFilter]);

  const handleLockToggle = async (item: ISupplier) => {
    try {
      if (!item._id) return;
      const confirm = window.confirm(item.status === ERECORD_STATUS.Active ? "Khoá nhà cung ứng này?" : "Mở khoá nhà cung ứng này?");
      if (!confirm) return;

      const res = item.status === ERECORD_STATUS.Active ? await lockSupplierApi(item._id) : await unlockSupplierApi(item._id);

      showNotification(res?.data?.message || "Cập nhật trạng thái thành công", "success");
      fetchSuppliers();
    } catch (err: any) {
      showNotification(err.message || "Lỗi cập nhật trạng thái", "error");
    }
  };

  const handleDelete = async (item: ISupplier) => {
    if (!item._id) return;
    if (!window.confirm("Bạn có chắc muốn xoá nhà cung ứng này?")) return;
    try {
      await deleteSupplierApi(item._id);
      showNotification("Đã xoá thành công", "success");
      fetchSuppliers();
    } catch (err: any) {
      showNotification(err.message || "Lỗi khi xoá", "error");
    }
  };

  const handleExportExcel = () => {
    const data = suppliers.map((s) => ({
      "MÃ NHÀ CUNG ỨNG": s.code,
      TÊN: s.name,
      "CÔNG TY": typeof s.companyId === "object" ? s.companyId?.name || "" : String(s.companyId),
      "TRẠNG THÁI": recordStatusLabel[s.status as keyof typeof recordStatusLabel] || s.status,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    ws["!cols"] = Object.keys(data[0]).map(() => ({ wch: 20 }));

    // Style cho từng cell
    const range = XLSX.utils.decode_range(ws["!ref"] || "");
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cell = XLSX.utils.encode_cell({ r: R, c: C });
        if (!ws[cell]) continue;
        const isHeader = R === 0;

        (ws[cell] as any).s = {
          font: {
            bold: isHeader,
            sz: isHeader ? 12 : 11,
          },
          alignment: {
            horizontal: isHeader ? "center" : "left",
            vertical: "center",
            wrapText: true,
          },
          border: {
            top: { style: "thin", color: { auto: 1 } },
            bottom: { style: "thin", color: { auto: 1 } },
            left: { style: "thin", color: { auto: 1 } },
            right: { style: "thin", color: { auto: 1 } },
          },
        };
      }
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "SUPPLIER");
    XLSX.writeFile(wb, "NHA_CUNG_UNG.xlsx");
  };

  const handleCreated = () => {
    setOpenCreateDialog(false);
    fetchSuppliers();
  };

  const handleUpdated = () => {
    setOpenUpdateDialog(false);
    setSelectedSupplier(null);
    fetchSuppliers();
  };

  const columns: GridColDef[] = [
    {
      field: "code",
      headerName: "MÃ",
      flex: 1.2,
      renderCell: ({ row }: { row: ISupplier }) => (
        <Box display="flex" alignItems="center" height="100%">
          <Typography
            sx={{ cursor: "pointer", textDecoration: "underline" }}
            color="primary"
            onClick={() => {
              setSelectedSupplier(row);
              setOpenDetailDialog(true);
            }}
          >
            {row.code}
          </Typography>
        </Box>
      ),
    },
    { field: "name", headerName: "TÊN NHÀ CUNG ỨNG", flex: 1.5 },
    {
      field: "companyId",
      headerName: "CÔNG TY",
      flex: 1.5,
      renderCell: ({ row }) => (typeof row.companyId === "object" ? row.companyId?.name : row.companyId),
    },
    {
      field: "status",
      headerName: "TRẠNG THÁI",
      flex: 1,
      renderCell: ({ value }) => <EnumChip type="recordStatus" value={value} />,
    },
    {
      field: "actions",
      headerName: "",
      width: 60,
      renderCell: ({ row }) => (
        <ActionMenu
          onEdit={() => {
            setSelectedSupplier(row);
            setOpenUpdateDialog(true);
          }}
          onLockUnlock={() => handleLockToggle(row)}
          onDelete={() => handleDelete(row)}
          status={row.status}
        />
      ),
    },
  ];

  return (
    <Box className="space-y-4">
      <Box mb={2} display="flex" gap={2} alignItems="center" justifyContent="space-between">
        <TextField placeholder="Tìm nhà cung ứng..." size="small" onChange={(e) => debouncedSearch(e.target.value)} className="max-w-[250px] w-full" />
        <Select size="small" displayEmpty value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} sx={{ minWidth: 150 }}>
          <MenuItem value="">Mặc định</MenuItem>
          <MenuItem value="all">Tất cả</MenuItem>
          <MenuItem value={ERECORD_STATUS.Active}>Hoạt động</MenuItem>
          <MenuItem value={ERECORD_STATUS.Locked}>Đã khoá</MenuItem>
          <MenuItem value={ERECORD_STATUS.NoActive}>Không hoạt động</MenuItem>
          <MenuItem value={ERECORD_STATUS.Deleted}>Đã xoá</MenuItem>
        </Select>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<Download />} onClick={handleExportExcel}>
            Xuất Excel
          </Button>
          <Button variant="contained" startIcon={<Add />} onClick={() => setOpenCreateDialog(true)}>
            Tạo mới
          </Button>
        </Stack>
      </Box>

      {loading ? (
        <Box textAlign="center">
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ width: "100%", overflow: "auto" }}>
          <DataGrid
            rows={suppliers.map((s) => ({ ...s, id: s._id }))}
            columns={columns}
            rowCount={total}
            pageSizeOptions={[10, 20, 50, 100]}
            paginationModel={{ page, pageSize }}
            paginationMode="server"
            onPaginationModelChange={({ page, pageSize }) => {
              setPage(page);
              setPageSize(pageSize);
            }}
            disableRowSelectionOnClick
          />
        </Box>
      )}

      <SupplierDetailDialog open={openDetailDialog} onClose={() => setOpenDetailDialog(false)} supplier={selectedSupplier} />
      <CreateSupplierDialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} onCreated={handleCreated} />
      <UpdateSupplierDialog open={openUpdateDialog} onClose={() => setOpenUpdateDialog(false)} onUpdated={handleUpdated} supplier={selectedSupplier} />
    </Box>
  );
}
