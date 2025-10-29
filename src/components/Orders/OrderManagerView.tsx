"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Box, Button, Stack, TextField, Select, MenuItem, CircularProgress, Typography, Chip, Tooltip, IconButton } from "@mui/material";
import { Add, Download, Edit, Delete, UploadFile, Print as PrintBillIcon, Receipt as PrintMarkIcon } from "@mui/icons-material";
import { DataGrid, GridColDef, GridRowId } from "@mui/x-data-grid";
import debounce from "lodash/debounce";
import * as XLSX from "sheetjs-style";
import { useTheme } from "@mui/material/styles";

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
import ImportOrdersDialog from "./ImportOrdersDialog";
import { formatDate } from "@/utils/hooks/hookDate";
import { blue, green, grey, orange, pink } from "@mui/material/colors";
import { formatCurrency } from "@/utils/hooks/hookCurrency";
import BillPrintDialog from "@/components/Bill/BillPrintDialog";
import BillShippingMarkDialog from "@/components/Bill/BillShippingMarkDialog";
import { ECURRENCY, EORDER_STATUS, EPRODUCT_TYPE } from "@/types/typeGlobals";
import CountrySelect from "@/components/Globals/CountrySelect";
import BulkUpdateOrdersDialog, { TBulkUpdatePayload } from "./BulkUpdateOrdersDialog";

// ⭐ Drawer Context
import { useLayout } from "@/contexts/LayoutContext";

/* ===========================================================
   Helpers
   =========================================================== */
const toIdOrObject = (v: any) => {
  if (!v) return null;
  if (typeof v === "object") return v;
  return String(v);
};

const getCurrency = (o: IOrder): ECURRENCY | null =>
  (o.currency as ECURRENCY | null) ?? ((o as any)?.basePrice?.purchasePrice?.currency as ECURRENCY | null) ?? ((o as any)?.basePrice?.salePrice?.currency as ECURRENCY | null) ?? ECURRENCY.VND;

const getPurchaseBase = (o: IOrder) => Number((o as any)?.basePrice?.purchasePrice?.value ?? 0);
const getSaleBase = (o: IOrder) => Number((o as any)?.basePrice?.salePrice?.value ?? 0);
const getExtraFeesTotal = (o: IOrder) => Number((o as any)?.extraFees?.extraFeesTotal ?? 0);
const getFscPurchase = (o: IOrder) => Number((o as any)?.extraFees?.fscFeeValue?.purchaseFSCFee ?? 0);
const getFscSale = (o: IOrder) => Number((o as any)?.extraFees?.fscFeeValue?.saleFSCFee ?? 0);
const getVatPurchase = (o: IOrder) => Number((o as any)?.vat?.purchaseVATTotal ?? 0);
const getVatSale = (o: IOrder) => Number((o as any)?.vat?.saleVATTotal ?? 0);
const getTotalPurchase = (o: IOrder) => Number((o as any)?.totalPrice?.purchaseTotal ?? 0);
const getTotalSale = (o: IOrder) => Number((o as any)?.totalPrice?.saleTotal ?? 0);

/* ===========================================================
   Normalize raw -> IOrder v1.1
   =========================================================== */
