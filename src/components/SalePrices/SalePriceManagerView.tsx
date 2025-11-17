"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Box, Button, Stack, TextField, Select, MenuItem, CircularProgress, Typography, Tooltip, IconButton } from "@mui/material";
import { Add, Download } from "@mui/icons-material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import debounce from "lodash/debounce";
import { useTheme } from "@mui/material/styles";
import { green } from "@mui/material/colors";

import { useNotification } from "@/contexts/NotificationProvider";
import { getCarriersApi } from "@/utils/apis/apiCarrier";
import { getPartnersApi } from "@/utils/apis/apiPartner";
import { getServicesApi, getServicesByCarrierApi } from "@/utils/apis/apiService";
import { searchSalePriceGroupsApi, deleteSalePriceGroupApi } from "@/utils/apis/apiSalePrice";

import CreateSalePriceDialog from "./CreateSalePriceDialog";
import UpdateSalePriceDialog from "./UpdateSalePriceDialog";
import SalePriceDetailDialog from "./SalePriceDetailDialog";

import { ERECORD_STATUS } from "@/types/typeGlobals";
import { getId, getNameOfObjectId } from "@/utils/hooks/hookGlobals";
import { ActionMenu } from "../Globals/ActionMenu";
import { exportSalePriceGroupToExcelFull } from "@/utils/hooks/hookPrice";
import { ISalePriceGroup } from "@/types/typeSalePrice";

const ACTION_COL_WIDTH = 120;

