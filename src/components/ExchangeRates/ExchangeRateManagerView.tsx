"use client";

import { Box, Button, Chip, CircularProgress, MenuItem, Select, Stack, TextField } from "@mui/material";
import { Add, Download } from "@mui/icons-material";
import { useEffect, useMemo, useState } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import debounce from "lodash/debounce";
import * as XLSX from "sheetjs-style";

import { IExchangeRate } from "@/types/typeExchangeRate";
import { useNotification } from "@/contexts/NotificationProvider";
import { searchExchangeRatesApi, deleteExchangeRateApi, lockExchangeRateApi, unlockExchangeRateApi } from "@/utils/apis/apiExchangeRate";
import { ECURRENCY, ERECORD_STATUS } from "@/types/typeGlobals";
import CreateExchangeRateDialog from "./CreateExchangeRateDialog";
import UpdateExchangeRateDialog from "./UpdateExchangeRateDialog";
import { green, orange } from "@mui/material/colors";
import { ActionMenu } from "../Globals/ActionMenu";
import { EnumChip } from "../Globals/EnumChip";
import { formatCurrency } from "@/utils/hooks/hookCurrency";

export default function ExchangeRateManagerView() {
  const [rates, setRates] = useState<IExchangeRate[]>([]);
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | "all" | ERECORD_STATUS>("");
  const [currencyFilter, setCurrencyFilter] = useState<ECURRENCY | "">("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
  const [selected, setSelected] = useState<IExchangeRate | null>(null);

  const { showNotification } = useNotification();

  const debouncedSearch = useMemo(() => debounce((v) => setKeyword(v), 500), []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await searchExchangeRatesApi({
        keyword,
        page: page + 1,
        perPage: pageSize,
        status: statusFilter,
        currencyFrom: currencyFilter,
      });
      setRates(res?.data?.data?.data || []);
      setTotal(res?.data?.data?.meta?.total || 0);
    } catch (err: any) {
      console.log(err.message);
      showNotification("Không thể tải danh sách tỉ giá", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [keyword, page, pageSize, statusFilter, currencyFilter]);

  const handleLockToggle = async (rate: IExchangeRate) => {
    try {
      if (!rate?._id) return;
      const confirm = window.confirm(rate.status === ERECORD_STATUS.Active ? "Khoá tỉ giá này?" : "Mở khoá tỉ giá này?");
      if (!confirm) return;

      const res = rate.status === ERECORD_STATUS.Active ? await lockExchangeRateApi(rate._id) : await unlockExchangeRateApi(rate._id);
      showNotification(res?.data?.message || "Cập nhật trạng thái thành công", "success");
      fetchData();
    } catch (err: any) {
      showNotification(err.message || "Lỗi cập nhật trạng thái", "error");
    }
  };

  const handleDelete = async (item: IExchangeRate) => {
    if (!item._id) return;
    if (!window.confirm("Bạn có chắc muốn xoá tỉ giá này?")) return;
    try {
      await deleteExchangeRateApi(item._id);
      showNotification("Đã xoá thành công", "success");
      fetchData();
    } catch (err: any) {
      showNotification(err.message || "Lỗi khi xoá", "error");
    }
  };

  const handleExportExcel = () => {
    const data = rates.map((r) => ({
      "TỪ TIỀN TỆ": r.currencyFrom,
      "SANG TIỀN TỆ": r.currencyTo,
      "TỶ GIÁ": formatCurrency(r.rate, r.currencyTo),
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
    XLSX.utils.book_append_sheet(wb, ws, "EXCHANGE_RATES");
    XLSX.writeFile(wb, "TI_GIA_TIEN_TE.xlsx");
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
      field: "currencyFrom",
      headerName: "TỪ TIỀN TỆ",
      align: "center",
      headerAlign: "center",
      flex: 1,
      renderCell: ({ value }) => (
        <Chip
          label={value}
          size="small"
          sx={{
            backgroundColor: green[300],
            color: "#fff",
            fontWeight: 500,
          }}
        />
      ),
    },
    {
      field: "currencyTo",
      headerName: "SANG TIỀN TỆ",
      align: "center",
      headerAlign: "center",
      flex: 1,
      renderCell: ({ value }) => (
        <Chip
          label={value}
          size="small"
          sx={{
            backgroundColor: orange[300],
            color: "#fff",
            fontWeight: 500,
          }}
        />
      ),
    },
    {
      field: "rate",
      headerName: "TỶ GIÁ",
      align: "center",
      headerAlign: "center",
      flex: 1,
      renderCell: ({ row, value }) => (
        <Chip
          label={formatCurrency(value, row.currencyTo)}
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
      field: "status",
      headerName: "TRẠNG THÁI",
      align: "center",
      headerAlign: "center",
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
        <TextField placeholder="Tìm theo mã tiền tệ..." size="small" onChange={(e) => debouncedSearch(e.target.value)} className="max-w-[250px] w-full" />
        <Select size="small" displayEmpty value={currencyFilter} onChange={(e) => setCurrencyFilter(e.target.value as ECURRENCY)} sx={{ minWidth: 150 }}>
          <MenuItem value="">Tất cả</MenuItem>
          {Object.keys(ECURRENCY).map((key) => (
            <MenuItem key={key} value={key}>
              {key}
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
        />
      )}

      <CreateExchangeRateDialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} onCreated={handleCreated} />
      <UpdateExchangeRateDialog open={openUpdateDialog} onClose={() => setOpenUpdateDialog(false)} onUpdated={handleUpdated} exchangeRate={selected} />
    </Box>
  );
}
