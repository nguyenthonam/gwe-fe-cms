"use client";

import { useEffect, useMemo, useState } from "react";
import { Box, Button, CircularProgress, MenuItem, Select, Stack, TextField, Typography } from "@mui/material";
import { Add, Download } from "@mui/icons-material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import debounce from "lodash/debounce";
import * as XLSX from "sheetjs-style";

import { EnumChip } from "../Globals/EnumChip";
import { ActionMenu } from "../Globals/ActionMenu";
import { ICAWBCode } from "@/types/typeCAWBCode";
import { ERECORD_STATUS } from "@/types/typeGlobals";
import { useNotification } from "@/contexts/NotificationProvider";
import { searchCAWBCodesApi, deleteCAWBCodeApi, lockCAWBCodeApi, unlockCAWBCodeApi } from "@/utils/apis/apiCAWBCode";
import { recordStatusLabel } from "@/utils/constants/enumLabel";
import CreateCAWBCodeDialog from "./CreateCAWBCodeDialog";
import UpdateCAWBCodeDialog from "./UpdateCAWBCodeDialog";
import CAWBCodeDetailDialog from "./CAWBCodeDetailDialog";
import { CheckCircle as CheckIcon } from "@mui/icons-material";
import { ICarrier } from "@/types/typeCarrier";
import { getCarriersApi } from "@/utils/apis/apiCarrier";

