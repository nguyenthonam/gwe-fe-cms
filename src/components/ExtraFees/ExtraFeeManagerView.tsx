"use client";

import { Box, Button, Chip, CircularProgress, MenuItem, Select, Stack, TextField, Typography } from "@mui/material";
import { Add, Download } from "@mui/icons-material";
import { useEffect, useMemo, useState } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import debounce from "lodash/debounce";
import * as XLSX from "sheetjs-style";

import { IExtraFee } from "@/types/typeExtraFee";
import { ICarrier } from "@/types/typeCarrier";
import { EFEE_TYPE, ERECORD_STATUS } from "@/types/typeGlobals";
import { useNotification } from "@/contexts/NotificationProvider";
import { searchExtraFeesApi, deleteExtraFeeApi, lockExtraFeeApi, unlockExtraFeeApi } from "@/utils/apis/apiExtraFee";
import { EnumChip } from "../Globals/EnumChip";
import { ActionMenu } from "../Globals/ActionMenu";
import CreateExtraFeeDialog from "./CreateExtraFeeDialog";
import UpdateExtraFeeDialog from "./UpdateExtraFeeDialog";
import ExtraFeeDetailDialog from "./ExtraFeeDetailDialog";
import { getCarriersApi } from "@/utils/apis/apiCarrier";

import { Percent as PercentIcon, Payments as PaymentsIcon } from "@mui/icons-material";
import { green, orange, red } from "@mui/material/colors";
import { feeTypeLabel } from "@/utils/constants/enumLabel";
import { formatCurrency } from "@/utils/hooks/hookCurrency";

