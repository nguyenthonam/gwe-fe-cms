"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Box, Button, Stack, TextField, Select, MenuItem, CircularProgress, Typography, Chip, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { Add, Download, Edit, Delete } from "@mui/icons-material";
import { DataGrid, GridColDef, GridRowId } from "@mui/x-data-grid";
import debounce from "lodash/debounce";
import * as XLSX from "sheetjs-style";

import { IOrder, IFilterOrder } from "@/types/typeOrder";
import { useNotification } from "@/contexts/NotificationProvider";
import { EnumChip } from "@/components/Globals/EnumChip";
import { ActionMenu } from "@/components/Globals/ActionMenu";
import { getCarriersApi } from "@/utils/apis/apiCarrier";
import { getPartnersApi } from "@/utils/apis/apiPartner";
import { getSuppliersApi } from "@/utils/apis/apiSupplier";
import { getServicesApi } from "@/utils/apis/apiService";
import { searchOrdersApi, deleteOrderApi, deleteOrdersApi, bulkUpdateOrdersApi } from "@/utils/apis/apiOrder";
import CreateOrderDialog from "./CreateOrderDialog";
import UpdateOrderDialog from "./UpdateOrderDialog";
import OrderDetailDialog from "./OrderDetailDialog";
import { formatDate } from "@/utils/hooks/hookDate";
import { blue, green, grey, pink } from "@mui/material/colors";
import { formatCurrency } from "@/utils/hooks/hookCurrency";
import BillPrintDialog from "@/components/Bill/BillPrintDialog";
import BillShippingMarkDialog from "@/components/Bill/BillShippingMarkDialog";
import { ECURRENCY, EORDER_STATUS, EPRODUCT_TYPE } from "@/types/typeGlobals";
import CountrySelect from "@/components/Globals/CountrySelect";

/* ===========================================================
   Legacy -> FE normalize (không đổi type FE, chỉ chuẩn hóa data)
   =========================================================== */
const normalizeOrderLegacyToFE = (raw: any): IOrder => {
  const currency: ECURRENCY = raw?.currency ?? raw?.basePrice?.purchasePrice?.currency ?? raw?.basePrice?.salePrice?.currency ?? ECURRENCY.VND;

  const surchargeItems = Array.isArray(raw?.surcharges) ? raw.surcharges : [];
  const surchargeTotal = raw?.surchargeTotal ?? 0;

  return {
    // IBaseRecord
    _id: raw?._id,
    status: raw?.status,
    createdAt: raw?.createdAt,
    updatedAt: raw?.updatedAt,
    _creator: raw?._creator,

    trackingCode: raw?.trackingCode ?? null,
    carrierAirWaybillCode: raw?.carrierAirWaybillCode ?? null,

    partner: raw?.partner
      ? {
          partnerId: (raw.partner?.partnerId ? String(raw.partner.partnerId) : null) as any,
          partnerName: raw.partner?.partnerName ?? "",
        }
      : null,

    carrierId: raw?.carrierId ?? null,
    serviceId: raw?.serviceId ?? null,
    supplierId: raw?.supplierId ?? null,

    productType: raw?.productType ?? null,

    sender: raw?.sender ?? null,
    recipient: raw?.recipient ?? null,

    packageDetail: raw?.packageDetail ?? null,
    note: raw?.note ?? null,
    zone: raw?.zone ?? null,
    chargeableWeight: raw?.chargeableWeight ?? null,
    exportDate: raw?.exportDate ?? null,

    // pricing?: để optional; UI hiển thị dùng fallback legacy helpers
    pricing: undefined,

    // Map đúng type FE hiện tại
    surcharges: {
      items: surchargeItems,
      total: surchargeTotal,
    },

    // Giữ lại các block legacy để UI hiển thị qua helper
    // (gắn tạm trên object, không đổi type FE)
    basePrice: raw?.basePrice,
    extraFees: {
      ...(raw?.extraFees || {}),
      extraFeeIds: Array.isArray(raw?.extraFees?.extraFeeIds) ? raw.extraFees.extraFeeIds.map((x: any) => String(x)) : [],
    },
    vat: raw?.vat,
    totalPrice: raw?.totalPrice,

    orderStatus: raw?.orderStatus ?? null,
    currency: currency ?? null,

    cancelReason: raw?.cancelReason ?? null,
    cancelledBy: raw?.cancelledBy ?? null,
    cancelledAt: raw?.cancelledAt ?? null,
    timeline: raw?.timeline ?? [],
  } as IOrder;
};

