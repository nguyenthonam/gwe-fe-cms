"use client";

import { useState, useEffect, useMemo } from "react";
import { Box, Button, Stack, TextField, Select, MenuItem, CircularProgress, Typography, Chip } from "@mui/material";
import { Add, Download } from "@mui/icons-material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import debounce from "lodash/debounce";
import * as XLSX from "sheetjs-style";
import { IOrder } from "@/types/typeOrder";
import { useNotification } from "@/contexts/NotificationProvider";
import { EnumChip } from "@/components/Globals/EnumChip";
import { ActionMenu } from "@/components/Globals/ActionMenu";
import { getCarriersApi } from "@/utils/apis/apiCarrier";
import { getPartnersApi } from "@/utils/apis/apiPartner";
import { getSuppliersApi } from "@/utils/apis/apiSupplier";
import { getServicesApi } from "@/utils/apis/apiService";
import { searchOrdersApi, deleteOrderApi, lockOrderApi, unlockOrderApi, calculateOrderTotalApi } from "@/utils/apis/apiOrder";
import CreateOrderDialog from "./CreateOrderDialog";
import UpdateOrderDialog from "./UpdateOrderDialog";
import OrderDetailDialog from "./OrderDetailDialog";
import { ECURRENCY, EORDER_STATUS, ERECORD_STATUS } from "@/types/typeGlobals";
import { formatDate } from "@/utils/hooks/hookDate";
import { blue, green, grey, pink } from "@mui/material/colors";
import { formatCurrency } from "@/utils/hooks/hookCurrency";