const normalizeOrderLegacyToFE = (raw: any): IOrder => {
  const currency: ECURRENCY = raw?.currency ?? raw?.basePrice?.purchasePrice?.currency ?? raw?.basePrice?.salePrice?.currency ?? ECURRENCY.VND;

  return {
    _id: String(raw?._id || ""),
    status: raw?.status,
    createdAt: raw?.createdAt ?? null,
    updatedAt: raw?.updatedAt ?? null,
    _creator: raw?._creator ?? null,

    trackingCode: String(raw?.trackingCode || ""),
    carrierAirWaybillCode: raw?.carrierAirWaybillCode?.trim?.() || null,

    partner: raw?.partner
      ? {
          partnerId: typeof raw.partner?.partnerId === "object" ? raw.partner.partnerId?._id || raw.partner.partnerId?.id || null : raw?.partner?.partnerId ? String(raw.partner.partnerId) : null,
          partnerName: raw?.partner?.partnerName ?? (typeof raw?.partner?.partnerId === "object" ? raw?.partner?.partnerId?.name || "" : ""),
        }
      : null,

    carrierId: toIdOrObject(raw?.carrierId) ?? "",
    serviceId: toIdOrObject(raw?.serviceId),
    supplierId: toIdOrObject(raw?.supplierId),

    productType: raw?.productType ?? null,
    sender: raw?.sender ?? null,
    recipient: raw?.recipient ?? null,

    packageDetail: {
      content: raw?.packageDetail?.content ?? "",
      declaredWeight: Number(raw?.packageDetail?.declaredWeight ?? 0),
      quantity: Number(raw?.packageDetail?.quantity ?? 0),
      declaredValue: Number(raw?.packageDetail?.declaredValue ?? 0),
      currency: (raw?.packageDetail?.currency ?? currency) as ECURRENCY,
      dimensions: Array.isArray(raw?.packageDetail?.dimensions) ? raw.packageDetail.dimensions : [],
    },

    note: raw?.note ?? null,
    zone: typeof raw?.zone === "number" ? raw.zone : null,
    chargeableWeight: Number(raw?.chargeableWeight ?? 0),

    basePrice: {
      purchasePrice: {
        value: Number(raw?.basePrice?.purchasePrice?.value ?? 0),
        currency: (raw?.basePrice?.purchasePrice?.currency ?? null) as ECURRENCY | null,
      },
      salePrice: {
        value: Number(raw?.basePrice?.salePrice?.value ?? 0),
        currency: (raw?.basePrice?.salePrice?.currency ?? null) as ECURRENCY | null,
      },
    },

    extraFees: {
      extraFeeIds: Array.isArray(raw?.extraFees?.extraFeeIds) ? raw.extraFees.extraFeeIds.map((x: any) => (typeof x === "object" ? x?._id || x?.id || String(x) : String(x))) : [],
      fscFeePercentage: raw?.extraFees?.fscFeePercentage !== undefined ? Number(raw.extraFees.fscFeePercentage) : null,
      fscFeeValue: {
        purchaseFSCFee: raw?.extraFees?.fscFeeValue?.purchaseFSCFee !== undefined ? Number(raw.extraFees.fscFeeValue.purchaseFSCFee) : null,
        saleFSCFee: raw?.extraFees?.fscFeeValue?.saleFSCFee !== undefined ? Number(raw.extraFees.fscFeeValue.saleFSCFee) : null,
      },
      extraFeesTotal: raw?.extraFees?.extraFeesTotal !== undefined ? Number(raw.extraFees.extraFeesTotal) : null,
    },

    vat: {
      systemVATPercentage: Number(raw?.vat?.systemVATPercentage ?? 0),
      customVATPercentage: Number(raw?.vat?.customVATPercentage ?? -1),
      purchaseVATTotal: Number(raw?.vat?.purchaseVATTotal ?? 0),
      saleVATTotal: Number(raw?.vat?.saleVATTotal ?? 0),
    },

    surcharges: Array.isArray(raw?.surcharges) ? raw.surcharges : [],
    surchargeTotal: Number(raw?.surchargeTotal ?? 0),

    totalPrice: {
      purchaseTotal: Number(raw?.totalPrice?.purchaseTotal ?? 0),
      saleTotal: Number(raw?.totalPrice?.saleTotal ?? 0),
    },

    orderStatus: raw?.orderStatus ?? EORDER_STATUS.Pending,
    currency: (currency as ECURRENCY) ?? null,
  } as IOrder;
};

/* ===========================================================
   View
   =========================================================== */
