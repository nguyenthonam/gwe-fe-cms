"use client";

import { Box, Button, Chip, CircularProgress, MenuItem, Select, Stack, TextField, Typography } from "@mui/material";
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
import ExchangeRateDetailDialog from "./ExchangeRateDetailDialog";
import { green, orange } from "@mui/material/colors";
import { ActionMenu } from "../Globals/ActionMenu";
import { EnumChip } from "../Globals/EnumChip";
import { formatCurrency } from "@/utils/hooks/hookCurrency";
import { getMonthRange } from "@/utils/hooks/hookDate";

export default function ExchangeRateManagerView() {
  const [rates, setRates] = useState<IExchangeRate[]>([]);
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | "all" | ERECORD_STATUS>("");
  const [currencyFilter, setCurrencyFilter] = useState<ECURRENCY | "">("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // Filter date range, default: current month
  const { start, end } = getMonthRange();
  const [filterStartDate, setFilterStartDate] = useState<string>(start);
  const [filterEndDate, setFilterEndDate] = useState<string>(end);

  // Dialog states
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
  const [selected, setSelected] = useState<IExchangeRate | null>(null);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<IExchangeRate | null>(null);

  const { showNotification } = useNotification();

  const debouncedSearch = useMemo(() => debounce((v) => setKeyword(v), 500), []);

  // Validate date filter
  const isDateInvalid = !!filterStartDate && !!filterEndDate && new Date(filterStartDate) > new Date(filterEndDate);

  // Fetch data with validation
  const fetchData = async () => {
    if (isDateInvalid) return;
    try {
      setLoading(true);
      const res = await searchExchangeRatesApi({
        keyword,
        page: page + 1,
        perPage: pageSize,
        status: statusFilter,
        currencyFrom: currencyFilter,
        startDate: filterStartDate || undefined,
        endDate: filterEndDate || undefined,
      });
      setRates(res?.data?.data?.data || []);
      setTotal(res?.data?.data?.meta?.total || 0);
      // eslint-disable-next-line
    } catch (err: any) {
      showNotification("Unable to load exchange rate list", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [keyword, page, pageSize, statusFilter, currencyFilter, filterStartDate, filterEndDate]);

  const handleLockToggle = async (rate: IExchangeRate) => {
    try {
      if (!rate?._id) return;
      const confirm = window.confirm(rate.status === ERECORD_STATUS.Active ? "Lock this exchange rate?" : "Unlock this exchange rate?");
      if (!confirm) return;

      const res = rate.status === ERECORD_STATUS.Active ? await lockExchangeRateApi(rate._id) : await unlockExchangeRateApi(rate._id);
      showNotification(res?.data?.message || "Status updated", "success");
      fetchData();
    } catch (err: any) {
      showNotification(err.message || "Failed to update status", "error");
    }
  };

  const handleDelete = async (item: IExchangeRate) => {
    if (!item._id) return;
    if (!window.confirm("Are you sure you want to delete this exchange rate?")) return;
    try {
      await deleteExchangeRateApi(item._id);
      showNotification("Deleted successfully", "success");
      fetchData();
    } catch (err: any) {
      showNotification(err.message || "Failed to delete", "error");
    }
  };

  const handleExportExcel = () => {
    const data = rates.map((r) => ({
      ID: r._id,
      FROM: r.currencyFrom,
      TO: r.currencyTo,
      "EXCHANGE RATE": formatCurrency(r.rate, r.currencyTo),
      "START DATE": r.startDate ? new Date(r.startDate).toLocaleDateString() : "",
      "END DATE": r.endDate ? new Date(r.endDate).toLocaleDateString() : "",
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    ws["!cols"] = Object.keys(data[0]).map(() => ({ wch: 20 }));

    // Style for each cell
    const range = XLSX.utils.decode_range(ws["!ref"] || "");
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cell = XLSX.utils.encode_cell({ r: R, c: C });
        if (!ws[cell]) continue;
        const isHeader = R === 0;
        (ws[cell] as any).s = {
          font: { bold: isHeader, sz: isHeader ? 12 : 11 },
          alignment: { horizontal: isHeader ? "center" : "left", vertical: "center", wrapText: true },
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
    XLSX.writeFile(wb, "EXCHANGE_RATES.xlsx");
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
      field: "_id",
      headerName: "ID",
      flex: 1.2,
      renderCell: ({ row }: { row: IExchangeRate }) => (
        <Box display="flex" alignItems="center" height="100%">
          <Typography
            sx={{ cursor: "pointer", textDecoration: "underline" }}
            color="primary"
            onClick={() => {
              setSelectedDetail(row);
              setOpenDetailDialog(true);
            }}
            title={row._id}
          >
            {row._id}
          </Typography>
        </Box>
      ),
    },
    {
      field: "currencyFrom",
      headerName: "FROM",
      align: "center",
      headerAlign: "center",
      flex: 1,
      renderCell: ({ value }) => <Chip label={value} size="small" sx={{ backgroundColor: green[300], color: "#fff", fontWeight: 500 }} />,
    },
    {
      field: "currencyTo",
      headerName: "TO",
      align: "center",
      headerAlign: "center",
      flex: 1,
      renderCell: ({ value }) => <Chip label={value} size="small" sx={{ backgroundColor: orange[300], color: "#fff", fontWeight: 500 }} />,
    },
    {
      field: "startDate",
      headerName: "START DATE",
      align: "center",
      headerAlign: "center",
      flex: 1,
      renderCell: ({ value }) => (value ? new Date(value).toLocaleDateString() : ""),
    },
    {
      field: "endDate",
      headerName: "END DATE",
      align: "center",
      headerAlign: "center",
      flex: 1,
      renderCell: ({ value }) => (value ? new Date(value).toLocaleDateString() : ""),
    },
    {
      field: "rate",
      headerName: "EXCHANGE RATE",
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
            "& .MuiChip-label": { fontWeight: "bold" },
          }}
        />
      ),
    },
    {
      field: "status",
      headerName: "STATUS",
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
      {/* Filter section */}
      <Box
        display="flex"
        gap={2}
        flexWrap="wrap"
        alignItems="center"
        mb={2}
        sx={{
          rowGap: 2,
          columnGap: 2,
          "& > *": { minWidth: 140 },
        }}
      >
        <Stack direction="row" justifyContent="space-between" spacing={1} flexGrow={1}>
          <TextField
            placeholder="Search currency..."
            size="small"
            onChange={(e) => debouncedSearch(e.target.value)}
            className="max-w-[280px] w-full"
            label="Search"
            InputLabelProps={{ shrink: true }}
          />

          <Stack direction="row" spacing={1}>
            <Button variant="outlined" startIcon={<Download />} onClick={handleExportExcel} sx={{ minWidth: 120 }}>
              Export Excel
            </Button>
            <Button variant="contained" startIcon={<Add />} onClick={() => setOpenCreateDialog(true)} sx={{ minWidth: 120 }}>
              Create New
            </Button>
          </Stack>
        </Stack>

        <Stack direction="row" spacing={1}>
          <Select size="small" displayEmpty value={currencyFilter} onChange={(e) => setCurrencyFilter(e.target.value as ECURRENCY)} sx={{ minWidth: 140 }}>
            <MenuItem value="">All currencies</MenuItem>
            {Object.keys(ECURRENCY).map((key) => (
              <MenuItem key={key} value={key}>
                {key}
              </MenuItem>
            ))}
          </Select>
          <Select size="small" displayEmpty value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} sx={{ minWidth: 140 }}>
            <MenuItem value="">Default status</MenuItem>
            <MenuItem value="all">All status</MenuItem>
            <MenuItem value={ERECORD_STATUS.Active}>Active</MenuItem>
            <MenuItem value={ERECORD_STATUS.Locked}>Locked</MenuItem>
            <MenuItem value={ERECORD_STATUS.NoActive}>Inactive</MenuItem>
            <MenuItem value={ERECORD_STATUS.Deleted}>Deleted</MenuItem>
          </Select>
          <Stack direction="row" spacing={1} flexGrow={1} justifyContent="flex-end">
            <TextField
              type="date"
              size="small"
              label="Start date"
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              error={isDateInvalid}
            />
            <TextField type="date" size="small" label="End date" value={filterEndDate} onChange={(e) => setFilterEndDate(e.target.value)} InputLabelProps={{ shrink: true }} error={isDateInvalid} />
          </Stack>
        </Stack>
      </Box>

      {/* Hiển thị lỗi nếu filter ngày sai */}
      {isDateInvalid && (
        <Typography color="error" fontSize={14} sx={{ pl: 1, mb: 1 }}>
          Start date must be less than or equal to end date.
        </Typography>
      )}

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
          pageSizeOptions={[10, 20, 50, 100]}
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
      <ExchangeRateDetailDialog open={openDetailDialog} onClose={() => setOpenDetailDialog(false)} exchangeRate={selectedDetail} />
    </Box>
  );
}
