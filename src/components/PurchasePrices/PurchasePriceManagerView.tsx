"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Box, Button, Stack, TextField, Select, MenuItem, CircularProgress, Typography, Tooltip, IconButton } from "@mui/material";
import { Add, Download } from "@mui/icons-material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import debounce from "lodash/debounce";
import { useTheme } from "@mui/material/styles";

import { useNotification } from "@/contexts/NotificationProvider";
import { getCarriersApi } from "@/utils/apis/apiCarrier";
import { getSuppliersApi } from "@/utils/apis/apiSupplier";
import { getServicesApi, getServicesByCarrierApi } from "@/utils/apis/apiService";
import { searchPurchasePriceGroupsApi, deletePurchasePriceGroupApi } from "@/utils/apis/apiPurchasePrice";

import CreatePurchasePriceDialog from "./CreatePurchasePriceDialog";
import UpdatePurchasePriceDialog from "./UpdatePurchasePriceDialog";
import PurchasePriceDetailDialog from "./PurchasePriceDetailDialog";

import { ERECORD_STATUS } from "@/types/typeGlobals";
import { getId, getNameOfObjectId } from "@/utils/hooks/hookGlobals";
import { ActionMenu } from "../Globals/ActionMenu";
import { exportPurchasePriceGroupToExcelFull } from "@/utils/hooks/hookPrice";
import { IPurchasePriceGroup } from "@/types/typePurchasePrice";
import { green } from "@mui/material/colors";

const ACTION_COL_WIDTH = 120;