/* ===========================================================
   Helpers hiển thị pricing (fallback legacy schema)
   =========================================================== */
const getCurrency = (o: IOrder) => o.pricing?.currency ?? o.currency ?? (o as any)?.basePrice?.purchasePrice?.currency ?? (o as any)?.basePrice?.salePrice?.currency ?? ECURRENCY.VND;

const getPurchaseBase = (o: IOrder) => o.pricing?.basePrice?.purchase?.system ?? (o as any)?.basePrice?.purchasePrice?.value ?? 0;

const getSaleBase = (o: IOrder) => o.pricing?.basePrice?.sale?.system ?? (o as any)?.basePrice?.salePrice?.value ?? 0;

const getExtraFeesTotal = (o: IOrder) => o.pricing?.extraFeeTotal?.system ?? (o as any)?.extraFees?.extraFeesTotal ?? 0;

// FSC tách BUY/SELL theo legacy
const getFscPurchase = (o: IOrder) => o.pricing?.fscFee?.system ?? (o as any)?.extraFees?.fscFeeValue?.purchaseFSCFee ?? 0;

const getFscSale = (o: IOrder) => o.pricing?.fscFee?.system ?? (o as any)?.extraFees?.fscFeeValue?.saleFSCFee ?? 0;

// VAT tách BUY/SELL theo legacy
const getVatPurchase = (o: IOrder) => o.pricing?.vat?.system ?? (o as any)?.vat?.purchaseVATTotal ?? 0;

const getVatSale = (o: IOrder) => o.pricing?.vat?.system ?? (o as any)?.vat?.saleVATTotal ?? 0;

const getTotalPurchase = (o: IOrder) => o.pricing?.total?.purchase?.system ?? (o as any)?.totalPrice?.purchaseTotal ?? 0;

const getTotalSale = (o: IOrder) => o.pricing?.total?.sale?.system ?? (o as any)?.totalPrice?.saleTotal ?? 0;

/* ===========================================================
   Bulk Update Dialog (đơn giản: orderStatus, serviceId, supplierId)
   =========================================================== */
