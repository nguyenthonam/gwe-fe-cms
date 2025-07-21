"use client";

import { Box, Button, Chip, CircularProgress, MenuItem, Select, Stack, TextField, Typography } from "@mui/material";
import { Add, Download } from "@mui/icons-material";
import { useEffect, useMemo, useState } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import debounce from "lodash/debounce";
import * as XLSX from "sheetjs-style";
import { IExtraFee } from "@/types/typeExtraFee";
import { ICarrier } from "@/types/typeCarrier";
import { ERECORD_STATUS, ECURRENCY } from "@/types/typeGlobals";
import { useNotification } from "@/contexts/NotificationProvider";
import { searchExtraFeesApi, deleteExtraFeeApi, lockExtraFeeApi, unlockExtraFeeApi } from "@/utils/apis/apiExtraFee";
import { EnumChip } from "../Globals/EnumChip";
import { ActionMenu } from "../Globals/ActionMenu";
import CreateFSCDialog from "./CreateFSCDialog";
import UpdateFSCDialog from "./UpdateFSCDialog";
import FSCDetailDialog from "./FSCDetailDialog";
import { getCarriersApi } from "@/utils/apis/apiCarrier";
import { orange } from "@mui/material/colors";
import { formatCurrency } from "@/utils/hooks/hookCurrency";

export default function FSCManagerView() {
  const [fees, setFees] = useState<IExtraFee[]>([]);
  const [carriers, setCarriers] = useState<ICarrier[]>([]);
  const [carrierIdFilter, setCarrierIdFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<"" | "all" | ERECORD_STATUS>("");
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // Date filter
  const today = new Date();
  const [filterStartDate, setFilterStartDate] = useState<string>(new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10));
  const [filterEndDate, setFilterEndDate] = useState<string>(new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().slice(0, 10));
  const isDateInvalid = !!filterStartDate && !!filterEndDate && new Date(filterStartDate) > new Date(filterEndDate);

  // Dialog states
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
      console.error("Failed to fetch carriers", err.message);
    }
  };

  const fetchData = async () => {
    if (isDateInvalid) return;
    try {
      setLoading(true);
      const res = await searchExtraFeesApi({
        keyword,
        page: page + 1,
        perPage: pageSize,
        carrierId: carrierIdFilter,
        status: statusFilter,
        startDate: filterStartDate,
        endDate: filterEndDate,
        code: "FSC", // Only get FSC
      });
      setFees(res?.data?.data?.data || []);
      setTotal(res?.data?.data?.meta?.total || 0);
      // eslint-disable-next-line
    } catch (err: any) {
      showNotification("Cannot load FSC fees list", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCarriers();
    fetchData();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [keyword, page, pageSize, carrierIdFilter, statusFilter, filterStartDate, filterEndDate]);

  const handleLockToggle = async (fee: IExtraFee) => {
    try {
      if (!fee?._id) return;
      const confirm = window.confirm(fee.status === ERECORD_STATUS.Active ? "Lock this FSC fee?" : "Unlock this FSC fee?");
      if (!confirm) return;
      const res = fee.status === ERECORD_STATUS.Active ? await lockExtraFeeApi(fee._id) : await unlockExtraFeeApi(fee._id);
      showNotification(res?.data?.message || "Status updated", "success");
      fetchData();
    } catch (err: any) {
      showNotification(err.message || "Error updating status", "error");
    }
  };

  const handleDelete = async (item: IExtraFee) => {
    if (!item._id) return;
    if (!window.confirm("Are you sure you want to delete this FSC fee?")) return;
    try {
      await deleteExtraFeeApi(item._id);
      showNotification("Deleted successfully", "success");
      fetchData();
    } catch (err: any) {
      showNotification(err.message || "Delete failed", "error");
    }
  };

  const handleExportExcel = () => {
    const data = fees.map((f) => ({
      "SUB CARRIER": typeof f.carrierId === "object" ? f.carrierId?.name : f.carrierId,
      SERVICE: typeof f.serviceId === "object" ? f.serviceId?.code : f.serviceId,
      NAME: f.name,
      VALUE: formatCurrency(f.value, ECURRENCY.USD) + "%",
      "START DATE": f.startDate ? new Date(f.startDate).toLocaleDateString() : "",
      "END DATE": f.endDate ? new Date(f.endDate).toLocaleDateString() : "",
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    ws["!cols"] = Object.keys(data[0]).map(() => ({ wch: 20 }));

    // Style
    const range = XLSX.utils.decode_range(ws["!ref"] || "");
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cell = XLSX.utils.encode_cell({ r: R, c: C });
        if (!ws[cell]) continue;
        const isHeader = R === 0;
        (ws[cell] as any).s = {
          font: { bold: isHeader, sz: isHeader ? 12 : 11 },
          alignment: { horizontal: "center", vertical: "center", wrapText: true },
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
    XLSX.utils.book_append_sheet(wb, ws, "FSC_FEES");
    XLSX.writeFile(wb, "FSC_FEES.xlsx");
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

  // Columns
  const columns: GridColDef[] = [
    {
      field: "_id",
      headerName: "#ID",
      align: "center",
      headerAlign: "center",
      flex: 1,
      minWidth: 120,
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
            #{String(row._id).slice(0, 6)}
          </Typography>
        </Box>
      ),
    },
    {
      field: "carrierId",
      headerName: "SUB CARRIER",
      headerAlign: "center",
      align: "center",
      flex: 1,
      minWidth: 130,
      renderCell: ({ row }) => (typeof row.carrierId === "object" ? row.carrierId?.name : row.carrierId),
    },
    {
      field: "serviceId",
      headerName: "SERVICE",
      headerAlign: "center",
      align: "center",
      flex: 1,
      minWidth: 130,
      renderCell: ({ row }) => (typeof row.serviceId === "object" ? row.serviceId?.code : row.serviceId),
    },
    { field: "name", headerName: "NAME", minWidth: 160, headerAlign: "center", align: "center", flex: 1.5 },
    {
      field: "value",
      headerName: "VALUE",
      align: "center",
      headerAlign: "center",
      flex: 1,
      minWidth: 150,
      renderCell: ({ value }) => (
        <Chip
          label={formatCurrency(value, ECURRENCY.USD) + "%"}
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
      field: "startDate",
      headerName: "START DATE",
      align: "center",
      headerAlign: "center",
      flex: 1,
      minWidth: 130,
      renderCell: ({ value }) => (value ? new Date(value).toLocaleDateString() : ""),
    },
    {
      field: "endDate",
      headerName: "END DATE",
      align: "center",
      headerAlign: "center",
      flex: 1,
      minWidth: 130,
      renderCell: ({ value }) => (value ? new Date(value).toLocaleDateString() : ""),
    },
    {
      field: "status",
      headerName: "STATUS",
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
            placeholder="Search FSC fee..."
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
          <Select size="small" displayEmpty value={carrierIdFilter} onChange={(e) => setCarrierIdFilter(e.target.value)} sx={{ minWidth: 180 }}>
            <MenuItem value="">All sub carriers</MenuItem>
            {carriers?.map((c) => (
              <MenuItem key={c._id} value={c._id}>
                {c.name}
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

      {/* Error date */}
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
          rows={fees.map((r) => ({ ...r, id: r._id }))}
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

      <CreateFSCDialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} onCreated={handleCreated} />
      <UpdateFSCDialog open={openUpdateDialog} onClose={() => setOpenUpdateDialog(false)} onUpdated={handleUpdated} extraFee={selected} />
      <FSCDetailDialog open={openDetailDialog} onClose={() => setOpenDetailDialog(false)} extraFee={selected} />
    </Box>
  );
}
