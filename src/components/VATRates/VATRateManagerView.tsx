"use client";

import { useState, useEffect, useMemo } from "react";
import { Box, Button, TextField, Select, MenuItem, CircularProgress, Typography, Stack } from "@mui/material";
import { Add, Download } from "@mui/icons-material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import * as XLSX from "sheetjs-style";
import debounce from "lodash/debounce";
import dayjs from "dayjs";
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
  const today = new Date();
  const [startDateFilter, setStartDateFilter] = useState<string>(new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10));
  const [endDateFilter, setEndDateFilter] = useState<string>(new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().slice(0, 10));
  const isDateInvalid = !!startDateFilter && !!endDateFilter && new Date(startDateFilter) > new Date(endDateFilter);

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
    // eslint-disable-next-line
  }, [carrierIdFilter, carriers]);

  // Fetch VAT Rate list
  const fetchData = async () => {
    if (isDateInvalid) return;
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
        startDate: startDateFilter || undefined,
        endDate: endDateFilter || undefined,
      });
      setRates(res?.data?.data?.data || []);
      setTotal(res?.data?.data?.meta?.total || 0);
    } catch {
      showNotification("Unable to load VAT Rate list", "error");
    } finally {
      setLoading(false);
    }
  };

  // Reload data/filter
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [keyword, page, pageSize, carrierIdFilter, serviceIdFilter, supplierIdFilter, statusFilter, startDateFilter, endDateFilter]);

  // Excel export
  const handleExportExcel = () => {
    const data = rates.map((v) => ({
      "SUB CARRIER": typeof v.carrierId === "object" ? v.carrierId?.name : v.carrierId,
      SERVICE: typeof v.serviceId === "object" ? v.serviceId?.code : v.serviceId,
      SUPPLIER: typeof v.supplierId === "object" ? v.supplierId?.name : v.supplierId,
      "VAT RATE (%)": v.value,
      "START DATE": v.startDate ? dayjs(v.startDate).format("DD/MM/YYYY") : "",
      "END DATE": v.endDate ? dayjs(v.endDate).format("DD/MM/YYYY") : "",
      STATUS: v.status,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    ws["!cols"] = Object.keys(data[0]).map(() => ({ wch: 18 }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "VAT_RATES");
    XLSX.writeFile(wb, "VATRateList.xlsx");
  };

  // Table columns
  const columns: GridColDef[] = [
    {
      field: "code",
      headerName: "CODE",
      align: "center",
      headerAlign: "center",
      flex: 1,
      minWidth: 110,
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
            {row.code || "#" + row._id?.slice(-6)}
          </Typography>
        </Box>
      ),
    },
    {
      field: "carrierId",
      headerName: "SUB CARRIER",
      minWidth: 140,
      flex: 1,
      renderCell: ({ row }) => (typeof row.carrierId === "object" ? row.carrierId?.name : row.carrierId),
    },
    {
      field: "serviceId",
      headerName: "SERVICE",
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
      field: "startDate",
      headerName: "START DATE",
      minWidth: 120,
      flex: 0.8,
      align: "center",
      renderCell: ({ value }) => (value ? dayjs(value).format("DD/MM/YYYY") : "-"),
    },
    {
      field: "endDate",
      headerName: "END DATE",
      minWidth: 120,
      flex: 0.8,
      align: "center",
      renderCell: ({ value }) => (value ? dayjs(value).format("DD/MM/YYYY") : "-"),
    },
    {
      field: "status",
      headerName: "STATUS",
      minWidth: 110,
      flex: 0.8,
      align: "center",
      renderCell: ({ value }) => <EnumChip type="recordStatus" value={value} />,
    },
    {
      field: "actions",
      headerName: "",
      width: 60,
      align: "center",
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
      const confirm = window.confirm(item.status === ERECORD_STATUS.Active ? "Lock this VAT Rate?" : "Unlock this VAT Rate?");
      if (!confirm) return;
      const res = item.status === ERECORD_STATUS.Active ? await lockVATRateApi(item._id) : await unlockVATRateApi(item._id);
      showNotification(res?.data?.message || "Status updated", "success");
      fetchData();
    } catch (err: any) {
      showNotification(err.message || "Error updating status", "error");
    }
  };

  const handleDelete = async (item: IVATRate) => {
    if (!item._id) return;
    if (!window.confirm("Are you sure to delete this VAT Rate?")) return;
    try {
      await deleteVATRateApi(item._id);
      showNotification("Deleted successfully", "success");
      fetchData();
    } catch (err: any) {
      showNotification(err.message || "Delete error", "error");
    }
  };

  return (
    <Box className="space-y-4 p-6">
      {/* FILTER BAR */}
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
            placeholder="Search VAT Rate..."
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
          <Select size="small" displayEmpty value={serviceIdFilter} onChange={(e) => setServiceIdFilter(e.target.value)} sx={{ minWidth: 140 }}>
            <MenuItem value="">All services</MenuItem>
            {services?.map((s) => (
              <MenuItem key={s._id} value={s._id}>
                {s.code}
              </MenuItem>
            ))}
          </Select>
          <Select size="small" displayEmpty value={supplierIdFilter} onChange={(e) => setSupplierIdFilter(e.target.value)} sx={{ minWidth: 140 }}>
            <MenuItem value="">All suppliers</MenuItem>
            {suppliers?.map((s) => (
              <MenuItem key={s._id} value={s._id}>
                {s.name}
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
              value={startDateFilter}
              onChange={(e) => setStartDateFilter(e.target.value)}
              InputLabelProps={{ shrink: true }}
              error={isDateInvalid}
            />
            <TextField type="date" size="small" label="End date" value={endDateFilter} onChange={(e) => setEndDateFilter(e.target.value)} InputLabelProps={{ shrink: true }} error={isDateInvalid} />
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

      {/* DIALOGS */}
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
