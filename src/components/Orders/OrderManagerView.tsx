"use client";

import { useState, useEffect, useMemo, useRef } from "react";
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
import { searchOrdersApi, deleteOrderApi, lockOrderApi, unlockOrderApi } from "@/utils/apis/apiOrder";
import CreateOrderDialog from "./CreateOrderDialog";
import UpdateOrderDialog from "./UpdateOrderDialog";
import OrderDetailDialog from "./OrderDetailDialog";
import { ECURRENCY, EORDER_STATUS, ERECORD_STATUS } from "@/types/typeGlobals";
import { formatDate } from "@/utils/hooks/hookDate";
import { blue, green, grey, pink } from "@mui/material/colors";
import { formatCurrency } from "@/utils/hooks/hookCurrency";
import BillPrintDialog from "@/components/Bill/BillPrintDialog";
import BillShippingMarkDialog from "@/components/Bill/BillShippingMarkDialog";

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

  // Bill
  const billPopupRef = useRef<any>(null);
  const shippingMarkPopupRef = useRef<any>(null);
  const [openBillDialog, setOpenBillDialog] = useState(false);
  const [openShippingMarkDialog, setOpenShippingMarkDialog] = useState(false);

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
  useEffect(() => {
    if (openBillDialog && selected && billPopupRef.current) {
      billPopupRef.current.open();
      setOpenBillDialog(false);
    }
  }, [openBillDialog, selected]);
  useEffect(() => {
    if (openShippingMarkDialog && selected && shippingMarkPopupRef.current) {
      shippingMarkPopupRef.current.open();
      setOpenShippingMarkDialog(false);
    }
  }, [openShippingMarkDialog, selected]);

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
      showNotification("Failed to load orders list", "error");
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
      "SUB CARRIER": typeof c.carrierId === "object" ? c.carrierId?.name : c.carrierId,
      SERVICE: typeof c.serviceId === "object" ? c.serviceId?.code : c.serviceId,
      DESTINATION: c.recipient?.country?.name || "",
      TYPE: c.productType,
      DIMENSIONS: c.packageDetail?.dimensions && c.packageDetail?.dimensions?.length > 0 ? c.packageDetail?.dimensions.map((d) => `${d.length}x${d.width}x${d.height}`).join(", ") : "",
      "GROSS WEIGHT": calculateGrossWeight(c),
      "VOLUME WEIGHT": calculateVolumeWeight(c),
      "CHARGE WEIGHT": c.chargeableWeight,
      NOTE: c.note || "",
      "BASE RATE (BUYING RATE)": formatCurrency(c.basePrice?.purchasePrice?.value || 0, c.currency || ECURRENCY.VND),
      "EXTRA FEE (BUYING)": formatCurrency(c.extraFees?.extraFeesTotal || 0, c.currency || ECURRENCY.VND),
      "FSC (BUYING)": formatCurrency(c.extraFees?.fscFeeValue?.purchaseFSCFee || 0, c.currency || ECURRENCY.VND),
      "VAT (BUYING)": formatCurrency(c.vat?.purchaseVATTotal || 0, c.currency || ECURRENCY.VND),
      "TOTAL (BUYING)": formatCurrency(c.totalPrice?.purchaseTotal || 0, c.currency || ECURRENCY.VND),
      "BASE RATE (SELLING RATE)": formatCurrency(c.basePrice?.salePrice?.value || 0, c.currency || ECURRENCY.VND),
      "EXTRA FEE (SELLING)": formatCurrency(c.extraFees?.extraFeesTotal || 0, c.currency || ECURRENCY.VND),
      "FSC (SELLING)": formatCurrency(c.extraFees?.fscFeeValue?.saleFSCFee || 0, c.currency || ECURRENCY.VND),
      "VAT (SELLING)": formatCurrency(c.vat?.saleVATTotal || 0, c.currency || ECURRENCY.VND),
      "TOTAL (SELLING)": formatCurrency(c.totalPrice?.saleTotal || 0, c.currency || ECURRENCY.VND),
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
    XLSX.writeFile(wb, "ORDER_LIST.xlsx");
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
      headerName: "SUB CARRIER",
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
    // ----- DESTINATION COLUMN ADDED HERE -----
    {
      field: "destination",
      headerName: "DESTINATION",
      align: "center",
      headerAlign: "center",
      minWidth: 220,
      flex: 1,
      renderCell: ({ row }) =>
        row.recipient?.country?.code || row.recipient?.country?.name ? (
          <Chip
            label={`${row.recipient?.country?.name || ""} (${row.recipient?.country?.code || ""})`}
            size="small"
            sx={{
              backgroundColor: blue[200],
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
    // ------------------------------------------
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
      minWidth: 160,
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
      minWidth: 160,
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
      minWidth: 140,
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
      headerName: "BASE RATE (BUYING)",
      align: "center",
      headerAlign: "center",
      minWidth: 180,
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
      minWidth: 150,
      flex: 1,
      renderCell: ({ row }) => (
        <Box display="flex" alignItems="center" justifyContent="center" height="100%" sx={{ bgcolor: blue[100] }}>
          <Typography>{formatCurrency(row.extraFees?.extraFeesTotal, row.currency)}</Typography>
        </Box>
      ),
    },
    {
      field: "extraFees.fscFeeValue.purchaseFSCFee",
      headerName: "FSC (BUYING)",
      align: "center",
      headerAlign: "center",
      minWidth: 150,
      flex: 1,
      renderCell: ({ row }) => (
        <Box display="flex" alignItems="center" justifyContent="center" height="100%" sx={{ bgcolor: blue[100] }}>
          <Typography>{formatCurrency(row.extraFees?.fscFeeValue?.purchaseFSCFee, row.currency)}</Typography>
        </Box>
      ),
    },
    {
      field: "vat.purchaseVATTotal",
      headerName: "VAT (BUYING)",
      align: "center",
      headerAlign: "center",
      minWidth: 150,
      flex: 1,
      renderCell: ({ row }) => (
        <Box display="flex" alignItems="center" justifyContent="center" height="100%" sx={{ bgcolor: blue[100] }}>
          <Typography>{formatCurrency(row.vat?.purchaseVATTotal, row.currency)}</Typography>
        </Box>
      ),
    },
    {
      field: "totalPrice.purchaseTotal",
      headerName: "TOTAL (BUYING)",
      align: "center",
      headerAlign: "center",
      minWidth: 150,
      flex: 1,
      renderCell: ({ row }) => (
        <Box display="flex" alignItems="center" justifyContent="center" height="100%" sx={{ bgcolor: blue[100] }}>
          <Typography>{formatCurrency(row.totalPrice?.purchaseTotal, row.currency)}</Typography>
        </Box>
      ),
    },
    {
      field: "basePrice.salePrice.value",
      headerName: "BASE RATE (SELLING)",
      align: "center",
      headerAlign: "center",
      minWidth: 180,
      flex: 1,
      renderCell: ({ row }) => (
        <Box display="flex" alignItems="center" justifyContent="center" height="100%" sx={{ bgcolor: green[100] }}>
          <Typography>{formatCurrency(row.basePrice?.salePrice?.value, row.currency)}</Typography>
        </Box>
      ),
    },
    {
      field: "extraFees.extraFeesTotal",
      headerName: "EXTRA FEE (SELLING)",
      align: "center",
      headerAlign: "center",
      minWidth: 180,
      flex: 1,
      renderCell: ({ row }) => (
        <Box display="flex" alignItems="center" justifyContent="center" height="100%" sx={{ bgcolor: green[100] }}>
          <Typography>{formatCurrency(row.extraFees?.extraFeesTotal, row.currency)}</Typography>
        </Box>
      ),
    },
    {
      field: "extraFees.fscFeeValue.saleFSCFee",
      headerName: "FSC (SELLING)",
      align: "center",
      headerAlign: "center",
      minWidth: 150,
      flex: 1,
      renderCell: ({ row }) => (
        <Box display="flex" alignItems="center" justifyContent="center" height="100%" sx={{ bgcolor: green[100] }}>
          <Typography>{formatCurrency(row.extraFees?.fscFeeValue?.saleFSCFee, row.currency)}</Typography>
        </Box>
      ),
    },
    {
      field: "vat.saleVATTotal",
      headerName: "VAT (SELLING)",
      align: "center",
      headerAlign: "center",
      minWidth: 150,
      flex: 1,
      renderCell: ({ row }) => (
        <Box display="flex" alignItems="center" justifyContent="center" height="100%" sx={{ bgcolor: green[100] }}>
          <Typography>{formatCurrency(row.vat?.saleVATTotal, row.currency)}</Typography>
        </Box>
      ),
    },
    {
      field: "totalPrice.saleTotal",
      headerName: "TOTAL (SELLING)",
      align: "center",
      headerAlign: "center",
      minWidth: 150,
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
      minWidth: 160,
      flex: 1,
      renderCell: ({ row }) => (
        <Box display="flex" alignItems="center" justifyContent="center" height="100%" sx={{ bgcolor: pink[100] }}>
          <Typography>{formatCurrency(row.totalPrice?.saleTotal - row.totalPrice.purchaseTotal, row.currency)}</Typography>
        </Box>
      ),
    },
    {
      field: "orderStatus",
      headerName: "STATUS",
      align: "center",
      headerAlign: "center",
      minWidth: 110,
      flex: 1,
      renderCell: ({ value }) => <EnumChip type="orderStatus" value={value} />,
    },

    {
      field: "actions",
      headerName: "",
      width: 260,
      renderCell: ({ row }) => (
        <Stack direction="row" height={"100%"} spacing={1} gap={1} justifyContent="center" alignItems="center">
          <Button
            size="small"
            variant="outlined"
            color="primary"
            onClick={() => {
              setSelected(row);
              setOpenBillDialog(true);
            }}
          >
            Print Bill
          </Button>
          <Button
            size="small"
            variant="outlined"
            color="secondary"
            onClick={() => {
              setSelected(row);
              setOpenShippingMarkDialog(true);
            }}
          >
            Print Mark
          </Button>
          <ActionMenu
            onEdit={() => {
              setSelected(row);
              setOpenUpdateDialog(true);
            }}
            onLockUnlock={() => handleLockToggle(row)}
            onDelete={() => handleDelete(row)}
            status={row.orderStatus}
          />
        </Stack>
      ),
    },
  ];

  const handleLockToggle = async (item: IOrder) => {
    try {
      if (!item._id) return;
      const confirm = window.confirm(item.status === ERECORD_STATUS.Active ? "Lock this order?" : "Unlock this order?");
      if (!confirm) return;
      const res = item.status === ERECORD_STATUS.Active ? await lockOrderApi(item._id) : await unlockOrderApi(item._id);
      showNotification(res?.data?.message || "Update successful", "success");
      fetchData();
    } catch (err: any) {
      showNotification(err.message || "Failed to update status", "error");
    }
  };

  const handleDelete = async (item: IOrder) => {
    if (!item._id) return;
    if (!window.confirm("Are you sure you want to delete this order?")) return;
    try {
      await deleteOrderApi(item._id);
      showNotification("Order deleted successfully", "success");
      fetchData();
    } catch (err: any) {
      showNotification(err.message || "Failed to delete", "error");
    }
  };

  return (
    <Box className="space-y-4 p-6">
      <Box display="flex" flexWrap="wrap" gap={1} justifyContent="space-between" alignItems="center">
        <TextField placeholder="Search, tracking..." size="small" onChange={(e) => debouncedSearch(e.target.value)} sx={{ minWidth: 250 }} />
        <Stack direction="row" spacing={1} overflow={"auto"}>
          <Button variant="outlined" startIcon={<Download />} onClick={handleExportExcel}>
            Export Excel
          </Button>
          <Button variant="contained" startIcon={<Add />} onClick={() => setOpenCreateDialog(true)}>
            Create Order
          </Button>
        </Stack>
        <Stack direction="row" spacing={1} overflow={"auto"}>
          <Select size="small" value={partnerIdFilter} onChange={(e) => setPartnerIdFilter(e.target.value)} displayEmpty sx={{ minWidth: 140 }}>
            <MenuItem value="">All Customers</MenuItem>
            {partners?.map((s) => (
              <MenuItem key={s._id} value={s._id}>
                {s.name}
              </MenuItem>
            ))}
          </Select>
          <Select size="small" value={carrierIdFilter} onChange={(e) => setCarrierIdFilter(e.target.value)} displayEmpty sx={{ minWidth: 140 }}>
            <MenuItem value="">All Sub Carriers</MenuItem>
            {carriers?.map((c) => (
              <MenuItem key={c._id} value={c._id}>
                {c.name}
              </MenuItem>
            ))}
          </Select>
          <Select size="small" value={serviceIdFilter} onChange={(e) => setServiceIdFilter(e.target.value)} displayEmpty sx={{ minWidth: 140 }}>
            <MenuItem value="">All Services</MenuItem>
            {services?.map((s) => (
              <MenuItem key={s._id} value={s._id}>
                {s.code}
              </MenuItem>
            ))}
          </Select>
          <Select size="small" value={supplierIdFilter} onChange={(e) => setSupplierIdFilter(e.target.value)} displayEmpty sx={{ minWidth: 140 }}>
            <MenuItem value="">All Suppliers</MenuItem>
            {suppliers?.map((s) => (
              <MenuItem key={s._id} value={s._id}>
                {s.name}
              </MenuItem>
            ))}
          </Select>
          <Select size="small" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} displayEmpty sx={{ minWidth: 120 }}>
            <MenuItem value="">Default</MenuItem>
            <MenuItem value="all">All</MenuItem>
            <MenuItem value={EORDER_STATUS.Pending}>Pending</MenuItem>
            <MenuItem value={EORDER_STATUS.Confirmed}>Confirmed</MenuItem>
            <MenuItem value={EORDER_STATUS.InTransit}>In Transit</MenuItem>
            <MenuItem value={EORDER_STATUS.Delivered}>Delivered</MenuItem>
            <MenuItem value={EORDER_STATUS.Cancelled}>Cancelled</MenuItem>
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
      <BillPrintDialog ref={billPopupRef} data={selected} />
      <BillShippingMarkDialog ref={shippingMarkPopupRef} data={selected} />
    </Box>
  );
}
