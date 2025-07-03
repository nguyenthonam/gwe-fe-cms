"use client";

import { useState, useEffect, useMemo } from "react";
import { Box, Button, Stack, TextField, Select, MenuItem, CircularProgress, Typography } from "@mui/material";
import { Add, Download } from "@mui/icons-material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import debounce from "lodash/debounce";
import { useNotification } from "@/contexts/NotificationProvider";
import { getCarriersApi } from "@/utils/apis/apiCarrier";
import { getPartnersApi } from "@/utils/apis/apiPartner";
import { getServicesApi, getServicesByCarrierApi } from "@/utils/apis/apiService";
import { searchSalePriceGroupsApi, deleteSalePriceGroupApi, lockSalePriceGroupApi, unlockSalePriceGroupApi } from "@/utils/apis/apiSalePrice";
import CreateSalePriceDialog from "./CreateSalePriceDialog";
import UpdateSalePriceDialog from "./UpdateSalePriceDialog";
import SalePriceDetailDialog from "./SalePriceDetailDialog";
import { ERECORD_STATUS } from "@/types/typeGlobals";
import { getId } from "@/utils/hooks/hookGlobals";
import { ActionMenu } from "../Globals/ActionMenu";
import { exportSalePriceGroupToExcelFull } from "@/utils/hooks/hookPrice";
import { ISalePriceGroup } from "@/types/typeSalePrice";

