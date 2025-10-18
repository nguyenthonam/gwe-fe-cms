"use client";

import { useState, useEffect, useMemo } from "react";
import { Box, Button, Stack, TextField, Select, MenuItem, CircularProgress, Typography } from "@mui/material";
import { Add, Download } from "@mui/icons-material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import debounce from "lodash/debounce";

import { useNotification } from "@/contexts/NotificationProvider";
import { getCarriersApi } from "@/utils/apis/apiCarrier";
import { getSuppliersApi } from "@/utils/apis/apiSupplier";
import { getServicesApi, getServicesByCarrierApi } from "@/utils/apis/apiService";
import { searchPurchasePriceGroupsApi, deletePurchasePriceGroupApi, lockPurchasePriceGroupApi, unlockPurchasePriceGroupApi } from "@/utils/apis/apiPurchasePrice";

import CreatePurchasePriceDialog from "./CreatePurchasePriceDialog";
import UpdatePurchasePriceDialog from "./UpdatePurchasePriceDialog";
import PurchasePriceDetailDialog from "./PurchasePriceDetailDialog";

import { ERECORD_STATUS } from "@/types/typeGlobals";
import { getId, getNameOfObjectId } from "@/utils/hooks/hookGlobals";
import { ActionMenu } from "../Globals/ActionMenu";
import { exportPurchasePriceGroupToExcelFull } from "@/utils/hooks/hookPrice";
import { IPurchasePriceGroup } from "@/types/typePurchasePrice";

