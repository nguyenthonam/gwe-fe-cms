"use client";

import { useEffect, useMemo, useState } from "react";
import { Box, Button, TextField, MenuItem, Select, Stack, CircularProgress, Typography, Paper } from "@mui/material";
import { Add, Download } from "@mui/icons-material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import debounce from "lodash/debounce";
import { ICarrier } from "@/types";
import { ECHARGEABLE_WEIGHT_TYPE, ERECORD_STATUS } from "@/types/typeGlobals";
import { EnumChip } from "../Globals/EnumChip";
import { ActionMenu } from "../Globals/ActionMenu";
import { useNotification } from "@/contexts/NotificationProvider";
import { searchCarriersApi, lockCarrierApi, unlockCarrierApi, deleteCarrierApi } from "@/utils/apis/apiCarrier";
import CreateCarrierDialog from "./CreateCarrierDialog";
import UpdateCarrierDialog from "./UpdateCarrierDialog";
import { chargeWeightTypeLabel, recordStatusLabel } from "@/utils/constants/enumLabel";
import * as XLSX from "sheetjs-style";
import CarrierDetailDialog from "./CarrierDetailDialog";

export default function CarrierManagerView() {
  const [carriers, setCarriers] = useState<ICarrier[]>([]);
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | "all" | ERECORD_STATUS>("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [selectedCarrier, setSelectedCarrier] = useState<ICarrier | null>(null);

  const { showNotification } = useNotification();

  const debouncedSearch = useMemo(() => debounce((v) => setKeyword(v), 500), []);

  const fetchCarriers = async () => {
    try {
      setLoading(true);
      const res = await searchCarriersApi({
        keyword,
        page: page + 1,
        perPage: pageSize,
        status: statusFilter,
      });
      setCarriers(res?.data?.data?.data || []);
      setTotal(res?.data?.data?.meta?.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCarriers();
  }, [keyword, page, pageSize, statusFilter]);

  const handleLockToggle = async (carrier: ICarrier) => {
    try {
      if (!carrier?._id) return;
      const confirm = window.confirm(carrier.status === ERECORD_STATUS.Active ? "Khoá nhà vận chuyển này?" : "Mở khoá nhà vận chuyển này?");
      if (!confirm) return;

      const res = carrier.status === ERECORD_STATUS.Active ? await lockCarrierApi(carrier._id) : await unlockCarrierApi(carrier._id);
      showNotification(res?.data?.message || "Cập nhật trạng thái thành công", "success");
      fetchCarriers();
    } catch (err: any) {
      showNotification(err.message || "Lỗi cập nhật trạng thái", "error");
    }
  };

  const handleDelete = async (carrier: ICarrier) => {
    if (!carrier._id) return;
    if (!window.confirm("Bạn có chắc muốn xoá?")) return;
    try {
      await deleteCarrierApi(carrier._id);
      showNotification("Đã xoá thành công", "success");
      fetchCarriers();
    } catch (err: any) {
      showNotification(err.message || "Lỗi khi xoá", "error");
    }
  };

  const handleExportExcel = () => {
    const data = carriers.map((c) => ({
      MÃ: c.code,
      TÊN: c.name,
      "HÃNG BAY": typeof c.companyId === "object" ? c.companyId?.name || "" : String(c.companyId),
      "CÁCH TÍNH CÂN NẶNG": chargeWeightTypeLabel[c.chargeableWeightType],
      "TRẠNG THÁI": recordStatusLabel[c.status as keyof typeof recordStatusLabel] || c.status,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    ws["!cols"] = Object.keys(data[0]).map(() => ({ wch: 20 }));

    const range = XLSX.utils.decode_range(ws["!ref"] || "");
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cell = XLSX.utils.encode_cell({ r: R, c: C });
        if (!ws[cell]) continue;
        const isHeader = R === 0;
        (ws[cell] as any).s = {
          font: { bold: isHeader, sz: isHeader ? 12 : 11 },
          alignment: { horizontal: isHeader ? "center" : "left", vertical: "center" },
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
    XLSX.utils.book_append_sheet(wb, ws, "CARRIER");
    XLSX.writeFile(wb, "NHA_VAN_CHUYEN.xlsx");
  };

  const handleCreated = () => {
    setOpenCreateDialog(false);
    fetchCarriers();
  };

  const handleUpdated = () => {
    setOpenUpdateDialog(false);
    setSelectedCarrier(null);
    fetchCarriers();
  };

  const columns: GridColDef[] = [
    {
      field: "code",
      headerName: "CODE",
      flex: 1.2,
      renderCell: ({ row }: { row: ICarrier }) => (
        <Box display="flex" alignItems="center" height="100%">
          <Typography
            sx={{ cursor: "pointer", textDecoration: "underline" }}
            color="primary"
            onClick={() => {
              setSelectedCarrier(row);
              setOpenDetailDialog(true);
            }}
          >
            {row.code}
          </Typography>
        </Box>
      ),
    },
    { field: "name", headerName: "TÊN", flex: 1.5 },
    {
      field: "companyId",
      headerName: "HÃNG BAY",
      flex: 1,
      renderCell: ({ row }) => (typeof row.companyId === "object" ? row.companyId?.name : row.companyId),
    },
    {
      field: "chargeableWeightType",
      headerName: "CÁCH TÍNH CÂN NẶNG",
      flex: 1.5,
      renderCell: ({ row }) => <EnumChip type="chargeWeightType" value={row.chargeableWeightType} />,
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
            setSelectedCarrier(row);
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
    <Box className="space-y-4 p-6">
      <Box mb={2} display="flex" gap={2} alignItems="center" justifyContent="space-between">
        <TextField placeholder="Tìm nhà vận chuyển..." size="small" onChange={(e) => debouncedSearch(e.target.value)} className="max-w-[250px] w-full" />
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
            rows={carriers.map((c) => ({ ...c, id: c._id }))}
            columns={columns}
            rowCount={total}
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

      <CarrierDetailDialog open={openDetailDialog} onClose={() => setOpenDetailDialog(false)} carrier={selectedCarrier} />
      <CreateCarrierDialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} onCreated={handleCreated} />
      <UpdateCarrierDialog open={openUpdateDialog} onClose={() => setOpenUpdateDialog(false)} onUpdated={handleUpdated} carrier={selectedCarrier} />
    </Box>
  );
}