export default function SalePriceManagerView() {
  const [groups, setGroups] = useState<ISalePriceGroup[]>([]);
  const [total, setTotal] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [carrierIdFilter, setCarrierIdFilter] = useState("");
  const [serviceIdFilter, setServiceIdFilter] = useState("");
  const [partnerIdFilter, setPartnerIdFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | "all" | ERECORD_STATUS>("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);

  const [carriers, setCarriers] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [partners, setPartners] = useState<any[]>([]);

  // Dialog & selection state
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<ISalePriceGroup | null>(null);

  const { showNotification } = useNotification();
  const debouncedSearch = useMemo(() => debounce((v) => setKeyword(v), 500), []);

  // Lấy options filter
  useEffect(() => {
    getCarriersApi().then((res) => setCarriers(res?.data?.data?.data || []));
    getPartnersApi().then((res) => setPartners(res?.data?.data?.data || []));
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

  // Fetch group data
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await searchSalePriceGroupsApi({
        keyword,
        page: page + 1,
        perPage: pageSize,
        carrierId: carrierIdFilter,
        serviceId: serviceIdFilter,
        partnerId: partnerIdFilter,
        status: statusFilter,
      });
      const arr: ISalePriceGroup[] = Array.isArray(res?.data?.data?.data) ? res.data.data.data.filter(Boolean) : [];
      setGroups(arr);
      setTotal(res?.data?.data?.meta?.total || 0);
    } catch (err) {
      console.error("Error fetching sale price groups:", err);
      showNotification("Không thể tải danh sách nhóm giá bán", "error");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [keyword, page, pageSize, carrierIdFilter, serviceIdFilter, partnerIdFilter, statusFilter]);

  // ==== Action cho group ====
  const handleDeleteGroup = async (group: ISalePriceGroup) => {
    if (!window.confirm("Bạn có chắc muốn xoá group này?")) return;
    if (!group || !group.carrierId || !group.partnerId || !group.serviceId) {
      showNotification("Thông tin group không đầy đủ để xoá!", "error");
      return;
    }
    const carrierId = typeof group.carrierId === "object" ? group.carrierId._id : group.carrierId;
    const partnerId = typeof group.partnerId === "object" ? group.partnerId._id : group.partnerId;
    const serviceId = typeof group.serviceId === "object" ? group.serviceId._id : group.serviceId;

    if (!carrierId || !partnerId || !serviceId) {
      showNotification("Không tìm thấy ID để xoá!", "error");
      return;
    }

    try {
      await deleteSalePriceGroupApi({
        carrierId,
        partnerId,
        serviceId,
      });
      showNotification("Đã xoá group!");
      fetchData();
    } catch (err: any) {
      showNotification(err.message || "Lỗi khi xoá", "error");
    }
  };

  const handleLockUnlockGroup = async (group: ISalePriceGroup) => {
    if (!group || !group.carrierId || !group.partnerId || !group.serviceId) {
      showNotification("Thông tin group không đầy đủ để khoá/mở khoá!", "error");
      return;
    }
    const carrierId = typeof group.carrierId === "object" ? group.carrierId._id : group.carrierId;
    const partnerId = typeof group.partnerId === "object" ? group.partnerId._id : group.partnerId;
    const serviceId = typeof group.serviceId === "object" ? group.serviceId._id : group.serviceId;

    if (!carrierId || !partnerId || !serviceId) {
      showNotification("Không tìm thấy ID để khoá/mở khoá!", "error");
      return;
    }

    const isLocked = group.datas.length > 0 && group.datas.every((d) => d.status === ERECORD_STATUS.Locked);

    try {
      const api = isLocked ? unlockSalePriceGroupApi : lockSalePriceGroupApi;
      await api({
        carrierId,
        partnerId,
        serviceId,
      });
      showNotification(isLocked ? "Đã mở khoá!" : "Đã khoá!");
      fetchData();
    } catch (err: any) {
      showNotification(err.message || "Lỗi cập nhật trạng thái", "error");
    }
  };

  // ==== Export Excel cho từng group ====
  const exportGroupToExcel = (group: ISalePriceGroup) => {
    if (!group || !group.datas) {
      showNotification("Không có dữ liệu để xuất Excel!");
      return;
    }
    exportSalePriceGroupToExcelFull(group);
  };

  // ==== Columns cho 1 DataGrid duy nhất ====
  const columns: GridColDef[] = [
    {
      field: "code",
      headerName: "CODE",
      flex: 1.2,
      renderCell: ({ row }: { row: ISalePriceGroup }) => (
        <Box display="flex" alignItems="center" height="100%">
          <Typography
            sx={{ cursor: "pointer", textDecoration: "underline" }}
            color="primary"
            onClick={() => {
              setSelectedGroup(row);
              setOpenDetailDialog(true);
            }}
          >
            Chi tiết
          </Typography>
        </Box>
      ),
    },
    {
      field: "partnerId",
      headerName: "Đối tác",
      minWidth: 120,
      flex: 1,
      renderCell: ({ row }: { row: ISalePriceGroup }) => getId(row.partnerId),
    },
    {
      field: "carrierId",
      headerName: "Hãng",
      minWidth: 120,
      flex: 1,
      renderCell: ({ row }: { row: ISalePriceGroup }) => getId(row.carrierId),
    },
    {
      field: "serviceId",
      headerName: "Dịch vụ",
      minWidth: 120,
      flex: 1,
      renderCell: ({ row }: { row: ISalePriceGroup }) => getId(row.serviceId),
    },
    {
      field: "actions",
      headerName: "Thao tác",
      minWidth: 100,
      flex: 1.2,
      renderCell: ({ row }: { row: ISalePriceGroup }) => (
        <Stack direction="row" height={"100%"} spacing={1} alignItems={"center"} justifyItems={"center"}>
          <Button size="small" startIcon={<Download />} onClick={() => exportGroupToExcel(row)}>
            Xuất Excel
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

  // ==== Render DataGrid duy nhất ====
  const rows = useMemo(() => groups.map((g, idx) => ({ ...g, id: idx })), [groups]);

  return (
    <Box className="space-y-4 p-6">
      {/* Toolbar */}
      <Box display="flex" flexWrap="wrap" gap={1} justifyContent="space-between" alignItems="center">
        <TextField placeholder="Tìm kiếm..." size="small" onChange={(e) => debouncedSearch(e.target.value)} sx={{ minWidth: 220 }} />
        <Stack direction="row" spacing={1}>
          <Button variant="contained" startIcon={<Add />} onClick={() => setOpenCreateDialog(true)}>
            Tạo mới
          </Button>
        </Stack>
        <Stack direction="row" spacing={1}>
          <Select size="small" value={partnerIdFilter} onChange={(e) => setPartnerIdFilter(e.target.value)} displayEmpty sx={{ minWidth: 130 }}>
            <MenuItem value="">Tất cả Partner</MenuItem>
            {partners.map((s) => (
              <MenuItem key={s._id} value={s._id}>
                {s.name}
              </MenuItem>
            ))}
          </Select>
          <Select size="small" value={carrierIdFilter} onChange={(e) => setCarrierIdFilter(e.target.value)} displayEmpty sx={{ minWidth: 130 }}>
            <MenuItem value="">Tất cả Hãng</MenuItem>
            {carriers.map((c) => (
              <MenuItem key={c._id} value={c._id}>
                {c.name}
              </MenuItem>
            ))}
          </Select>
          <Select size="small" value={serviceIdFilter} onChange={(e) => setServiceIdFilter(e.target.value)} displayEmpty sx={{ minWidth: 130 }}>
            <MenuItem value="">Tất cả Dịch vụ</MenuItem>
            {services.map((s) => (
              <MenuItem key={s._id} value={s._id}>
                {s.code}
              </MenuItem>
            ))}
          </Select>
          <Select size="small" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} displayEmpty sx={{ minWidth: 120 }}>
            <MenuItem value="">Mặc định</MenuItem>
            <MenuItem value="all">Tất cả</MenuItem>
            <MenuItem value={ERECORD_STATUS.Active}>Hoạt động</MenuItem>
            <MenuItem value={ERECORD_STATUS.Locked}>Đã khoá</MenuItem>
            <MenuItem value={ERECORD_STATUS.NoActive}>Không hoạt động</MenuItem>
            <MenuItem value={ERECORD_STATUS.Deleted}>Đã xoá</MenuItem>
          </Select>
        </Stack>
      </Box>

      {/* DataGrid 1 bảng duy nhất */}
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