export default function OrderManagerView() {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [carrierIdFilter, setCarrierIdFilter] = useState("");
  const [partnerIdFilter, setPartnerIdFilter] = useState("");
  const [serviceIdFilter, setServiceIdFilter] = useState("");
  const [supplierIdFilter, setSupplierIdFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | "all" | ERECORD_STATUS>("");
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // Dropdown preload
  const [carriers, setCarriers] = useState<any[]>([]);
  const [partners, setPartners] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);

  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [selected, setSelected] = useState<IOrder | null>(null);

  const { showNotification } = useNotification();
  const debouncedSearch = useMemo(() => debounce((v) => setKeyword(v), 500), []);

  useEffect(() => {
    getCarriersApi().then((res) => setCarriers(res?.data?.data?.data || []));
    getPartnersApi().then((res) => setPartners(res?.data?.data?.data || []));
    getServicesApi().then((res) => setServices(res?.data?.data?.data || []));
    getSuppliersApi().then((res) => setSuppliers(res?.data?.data?.data || []));
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await searchOrdersApi({
        keyword,
        page: page + 1,
        perPage: pageSize,
        carrierId: carrierIdFilter,
        partnerId: partnerIdFilter,
        serviceId: serviceIdFilter,
        supplierId: supplierIdFilter,
        status: statusFilter,
      });
      setOrders(res?.data?.data?.data || []);
      setTotal(res?.data?.data?.meta?.total || 0);
    } catch (err) {
      console.error(err);
      showNotification("Không thể tải danh sách đơn hàng", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [keyword, page, pageSize, carrierIdFilter, partnerIdFilter, serviceIdFilter, supplierIdFilter, statusFilter]);

  const calculateGrossWeight = (row: IOrder) => {
    if (row?.packageDetail?.dimensions && row?.packageDetail?.dimensions.length > 0) {
      const totalGrossWeight = row?.packageDetail?.dimensions.reduce((acc, item) => acc + item.grossWeight, 0);
      return totalGrossWeight;
    }
    return 0;
  };
  const calculateVolumeWeight = (row: IOrder) => {
    if (row?.packageDetail?.dimensions && row?.packageDetail?.dimensions.length > 0) {
      const totalVolumeWeight = row?.packageDetail?.dimensions.reduce((acc, item) => acc + item.volumeWeight, 0);
      return totalVolumeWeight;
    }
    return 0;
  };

  const handleExportExcel = () => {
    const data = orders.map((c) => ({
      HAWB: c.trackingCode,
      AWB: c.carrierAirWaybillCode,
      DATE: formatDate(c.createdAt || ""),
      "CUSTOMER NAME": c.partner?.partnerName || "",
      SUPPLIER: typeof c.supplierId === "object" ? c.supplierId?.name : c.supplierId,
      CARRIER: typeof c.carrierId === "object" ? c.carrierId?.name : c.carrierId,
      SERVICE: typeof c.serviceId === "object" ? c.serviceId?.code : c.serviceId,
      TYPE: c.productType,
      DIMENSIONS: c.packageDetail?.dimensions && c.packageDetail?.dimensions?.length > 0 ? c.packageDetail?.dimensions.map((d) => `${d.length}x${d.width}x${d.height}`).join(", ") : "",
      "GROSS WEIGHT": calculateGrossWeight(c),
      "VOLUME WEIGHT": calculateVolumeWeight(c),
      "CHARGE WEIGHT": c.chargeableWeight,
      NOTE: c.note || "",
      "BASE RATE (BUYING RATE)": formatCurrency(c.basePrice?.purchasePrice?.value || 0, c.currency || ECURRENCY.VND),
      "EXTRA FEE (BUY)": formatCurrency(c.extraFees?.extraFeesTotal || 0, c.currency || ECURRENCY.VND),
      "PPXD (BUY)": formatCurrency(c.extraFees?.fscFeeValue?.purchaseFSCFee || 0, c.currency || ECURRENCY.VND),
      "VAT (BUY)": formatCurrency(c.vat?.purchaseVATTotal || 0, c.currency || ECURRENCY.VND),
      "TOTAL (BUY)": formatCurrency(c.totalPrice?.purchaseTotal || 0, c.currency || ECURRENCY.VND),
      "BASE RATE (SELLING RATE)": formatCurrency(c.basePrice?.salePrice?.value || 0, c.currency || ECURRENCY.VND),
      "EXTRA FEE (SELL)": formatCurrency(c.extraFees?.extraFeesTotal || 0, c.currency || ECURRENCY.VND),
      "PPXD (SELL)": formatCurrency(c.extraFees?.fscFeeValue?.saleFSCFee || 0, c.currency || ECURRENCY.VND),
      "VAT (SELL)": formatCurrency(c.vat?.saleVATTotal || 0, c.currency || ECURRENCY.VND),
      "TOTAL (SELL)": formatCurrency(c.totalPrice?.saleTotal || 0, c.currency || ECURRENCY.VND),
      PROFIT: formatCurrency((c.totalPrice?.saleTotal || 0) - (c.totalPrice?.purchaseTotal || 0), c.currency || ECURRENCY.VND),
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    ws["!cols"] = Object.keys(data[0]).map(() => ({ wch: 20 }));

    // Styling header & cell
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
    XLSX.utils.book_append_sheet(wb, ws, "ORDERS");
    XLSX.writeFile(wb, "DANH_SACH_DON_HANG.xlsx");
  };

  // Table columns
  const columns: GridColDef[] = [
    {
      field: "trackingCode",
      headerName: "HAWB",
      flex: 1.1,
      align: "center",
      headerAlign: "center",
      minWidth: 130,
      renderCell: ({ row }) => (
        <Box display="flex" alignItems="center" justifyContent="center" width="100%" height="100%">
          <Typography
            color="primary"
            sx={{ cursor: "pointer", textDecoration: "underline" }}
            onClick={() => {
              setSelected(row);
              setOpenDetailDialog(true);
            }}
          >
            {row.trackingCode}
          </Typography>
        </Box>
      ),
    },
    {
      field: "carrierAirWaybillCode",
      headerName: "AWB",
      align: "center",
      headerAlign: "center",
      minWidth: 130,
      flex: 0.7,
    },
    {
      field: "createdAt",
      headerName: "DATE",
      align: "center",
      headerAlign: "center",
      minWidth: 130,
      flex: 1,
      renderCell: ({ row }) => formatDate(row.createdAt),
    },
    {
      field: "partner",
      headerName: "CUSTOMER NAME",
      align: "center",
      headerAlign: "center",
      minWidth: 150,
      flex: 1,
      renderCell: ({ row }) => row.partner?.partnerName,
    },
    {
      field: "supplierId",
      headerName: "SUPPLIER",
      align: "center",
      headerAlign: "center",
      minWidth: 130,
      flex: 1,
      renderCell: ({ row }) => (typeof row.supplierId === "object" ? row.supplierId?.name : row.supplierId),
    },
    {
      field: "carrierId",
      headerName: "CARRIER",
      align: "center",
      headerAlign: "center",
      minWidth: 130,
      flex: 1,
      renderCell: ({ row }) => (typeof row.carrierId === "object" ? row.carrierId?.name : row.carrierId),
    },
    {
      field: "serviceId",
      headerName: "SERVICE",
      align: "center",
      headerAlign: "center",
      minWidth: 110,
      flex: 1,
      renderCell: ({ row }) => (typeof row.serviceId === "object" ? row.serviceId?.code : row.serviceId),
    },
    {
      field: "productType",
      headerName: "TYPE",
      align: "center",
      headerAlign: "center",
      minWidth: 90,
      flex: 1,
      renderCell: ({ row }) => row.productType,
    },
    {
      field: "packageDetail.dimensions",
      headerName: "DIMENSIONS",
      align: "center",
      headerAlign: "center",
      minWidth: 120,
      flex: 0.7,
      renderCell: ({ row }) =>
        row.packageDetail?.dimensions?.length > 0 ? (
          <Chip
            label={row.packageDetail?.dimensions.map((d: any) => `${d.length}x${d.width}x${d.height}`).join(", ")}
            size="small"
            sx={{
              backgroundColor: grey[500],
              color: "#fff",
              fontWeight: 500,
            }}
          />
        ) : (
          <Chip
            label="N/A"
            size="small"
            sx={{
              backgroundColor: grey[500],
              color: "#fff",
              fontWeight: 500,
            }}
          />
        ),
    },
    {
      field: "grossWeight",
      headerName: "GROSS WEIGHT",
      align: "center",
      headerAlign: "center",
      minWidth: 120,
      flex: 0.7,
      renderCell: ({ row }) => (
        <Chip
          label={calculateGrossWeight(row)}
          size="small"
          sx={{
            backgroundColor: grey[300],
            color: "#fff",
            fontWeight: 500,
          }}
        />
      ),
    },
    {
      field: "volumeWeight",
      headerName: "VOLUME WEIGHT",
      align: "center",
      headerAlign: "center",
      minWidth: 120,
      flex: 0.7,
      renderCell: ({ row }) => (
        <Chip
          label={calculateVolumeWeight(row)}
          size="small"
          sx={{
            backgroundColor: grey[500],
            color: "#fff",
            fontWeight: 500,
          }}
        />
      ),
    },
    {
      field: "chargeableWeight",
      headerName: "CHARGE WEIGHT",
      align: "center",
      headerAlign: "center",
      minWidth: 120,
      flex: 0.7,
      renderCell: ({ value }) => (
        <Chip
          label={value}
          size="small"
          sx={{
            backgroundColor: grey[500],
            color: "#fff",
            fontWeight: 500,
          }}
        />
      ),
    },

    {
      field: "note",
      headerName: "NOTE",
      align: "center",
      headerAlign: "center",
      minWidth: 110,
      flex: 1,
    },
    {
      field: "basePrice.purchasePrice.value",
      headerName: "BASE RATE (BUYING RATE)",
      align: "center",
      headerAlign: "center",
      minWidth: 150,
      flex: 1,
      renderCell: ({ row }) => (
        <Box display="flex" alignItems="center" justifyContent="center" height="100%" sx={{ bgcolor: blue[100] }}>
          <Typography>{formatCurrency(row.basePrice?.purchasePrice?.value, row.currency)}</Typography>
        </Box>
      ),
    },
    {
      field: "extraFees.extraFeesTotalPurchase",
      headerName: "EXTRA FEE",
      align: "center",
      headerAlign: "center",
      minWidth: 120,
      flex: 1,
      renderCell: ({ row }) => (
        <Box display="flex" alignItems="center" justifyContent="center" height="100%" sx={{ bgcolor: blue[100] }}>
          <Typography>{formatCurrency(row.extraFees?.extraFeesTotal, row.currency)}</Typography>
        </Box>
      ),
    },
    {
      field: "extraFees.fscFeeValue.purchaseFSCFee",
      headerName: "PPXD",
      align: "center",
      headerAlign: "center",
      minWidth: 110,
      flex: 1,
      renderCell: ({ row }) => (
        <Box display="flex" alignItems="center" justifyContent="center" height="100%" sx={{ bgcolor: blue[100] }}>
          <Typography>{formatCurrency(row.extraFees?.fscFeeValue?.purchaseFSCFee, row.currency)}</Typography>
        </Box>
      ),
    },
    {
      field: "vat.purchaseVATTotal",
      headerName: "VAT",
      align: "center",
      headerAlign: "center",
      minWidth: 110,
      flex: 1,
      renderCell: ({ row }) => (
        <Box display="flex" alignItems="center" justifyContent="center" height="100%" sx={{ bgcolor: blue[100] }}>
          <Typography>{formatCurrency(row.vat?.purchaseVATTotal, row.currency)}</Typography>
        </Box>
      ),
    },
    {
      field: "totalPrice.purchaseTotal",
      headerName: "TOTAL",
      align: "center",
      headerAlign: "center",
      minWidth: 110,
      flex: 1,
      renderCell: ({ row }) => (
        <Box display="flex" alignItems="center" justifyContent="center" height="100%" sx={{ bgcolor: blue[100] }}>
          <Typography>{formatCurrency(row.totalPrice?.purchaseTotal, row.currency)}</Typography>
        </Box>
      ),
    },
    {
      field: "basePrice.salePrice.value",
      headerName: "BASE RATE (SELLING RATE)",
      align: "center",
      headerAlign: "center",
      minWidth: 110,
      flex: 1,
      renderCell: ({ row }) => (
        <Box display="flex" alignItems="center" justifyContent="center" height="100%" sx={{ bgcolor: green[100] }}>
          <Typography>{formatCurrency(row.basePrice?.purchasePrice?.value, row.currency)}</Typography>
        </Box>
      ),
    },
    {
      field: "extraFees.extraFeesTotal",
      headerName: "EXTRA FEE",
      align: "center",
      headerAlign: "center",
      minWidth: 110,
      flex: 1,
      renderCell: ({ row }) => (
        <Box display="flex" alignItems="center" justifyContent="center" height="100%" sx={{ bgcolor: green[100] }}>
          <Typography>{formatCurrency(row.extraFees?.extraFeesTotal, row.currency)}</Typography>
        </Box>
      ),
    },
    {
      field: "extraFees.fscFeeValue.saleFSCFee",
      headerName: "PPXD",
      align: "center",
      headerAlign: "center",
      minWidth: 110,
      flex: 1,
      renderCell: ({ row }) => (
        <Box display="flex" alignItems="center" justifyContent="center" height="100%" sx={{ bgcolor: green[100] }}>
          <Typography>{formatCurrency(row.extraFees?.fscFeeValue?.saleFSCFee, row.currency)}</Typography>
        </Box>
      ),
    },
    {
      field: "vat.saleVATTotal",
      headerName: "VAT",
      align: "center",
      headerAlign: "center",
      minWidth: 110,
      flex: 1,
      renderCell: ({ row }) => (
        <Box display="flex" alignItems="center" justifyContent="center" height="100%" sx={{ bgcolor: green[100] }}>
          <Typography>{formatCurrency(row.vat?.saleVATTotal, row.currency)}</Typography>
        </Box>
      ),
    },
    {
      field: "totalPrice.saleTotal",
      headerName: "TOTAL",
      align: "center",
      headerAlign: "center",
      minWidth: 110,
      flex: 1,

      renderCell: ({ row }) => (
        <Box display="flex" alignItems="center" justifyContent="center" height="100%" sx={{ bgcolor: green[100] }}>
          <Typography>{formatCurrency(row.totalPrice?.saleTotal, row.currency)}</Typography>
        </Box>
      ),
    },
    {
      field: "profit",
      headerName: "PROFIT",
      align: "center",
      headerAlign: "center",
      minWidth: 110,
      flex: 1,
      renderCell: ({ row }) => (
        <Box display="flex" alignItems="center" justifyContent="center" height="100%" sx={{ bgcolor: pink[100] }}>
          <Typography>{formatCurrency(row.totalPrice?.saleTotal - row.totalPrice.purchaseTotal, row.currency)}</Typography>
        </Box>
      ),
    },
    {
      field: "orderStatus",
      headerName: "Status",
      align: "center",
      headerAlign: "center",
      minWidth: 110,
      flex: 1,
      renderCell: ({ value }) => <EnumChip type="orderStatus" value={value} />,
    },

    {
      field: "actions",
      headerName: "",
      width: 70,
      renderCell: ({ row }) => (
        <ActionMenu
          onEdit={() => {
            setSelected(row);
            setOpenUpdateDialog(true);
          }}
          onLockUnlock={() => handleLockToggle(row)}
          onDelete={() => handleDelete(row)}
          onCaculatePriceOrder={() => {
            setSelected(row);
            handleCalculatePrice();
          }}
          status={row.orderStatus}
        />
      ),
    },
  ];

  const handleLockToggle = async (item: IOrder) => {
    try {
      if (!item._id) return;
      const confirm = window.confirm(item.status === ERECORD_STATUS.Active ? "Khoá đơn hàng này?" : "Mở khoá đơn này?");
      if (!confirm) return;
      const res = item.status === ERECORD_STATUS.Active ? await lockOrderApi(item._id) : await unlockOrderApi(item._id);
      showNotification(res?.data?.message || "Cập nhật thành công", "success");
      fetchData();
    } catch (err: any) {
      showNotification(err.message || "Lỗi cập nhật trạng thái", "error");
    }
  };

  const handleDelete = async (item: IOrder) => {
    if (!item._id) return;
    if (!window.confirm("Bạn có chắc muốn xoá đơn hàng này?")) return;
    try {
      await deleteOrderApi(item._id);
      showNotification("Đã xoá thành công", "success");
      fetchData();
    } catch (err: any) {
      showNotification(err.message || "Lỗi khi xoá", "error");
    }
  };

  const handleCalculatePrice = () => {
    if (!selected?._id) return;
    calculateOrderTotalApi(selected._id);
  };

  return (
    <Box className="space-y-4 p-6">
      <Box display="flex" flexWrap="wrap" gap={1} justifyContent="space-between" alignItems="center">
        <TextField placeholder="Tìm kiếm, tracking..." size="small" onChange={(e) => debouncedSearch(e.target.value)} sx={{ minWidth: 250 }} />
        <Stack direction="row" spacing={1} overflow={"auto"}>
          <Button variant="outlined" startIcon={<Download />} onClick={handleExportExcel}>
            Xuất Excel
          </Button>
          <Button variant="contained" startIcon={<Add />} onClick={() => setOpenCreateDialog(true)}>
            Tạo mới
          </Button>
        </Stack>
        <Stack direction="row" spacing={1} overflow={"auto"}>
          <Select size="small" value={partnerIdFilter} onChange={(e) => setPartnerIdFilter(e.target.value)} displayEmpty sx={{ minWidth: 140 }}>
            <MenuItem value="">Tất cả Partner</MenuItem>
            {partners?.map((s) => (
              <MenuItem key={s._id} value={s._id}>
                {s.name}
              </MenuItem>
            ))}
          </Select>
          <Select size="small" value={carrierIdFilter} onChange={(e) => setCarrierIdFilter(e.target.value)} displayEmpty sx={{ minWidth: 140 }}>
            <MenuItem value="">Tất cả Hãng</MenuItem>
            {carriers?.map((c) => (
              <MenuItem key={c._id} value={c._id}>
                {c.name}
              </MenuItem>
            ))}
          </Select>
          <Select size="small" value={serviceIdFilter} onChange={(e) => setServiceIdFilter(e.target.value)} displayEmpty sx={{ minWidth: 140 }}>
            <MenuItem value="">Tất cả Dịch vụ</MenuItem>
            {services?.map((s) => (
              <MenuItem key={s._id} value={s._id}>
                {s.code}
              </MenuItem>
            ))}
          </Select>
          <Select size="small" value={supplierIdFilter} onChange={(e) => setSupplierIdFilter(e.target.value)} displayEmpty sx={{ minWidth: 140 }}>
            <MenuItem value="">Tất cả Supplier</MenuItem>
            {suppliers?.map((s) => (
              <MenuItem key={s._id} value={s._id}>
                {s.name}
              </MenuItem>
            ))}
          </Select>
          <Select size="small" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} displayEmpty sx={{ minWidth: 120 }}>
            <MenuItem value="">Mặc định</MenuItem>
            <MenuItem value="all">Tất cả</MenuItem>
            <MenuItem value={EORDER_STATUS.Pending}>Chờ xử lý</MenuItem>
            <MenuItem value={EORDER_STATUS.Confirmed}>Đã xác nhận</MenuItem>
            <MenuItem value={EORDER_STATUS.InTransit}>Đang vận chuyển</MenuItem>
            <MenuItem value={EORDER_STATUS.Delivered}>Đã giao</MenuItem>
            <MenuItem value={EORDER_STATUS.Cancelled}>Đã huỷ</MenuItem>
          </Select>
        </Stack>
      </Box>
      {loading ? (
        <Box textAlign="center">
          <CircularProgress />
        </Box>
      ) : (
        <DataGrid
          rows={orders.map((r) => ({ ...r, id: r._id }))}
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
      <CreateOrderDialog
        open={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
        onCreated={() => {
          fetchData();
          setOpenCreateDialog(false);
        }}
      />
      <UpdateOrderDialog open={openUpdateDialog} onClose={() => setOpenUpdateDialog(false)} onUpdated={fetchData} order={selected} />
      <OrderDetailDialog open={openDetailDialog} onClose={() => setOpenDetailDialog(false)} order={selected} />
    </Box>
  );
}