function BulkUpdateDialog({
  open,
  onClose,
  onSubmit,
  services,
  suppliers,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (update: Record<string, any>) => void;
  services: any[];
  suppliers: any[];
}) {
  const [orderStatus, setOrderStatus] = useState<EORDER_STATUS | "">("");
  const [serviceId, setServiceId] = useState<string>("");
  const [supplierId, setSupplierId] = useState<string>("");

  const handleSubmit = () => {
    const update: Record<string, any> = {};
    if (orderStatus) update.orderStatus = orderStatus;
    if (serviceId) update.serviceId = serviceId;
    if (supplierId) update.supplierId = supplierId;
    onSubmit(update);
  };

  useEffect(() => {
    if (!open) {
      setOrderStatus("");
      setServiceId("");
      setSupplierId("");
    }
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Bulk Update Orders</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} mt={1}>
          <Select size="small" value={orderStatus} onChange={(e) => setOrderStatus(e.target.value as EORDER_STATUS | "")} displayEmpty>
            <MenuItem value="">(Keep current)</MenuItem>
            <MenuItem value={EORDER_STATUS.Pending}>Pending</MenuItem>
            <MenuItem value={EORDER_STATUS.Confirmed}>Confirmed</MenuItem>
            <MenuItem value={EORDER_STATUS.InTransit}>In Transit</MenuItem>
            <MenuItem value={EORDER_STATUS.Delivered}>Delivered</MenuItem>
            <MenuItem value={EORDER_STATUS.Cancelled}>Cancelled</MenuItem>
          </Select>

          <Select size="small" value={serviceId} onChange={(e) => setServiceId(e.target.value)} displayEmpty>
            <MenuItem value="">(Keep current) Service</MenuItem>
            {services?.map((s) => (
              <MenuItem key={s._id} value={s._id}>
                {s.code} — {s.name}
              </MenuItem>
            ))}
          </Select>

          <Select size="small" value={supplierId} onChange={(e) => setSupplierId(e.target.value)} displayEmpty>
            <MenuItem value="">(Keep current) Supplier</MenuItem>
            {suppliers?.map((s) => (
              <MenuItem key={s._id} value={s._id}>
                {s.name}
              </MenuItem>
            ))}
          </Select>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" startIcon={<Edit />}>
          Update
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/* ===========================================================
   Main component
   =========================================================== */
export default function OrderManagerView() {
  const [orders, setOrders] = useState<IOrder[]>([]);

  // --- Filters ---
  const [keyword, setKeyword] = useState("");
  const [carrierIdFilter, setCarrierIdFilter] = useState("");
  const [partnerIdFilter, setPartnerIdFilter] = useState("");
  const [serviceIdFilter, setServiceIdFilter] = useState("");
  const [supplierIdFilter, setSupplierIdFilter] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState<"" | "all" | EORDER_STATUS>("");
  const [productTypeFilter, setProductTypeFilter] = useState<"" | EPRODUCT_TYPE>("");
  const [destCountryCode, setDestCountryCode] = useState<string>(""); // Nước đến (code)
  const [hawbFilter, setHawbFilter] = useState<string>(""); // trackingCode
  const [cawbFilter, setCawbFilter] = useState<string>(""); // carrierAirWaybillCode

  // --- Pagination ---
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // --- Selections ---
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

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
  const [openBulkUpdateDialog, setOpenBulkUpdateDialog] = useState(false);
  const [selected, setSelected] = useState<IOrder | null>(null);

  const { showNotification } = useNotification();
  const debouncedSearch = useMemo(() => debounce((v) => setKeyword(v), 500), []);

  // preload dropdowns
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

  const buildOrderFilters = (all = false): IFilterOrder => ({
    keyword,
    page: all ? 1 : page + 1,
    perPage: all ? 100000 : pageSize,
    partnerId: partnerIdFilter || undefined,
    carrierId: carrierIdFilter || undefined,
    serviceId: serviceIdFilter || undefined,
    supplierId: supplierIdFilter || undefined,
    orderStatus: orderStatusFilter && orderStatusFilter !== "all" ? (orderStatusFilter as EORDER_STATUS) : undefined,
    productType: (productTypeFilter as EPRODUCT_TYPE) || undefined,
    countryCode: destCountryCode || undefined,
    trackingCode: hawbFilter || undefined,
    carrierAirWaybillCode: cawbFilter || undefined,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const params: IFilterOrder = buildOrderFilters(false);
      const body = await searchOrdersApi(params); // body = res.data
      const raw = body?.data?.data || [];
      const normalized: IOrder[] = raw.map((o: any) => normalizeOrderLegacyToFE(o));
      setOrders(normalized);
      setTotal(body?.data?.meta?.total || 0);
    } catch (err: any) {
      console.error(err);
      showNotification(err?.message || "Failed to load orders list", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword, page, pageSize, carrierIdFilter, partnerIdFilter, serviceIdFilter, supplierIdFilter, orderStatusFilter, productTypeFilter, hawbFilter, cawbFilter, destCountryCode]);

  const calculateGrossWeight = (row: IOrder) => {
    if (row?.packageDetail?.dimensions && row?.packageDetail?.dimensions.length > 0) {
      const totalGrossWeight = row?.packageDetail?.dimensions.reduce((acc: number, item: any) => acc + (item.grossWeight || 0), 0);
      return totalGrossWeight;
    }
    return 0;
  };
  const calculateVolumeWeight = (row: IOrder) => {
    if (row?.packageDetail?.dimensions && row?.packageDetail?.dimensions.length > 0) {
      const totalVolumeWeight = row?.packageDetail?.dimensions.reduce((acc: number, item: any) => acc + (item.volumeWeight || 0), 0);
      return totalVolumeWeight;
    }
    return 0;
  };

  const handleExportExcel = async () => {
    try {
      const params: IFilterOrder = { ...buildOrderFilters(true), all: true };
      const body = await searchOrdersApi(params);
      const rawAll: any[] = body?.data?.data || [];
      const all: IOrder[] = rawAll.map((o) => normalizeOrderLegacyToFE(o));

      if (!all.length) {
        showNotification("No data to export", "warning");
        return;
      }

      // Giữ nguyên tiêu đề & thứ tự cột như bản export cũ
      const HEADERS = [
        "HAWB",
        "AWB",
        "DATE",
        "CUSTOMER NAME",
        "SUPPLIER",
        "SUB CARRIER",
        "SERVICE",
        "DESTINATION",
        "TYPE",
        "DIMENSIONS",
        "GROSS WEIGHT",
        "VOLUME WEIGHT",
        "CHARGE WEIGHT",
        "NOTE",
        "BASE RATE (BUYING RATE)",
        "EXTRA FEE (BUYING)",
        "FSC (BUYING)",
        "VAT (BUYING)",
        "TOTAL (BUYING)",
        "BASE RATE (SELLING RATE)",
        "EXTRA FEE (SELLING)",
        "FSC (SELLING)",
        "VAT (SELLING)",
        "TOTAL (SELLING)",
        "PROFIT",
      ];

      // Dữ liệu số/Date thật (không format chuỗi)
      const rowCurrencies: string[] = [];
      const rows = all.map((c) => {
        const cur = getCurrency(c) as unknown as string;
        rowCurrencies.push(cur);
        return {
          HAWB: c.trackingCode || "",
          AWB: c.carrierAirWaybillCode || "",
          DATE: c.createdAt ? new Date(c.createdAt) : null, // Date object
          "CUSTOMER NAME": c.partner?.partnerName || "",
          SUPPLIER: typeof c.supplierId === "object" ? (c.supplierId as any)?.name : (c as any)?.supplierId || "",
          "SUB CARRIER": typeof c.carrierId === "object" ? (c.carrierId as any)?.name : (c as any)?.carrierId || "",
          SERVICE: typeof c.serviceId === "object" ? (c.serviceId as any)?.code : (c as any)?.serviceId || "",
          DESTINATION: c.recipient?.country?.name || "",
          TYPE: c.productType || "",
          DIMENSIONS: c.packageDetail?.dimensions?.length ? c.packageDetail.dimensions.map((d: any) => `${d.length}x${d.width}x${d.height}`).join(", ") : "",
          "GROSS WEIGHT": calculateGrossWeight(c), // number
          "VOLUME WEIGHT": calculateVolumeWeight(c), // number
          "CHARGE WEIGHT": c.chargeableWeight ?? 0, // number
          NOTE: c.note || "",
          // BUYING
          "BASE RATE (BUYING RATE)": getPurchaseBase(c),
          "EXTRA FEE (BUYING)": getExtraFeesTotal(c),
          "FSC (BUYING)": getFscPurchase(c),
          "VAT (BUYING)": getVatPurchase(c),
          "TOTAL (BUYING)": getTotalPurchase(c),
          // SELLING
          "BASE RATE (SELLING RATE)": getSaleBase(c),
          "EXTRA FEE (SELLING)": getExtraFeesTotal(c),
          "FSC (SELLING)": getFscSale(c),
          "VAT (SELLING)": getVatSale(c),
          "TOTAL (SELLING)": getTotalSale(c),
          // PROFIT
          PROFIT: getTotalSale(c) - getTotalPurchase(c),
        };
      });

      const ws = XLSX.utils.json_to_sheet(rows, { header: HEADERS, skipHeader: false, cellDates: true });
      ws["!cols"] = HEADERS.map(() => ({ wch: 22 }));

      const range = XLSX.utils.decode_range(ws["!ref"] || "");
      const headers = HEADERS;
      const colIndexByHeader: Record<string, number> = {};
      headers.forEach((h, i) => (colIndexByHeader[h] = i));

      // Base border: thin cho toàn bảng
      const THIN = { style: "thin", color: { auto: 1 } };
      const BASE_BORDER = { top: THIN, bottom: THIN, left: THIN, right: THIN };

      for (let R = range.s.r; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
          const addr = XLSX.utils.encode_cell({ r: R, c: C });
          if (!ws[addr]) ws[addr] = { t: "s", v: "" } as any;
          const isHeader = R === 0;
          (ws[addr] as any).s = {
            ...(ws[addr] as any).s,
            font: { bold: isHeader, sz: isHeader ? 12 : 11 },
            alignment: {
              horizontal: isHeader ? "center" : "left",
              vertical: "center",
              wrapText: true,
              ...(ws[addr] as any).s?.alignment,
            },
            border: BASE_BORDER,
          };
        }
      }

      // Định dạng kiểu dữ liệu: DATE/WEIGHT/MONEY
      const WEIGHT_COLS = ["GROSS WEIGHT", "VOLUME WEIGHT", "CHARGE WEIGHT"];
      const MONEY_COLS = [
        "BASE RATE (BUYING RATE)",
        "EXTRA FEE (BUYING)",
        "FSC (BUYING)",
        "VAT (BUYING)",
        "TOTAL (BUYING)",
        "BASE RATE (SELLING RATE)",
        "EXTRA FEE (SELLING)",
        "FSC (SELLING)",
        "VAT (SELLING)",
        "TOTAL (SELLING)",
        "PROFIT",
      ];
      const moneyFormatFor = (currency: string) => {
        if (currency === "VND") return '#,##0" ₫"';
        if (currency === "USD") return '#,##0.00" $"';
        return "#,##0.00";
      };

      for (let r = 1; r <= rows.length; r++) {
        const cur = rowCurrencies[r - 1] || "VND";

        // DATE
        if (colIndexByHeader["DATE"] != null) {
          const c = colIndexByHeader["DATE"];
          const addr = XLSX.utils.encode_cell({ r, c });
          const cell = ws[addr];
          if (cell) {
            cell.t = "d";
            (cell as any).z = "dd/mm/yyyy";
            (cell as any).s = {
              ...(cell as any).s,
              alignment: { ...(cell as any).s?.alignment, horizontal: "center" },
            };
          }
        }

        // WEIGHTS -> number 2 decimals
        for (const h of WEIGHT_COLS) {
          const c = colIndexByHeader[h];
          if (c == null) continue;
          const addr = XLSX.utils.encode_cell({ r, c });
          const cell = ws[addr];
          if (cell && cell.v !== "" && cell.v !== null && cell.v !== undefined) {
            cell.t = "n";
            (cell as any).z = "0.00";
            (cell as any).s = {
              ...(cell as any).s,
              alignment: { ...(cell as any).s?.alignment, horizontal: "right" },
            };
          }
        }

        // MONEY -> number theo từng currency
        const zMoney = moneyFormatFor(cur);
        for (const h of MONEY_COLS) {
          const c = colIndexByHeader[h];
          if (c == null) continue;
          const addr = XLSX.utils.encode_cell({ r, c });
          const cell = ws[addr];
          if (cell && cell.v !== "" && cell.v !== null && cell.v !== undefined) {
            cell.t = "n";
            (cell as any).z = zMoney;
            (cell as any).s = {
              ...(cell as any).s,
              alignment: { ...(cell as any).s?.alignment, horizontal: "right" },
            };
          }
        }
      }

      // Header border đậm + Outline đậm
      const MED = { style: "medium", color: { auto: 1 } }; // đổi "thick" nếu muốn đậm hơn
      const rTop = range.s.r;
      const rBottom = range.e.r;
      const cLeft = range.s.c;
      const cRight = range.e.c;

      // Header: border 4 cạnh medium
      for (let c = cLeft; c <= cRight; c++) {
        const addr = XLSX.utils.encode_cell({ r: rTop, c });
        if (!ws[addr]) ws[addr] = { t: "s", v: "" } as any;
        (ws[addr] as any).s = {
          ...(ws[addr] as any).s,
          border: { top: MED, right: MED, bottom: MED, left: MED },
        };
      }

      // Outline: viền ngoài medium
      // Top & Bottom
      for (let c = cLeft; c <= cRight; c++) {
        let addr = XLSX.utils.encode_cell({ r: rTop, c });
        (ws[addr] as any).s = {
          ...(ws[addr] as any).s,
          border: { ...(ws[addr] as any).s?.border, top: MED },
        };
        addr = XLSX.utils.encode_cell({ r: rBottom, c });
        (ws[addr] as any).s = {
          ...(ws[addr] as any).s,
          border: { ...(ws[addr] as any).s?.border, bottom: MED },
        };
      }
      // Left & Right
      for (let r = rTop; r <= rBottom; r++) {
        let addr = XLSX.utils.encode_cell({ r, c: cLeft });
        (ws[addr] as any).s = {
          ...(ws[addr] as any).s,
          border: { ...(ws[addr] as any).s?.border, left: MED },
        };
        addr = XLSX.utils.encode_cell({ r, c: cRight });
        (ws[addr] as any).s = {
          ...(ws[addr] as any).s,
          border: { ...(ws[addr] as any).s?.border, right: MED },
        };
      }

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "ORDERS");
      XLSX.writeFile(wb, "ORDER_LIST.xlsx", { cellDates: true });
    } catch (err: any) {
      console.error(err);
      showNotification(err?.message || "Export failed", "error");
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedIds.length) return;
    if (!window.confirm(`Delete ${selectedIds.length} selected orders?`)) return;
    try {
      const res = await deleteOrdersApi(selectedIds);
      showNotification(res?.data?.message || "Deleted successfully", "success");
      setSelectedIds([]);
      fetchData();
    } catch (err: any) {
      showNotification(err?.message || "Delete failed", "error");
    }
  };
  const handleBulkUpdateSubmit = async (update: Record<string, any>) => {
    if (!selectedIds.length) return;
    if (!Object.keys(update).length) {
      showNotification("No change to update", "warning");
      return;
    }
    try {
      const res = await bulkUpdateOrdersApi(selectedIds, update);
      showNotification(res?.data?.message || "Updated successfully", "success");
      setOpenBulkUpdateDialog(false);
      setSelectedIds([]);
      fetchData();
    } catch (err: any) {
      showNotification(err?.message || "Bulk update failed", "error");
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
      showNotification(err?.message || "Failed to delete", "error");
    }
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
      renderCell: ({ row }) => (typeof row.supplierId === "object" ? (row.supplierId as any)?.name : row.supplierId),
    },
    {
      field: "carrierId",
      headerName: "SUB CARRIER",
      align: "center",
      headerAlign: "center",
      minWidth: 130,
      flex: 1,
      renderCell: ({ row }) => (typeof row.carrierId === "object" ? (row.carrierId as any)?.name : row.carrierId),
    },
    {
      field: "serviceId",
      headerName: "SERVICE",
      align: "center",
      headerAlign: "center",
      minWidth: 110,
      flex: 1,
      renderCell: ({ row }) => (typeof row.serviceId === "object" ? (row.serviceId as any)?.code : row.serviceId),
    },
    {
      field: "destination",
      headerName: "DESTINATION",
      align: "center",
      headerAlign: "center",
      minWidth: 220,
      flex: 1,
      renderCell: ({ row }) =>
        row.recipient?.country?.code || row.recipient?.country?.name ? (
          <Chip label={`${row.recipient?.country?.name || ""} (${row.recipient?.country?.code || ""})`} size="small" sx={{ backgroundColor: blue[200], color: "#fff", fontWeight: 500 }} />
        ) : (
          <Chip label="N/A" size="small" sx={{ backgroundColor: grey[500], color: "#fff", fontWeight: 500 }} />
        ),
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
            sx={{ backgroundColor: grey[500], color: "#fff", fontWeight: 500 }}
          />
        ) : (
          <Chip label="N/A" size="small" sx={{ backgroundColor: grey[500], color: "#fff", fontWeight: 500 }} />
        ),
    },
    {
      field: "grossWeight",
      headerName: "GROSS WEIGHT",
      align: "center",
      headerAlign: "center",
      minWidth: 160,
      flex: 0.7,
      renderCell: ({ row }) => <Chip label={calculateGrossWeight(row)} size="small" sx={{ backgroundColor: grey[300], color: "#fff", fontWeight: 500 }} />,
    },
    {
      field: "volumeWeight",
      headerName: "VOLUME WEIGHT",
      align: "center",
      headerAlign: "center",
      minWidth: 160,
      flex: 0.7,
      renderCell: ({ row }) => <Chip label={calculateVolumeWeight(row)} size="small" sx={{ backgroundColor: grey[500], color: "#fff", fontWeight: 500 }} />,
    },
    {
      field: "chargeableWeight",
      headerName: "CHARGE WEIGHT",
      align: "center",
      headerAlign: "center",
      minWidth: 140,
      flex: 0.7,
      renderCell: ({ value }) => <Chip label={value} size="small" sx={{ backgroundColor: grey[500], color: "#fff", fontWeight: 500 }} />,
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
          <Typography>{formatCurrency(getPurchaseBase(row), getCurrency(row))}</Typography>
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
          <Typography>{formatCurrency(getExtraFeesTotal(row), getCurrency(row))}</Typography>
        </Box>
      ),
    },
    {
      field: "pricing.fscFee.system",
      headerName: "FSC (BUYING)",
      align: "center",
      headerAlign: "center",
      minWidth: 150,
      flex: 1,
      renderCell: ({ row }) => (
        <Box display="flex" alignItems="center" justifyContent="center" height="100%" sx={{ bgcolor: blue[100] }}>
          <Typography>{formatCurrency(getFscPurchase(row), getCurrency(row))}</Typography>
        </Box>
      ),
    },
    {
      field: "pricing.vat.system",
      headerName: "VAT (BUYING)",
      align: "center",
      headerAlign: "center",
      minWidth: 150,
      flex: 1,
      renderCell: ({ row }) => (
        <Box display="flex" alignItems="center" justifyContent="center" height="100%" sx={{ bgcolor: blue[100] }}>
          <Typography>{formatCurrency(getVatPurchase(row), getCurrency(row))}</Typography>
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
          <Typography>{formatCurrency(getTotalPurchase(row), getCurrency(row))}</Typography>
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
          <Typography>{formatCurrency(getSaleBase(row), getCurrency(row))}</Typography>
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
          <Typography>{formatCurrency(getExtraFeesTotal(row), getCurrency(row))}</Typography>
        </Box>
      ),
    },
    {
      field: "pricing.fscFee.system#selling",
      headerName: "FSC (SELLING)",
      align: "center",
      headerAlign: "center",
      minWidth: 150,
      flex: 1,
      renderCell: ({ row }) => (
        <Box display="flex" alignItems="center" justifyContent="center" height="100%" sx={{ bgcolor: green[100] }}>
          <Typography>{formatCurrency(getFscSale(row), getCurrency(row))}</Typography>
        </Box>
      ),
    },
    {
      field: "pricing.vat.system#selling",
      headerName: "VAT (SELLING)",
      align: "center",
      headerAlign: "center",
      minWidth: 150,
      flex: 1,
      renderCell: ({ row }) => (
        <Box display="flex" alignItems="center" justifyContent="center" height="100%" sx={{ bgcolor: green[100] }}>
          <Typography>{formatCurrency(getVatSale(row), getCurrency(row))}</Typography>
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
          <Typography>{formatCurrency(getTotalSale(row), getCurrency(row))}</Typography>
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
          <Typography>{formatCurrency(getTotalSale(row) - getTotalPurchase(row), getCurrency(row))}</Typography>
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
            onDelete={() => handleDelete(row)}
            status={row.orderStatus}
          />
        </Stack>
      ),
    },
  ];

  return (
    <Box className="space-y-4 p-6">
      {/* Filters + actions */}
      <Box display="flex" flexWrap="wrap" gap={1} justifyContent="space-between" alignItems="center">
        <Stack direction="row" spacing={1} flexWrap="wrap">
          <TextField placeholder="Search keyword" size="small" onChange={(e) => debouncedSearch(e.target.value)} sx={{ minWidth: 200 }} />
          <TextField placeholder="HAWB (trackingCode)" size="small" value={hawbFilter} onChange={(e) => setHawbFilter(e.target.value)} sx={{ minWidth: 180 }} />
          <TextField placeholder="CAWB (AWB)" size="small" value={cawbFilter} onChange={(e) => setCawbFilter(e.target.value)} sx={{ minWidth: 160 }} />

          {/* Destination filter: CountrySelect (đẩy countryCode lên API) */}
          <CountrySelect value={destCountryCode} onChange={(country) => setDestCountryCode(country?.code || "")} label="Destination" />
        </Stack>

        <Stack direction="row" spacing={1} overflow={"auto"}>
          <Button variant="outlined" startIcon={<Download />} onClick={handleExportExcel}>
            Export Excel
          </Button>

          {/* Bulk actions đặt ngay cạnh để bạn thao tác nhanh — disable khi chưa chọn */}
          {/* <Button variant="outlined" startIcon={<Edit />} disabled={!selectedIds.length} onClick={() => setOpenBulkUpdateDialog(true)}>
            Bulk Update
          </Button> */}
          <Button variant="outlined" startIcon={<Delete />} color="error" disabled={!selectedIds.length} onClick={handleBulkDelete}>
            Delete
          </Button>

          <Button variant="contained" startIcon={<Add />} onClick={() => setOpenCreateDialog(true)}>
            Create Order
          </Button>
        </Stack>

        <Stack direction="row" spacing={1} overflow={"auto"}>
          <Select size="small" value={productTypeFilter} onChange={(e) => setProductTypeFilter(e.target.value as "" | EPRODUCT_TYPE)} displayEmpty sx={{ minWidth: 140 }}>
            <MenuItem value="">All Types</MenuItem>
            <MenuItem value={EPRODUCT_TYPE.DOCUMENT}>DOX</MenuItem>
            <MenuItem value={EPRODUCT_TYPE.PARCEL}>WPX</MenuItem>
          </Select>

          <Select size="small" value={partnerIdFilter} onChange={(e) => setPartnerIdFilter(e.target.value)} displayEmpty sx={{ minWidth: 160 }}>
            <MenuItem value="">All Customers</MenuItem>
            {partners?.map((s) => (
              <MenuItem key={s._id} value={s._id}>
                {s.name}
              </MenuItem>
            ))}
          </Select>

          <Select size="small" value={carrierIdFilter} onChange={(e) => setCarrierIdFilter(e.target.value)} displayEmpty sx={{ minWidth: 160 }}>
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

          <Select size="small" value={orderStatusFilter} onChange={(e) => setOrderStatusFilter(e.target.value as any)} displayEmpty sx={{ minWidth: 140 }}>
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

      {/* Bulk actions bar (chỉ hiện khi đã chọn) */}
      {selectedIds.length > 0 && (
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography sx={{ fontWeight: 600 }}>{selectedIds.length} selected</Typography>
          {/* <Button size="small" startIcon={<Edit />} onClick={() => setOpenBulkUpdateDialog(true)}>
            Bulk Update
          </Button> */}

          {/* <Button size="small" color="error" startIcon={<Delete />} onClick={handleBulkDelete}>
            Delete
          </Button>
          <Button size="small" onClick={() => setSelectedIds([])}>
            Clear
          </Button> */}
        </Stack>
      )}

      {/* Table */}
      {loading ? (
        <Box textAlign="center">
          <CircularProgress />
        </Box>
      ) : (
        <DataGrid
          rows={orders.map((r) => ({ ...r, id: r._id }))}
          columns={columns}
          checkboxSelection
          paginationMode="server"
          rowCount={total}
          pageSizeOptions={[10, 20, 50, 100]}
          paginationModel={{ page, pageSize }}
          onPaginationModelChange={({ page, pageSize }) => {
            setPage(page);
            setPageSize(pageSize);
          }}
          // ✅ Bắt cả 2 dạng selection model (array ở v6, object {ids:Set} ở v7)
          onRowSelectionModelChange={(model) => {
            let ids: string[] = [];
            if (Array.isArray(model)) {
              ids = (model as any[]).map(String);
            } else if (model && typeof model === "object" && "ids" in model) {
              ids = Array.from((model as any).ids as Set<GridRowId>).map((x) => String(x));
            }
            setSelectedIds(ids);
          }}
          disableRowSelectionOnClick
          autoHeight
        />
      )}

      {/* Dialogs */}
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

      <BulkUpdateDialog open={openBulkUpdateDialog} onClose={() => setOpenBulkUpdateDialog(false)} onSubmit={handleBulkUpdateSubmit} services={services} suppliers={suppliers} />
    </Box>
  );
}