export default function OrderManagerView() {
  const theme = useTheme();
  const { drawerOpen } = useLayout();

  // === Width cột ACTION cố định theo Drawer ===
  const ACTION_COL_WIDTH = 120;

  const [orders, setOrders] = useState<IOrder[]>([]);
  const displayedRows = orders; // trang hiện tại

  // ==== Measurements to align Action Rail with DataGrid ====
  const [headerH, setHeaderH] = useState<number>(56);
  const [rowH, setRowH] = useState<number>(52);
  const [rowBorderColor, setRowBorderColor] = useState<string>(theme.palette.divider);
  const [hScrollSize, setHScrollSize] = useState<number>(0); // horizontal scrollbar thickness

  const gridRootRef = useRef<HTMLDivElement | null>(null);
  const gridScrollerRef = useRef<HTMLDivElement | null>(null);
  const railScrollRef = useRef<HTMLDivElement | null>(null);
  const syncingRef = useRef<{ from?: "grid" | "rail" }>({});

  // Filters
  const [keyword, setKeyword] = useState("");
  const [carrierIdFilter, setCarrierIdFilter] = useState("");
  const [partnerIdFilter, setPartnerIdFilter] = useState("");
  const [serviceIdFilter, setServiceIdFilter] = useState("");
  const [supplierIdFilter, setSupplierIdFilter] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState<"" | "all" | EORDER_STATUS>("");
  const [productTypeFilter, setProductTypeFilter] = useState<"" | EPRODUCT_TYPE>("");
  const [destCountryCode, setDestCountryCode] = useState<string>("");
  const [hawbFilter, setHawbFilter] = useState<string>("");
  const [cawbFilter, setCawbFilter] = useState<string>("");

  // Pagination
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // Selections
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Import dialog
  const [openImportDialog, setOpenImportDialog] = useState(false);

  // Bill dialogs
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
      const body = await searchOrdersApi(params);
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
      return row.packageDetail.dimensions.reduce((acc: number, item: any) => acc + (item.grossWeight || 0), 0);
    }
    return 0;
  };

  const calculateVolumeWeight = (row: IOrder) => {
    if (row?.packageDetail?.dimensions && row?.packageDetail?.dimensions.length > 0) {
      return row.packageDetail.dimensions.reduce((acc: number, item: any) => acc + (item.volumeWeight || 0), 0);
    }
    return 0;
  };

  const resolveNameCode = (list: any[], ref: any, fallbackName?: string): { name: string; code: string } => {
    let id: string | null = null;
    let name = fallbackName || "";
    let code = "";

    if (ref && typeof ref === "object") {
      id = String(ref._id || ref.id || "");
      name = ref.name ?? name;
      code = ref.code ?? code;
    } else if (ref) {
      id = String(ref);
    }

    if (id) {
      const hit = list.find((x) => String(x._id) === id);
      if (hit) {
        name = name || hit.name || "";
        code = code || hit.code || "";
      }
    }

    if (!code && name) {
      const byName = list.find((x) => (x.name || "").trim().toUpperCase() === name.trim().toUpperCase());
      if (byName) code = byName.code || "";
    }

    return { name: name || "", code: code || "" };
  };

  // ========================= Export Excel (giữ logic của bạn) =========================
  const handleExportExcel = async () => {
    try {
      const params: IFilterOrder = { ...buildOrderFilters(true), all: true };
      const body = await searchOrdersApi(params);
      const rawAll: any[] = body?.data?.data || [];
      const all: IOrder[] = rawAll.map((o: any) => normalizeOrderLegacyToFE(o));

      if (!all.length) {
        showNotification("No data to export", "warning");
        return;
      }

      const HEADERS = [
        "HAWB",
        "AWB",
        "DATE",
        "CUSTOMER NAME",
        "CUSTOMER CODE",
        "SUPPLIER",
        "SUPPLIER CODE",
        "SUB CARRIER",
        "SUB CARRIER CODE",
        "SERVICE",
        "SERVICE CODE",
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

      const rowCurrencies: string[] = [];
      const rows = all.map((c) => {
        const cur = (getCurrency(c) as unknown as string) || "VND";
        rowCurrencies.push(cur);

        const partnerNC = resolveNameCode(partners, c.partner?.partnerId, c.partner?.partnerName);
        const supplierNC = resolveNameCode(suppliers, (c as any).supplierId, undefined);
        const subcNC = resolveNameCode(carriers, (c as any).carrierId, undefined);
        const serviceNC = resolveNameCode(services, (c as any).serviceId, undefined);

        const destName = c.recipient?.country?.name || "";
        const destCode = c.recipient?.country?.code || "";

        return {
          HAWB: c.trackingCode || "",
          AWB: c.carrierAirWaybillCode || "",
          DATE: c.createdAt ? new Date(c.createdAt) : null,

          "CUSTOMER NAME": partnerNC.name,
          "CUSTOMER CODE": partnerNC.code,

          SUPPLIER: supplierNC.name || (typeof (c as any).supplierId === "object" ? (c as any).supplierId?.name : (c as any).supplierId || ""),
          "SUPPLIER CODE": supplierNC.code,

          "SUB CARRIER": subcNC.name || (typeof (c as any).carrierId === "object" ? (c as any).carrierId?.name : (c as any).carrierId || ""),
          "SUB CARRIER CODE": subcNC.code,

          SERVICE:
            serviceNC.name ||
            (typeof (c as any).serviceId === "object" ? (c as any).serviceId?.name : "") ||
            serviceNC.code ||
            (typeof (c as any).serviceId === "object" ? (c as any).serviceId?.code : (c as any)?.serviceId) ||
            "",
          "SERVICE CODE": serviceNC.code || (typeof (c as any).serviceId === "object" ? (c as any).serviceId?.code : (c as any)?.serviceId) || "",

          DESTINATION: destName && destCode ? `${destName} (${destCode})` : destName || destCode || "",

          TYPE: c.productType || "",
          DIMENSIONS: c.packageDetail?.dimensions?.length ? c.packageDetail.dimensions.map((d: any) => `${d.length}x${d.width}x${d.height}`).join(", ") : "",
          "GROSS WEIGHT": calculateGrossWeight(c),
          "VOLUME WEIGHT": calculateVolumeWeight(c),
          "CHARGE WEIGHT": c.chargeableWeight ?? 0,
          NOTE: c.note || "",

          "BASE RATE (BUYING RATE)": getPurchaseBase(c),
          "EXTRA FEE (BUYING)": getExtraFeesTotal(c),
          "FSC (BUYING)": getFscPurchase(c),
          "VAT (BUYING)": getVatPurchase(c),
          "TOTAL (BUYING)": getTotalPurchase(c),

          "BASE RATE (SELLING RATE)": getSaleBase(c),
          "EXTRA FEE (SELLING)": getExtraFeesTotal(c),
          "FSC (SELLING)": getFscSale(c),
          "VAT (SELLING)": getVatSale(c),
          "TOTAL (SELLING)": getTotalSale(c),

          PROFIT: getTotalSale(c) - getTotalPurchase(c),
        };
      });

      const ws = XLSX.utils.json_to_sheet(rows, { header: HEADERS, skipHeader: false, cellDates: true });
      ws["!cols"] = HEADERS.map(() => ({ wch: 22 }));

      const range = XLSX.utils.decode_range(ws["!ref"] || "");
      const colIndexByHeader: Record<string, number> = {};
      HEADERS.forEach((h, i) => (colIndexByHeader[h] = i));

      const THIN = { style: "thin", color: { auto: 1 } } as any;
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
        if (currency === "VND") return "#,##0";
        if (currency === "USD") return "#,##0.00";
        return "#,##0.00";
      };

      for (let r = 1; r <= rows.length; r++) {
        const cur = rowCurrencies[r - 1] || "VND";

        // DATE
        {
          const c = colIndexByHeader["DATE"];
          if (c != null) {
            const addr = XLSX.utils.encode_cell({ r, c });
            const cell = ws[addr];
            if (cell) {
              cell.t = "d";
              (cell as any).z = "dd/mm/yyyy";
              (cell as any).s = { ...(cell as any).s, alignment: { ...(cell as any).s?.alignment, horizontal: "center" } };
            }
          }
        }

        // WEIGHTS -> number 2 decimals
        for (const h of WEIGHT_COLS) {
          const c = colIndexByHeader[h];
          if (c == null) continue;
          const addr = XLSX.utils.encode_cell({ r, c });
          const cell = ws[addr];
          if (cell && cell.v !== "" && cell.v != null) {
            cell.t = "n";
            (cell as any).z = "0.00";
            (cell as any).s = { ...(cell as any).s, alignment: { ...(cell as any).s?.alignment, horizontal: "right" } };
          }
        }

        // MONEY -> number
        const zMoney = moneyFormatFor(cur);
        for (const h of MONEY_COLS) {
          const c = colIndexByHeader[h];
          if (c == null) continue;
          const addr = XLSX.utils.encode_cell({ r, c });
          const cell = ws[addr];
          if (cell && cell.v !== "" && cell.v != null) {
            cell.t = "n";
            (cell as any).z = zMoney;
            (cell as any).s = { ...(cell as any).s, alignment: { ...(cell as any).s?.alignment, horizontal: "right" } };
          }
        }
      }

      const MED = { style: "medium", color: { auto: 1 } } as any;
      const rTop = range.s.r;
      const rBottom = range.e.r;
      const cLeft = range.s.c;
      const cRight = range.e.c;

      for (let c = cLeft; c <= cRight; c++) {
        const addr = XLSX.utils.encode_cell({ r: rTop, c });
        if (!ws[addr]) ws[addr] = { t: "s", v: "" } as any;
        (ws[addr] as any).s = { ...(ws[addr] as any).s, border: { top: MED, right: MED, bottom: MED, left: MED } };
      }
      for (let c = cLeft; c <= cRight; c++) {
        let addr = XLSX.utils.encode_cell({ r: rTop, c });
        (ws[addr] as any).s = { ...(ws[addr] as any).s, border: { ...(ws[addr] as any).s?.border, top: MED } };
        addr = XLSX.utils.encode_cell({ r: rBottom, c });
        (ws[addr] as any).s = { ...(ws[addr] as any).s, border: { ...(ws[addr] as any).s?.border, bottom: MED } };
      }
      for (let r = rTop; r <= rBottom; r++) {
        let addr = XLSX.utils.encode_cell({ r, c: cLeft });
        (ws[addr] as any).s = { ...(ws[addr] as any).s, border: { ...(ws[addr] as any).s?.border, left: MED } };
        addr = XLSX.utils.encode_cell({ r, c: cRight });
        (ws[addr] as any).s = { ...(ws[addr] as any).s, border: { ...(ws[addr] as any).s?.border, right: MED } };
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
      setSelectedIds([]);
      showNotification(res?.data?.message || "Deleted successfully", "success");
      fetchData();
    } catch (err: any) {
      showNotification(err?.message || "Delete failed", "error");
    }
  };

  const handleBulkUpdateSubmit = async (update: TBulkUpdatePayload) => {
    if (!selectedIds.length) return;
    if (!update.vat && !update.extraFees) {
      showNotification("No change to update", "warning");
      return;
    }
    try {
      await bulkUpdateOrdersApi(selectedIds, update as any);
      showNotification("Updated successfully", "success");
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

  // ==================== COLUMNS (KHÔNG gồm ACTIONS) ====================
  const columns: GridColDef[] = [
    {
      field: "trackingCode",
      headerName: "HAWB",
      flex: 1.1,
      align: "center",
      headerAlign: "center",
      minWidth: 130,
      sortable: false,
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
    { field: "carrierAirWaybillCode", headerName: "AWB", align: "center", headerAlign: "center", minWidth: 130, flex: 0.7, sortable: false },
    { field: "createdAt", headerName: "DATE", align: "center", headerAlign: "center", minWidth: 130, flex: 1, sortable: false, renderCell: ({ row }) => formatDate(row.createdAt) },
    { field: "partner", headerName: "CUSTOMER NAME", align: "center", headerAlign: "center", minWidth: 150, flex: 1, sortable: false, renderCell: ({ row }) => row.partner?.partnerName },
    {
      field: "supplierId",
      headerName: "SUPPLIER",
      align: "center",
      headerAlign: "center",
      minWidth: 130,
      flex: 1,
      sortable: false,
      renderCell: ({ row }) => (typeof (row as any).supplierId === "object" ? (row as any).supplierId?.name : (row as any).supplierId),
    },
    {
      field: "carrierId",
      headerName: "SUB CARRIER",
      align: "center",
      headerAlign: "center",
      minWidth: 130,
      flex: 1,
      sortable: false,
      renderCell: ({ row }) => (typeof (row as any).carrierId === "object" ? (row as any).carrierId?.name : (row as any).carrierId),
    },
    {
      field: "serviceId",
      headerName: "SERVICE",
      align: "center",
      headerAlign: "center",
      minWidth: 110,
      flex: 1,
      sortable: false,
      renderCell: ({ row }) => (typeof (row as any).serviceId === "object" ? (row as any).serviceId?.code : (row as any).serviceId),
    },
    {
      field: "destination",
      headerName: "DESTINATION",
      align: "center",
      headerAlign: "center",
      minWidth: 220,
      flex: 1,
      sortable: false,
      renderCell: ({ row }) =>
        row.recipient?.country?.code || row.recipient?.country?.name ? (
          <Chip label={`${row.recipient?.country?.name || ""} (${row.recipient?.country?.code || ""})`} size="small" sx={{ backgroundColor: blue[200], color: "#fff", fontWeight: 500 }} />
        ) : (
          <Chip label="N/A" size="small" sx={{ backgroundColor: grey[500], color: "#fff", fontWeight: 500 }} />
        ),
    },
    { field: "productType", headerName: "TYPE", align: "center", headerAlign: "center", minWidth: 90, flex: 1, sortable: false, renderCell: ({ row }) => row.productType },
    {
      field: "packageDetail.dimensions",
      headerName: "DIMENSIONS",
      align: "center",
      headerAlign: "center",
      minWidth: 120,
      flex: 0.7,
      sortable: false,
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
      sortable: false,
      renderCell: ({ row }) => <Chip label={calculateGrossWeight(row)} size="small" sx={{ backgroundColor: grey[300], color: "#fff", fontWeight: 500 }} />,
    },
    {
      field: "volumeWeight",
      headerName: "VOLUME WEIGHT",
      align: "center",
      headerAlign: "center",
      minWidth: 160,
      flex: 0.7,
      sortable: false,
      renderCell: ({ row }) => <Chip label={calculateVolumeWeight(row)} size="small" sx={{ backgroundColor: grey[500], color: "#fff", fontWeight: 500 }} />,
    },
    {
      field: "chargeableWeight",
      headerName: "CHARGE WEIGHT",
      align: "center",
      headerAlign: "center",
      minWidth: 140,
      flex: 0.7,
      sortable: false,
      renderCell: ({ value }) => <Chip label={value} size="small" sx={{ backgroundColor: grey[500], color: "#fff", fontWeight: 500 }} />,
    },
    { field: "note", headerName: "NOTE", align: "center", headerAlign: "center", minWidth: 110, flex: 1, sortable: false },

    // BUYING
    {
      field: "basePrice.purchasePrice.value",
      headerName: "BASE RATE (BUYING)",
      align: "center",
      headerAlign: "center",
      minWidth: 180,
      flex: 1,
      sortable: false,
      renderCell: ({ row }) => (
        <Box display="flex" alignItems="center" justifyContent="center" height="100%" sx={{ bgcolor: blue[100] }}>
          <Typography>{formatCurrency(getPurchaseBase(row), getCurrency(row) || undefined)}</Typography>
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
      sortable: false,
      renderCell: ({ row }) => (
        <Box display="flex" alignItems="center" justifyContent="center" height="100%" sx={{ bgcolor: blue[100] }}>
          <Typography>{formatCurrency(getExtraFeesTotal(row), getCurrency(row) || undefined)}</Typography>
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
      sortable: false,
      renderCell: ({ row }) => (
        <Box display="flex" alignItems="center" justifyContent="center" height="100%" sx={{ bgcolor: blue[100] }}>
          <Typography>{formatCurrency(getFscPurchase(row), getCurrency(row) || undefined)}</Typography>
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
      sortable: false,
      renderCell: ({ row }) => (
        <Box display="flex" alignItems="center" justifyContent="center" height="100%" sx={{ bgcolor: blue[100] }}>
          <Typography>{formatCurrency(getVatPurchase(row), getCurrency(row) || undefined)}</Typography>
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
      sortable: false,
      renderCell: ({ row }) => (
        <Box display="flex" alignItems="center" justifyContent="center" height="100%" sx={{ bgcolor: blue[100] }}>
          <Typography>{formatCurrency(getTotalPurchase(row), getCurrency(row) || undefined)}</Typography>
        </Box>
      ),
    },

    // SELLING
    {
      field: "basePrice.salePrice.value",
      headerName: "BASE RATE (SELLING)",
      align: "center",
      headerAlign: "center",
      minWidth: 180,
      flex: 1,
      sortable: false,
      renderCell: ({ row }) => (
        <Box display="flex" alignItems="center" justifyContent="center" height="100%" sx={{ bgcolor: green[100] }}>
          <Typography>{formatCurrency(getSaleBase(row), getCurrency(row) || undefined)}</Typography>
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
      sortable: false,
      renderCell: ({ row }) => (
        <Box display="flex" alignItems="center" justifyContent="center" height="100%" sx={{ bgcolor: green[100] }}>
          <Typography>{formatCurrency(getExtraFeesTotal(row), getCurrency(row) || undefined)}</Typography>
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
      sortable: false,
      renderCell: ({ row }) => (
        <Box display="flex" alignItems="center" justifyContent="center" height="100%" sx={{ bgcolor: green[100] }}>
          <Typography>{formatCurrency(getFscSale(row), getCurrency(row) || undefined)}</Typography>
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
      sortable: false,
      renderCell: ({ row }) => (
        <Box display="flex" alignItems="center" justifyContent="center" height="100%" sx={{ bgcolor: green[100] }}>
          <Typography>{formatCurrency(getVatSale(row), getCurrency(row) || undefined)}</Typography>
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
      sortable: false,
      renderCell: ({ row }) => (
        <Box display="flex" alignItems="center" justifyContent="center" height="100%" sx={{ bgcolor: green[100] }}>
          <Typography>{formatCurrency(getTotalSale(row), getCurrency(row) || undefined)}</Typography>
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
      sortable: false,
      renderCell: ({ row }) => (
        <Box display="flex" alignItems="center" justifyContent="center" height="100%" sx={{ bgcolor: pink[100] }}>
          <Typography>{formatCurrency(getTotalSale(row) - getTotalPurchase(row), getCurrency(row) || undefined)}</Typography>
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
      sortable: false,
      renderCell: ({ value }) => <EnumChip type="orderStatus" value={value} />,
    },
  ];

  // ==== đo lường & đồng bộ scroll (để rail khớp 100%) ====
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
      const hScroll = scroller.offsetHeight - scroller.clientHeight; // horizontal scrollbar thickness (if any)
      setHScrollSize(hScroll > 0 ? hScroll : 0);
    }
  }, [theme.palette.divider]);

  useEffect(() => {
    attachGridScroller();
    const ro = gridRootRef.current ? new ResizeObserver(() => attachGridScroller()) : null;
    if (gridRootRef.current && ro) ro.observe(gridRootRef.current);
    return () => ro?.disconnect();
  }, [attachGridScroller, orders, page, pageSize, drawerOpen]);

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
  }, [orders, page, pageSize]);

  return (
    // ===== Root wrapper: chiếm toàn bộ chiều cao vùng main, không tràn trang
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0, overflow: "hidden", p: 2 }}>
      {/* Filters + actions */}
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
        <Stack direction="row" spacing={1} flexWrap="wrap">
          <TextField placeholder="Search keyword" size="small" onChange={(e) => debouncedSearch(e.target.value)} sx={{ minWidth: 200 }} />
          <TextField placeholder="HAWB (trackingCode)" size="small" value={hawbFilter} onChange={(e) => setHawbFilter(e.target.value)} sx={{ minWidth: 180 }} />
          <TextField placeholder="CAWB (AWB)" size="small" value={cawbFilter} onChange={(e) => setCawbFilter(e.target.value)} sx={{ minWidth: 160 }} />
          <CountrySelect value={destCountryCode} onChange={(country) => setDestCountryCode(country?.code || "")} label="Destination" />
        </Stack>

        <Stack direction="row" spacing={1} overflow={"auto"}>
          <Button variant="outlined" startIcon={<UploadFile />} onClick={() => setOpenImportDialog(true)}>
            Import Excel
          </Button>
          <Button variant="outlined" startIcon={<Download />} onClick={handleExportExcel}>
            Export Excel
          </Button>
          <Button variant="outlined" startIcon={<Edit />} disabled={!selectedIds.length} onClick={() => setOpenBulkUpdateDialog(true)}>
            Bulk Update
          </Button>
          <Button variant="outlined" startIcon={<Delete />} color="error" disabled={!selectedIds.length} onClick={handleBulkDelete}>
            Delete
          </Button>
          <Button variant="contained" startIcon={<Add />} onClick={() => setOpenCreateDialog(true)}>
            Create Order
          </Button>
        </Stack>

        <Stack direction="row" spacing={1} overflow={"auto"}>
          <Select size="small" value={productTypeFilter} onChange={(e) => setProductTypeFilter(e.target.value as any)} displayEmpty sx={{ minWidth: 140 }}>
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

      {/* ===== Grid + Action Rail (side-by-side) ===== */}
      <Box sx={{ flex: "1 1 auto", minHeight: 0, display: "flex", alignItems: "stretch" }}>
        {/* LEFT: DataGrid container */}
        <Box ref={gridRootRef} sx={{ flex: 1, minWidth: 0 }}>
          {loading ? (
            <Box textAlign="center" sx={{ pt: 4 }}>
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
              onRowSelectionModelChange={(model) => {
                let ids: string[] = [];
                if (Array.isArray(model)) ids = (model as any[]).map(String);
                else if (model && typeof model === "object" && "ids" in model) ids = Array.from((model as any).ids as Set<GridRowId>).map((x) => String(x));
                setSelectedIds(ids);
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

                // đảm bảo border màu nhất quán (v6 có biến này)
                "--DataGrid-rowBorderColor": theme.palette.divider,
              }}
            />
          )}
        </Box>

        {/* RIGHT: Action Rail (cố định ngoài table) */}
        <Box
          sx={{
            width: ACTION_COL_WIDTH,
            borderLeft: `1px solid ${theme.palette.divider}`,
            borderTop: `1px solid ${theme.palette.divider}`,
            display: "flex",
            flexDirection: "column",
            minWidth: ACTION_COL_WIDTH,
          }}
        >
          {/* Header rail — lấy đúng chiều cao header thực tế */}
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
              color: green[600],
              boxSizing: "border-box",
            }}
          >
            ACTIONS
          </Box>

          {/* Scroll body rail (sync với DataGrid) */}
          <Box
            ref={railScrollRef}
            sx={{
              flex: 1,
              minHeight: 0,
              overflowY: "auto",
              overflowX: "hidden",
              bgcolor: theme.palette.background.default,
              pb: `${hScrollSize}px`, // đệm nếu grid có scrollbar ngang
            }}
          >
            {displayedRows.length === 0 ? (
              <Box sx={{ p: 2, color: theme.palette.text.secondary }}>No rows</Box>
            ) : (
              <>
                {displayedRows.map((row) => {
                  return (
                    <Box
                      key={row._id}
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
                        {/* ICON: Print Bill */}
                        <Tooltip title="Print Bill" arrow>
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelected(row);
                              setOpenBillDialog(true);
                            }}
                            aria-label="Print Bill"
                            sx={{ color: orange[600], "&:hover": { color: orange[800], bgcolor: "rgba(255,152,0,0.08)" } }}
                          >
                            <PrintBillIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Print Mark" arrow>
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelected(row);
                              setOpenShippingMarkDialog(true);
                            }}
                            aria-label="Print Mark"
                            sx={{ color: blue[500], "&:hover": { color: blue[700], bgcolor: "rgba(63,81,181,0.08)" } }}
                          >
                            <PrintMarkIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {/* Menu các thao tác khác */}
                        <ActionMenu
                          onEdit={() => {
                            setSelected(row);
                            setOpenUpdateDialog(true);
                          }}
                          onDelete={() => handleDelete(row)}
                          // Bạn có thể bật menu print nếu thích (hiện đang dùng icon riêng phía trên):
                          onPrintBill={() => {
                            setSelected(row);
                            setOpenBillDialog(true);
                          }}
                          onPrintMark={() => {
                            setSelected(row);
                            setOpenShippingMarkDialog(true);
                          }}
                          status={row.orderStatus as any}
                        />
                      </Stack>
                    </Box>
                  );
                })}
                <Box
                  sx={{
                    height: `${rowH + 16}px`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    p: 1,
                    boxSizing: "border-box",
                    borderRight: `1px solid ${rowBorderColor}`,
                    borderBottom: `1px solid ${rowBorderColor}`,
                    bgcolor: theme.palette.background.default,
                  }}
                ></Box>
              </>
            )}
          </Box>
        </Box>
      </Box>

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

      <ImportOrdersDialog
        open={openImportDialog}
        onClose={() => {
          setOpenImportDialog(false);
          fetchData();
        }}
      />

      <BulkUpdateOrdersDialog open={openBulkUpdateDialog} onClose={() => setOpenBulkUpdateDialog(false)} onSubmit={handleBulkUpdateSubmit} selectedCount={selectedIds.length} />
    </Box>
  );
}
