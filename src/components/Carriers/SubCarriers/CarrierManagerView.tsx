"use client";

import { useEffect, useMemo, useState } from "react";
import { Box, Button, TextField, MenuItem, Select, Stack, CircularProgress, Typography, Chip } from "@mui/material";
import { Add, Download } from "@mui/icons-material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import debounce from "lodash/debounce";
import { ICarrier } from "@/types";
import { ERECORD_STATUS } from "@/types/typeGlobals";
import { EnumChip } from "../../Globals/EnumChip";
import { ActionMenu } from "../../Globals/ActionMenu";
import { useNotification } from "@/contexts/NotificationProvider";
import { searchCarriersApi, lockCarrierApi, unlockCarrierApi, deleteCarrierApi } from "@/utils/apis/apiCarrier";
import CreateCarrierDialog from "./CreateCarrierDialog";
import UpdateCarrierDialog from "./UpdateCarrierDialog";
import { chargeWeightTypeLabel, recordStatusLabel } from "@/utils/constants/enumLabel";
import * as XLSX from "sheetjs-style";
import CarrierDetailDialog from "./CarrierDetailDialog";
import { orange } from "@mui/material/colors";

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
      const confirm = window.confirm(carrier.status === ERECORD_STATUS.Active ? "Lock this carrier?" : "Unlock this carrier?");
      if (!confirm) return;

      const res = carrier.status === ERECORD_STATUS.Active ? await lockCarrierApi(carrier._id) : await unlockCarrierApi(carrier._id);
      showNotification(res?.data?.message || "Status updated successfully", "success");
      fetchCarriers();
    } catch (err: any) {
      showNotification(err.message || "Status update failed", "error");
    }
  };

  const handleDelete = async (carrier: ICarrier) => {
    if (!carrier._id) return;
    if (!window.confirm("Are you sure you want to delete this carrier?")) return;
    try {
      await deleteCarrierApi(carrier._id);
      showNotification("Deleted successfully", "success");
      fetchCarriers();
    } catch (err: any) {
      showNotification(err.message || "Delete failed", "error");
    }
  };

  const handleExportExcel = () => {
    const data = carriers.map((c) => ({
      CODE: c.code,
      NAME: c.name,
      AIRLINE: typeof c.companyId === "object" ? c.companyId?.name || "" : String(c.companyId),
      "CHARGEABLE WEIGHT METHOD": chargeWeightTypeLabel[c.chargeableWeightType],
      "VOLUME CONVERSION RATE": c.volWeightRate,
      STATUS: recordStatusLabel[c.status as keyof typeof recordStatusLabel] || c.status,
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
    XLSX.utils.book_append_sheet(wb, ws, "CARRIER");
    XLSX.writeFile(wb, "CARRIER_LIST.xlsx");
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
      headerName: "SUB CARRIER CODE",
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
    { field: "name", headerName: "SUB CARRIER NAME", flex: 1.5 },
    {
      field: "companyId",
      headerName: "CARRIER",
      flex: 1,
      renderCell: ({ row }) => (typeof row.companyId === "object" ? row.companyId?.name : row.companyId),
    },
    {
      field: "chargeableWeightType",
      headerName: "CHARGEABLE WEIGHT TYPE",
      flex: 1.5,
      width: 250,
      renderCell: ({ row }) => <EnumChip type="chargeWeightType" value={row.chargeableWeightType} />,
    },
    {
      field: "volWeightRate",
      headerName: "VOLUME WEIGHT RATE",
      flex: 1,
      width: 250,
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
        <TextField placeholder="Search carrier..." size="small" onChange={(e) => debouncedSearch(e.target.value)} className="max-w-[250px] w-full" />
        <Select size="small" displayEmpty value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} sx={{ minWidth: 150 }}>
          <MenuItem value="">Default</MenuItem>
          <MenuItem value="all">All</MenuItem>
          <MenuItem value={ERECORD_STATUS.Active}>Active</MenuItem>
          <MenuItem value={ERECORD_STATUS.Locked}>Locked</MenuItem>
          <MenuItem value={ERECORD_STATUS.NoActive}>Inactive</MenuItem>
          <MenuItem value={ERECORD_STATUS.Deleted}>Deleted</MenuItem>
        </Select>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<Download />} onClick={handleExportExcel}>
            Export Excel
          </Button>
          <Button variant="contained" startIcon={<Add />} onClick={() => setOpenCreateDialog(true)}>
            Create New
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

      <CarrierDetailDialog open={openDetailDialog} onClose={() => setOpenDetailDialog(false)} carrier={selectedCarrier} />
      <CreateCarrierDialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} onCreated={handleCreated} />
      <UpdateCarrierDialog open={openUpdateDialog} onClose={() => setOpenUpdateDialog(false)} onUpdated={handleUpdated} carrier={selectedCarrier} />
    </Box>
  );
}