export default function PurchasePriceManagerView() {
  const [groups, setGroups] = useState<IPurchasePriceGroup[]>([]);
  const [total, setTotal] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [carrierIdFilter, setCarrierIdFilter] = useState("");
  const [serviceIdFilter, setServiceIdFilter] = useState("");
  const [supplierIdFilter, setSupplierIdFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | "all" | ERECORD_STATUS>("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);

  const [carriers, setCarriers] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);

  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<IPurchasePriceGroup | null>(null);

  const { showNotification } = useNotification();
  const debouncedSearch = useMemo(() => debounce((v) => setKeyword(v), 500), []);

  useEffect(() => {
    getCarriersApi().then((res) => setCarriers(res?.data?.data?.data || []));
    getSuppliersApi().then((res) => setSuppliers(res?.data?.data?.data || []));
  }, []);

  useEffect(() => {
    if (carrierIdFilter) {
      const selected = carriers.find((c) => c._id === carrierIdFilter);
      const companyId = typeof selected?.companyId === "object" ? selected?.companyId?._id : selected?.companyId;
      if (!companyId) return;
      getServicesByCarrierApi(companyId).then((res) => setServices(res?.data?.data?.data || []));
    } else {
      getServicesApi().then((res) => setServices(res?.data?.data?.data || []));
    }
  }, [carrierIdFilter, carriers]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await searchPurchasePriceGroupsApi({
        keyword,
        page: page + 1,
        perPage: pageSize,
        carrierId: carrierIdFilter,
        serviceId: serviceIdFilter,
        supplierId: supplierIdFilter,
        status: statusFilter,
      });
      const arr: IPurchasePriceGroup[] = Array.isArray(res?.data?.data?.data) ? res.data.data.data.filter(Boolean) : [];
      setGroups(arr);
      setTotal(res?.data?.data?.meta?.total || 0);
    } catch (err) {
      console.error("Error fetching purchase price groups:", err);
      showNotification("Failed to load purchase price groups", "error");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [keyword, page, pageSize, carrierIdFilter, serviceIdFilter, supplierIdFilter, statusFilter]);

  const handleDeleteGroup = async (group: IPurchasePriceGroup) => {
    if (!window.confirm("Are you sure you want to delete this group?")) return;
    try {
      console.log("Deleting purchase price group:", group);
      const carrierId = getId(group.carrierId);
      const supplierId = getId(group.supplierId);
      const serviceId = getId(group.serviceId);
      if (!carrierId || !supplierId || !serviceId) {
        showNotification("Missing group ID!", "error");
        return;
      }

      await deletePurchasePriceGroupApi({ carrierId, supplierId, serviceId });
      showNotification("Group deleted successfully!");
      fetchData();
    } catch (err: any) {
      console.error("Error deleting purchase price group:", err);
      showNotification(err.message || "Delete error", "error");
    }
  };

  const handleLockUnlockGroup = async (group: IPurchasePriceGroup) => {
    const carrierId = getId(group.carrierId);
    const supplierId = getId(group.supplierId);
    const serviceId = getId(group.serviceId);
    if (!carrierId || !supplierId || !serviceId) {
      showNotification("Missing group ID!", "error");
      return;
    }

    const isLocked = group.datas.length > 0 && group.datas.every((d) => d.status === ERECORD_STATUS.Locked);

    try {
      const api = isLocked ? unlockPurchasePriceGroupApi : lockPurchasePriceGroupApi;
      await api({ carrierId, supplierId, serviceId });
      showNotification(isLocked ? "Unlocked successfully!" : "Locked successfully!");
      fetchData();
    } catch (err: any) {
      console.error("Error updating group status:", err);
      showNotification(err.message || "Status update error", "error");
    }
  };

  const exportGroupToExcel = (group: IPurchasePriceGroup) => {
    if (!group || !group.datas) {
      showNotification("No data to export!");
      return;
    }
    exportPurchasePriceGroupToExcelFull(group);
  };

  const columns: GridColDef[] = [
    {
      field: "code",
      headerName: "CODE",
      flex: 1.2,
      renderCell: ({ row }: { row: IPurchasePriceGroup }) => (
        <Box display="flex" alignItems="center" height="100%">
          <Typography
            sx={{ cursor: "pointer", textDecoration: "underline" }}
            color="primary"
            onClick={() => {
              setSelectedGroup(row);
              setOpenDetailDialog(true);
            }}
          >
            Detail
          </Typography>
        </Box>
      ),
    },
    {
      field: "supplierId",
      headerName: "Supplier",
      minWidth: 120,
      flex: 1,
      renderCell: ({ row }) => getNameOfObjectId(row.supplierId),
    },
    {
      field: "carrierId",
      headerName: "Sub Carrier",
      minWidth: 120,
      flex: 1,
      renderCell: ({ row }) => getNameOfObjectId(row.carrierId),
    },
    {
      field: "serviceId",
      headerName: "Service",
      minWidth: 120,
      flex: 1,
      renderCell: ({ row }) => getNameOfObjectId(row.serviceId),
    },
    {
      field: "actions",
      headerName: "Actions",
      minWidth: 100,
      flex: 1.2,
      renderCell: ({ row }: { row: IPurchasePriceGroup }) => (
        <Stack direction="row" height="100%" spacing={1} alignItems="center">
          <Button size="small" startIcon={<Download />} onClick={() => exportGroupToExcel(row)}>
            Export Excel
          </Button>
          <ActionMenu
            onEdit={() => {
              setSelectedGroup(row);
              setOpenUpdateDialog(true);
            }}
            onLockUnlock={() => handleLockUnlockGroup(row)}
            onDelete={() => handleDeleteGroup(row)}
            status={row.datas?.length ? row.datas[0].status : undefined}
          />
        </Stack>
      ),
    },
  ];

  const rows = useMemo(() => groups.map((g, idx) => ({ ...g, id: idx })), [groups]);

  return (
    <Box className="space-y-4 p-6">
      {/* Toolbar */}
      <Box display="flex" flexWrap="wrap" gap={1} justifyContent="space-between" alignItems="center">
        <TextField placeholder="Search..." size="small" onChange={(e) => debouncedSearch(e.target.value)} sx={{ minWidth: 220 }} />
        <Stack direction="row" spacing={1}>
          <Button variant="contained" startIcon={<Add />} onClick={() => setOpenCreateDialog(true)}>
            Create New
          </Button>
        </Stack>
        <Stack direction="row" spacing={1}>
          <Select size="small" value={supplierIdFilter} onChange={(e) => setSupplierIdFilter(e.target.value)} displayEmpty sx={{ minWidth: 130 }}>
            <MenuItem value="">All Suppliers</MenuItem>
            {suppliers.map((s) => (
              <MenuItem key={s._id} value={s._id}>
                {s.name}
              </MenuItem>
            ))}
          </Select>
          <Select size="small" value={carrierIdFilter} onChange={(e) => setCarrierIdFilter(e.target.value)} displayEmpty sx={{ minWidth: 130 }}>
            <MenuItem value="">All Sub Carriers</MenuItem>
            {carriers.map((c) => (
              <MenuItem key={c._id} value={c._id}>
                {c.name}
              </MenuItem>
            ))}
          </Select>
          <Select size="small" value={serviceIdFilter} onChange={(e) => setServiceIdFilter(e.target.value)} displayEmpty sx={{ minWidth: 130 }}>
            <MenuItem value="">All Services</MenuItem>
            {services.map((s) => (
              <MenuItem key={s._id} value={s._id}>
                {s.code}
              </MenuItem>
            ))}
          </Select>
          <Select size="small" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} displayEmpty sx={{ minWidth: 120 }}>
            <MenuItem value="">Default</MenuItem>
            <MenuItem value="all">All</MenuItem>
            <MenuItem value={ERECORD_STATUS.Active}>Active</MenuItem>
            <MenuItem value={ERECORD_STATUS.Locked}>Locked</MenuItem>
            <MenuItem value={ERECORD_STATUS.NoActive}>Inactive</MenuItem>
            <MenuItem value={ERECORD_STATUS.Deleted}>Deleted</MenuItem>
          </Select>
        </Stack>
      </Box>

      {/* DataGrid */}
      {loading ? (
        <Box textAlign="center">
          <CircularProgress />
        </Box>
      ) : (
        <DataGrid
          rows={rows}
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
          autoHeight
        />
      )}

      {/* Dialogs */}
      <CreatePurchasePriceDialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} onCreated={fetchData} />
      {selectedGroup && (
        <>
          <UpdatePurchasePriceDialog open={openUpdateDialog} onClose={() => setOpenUpdateDialog(false)} group={selectedGroup} onUpdated={fetchData} />
          <PurchasePriceDetailDialog open={openDetailDialog} onClose={() => setOpenDetailDialog(false)} group={selectedGroup} />
        </>
      )}
    </Box>
  );
}