export default function CAWBCodeManagerView() {
  const [codes, setCodes] = useState<ICAWBCode[]>([]);
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | "all" | ERECORD_STATUS>("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isUsedFilter, setIsUsedFilter] = useState("");
  const [carrierFilter, setCarrierFilter] = useState("");
  const [carriers, setCarriers] = useState<ICarrier[]>([]);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [selectedCode, setSelectedCode] = useState<ICAWBCode | null>(null);

  const { showNotification } = useNotification();
  const debouncedSearch = useMemo(() => debounce((v) => setKeyword(v), 500), []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await searchCAWBCodesApi({
        keyword,
        page: page + 1,
        perPage: pageSize,
        status: statusFilter,
        isUsed: isUsedFilter,
        carrierId: carrierFilter,
      });
      setCodes(res?.data?.data?.data || []);
      setTotal(res?.data?.data?.meta?.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCarriers = async () => {
    try {
      const res = await getCarriersApi();
      setCarriers(res?.data?.data?.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCarriers();
  }, []);

  useEffect(() => {
    fetchData();
  }, [keyword, page, pageSize, statusFilter, isUsedFilter, carrierFilter]);

  const handleLockToggle = async (item: ICAWBCode) => {
    try {
      if (!item._id) return;
      const confirm = window.confirm(item.status === ERECORD_STATUS.Active ? "Lock this code?" : "Unlock this code?");
      if (!confirm) return;

      const res = item.status === ERECORD_STATUS.Active ? await lockCAWBCodeApi(item._id) : await unlockCAWBCodeApi(item._id);
      showNotification(res?.data?.message || "Status updated successfully", "success");
      fetchData();
    } catch (err: any) {
      showNotification(err.message || "Error updating status", "error");
    }
  };

  const handleDelete = async (item: ICAWBCode) => {
    if (!item._id) return;
    if (!window.confirm("Are you sure you want to delete this code?")) return;
    try {
      await deleteCAWBCodeApi(item._id);
      showNotification("Deleted successfully", "success");
      fetchData();
    } catch (err: any) {
      showNotification(err.message || "Error deleting code", "error");
    }
  };

  const handleExportExcel = () => {
    const data = codes.map((c) => ({
      "CAWB CODE": c.code,
      "SUB CARRIER": typeof c.carrierId === "object" ? c.carrierId?.name || "" : String(c.carrierId),
      USED: c.isUsed ? "Yes" : "No",
      STATUS: recordStatusLabel[c.status as keyof typeof recordStatusLabel] || c.status,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    ws["!cols"] = Object.keys(data[0]).map(() => ({ wch: 20 }));

    // Style cells
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
    XLSX.utils.book_append_sheet(wb, ws, "CAWB_CODE");
    XLSX.writeFile(wb, "CAWB_CODE_LIST.xlsx");
  };

  const handleCreated = () => {
    setOpenCreateDialog(false);
    fetchData();
  };

  const handleUpdated = () => {
    setOpenUpdateDialog(false);
    setSelectedCode(null);
    fetchData();
  };

  const columns: GridColDef[] = [
    {
      field: "code",
      headerName: "CAWB CODE",
      flex: 1.2,
      renderCell: ({ row }: { row: ICAWBCode }) => (
        <Box display="flex" alignItems="center" height="100%">
          <Typography
            sx={{ cursor: "pointer", textDecoration: "underline" }}
            color="primary"
            onClick={() => {
              setSelectedCode(row);
              setOpenDetailDialog(true);
            }}
          >
            {row.code}
          </Typography>
        </Box>
      ),
    },
    {
      field: "carrierId",
      headerName: "SUB CARRIER",
      flex: 1,
      renderCell: ({ row }) => (typeof row.carrierId === "object" ? row.carrierId?.name : row.carrierId),
    },
    {
      field: "isUsed",
      headerName: "USED",
      flex: 1,
      renderCell: ({ row }) => (row.isUsed ? <CheckIcon fontSize="small" sx={{ color: "#2E7D32" }} /> : ""),
    },
    {
      field: "status",
      headerName: "STATUS",
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
            setSelectedCode(row);
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
      <Box mb={2} display="flex" gap={2} alignItems="center" justifyContent="flex-end">
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<Download />} onClick={handleExportExcel}>
            Export Excel
          </Button>
          <Button variant="contained" startIcon={<Add />} onClick={() => setOpenCreateDialog(true)}>
            Create CAWB Code
          </Button>
        </Stack>
      </Box>
      <Box mb={2} display="flex" gap={2} alignItems="center" justifyContent="space-between">
        <TextField placeholder="Search CAWB Code..." size="small" onChange={(e) => debouncedSearch(e.target.value)} className="max-w-[250px] w-full" />

        <Select size="small" displayEmpty value={isUsedFilter} onChange={(e) => setIsUsedFilter(e.target.value)} sx={{ minWidth: 150 }}>
          <MenuItem value="">(All)</MenuItem>
          <MenuItem value="true">Used</MenuItem>
          <MenuItem value="false">Not Used</MenuItem>
        </Select>
        <Select size="small" displayEmpty value={carrierFilter} onChange={(e) => setCarrierFilter(e.target.value)} sx={{ minWidth: 200 }}>
          <MenuItem value="">All Sub Carriers</MenuItem>
          {carriers.map((c) => (
            <MenuItem key={c._id} value={c._id}>
              {c.name}
            </MenuItem>
          ))}
        </Select>
        <Select size="small" displayEmpty value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} sx={{ minWidth: 150 }}>
          <MenuItem value="">Default</MenuItem>
          <MenuItem value="all">All</MenuItem>
          <MenuItem value={ERECORD_STATUS.Active}>Active</MenuItem>
          <MenuItem value={ERECORD_STATUS.Locked}>Locked</MenuItem>
          <MenuItem value={ERECORD_STATUS.NoActive}>Inactive</MenuItem>
          <MenuItem value={ERECORD_STATUS.Deleted}>Deleted</MenuItem>
        </Select>
      </Box>

      {loading ? (
        <Box textAlign="center">
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ width: "100%", overflow: "auto" }}>
          <DataGrid
            rows={codes.map((c) => ({ ...c, id: c._id }))}
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

      <CAWBCodeDetailDialog open={openDetailDialog} onClose={() => setOpenDetailDialog(false)} cawbCode={selectedCode} />
      <CreateCAWBCodeDialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} onCreated={handleCreated} />
      <UpdateCAWBCodeDialog open={openUpdateDialog} onClose={() => setOpenUpdateDialog(false)} onUpdated={handleUpdated} cawbCode={selectedCode} />
    </Box>
  );
}