export default function PurchasePriceManagerView() {
  const theme = useTheme();
  const { showNotification } = useNotification();

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

  const debouncedSearch = useMemo(() => debounce((v: string) => setKeyword(v), 500), []);

  // ==== đo lường & đồng bộ scroll giống OrderManagerView ====
  const [headerH, setHeaderH] = useState<number>(56);
  const [rowH, setRowH] = useState<number>(52);
  const [rowBorderColor, setRowBorderColor] = useState<string>(theme.palette.divider);
  const [hScrollSize, setHScrollSize] = useState<number>(0);

  const gridRootRef = useRef<HTMLDivElement | null>(null);
  const gridScrollerRef = useRef<HTMLDivElement | null>(null);
  const railScrollRef = useRef<HTMLDivElement | null>(null);
  const syncingRef = useRef<{ from?: "grid" | "rail" }>({});

  const attachGridScroller = useCallback(() => {
    if (!gridRootRef.current) return;

    const scroller = gridRootRef.current.querySelector<HTMLDivElement>(".MuiDataGrid-virtualScroller");
    gridScrollerRef.current = scroller || null;

    const headerEl = gridRootRef.current.querySelector<HTMLDivElement>(".MuiDataGrid-columnHeaders");
    if (headerEl) setHeaderH(headerEl.clientHeight);

    const firstRow = gridRootRef.current.querySelector<HTMLDivElement>(".MuiDataGrid-row");
    if (firstRow) setRowH(firstRow.clientHeight);

    const firstCell = gridRootRef.current.querySelector<HTMLElement>(".MuiDataGrid-cell");
    if (firstCell) {
      const cs = getComputedStyle(firstCell);
      setRowBorderColor(cs.borderBottomColor || theme.palette.divider);
    }

    if (scroller) {
      const hScroll = scroller.offsetHeight - scroller.clientHeight;
      setHScrollSize(hScroll > 0 ? hScroll : 0);
    }
  }, [theme.palette.divider]);

  // preload dropdowns
  useEffect(() => {
    getCarriersApi().then((res) => setCarriers(res?.data?.data?.data || []));
    getSuppliersApi().then((res) => setSuppliers(res?.data?.data?.data || []));
  }, []);

  useEffect(() => {
    const loadServices = async () => {
      try {
        if (carrierIdFilter) {
          const selected = carriers.find((c) => c._id === carrierIdFilter);
          const companyId = typeof selected?.companyId === "object" ? selected?.companyId?._id : selected?.companyId;
          if (!companyId) return;
          const res = await getServicesByCarrierApi(companyId);
          setServices(res?.data?.data?.data || []);
        } else {
          const res = await getServicesApi();
          setServices(res?.data?.data?.data || []);
        }
      } catch {
        showNotification("Failed to load services", "error");
      }
    };
    loadServices();
  }, [carrierIdFilter, carriers, showNotification]);

  // fetch list
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
    } catch (err: any) {
      console.error(err);
      showNotification(err?.message || "Failed to load purchase price groups", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword, page, pageSize, carrierIdFilter, serviceIdFilter, supplierIdFilter, statusFilter]);

  // đo lường grid khi data đổi
  const rows = useMemo(
    () =>
      groups.map((g, idx) => ({
        ...g,
        id: (g as any)._id || `${getId(g.carrierId)}-${getId(g.supplierId)}-${getId(g.serviceId)}-${idx}`,
      })),
    [groups]
  );

  const displayedRows = rows; // dùng cho rail

  useEffect(() => {
    attachGridScroller();
    const ro = gridRootRef.current ? new ResizeObserver(() => attachGridScroller()) : null;
    if (gridRootRef.current && ro) ro.observe(gridRootRef.current);
    return () => ro?.disconnect();
  }, [attachGridScroller, rows.length]);

  useEffect(() => {
    const gridEl = gridScrollerRef.current;
    const railEl = railScrollRef.current;
    if (!gridEl || !railEl) return;

    const onGridScroll = () => {
      if (syncingRef.current.from === "rail") {
        syncingRef.current.from = undefined;
        return;
      }
      syncingRef.current.from = "grid";
      railEl.scrollTop = gridEl.scrollTop;
    };

    const onRailScroll = () => {
      if (syncingRef.current.from === "grid") {
        syncingRef.current.from = undefined;
        return;
      }
      syncingRef.current.from = "rail";
      gridEl.scrollTop = railEl.scrollTop;
    };

    gridEl.addEventListener("scroll", onGridScroll, {
      passive: true,
    });
    railEl.addEventListener("scroll", onRailScroll, {
      passive: true,
    });
    railEl.scrollTop = gridEl.scrollTop;

    return () => {
      gridEl.removeEventListener("scroll", onGridScroll);
      railEl.removeEventListener("scroll", onRailScroll);
    };
  }, [rows.length]);

  // handlers
  const openDetail = (row: IPurchasePriceGroup) => {
    setSelectedGroup(row);
    setOpenDetailDialog(true);
  };

  const handleDeleteGroup = async (group: IPurchasePriceGroup) => {
    if (!window.confirm("Are you sure you want to delete this group?")) return;

    try {
      const carrierId = getId(group.carrierId);
      const supplierId = getId(group.supplierId);
      const serviceId = getId(group.serviceId);
      if (!carrierId || !supplierId || !serviceId) {
        showNotification("Missing group ID!", "error");
        return;
      }
      await deletePurchasePriceGroupApi({
        carrierId,
        supplierId,
        serviceId,
      });
      showNotification("Group deleted successfully!", "success");
      fetchData();
    } catch (err: any) {
      console.error("Error deleting purchase price group:", err);
      showNotification(err.message || "Delete error", "error");
    }
  };

  const exportGroupToExcel = (group: IPurchasePriceGroup) => {
    if (!group || !group.datas || !group.datas.length) {
      showNotification("No data to export!", "warning");
      return;
    }
    exportPurchasePriceGroupToExcelFull(group);
  };

  // columns (KHÔNG có Actions – chuyển sang rail)
  const columns: GridColDef[] = [
    {
      field: "code",
      headerName: "CODE",
      flex: 1.2,
      minWidth: 120,
      sortable: false,
      renderCell: ({ row }: { row: IPurchasePriceGroup }) => (
        <Box display="flex" alignItems="center" height="100%">
          <Typography sx={{ cursor: "pointer", textDecoration: "underline" }} color="primary" onClick={() => openDetail(row)}>
            Detail
          </Typography>
        </Box>
      ),
    },
    {
      field: "supplierId",
      headerName: "Supplier",
      minWidth: 140,
      flex: 1,
      sortable: false,
      renderCell: ({ row }) => getNameOfObjectId(row.supplierId),
    },
    {
      field: "carrierId",
      headerName: "Sub Carrier",
      minWidth: 140,
      flex: 1,
      sortable: false,
      renderCell: ({ row }) => getNameOfObjectId(row.carrierId),
    },
    {
      field: "serviceId",
      headerName: "Service",
      minWidth: 140,
      flex: 1,
      sortable: false,
      renderCell: ({ row }) => getNameOfObjectId(row.serviceId),
    },
  ];

  // render
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
        overflow: "hidden",
        p: 2,
      }}
    >
      {/* Toolbar */}
      <Box
        sx={{
          flex: "0 0 auto",
          mb: 1.5,
          display: "flex",
          flexWrap: "wrap",
          gap: 1,
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* Left: search */}
        <Stack direction="row" spacing={1} flexWrap="wrap">
          <TextField placeholder="Search..." size="small" onChange={(e) => debouncedSearch(e.target.value)} sx={{ minWidth: 220 }} />
        </Stack>

        {/* Center: main actions */}
        <Stack direction="row" spacing={1}>
          <Button variant="contained" startIcon={<Add />} onClick={() => setOpenCreateDialog(true)}>
            Create New
          </Button>
        </Stack>

        {/* Right: filters */}
        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Select size="small" value={supplierIdFilter} onChange={(e) => setSupplierIdFilter(e.target.value)} displayEmpty sx={{ minWidth: 150 }}>
            <MenuItem value="">All Suppliers</MenuItem>
            {suppliers.map((s) => (
              <MenuItem key={s._id} value={s._id}>
                {s.name}
              </MenuItem>
            ))}
          </Select>

          <Select size="small" value={carrierIdFilter} onChange={(e) => setCarrierIdFilter(e.target.value)} displayEmpty sx={{ minWidth: 150 }}>
            <MenuItem value="">All Sub Carriers</MenuItem>
            {carriers.map((c) => (
              <MenuItem key={c._id} value={c._id}>
                {c.name}
              </MenuItem>
            ))}
          </Select>

          <Select size="small" value={serviceIdFilter} onChange={(e) => setServiceIdFilter(e.target.value)} displayEmpty sx={{ minWidth: 150 }}>
            <MenuItem value="">All Services</MenuItem>
            {services.map((s) => (
              <MenuItem key={s._id} value={s._id}>
                {s.code}
              </MenuItem>
            ))}
          </Select>

          <Select size="small" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} displayEmpty sx={{ minWidth: 140 }}>
            <MenuItem value="">Default</MenuItem>
            <MenuItem value="all">All</MenuItem>
            <MenuItem value={ERECORD_STATUS.Active}>Active</MenuItem>
            <MenuItem value={ERECORD_STATUS.Locked}>Locked</MenuItem>
            <MenuItem value={ERECORD_STATUS.NoActive}>Inactive</MenuItem>
            <MenuItem value={ERECORD_STATUS.Deleted}>Deleted</MenuItem>
          </Select>
        </Stack>
      </Box>

      {/* Grid + Action Rail (giống OrderManagerView) */}
      <Box
        sx={{
          flex: "1 1 auto",
          minHeight: 0,
          display: "flex",
          alignItems: "stretch",
        }}
      >
        {/* LEFT: DataGrid */}
        <Box ref={gridRootRef} sx={{ flex: 1, minWidth: 0 }}>
          {loading ? (
            <Box
              sx={{
                pt: 4,
                textAlign: "center",
              }}
            >
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
              autoHeight={false}
              sx={{
                height: "100%",
                "& .MuiDataGrid-virtualScroller": {
                  overflowX: "auto",
                  overflowY: "auto",
                  position: "relative",
                },
                "--DataGrid-rowBorderColor": theme.palette.divider,
              }}
            />
          )}
        </Box>

        {/* RIGHT: Action Rail */}
        <Box
          sx={{
            width: ACTION_COL_WIDTH,
            minWidth: ACTION_COL_WIDTH,
            borderLeft: `1px solid ${theme.palette.divider}`,
            borderTop: `1px solid ${theme.palette.divider}`,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Header rail */}
          <Box
            sx={{
              height: `${headerH}px`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              borderRight: `1px solid ${rowBorderColor}`,
              borderBottom: `1px solid ${rowBorderColor}`,
              overflow: "hidden",
              bgcolor: theme.palette.background.paper,
              color: theme.palette.primary.main,
              boxSizing: "border-box",
            }}
          >
            ACTIONS
          </Box>

          {/* Body rail (scroll sync) */}
          <Box
            ref={railScrollRef}
            sx={{
              flex: 1,
              minHeight: 0,
              overflowY: "auto",
              overflowX: "hidden",
              bgcolor: theme.palette.background.default,
              pb: `${hScrollSize}px`,
            }}
          >
            {displayedRows.length === 0 ? (
              <Box sx={{ p: 2, color: theme.palette.text.secondary }}>No rows</Box>
            ) : (
              <>
                {displayedRows.map((row: any) => (
                  <Box
                    key={row.id}
                    sx={{
                      height: `${rowH}px`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      p: 1,
                      boxSizing: "border-box",
                      borderRight: `1px solid ${rowBorderColor}`,
                      borderBottom: `1px solid ${rowBorderColor}`,
                      bgcolor: theme.palette.background.default,
                    }}
                  >
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Tooltip title="Export Excel" arrow>
                        <IconButton size="small" onClick={() => exportGroupToExcel(row as IPurchasePriceGroup)} aria-label="Export Excel">
                          <Download fontSize="small" sx={{ color: green[600], "&:hover": { color: green[800], bgcolor: "rgba(255,152,0,0.08)" } }} />
                        </IconButton>
                      </Tooltip>

                      <ActionMenu
                        onEdit={() => {
                          setSelectedGroup(row as IPurchasePriceGroup);
                          setOpenUpdateDialog(true);
                        }}
                        onDelete={() => handleDeleteGroup(row as IPurchasePriceGroup)}
                        status={(row as IPurchasePriceGroup).datas?.length ? (row as IPurchasePriceGroup).datas![0].status : undefined}
                      />
                    </Stack>
                  </Box>
                ))}
                {/* filler cuối để đỡ cụt rail */}
                <Box
                  sx={{
                    height: `${rowH + 16}px`,
                    borderRight: `1px solid ${rowBorderColor}`,
                    borderBottom: `1px solid ${rowBorderColor}`,
                    boxSizing: "border-box",
                    bgcolor: theme.palette.background.default,
                  }}
                />
              </>
            )}
          </Box>
        </Box>
      </Box>

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