export default function ExtraFeeManagerView() {
  const [fees, setFees] = useState<IExtraFee[]>([]);
  const [carriers, setCarriers] = useState<ICarrier[]>([]);
  const [carrierIdFilter, setCarrierIdFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<"" | "all" | ERECORD_STATUS>("");

  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [selected, setSelected] = useState<IExtraFee | null>(null);

  const { showNotification } = useNotification();
  const debouncedSearch = useMemo(() => debounce((v) => setKeyword(v), 500), []);

  const fetchCarriers = async () => {
    try {
      const res = await getCarriersApi();
      setCarriers(res?.data?.data?.data || []);
    } catch (err: any) {
      console.error("Failed to fetch carriers", err.massage);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await searchExtraFeesApi({
        keyword,
        page: page + 1,
        perPage: pageSize,
        carrierId: carrierIdFilter,
        status: statusFilter,
      });
      setFees(res?.data?.data?.data || []);
      setTotal(res?.data?.data?.meta?.total || 0);
    } catch (err: any) {
      console.log(err);
      showNotification("Không thể tải danh sách phụ phí", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCarriers();
    fetchData();
  }, []);

  useEffect(() => {
    fetchData();
  }, [keyword, page, pageSize, carrierIdFilter, statusFilter]);

  const handleLockToggle = async (rate: IExtraFee) => {
    try {
      if (!rate?._id) return;
      const confirm = window.confirm(rate.status === ERECORD_STATUS.Active ? "Khoá phụ phí này?" : "Mở khoá phụ phí này?");
      if (!confirm) return;

      const res = rate.status === ERECORD_STATUS.Active ? await lockExtraFeeApi(rate._id) : await unlockExtraFeeApi(rate._id);
      showNotification(res?.data?.message || "Cập nhật trạng thái thành công", "success");
      fetchData();
    } catch (err: any) {
      showNotification(err.message || "Lỗi cập nhật trạng thái", "error");
    }
  };

  const handleDelete = async (item: IExtraFee) => {
    if (!item._id) return;
    if (!window.confirm("Bạn có chắc muốn xoá phụ phí này?")) return;
    try {
      await deleteExtraFeeApi(item._id);
      showNotification("Đã xoá thành công", "success");
      fetchData();
    } catch (err: any) {
      showNotification(err.message || "Lỗi khi xoá", "error");
    }
  };

  const handleExportExcel = () => {
    const data = fees.map((f) => ({
      MÃ: f.code,
      TÊN: f.name,
      HÃNG: typeof f.carrierId === "object" ? f.carrierId?.name : f.carrierId,
      "DỊCH VỤ": typeof f.serviceId === "object" ? f.serviceId?.code : f.serviceId,
      "GIÁ TRỊ": formatCurrency(f.value, f.currency),
      "KIỂU PHÍ": feeTypeLabel[f.type],
      "TIỀN TỆ": f.currency,
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
    XLSX.utils.book_append_sheet(wb, ws, "EXTRA_FEES");
    XLSX.writeFile(wb, "PHU_PHI.xlsx");
  };

  const handleCreated = () => {
    setOpenCreateDialog(false);
    fetchData();
  };

  const handleUpdated = () => {
    setOpenUpdateDialog(false);
    setSelected(null);
    fetchData();
  };

  const columns: GridColDef[] = [
    {
      field: "code",
      headerName: "MÃ",
      align: "center",
      headerAlign: "center",
      flex: 1,
      minWidth: 100,
      renderCell: ({ row }) => (
        <Box display="flex" alignItems="center" justifyContent="center" height="100%">
          <Typography
            sx={{ cursor: "pointer", textDecoration: "underline" }}
            color="primary"
            onClick={() => {
              setSelected(row);
              setOpenDetailDialog(true);
            }}
          >
            {row.code}
          </Typography>
        </Box>
      ),
    },
    { field: "name", headerName: "TÊN", minWidth: 160, headerAlign: "center", flex: 1.5 },
    {
      field: "carrierId",
      headerName: "HÃNG",
      headerAlign: "center",
      flex: 1,
      minWidth: 130,
      renderCell: ({ row }) => (typeof row.carrierId === "object" ? row.carrierId?.name : row.carrierId),
    },
    {
      field: "serviceId",
      headerName: "DỊCH VỤ",
      headerAlign: "center",
      flex: 1,
      minWidth: 130,
      renderCell: ({ row }) => (typeof row.serviceId === "object" ? row.serviceId?.code : row.serviceId),
    },
    {
      field: "value",
      headerName: "GIÁ TRỊ",
      align: "center",
      headerAlign: "center",
      flex: 1,
      minWidth: 150,
      renderCell: ({ row, value }) => (
        <Chip
          label={formatCurrency(value, row.currency)}
          size="small"
          sx={{
            width: "100%",
            fontSize: "14px",
            padding: "4px 8px",
            backgroundColor: orange[100],
            color: orange[700],
            "& .MuiChip-label": {
              fontWeight: "bold",
            },
          }}
        />
      ),
    },
    {
      field: "type",
      headerName: "KIỂU PHÍ",
      width: 100,
      align: "center",
      headerAlign: "center",
      renderCell: ({ value }) => (value === EFEE_TYPE.PERCENT ? <PercentIcon sx={{ color: red[500] }} /> : <PaymentsIcon sx={{ color: orange[500] }} />),
    },
    {
      field: "currency",
      headerName: "TIỀN TỆ",
      align: "center",
      headerAlign: "center",
      width: 100,
      renderCell: ({ value }) => (
        <Chip
          label={value}
          size="small"
          sx={{
            backgroundColor: green[700],
            color: "#fff",
            fontWeight: 500,
          }}
        />
      ),
    },
    {
      field: "status",
      headerName: "TRẠNG THÁI",
      align: "center",
      headerAlign: "center",
      width: 120,
      renderCell: ({ value }) => <EnumChip type="recordStatus" value={value} />,
    },
    {
      field: "actions",
      headerName: "",
      align: "center",
      headerAlign: "center",
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

  return (
    <Box className="space-y-4 p-6">
      <Box display="flex" gap={2} justifyContent="space-between" alignItems="center">
        <TextField placeholder="Tìm phụ phí..." size="small" onChange={(e) => debouncedSearch(e.target.value)} className="max-w-[250px] w-full" />
        <Stack direction="row" spacing={1}>
          <Select size="small" displayEmpty value={carrierIdFilter} onChange={(e) => setCarrierIdFilter(e.target.value)} sx={{ minWidth: 180 }}>
            <MenuItem value="">Tất cả Hãng Vận Chuyển</MenuItem>
            {carriers?.map((c) => (
              <MenuItem key={c._id} value={c._id}>
                {c.name}
              </MenuItem>
            ))}
          </Select>
          <Select size="small" displayEmpty value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} sx={{ minWidth: 150 }}>
            <MenuItem value="">Mặc định</MenuItem>
            <MenuItem value="all">Tất cả</MenuItem>
            <MenuItem value={ERECORD_STATUS.Active}>Hoạt động</MenuItem>
            <MenuItem value={ERECORD_STATUS.Locked}>Đã khoá</MenuItem>
            <MenuItem value={ERECORD_STATUS.NoActive}>Không hoạt động</MenuItem>
            <MenuItem value={ERECORD_STATUS.Deleted}>Đã xoá</MenuItem>
          </Select>
        </Stack>
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
        <DataGrid
          autoHeight
          rows={fees.map((r) => ({ ...r, id: r._id }))}
          columns={columns}
          paginationMode="server"
          rowCount={total}
          paginationModel={{ page, pageSize }}
          onPaginationModelChange={({ page, pageSize }) => {
            setPage(page);
            setPageSize(pageSize);
          }}
          disableRowSelectionOnClick
        />
      )}

      <CreateExtraFeeDialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} onCreated={handleCreated} />
      <UpdateExtraFeeDialog open={openUpdateDialog} onClose={() => setOpenUpdateDialog(false)} onUpdated={handleUpdated} extraFee={selected} />
      <ExtraFeeDetailDialog open={openDetailDialog} onClose={() => setOpenDetailDialog(false)} extraFee={selected} />
    </Box>
  );
}