export default function SalePriceManagerView() {
  const theme = useTheme();
  const { showNotification } = useNotification();

  const [groups, setGroups] = useState<ISalePriceGroup[]>([]);
  const [total, setTotal] = useState(0);

  const [keyword, setKeyword] = useState("");
  const [carrierIdFilter, setCarrierIdFilter] = useState("");
  const [serviceIdFilter, setServiceIdFilter] = useState("");
  const [customerIdFilter, setCustomerIdFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | "all" | ERECORD_STATUS>("");

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);

  const [carriers, setCarriers] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);

  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<ISalePriceGroup | null>(null);

  const debouncedSearch = useMemo(() => debounce((v: string) => setKeyword(v), 500), []);

  // ==== đo lường & đồng bộ scroll giống OrderManagerView/PurchasePrice ====
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
    getPartnersApi().then((res) => setCustomers(res?.data?.data?.data || []));
  }, []);

  // load services theo carrier filter
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
      const res = await searchSalePriceGroupsApi({
        keyword,
        page: page + 1,
        perPage: pageSize,
        carrierId: carrierIdFilter,
        serviceId: serviceIdFilter,
        partnerId: customerIdFilter,
        status: statusFilter,
      });
      const arr: ISalePriceGroup[] = Array.isArray(res?.data?.data?.data) ? res.data.data.data.filter(Boolean) : [];
      setGroups(arr);
      setTotal(res?.data?.data?.meta?.total || 0);
    } catch (err: any) {
      console.error(err);
      showNotification(err?.message || "Failed to load sale price groups", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword, page, pageSize, carrierIdFilter, serviceIdFilter, customerIdFilter, statusFilter]);

  // đo lường grid khi data đổi
  const rows = useMemo(
    () =>
      groups.map((g, idx) => ({
        ...g,
        id: (g as any)._id || `${getId(g.carrierId)}-${getId(g.partnerId)}-${getId(g.serviceId)}-${idx}`,
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

    gridEl.addEventListener("scroll", onGridScroll, { passive: true });
    railEl.addEventListener("scroll", onRailScroll, { passive: true });
    railEl.scrollTop = gridEl.scrollTop;

    return () => {
      gridEl.removeEventListener("scroll", onGridScroll);
      railEl.removeEventListener("scroll", onRailScroll);
    };
  }, [rows.length]);

  // handlers
  const openDetail = (row: ISalePriceGroup) => {
    setSelectedGroup(row);
    setOpenDetailDialog(true);
  };

  const handleDeleteGroup = async (group: ISalePriceGroup) => {
    if (!window.confirm("Are you sure you want to delete this group?")) return;
    const carrierId = getId(group.carrierId);
    const customerId = getId(group.partnerId);
    const serviceId = getId(group.serviceId);
    if (!carrierId || !customerId || !serviceId) {
      showNotification("Missing group ID!", "error");
      return;
    }
    try {
      await deleteSalePriceGroupApi({ carrierId, partnerId: customerId, serviceId });
      showNotification("Group deleted successfully!", "success");
      fetchData();
    } catch (err: any) {
      showNotification(err?.message || "Error deleting group", "error");
    }
  };

  const exportGroupToExcel = (group: ISalePriceGroup) => {
    if (!group?.datas || !group.datas.length) {
      showNotification("No data to export!", "warning");
      return;
    }
    exportSalePriceGroupToExcelFull(group);
  };

  // columns (KHÔNG có Actions – chuyển sang rail)
  const columns: GridColDef[] = [
    {
      field: "code",
      headerName: "CODE",
      flex: 1.2,
      minWidth: 120,
      sortable: false,
      renderCell: ({ row }) => (
        <Box display="flex" alignItems="center" height="100%">
          <Typography sx={{ cursor: "pointer", textDecoration: "underline" }} color="primary" onClick={() => openDetail(row as ISalePriceGroup)}>
            Detail
          </Typography>
        </Box>
      ),
    },
    {
      field: "partnerId",
      headerName: "Customer",
      minWidth: 140,
      flex: 1,
      sortable: false,
      renderCell: ({ row }) => getNameOfObjectId((row as ISalePriceGroup).partnerId),
    },
    {
      field: "carrierId",
      headerName: "Sub Carrier",
      minWidth: 140,
      flex: 1,
      sortable: false,
      renderCell: ({ row }) => getNameOfObjectId((row as ISalePriceGroup).carrierId),
    },
    {
      field: "serviceId",
      headerName: "Service",
      minWidth: 140,
      flex: 1,
      sortable: false,
      renderCell: ({ row }) => getNameOfObjectId((row as ISalePriceGroup).serviceId),
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
          <Select size="small" value={customerIdFilter} onChange={(e) => setCustomerIdFilter(e.target.value)} displayEmpty sx={{ minWidth: 150 }}>
            <MenuItem value="">All Customers</MenuItem>
            {customers.map((c) => (
              <MenuItem key={c._id} value={c._id}>
                {c.name}
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

      {/* Grid + Action Rail (giống OrderManagerView / PurchasePriceManagerView) */}
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
                        <IconButton size="small" onClick={() => exportGroupToExcel(row as ISalePriceGroup)} aria-label="Export Excel">
                          <Download fontSize="small" sx={{ color: green[600], "&:hover": { color: green[800], bgcolor: "rgba(76,175,80,0.08)" } }} />
                        </IconButton>
                      </Tooltip>

                      <ActionMenu
                        onEdit={() => {
                          setSelectedGroup(row as ISalePriceGroup);
                          setOpenUpdateDialog(true);
                        }}
                        onDelete={() => handleDeleteGroup(row as ISalePriceGroup)}
                        status={(row as ISalePriceGroup).datas?.length ? (row as ISalePriceGroup).datas![0].status : undefined}
                      />
                    </Stack>
                  </Box>
                ))}
                {/* filler cuối để rail không bị cụt */}
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
      <CreateSalePriceDialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} onCreated={fetchData} />

      {selectedGroup && (
        <>
          <UpdateSalePriceDialog open={openUpdateDialog} onClose={() => setOpenUpdateDialog(false)} group={selectedGroup} onUpdated={fetchData} />
          <SalePriceDetailDialog open={openDetailDialog} onClose={() => setOpenDetailDialog(false)} group={selectedGroup} />
        </>
      )}
    </Box>
  );
}
