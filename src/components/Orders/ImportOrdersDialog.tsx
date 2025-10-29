"use client";

import React from "react";
import { Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, Stack, LinearProgress, Alert, Typography, Chip, IconButton, Tooltip, Tabs, Tab } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import DeleteIcon from "@mui/icons-material/Delete";
import * as XLSX from "sheetjs-style";

import { useNotification } from "@/contexts/NotificationProvider";
import { getCarriersApi } from "@/utils/apis/apiCarrier"; // SubCarriers (getAll)
import { getPartnersApi } from "@/utils/apis/apiPartner"; // Customers (getAll by type)
import { getSuppliersApi } from "@/utils/apis/apiSupplier"; // Suppliers (getAll)
import { getServicesApi } from "@/utils/apis/apiService"; // Services (getAll)
import { bulkCreateOrdersApi } from "@/utils/apis/apiOrder";
import type { ICreateOrderRequest } from "@/types/typeOrder";
import { ECURRENCY, EPRODUCT_TYPE, ECountryCode } from "@/types/typeGlobals";
import { COUNTRIES } from "@/utils/constants";

/* ============================================================
   Excel RAW (CODE-only)
   ============================================================ */
type TRaw = {
  DATE?: string;
  "CAWB (optional)"?: string;

  "CUSTOMER CODE"?: string; // required (CODE only)
  "SUB CARRIER CODE"?: string; // required (CODE only)
  "SUPPLIER CODE"?: string; // optional (CODE only)
  "SERVICE CODE"?: string; // required (CODE only)

  DESTINATION?: string; // required (country CODE only)
  TYPE?: string; // required (DOX/WPX or DOCUMENT/PARCEL)

  "CHARGE WEIGHT"?: number | string; // required > 0
  "GROSS WEIGHT"?: number | string; // required > 0

  DIMENSIONS?: string; // "0x0x0, 1x1x1" hoặc xuống dòng
  NOTE?: string;
  VAT?: number | string; // optional (%)
  FSC?: number | string; // optional (%)
};

type TErr = { index: number; message: string };

/* ============================================================
   Utils & constants
   ============================================================ */
const COUNTRY_CODE_TO_NAME = new Map(COUNTRIES.map((c) => [c.code.toUpperCase(), c.name]));
const safeStr = (v: any) => (v == null ? "" : String(v)).trim();
const eqCI = (a: string, b: string) => a.trim().toUpperCase() === b.trim().toUpperCase();
const toCountryCode = (code: string): ECountryCode => code as unknown as ECountryCode;

function asNumber(v: any): number | null {
  if (v === "" || v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function normalizeType(v?: string): EPRODUCT_TYPE | null {
  const s = safeStr(v).toUpperCase();
  if (s === "DOX" || s === "DOCUMENT") return EPRODUCT_TYPE.DOCUMENT;
  if (s === "WPX" || s === "PARCEL") return EPRODUCT_TYPE.PARCEL;
  return null;
}

/** Strict CODE lookup (no NAME fallback) */
function resolveByCodeStrict<T extends { code?: string }>(list: T[], value?: string): T | null {
  const v = safeStr(value);
  if (!v) return null;
  return list.find((x) => x.code && eqCI(x.code, v)) || null;
}

/** Country code only */
function normalizeCountryCodeStrict(input?: string): { code: string | null; name: string | null } {
  const s = safeStr(input).toUpperCase();
  if (!s) return { code: null, name: null };
  const name = COUNTRY_CODE_TO_NAME.get(s);
  if (!name) return { code: null, name: null };
  return { code: s, name };
}

/** Best effort company id string (works for populated or raw) */
function getCompanyIdString(v: any): string {
  if (!v) return "";
  if (typeof v === "object") {
    return String(v.companyId?._id || v.companyId?.id || v.companyId || v._id || v.id || "");
  }
  return String(v);
}

/** Resolve SERVICE by CODE that belongs to the same company as SubCarrier */
function resolveServiceForSubCarrier(services: any[], svcCode?: string, subc?: any) {
  const code = safeStr(svcCode);
  if (!code || !subc) return null;

  const subCompanyId = getCompanyIdString(subc);
  const sameCode = services.filter((s) => s.code && eqCI(s.code, code));
  if (!sameCode.length) return null;

  const exact = sameCode.find((s) => getCompanyIdString(s) === subCompanyId);
  return exact || null;
}

/* ===== DIMENSIONS parser (hỗ trợ: newline, comma, semicolon, "×") ===== */
type TParsedDim = { length: number; width: number; height: number };

function parseDimensionsList(input: string): { dims: TParsedDim[]; badParts: string[] } {
  const s = safeStr(input);
  if (!s) return { dims: [], badParts: [] };

  const chunks = s
    .split(/\r?\n|[;,]/)
    .map((x) => x.trim())
    .filter(Boolean);

  const badParts: string[] = [];
  const dims: TParsedDim[] = [];

  const num = "(\\d+(?:\\.\\d+)?)";
  const xsep = "[xX×]";
  const re = new RegExp("^\\s*(?<l>" + num + ")\\s*" + xsep + "\\s*(?<w>" + num + ")\\s*" + xsep + "\\s*(?<h>" + num + ")\\s*$");

  for (const raw of chunks) {
    const m = re.exec(raw);
    if (m?.groups) {
      const l = Number(m.groups.l);
      const w = Number(m.groups.w);
      const h = Number(m.groups.h);
      if ([l, w, h].every((v) => Number.isFinite(v))) {
        dims.push({ length: l, width: w, height: h });
      } else {
        badParts.push(raw);
      }
    } else {
      badParts.push(raw);
    }
  }

  return { dims, badParts };
}

/* ============================================================
   Component
   ============================================================ */
type Props = { open: boolean; onClose: () => void };

export default function ImportOrdersDialog({ open, onClose }: Props) {
  const { showNotification } = useNotification();

  // Master data
  const [partners, setPartners] = React.useState<any[]>([]);
  const [subCarriers, setSubs] = React.useState<any[]>([]);
  const [suppliers, setSuppliers] = React.useState<any[]>([]);
  const [services, setServices] = React.useState<any[]>([]);
  const [masterReady, setMasterReady] = React.useState(false);

  // File & rows
  const [file, setFile] = React.useState<File | null>(null);
  const [rawRows, setRawRows] = React.useState<TRaw[]>([]);

  // Validation & create
  const [validating, setValidating] = React.useState(false);
  const [creating, setCreating] = React.useState(false);
  const [errors, setErrors] = React.useState<TErr[]>([]);
  const [mappedRows, setMappedRows] = React.useState<ICreateOrderRequest[]>([]);
  const [serverResult, setServerResult] = React.useState<{ insertedCount: number; failed: Array<{ index: number; message: string }> } | null>(null);

  // View filter
  const [viewTab, setViewTab] = React.useState<0 | 1 | 2>(0);

  // Success popup
  const [successOpen, setSuccessOpen] = React.useState(false);
  const [successInserted, setSuccessInserted] = React.useState(0);

  // ==== reset helpers ====
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const resetAll = React.useCallback(() => {
    // masters
    setPartners([]);
    setSubs([]);
    setSuppliers([]);
    setServices([]);
    setMasterReady(false);

    // data
    setFile(null);
    setRawRows([]);
    setErrors([]);
    setMappedRows([]);
    setServerResult(null);
    setViewTab(0);

    // flags
    setValidating(false);
    setCreating(false);

    // popup
    setSuccessOpen(false);
    setSuccessInserted(0);

    // clear file input
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  /** Reset chỉ phần dữ liệu import (giữ lại master để import tiếp nhanh) */
  const resetForNextImport = React.useCallback(() => {
    setFile(null);
    setRawRows([]);
    setErrors([]);
    setMappedRows([]);
    setServerResult(null);
    setViewTab(0);
    setValidating(false);
    setCreating(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const handleClose = () => {
    resetAll();
    onClose();
  };

  // Load master when open = true; reset when open = false
  React.useEffect(() => {
    if (!open) {
      resetAll();
      return;
    }
    (async () => {
      try {
        const [p, sc, sp, sv] = await Promise.all([getPartnersApi(), getCarriersApi(), getSuppliersApi(), getServicesApi()]);
        setPartners(p?.data?.data?.data || p?.data?.data || []);
        setSubs(sc?.data?.data?.data || sc?.data?.data || []);
        setSuppliers(sp?.data?.data?.data || sp?.data?.data || []);
        setServices(sv?.data?.data?.data || sv?.data?.data || []);
        setMasterReady(true);
      } catch (e: any) {
        setMasterReady(true);
        showNotification(e?.message || "Tải danh mục thất bại", "error");
      }
    })();
  }, [open, resetAll, showNotification]);

  /* ===== Read Excel ===== */
  const readImportSheet = async (f: File) => {
    const buf = await f.arrayBuffer();
    const wb = XLSX.read(buf, { type: "array", cellDates: true });

    const ws = wb.Sheets["IMPORT"] || wb.Sheets["Sheet1"] || wb.Sheets[wb.SheetNames[0]];
    if (!ws) return [];

    const rows = XLSX.utils.sheet_to_json<TRaw>(ws, {
      defval: "",
      raw: false, // convert date cells to text using dateNF
      dateNF: "dd/mm/yyyy",
    });

    // filter empty rows
    return rows.filter((r) => Object.values(r).some((v) => safeStr(v) !== ""));
  };

  const handlePickFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
    setServerResult(null);
    setMappedRows([]);
    setErrors([]);
    if (f) {
      const rows = await readImportSheet(f);
      setRawRows(rows);
    } else {
      setRawRows([]);
    }
  };

  /* ===== Auto-validate whenever rawRows or masters change ===== */
  React.useEffect(() => {
    if (!masterReady) return;
    if (!rawRows.length) {
      setErrors([]);
      setMappedRows([]);
      return;
    }
    applyValidation(rawRows, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [masterReady, rawRows, partners, subCarriers, suppliers, services]);

  /* ===== VALIDATION (CODE-only) ===== */
  const validateRows = (rows: TRaw[]) => {
    const errs: TErr[] = [];
    const mapped: ICreateOrderRequest[] = [];

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];

      // Customer (required)
      const customer = resolveByCodeStrict(partners, r["CUSTOMER CODE"]);
      if (!customer) {
        errs.push({ index: i, message: "CUSTOMER CODE not found" });
        continue;
      }

      // SubCarrier (required)
      const subc = resolveByCodeStrict(subCarriers, r["SUB CARRIER CODE"]);
      if (!subc) {
        errs.push({ index: i, message: "SUB CARRIER CODE not found" });
        continue;
      }

      // Supplier (optional)
      let sup: any = null;
      if (safeStr(r["SUPPLIER CODE"])) {
        sup = resolveByCodeStrict(suppliers, r["SUPPLIER CODE"]);
        if (!sup) {
          errs.push({ index: i, message: "SUPPLIER CODE not found" });
          continue;
        }
      }

      // Service (required) + must match SubCarrier company
      const svc = resolveServiceForSubCarrier(services, r["SERVICE CODE"], subc);
      if (!svc) {
        errs.push({ index: i, message: "SERVICE CODE not found for this SUB CARRIER (company mismatch or invalid code)" });
        continue;
      }

      // Destination (country CODE)
      const dest = normalizeCountryCodeStrict(r.DESTINATION);
      if (!dest.code) {
        errs.push({ index: i, message: "DESTINATION (country CODE) not found" });
        continue;
      }

      // Type
      const pType = normalizeType(r.TYPE);
      if (!pType) {
        errs.push({ index: i, message: "TYPE must be DOX/WPX (or DOCUMENT/PARCEL)" });
        continue;
      }

      // Charge & Gross
      const cw = asNumber(r["CHARGE WEIGHT"]);
      if (cw == null || cw <= 0) {
        errs.push({ index: i, message: "CHARGE WEIGHT must be > 0" });
        continue;
      }

      const grossTotal = asNumber(r["GROSS WEIGHT"]);
      if (grossTotal == null || grossTotal <= 0) {
        errs.push({ index: i, message: "GROSS WEIGHT must be > 0" });
        continue;
      }

      // Dimensions
      const { dims, badParts } = parseDimensionsList(safeStr(r.DIMENSIONS));
      if (!dims.length) {
        errs.push({ index: i, message: "DIMENSIONS must contain at least one LxWxH" });
        continue;
      }
      if (badParts.length) {
        errs.push({ index: i, message: `DIMENSIONS invalid parts: ${badParts.slice(0, 3).join(", ")}${badParts.length > 3 ? "..." : ""}` });
        continue;
      }

      // Company match (defensive)
      const svcCompanyId = getCompanyIdString(svc);
      const subCompanyId = getCompanyIdString(subc);
      if (svcCompanyId && subCompanyId && svcCompanyId !== subCompanyId) {
        errs.push({ index: i, message: "SERVICE CODE does not belong to SUB CARRIER's company" });
        continue;
      }

      // Distribute gross per piece
      const totalPieces = dims.length;
      const perPieceGW = grossTotal! / totalPieces;
      const mappedDims = dims.map((d, idx) => ({
        no: idx + 1,
        length: d.length,
        width: d.width,
        height: d.height,
        grossWeight: perPieceGW,
        volumeWeight: 0, // BE calculates
      }));

      const vat = asNumber(r.VAT);
      const fsc = asNumber(r.FSC);

      mapped.push({
        carrierAirWaybillCode: safeStr(r["CAWB (optional)"]) || null,

        carrierId: String((subc as any)?._id || (subc as any)?.id || ""),
        serviceId: String((svc as any)?._id || (svc as any).id || ""),
        supplierId: sup ? String((sup as any)._id || (sup as any).id) : null,

        partner: {
          partnerId: String((customer as any)._id || (customer as any).id),
          partnerName: (customer as any).name || "",
        },

        sender: {
          fullname: "",
          address1: "",
          address2: null,
          address3: null,
          phone: "",
          country: { code: toCountryCode("VN"), name: "Vietnam" },
          city: "",
          state: "",
          province: { code: "", name: "" },
          postCode: "",
        },
        recipient: {
          fullname: "",
          attention: null,
          address1: "",
          address2: null,
          address3: null,
          phone: "",
          country: { code: toCountryCode(dest.code as string), name: dest.name as string },
          city: "",
          state: "",
          province: { code: "", name: "" },
          postCode: "",
        },

        packageDetail: {
          content: "",
          declaredWeight: cw!,
          quantity: totalPieces,
          declaredValue: 0,
          currency: ECURRENCY.VND,
          dimensions: mappedDims,
        },

        note: safeStr(r.NOTE) || null,
        productType: pType!,
        surcharges: [],
        extraFees: { extraFeeIds: [], fscFeePercentage: fsc ?? null },
        vat: { customVATPercentage: vat ?? -1 },
      });
    }

    return { errs, mapped };
  };

  const applyValidation = (rows: TRaw[], notify = false) => {
    setValidating(true);
    try {
      const { errs, mapped } = validateRows(rows);
      setErrors(errs);
      setMappedRows(mapped);

      if (notify) {
        if (errs.length) showNotification(`Validate xong: ${errs.length} lỗi.`, "warning");
        else showNotification("Validate OK.", "success");
      }
    } finally {
      setValidating(false);
    }
  };

  /* ===== Actions ===== */
  const handleRemoveRow = (rowIndex: number) => {
    const next = rawRows.filter((_, i) => i !== rowIndex);
    setRawRows(next); // auto re-validate via effect
  };

  const handleRemoveErrorRows = () => {
    if (!errors.length) return;
    const errorIdx = new Set(errors.map((e) => e.index));
    const next = rawRows.filter((_, i) => !errorIdx.has(i));
    setRawRows(next); // auto re-validate
  };

  const handleCreate = async () => {
    if (!mappedRows.length) return showNotification("Không có dòng hợp lệ để tạo.", "warning");
    setCreating(true);
    setServerResult(null);
    try {
      const apiRes = await bulkCreateOrdersApi(mappedRows);
      const inserted = apiRes.inserted ?? 0;
      const failedArr = apiRes.failed ?? [];
      setServerResult({ insertedCount: inserted, failed: failedArr });

      // Popup: nếu thành công toàn bộ -> reset form để import tiếp
      if (failedArr.length === 0 && inserted > 0) {
        setSuccessInserted(inserted);
        setSuccessOpen(true);
        resetForNextImport(); // giữ master, chỉ reset file + bảng
        showNotification(`Tạo thành công ${inserted} đơn`, "success");
      } else if (failedArr.length) {
        showNotification(`Tạo xong: OK ${inserted}, lỗi ${failedArr.length}`, "warning");
      } else {
        showNotification("Không có bản ghi nào được tạo.", "info");
      }
    } catch (e: any) {
      showNotification(e?.message || "Tạo nhiều đơn thất bại", "error");
    } finally {
      setCreating(false);
    }
  };

  const handleDownloadTemplate = () => {
    const COLS = [
      "DATE",
      "CAWB (optional)",
      "CUSTOMER CODE",
      "SUB CARRIER CODE",
      "SUPPLIER CODE",
      "SERVICE CODE",
      "DESTINATION",
      "TYPE",
      "CHARGE WEIGHT",
      "GROSS WEIGHT",
      "DIMENSIONS",
      "NOTE",
      "VAT",
      "FSC",
    ] as const;

    // Mẫu với DIMENSIONS: "0x0x0, 1x1x1"
    const sample = [
      {
        DATE: new Date(),
        "CAWB (optional)": "",
        "CUSTOMER CODE": "INTLOG",
        "SUB CARRIER CODE": "FEDEXSG",
        "SUPPLIER CODE": "COURLINK",
        "SERVICE CODE": "IP",
        DESTINATION: "US",
        TYPE: "DOX",
        "CHARGE WEIGHT": 1.2,
        "GROSS WEIGHT": 1.0,
        DIMENSIONS: "0x0x0, 1x1x1",
        NOTE: "SAMPLE",
        VAT: 8,
        FSC: 29.75,
      },
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(sample, {
      header: COLS as unknown as string[],
      skipHeader: false,
      cellDates: true,
    });

    (ws as any)["!cols"] = [
      { wch: 12 },
      { wch: 16 },
      { wch: 22 },
      { wch: 22 },
      { wch: 22 },
      { wch: 22 },
      { wch: 18 },
      { wch: 10 },
      { wch: 16 },
      { wch: 16 },
      { wch: 32 },
      { wch: 20 },
      { wch: 10 },
      { wch: 10 },
    ];

    const range = XLSX.utils.decode_range((ws as any)["!ref"] as string);
    const THIN = { style: "thin", color: { auto: 1 } } as any;
    const MED = { style: "medium", color: { auto: 1 } } as any;
    const BASE_BORDER = { top: THIN, bottom: THIN, left: THIN, right: THIN };

    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const addr = XLSX.utils.encode_cell({ r: R, c: C });
        if (!(ws as any)[addr]) (ws as any)[addr] = { t: "s", v: "" };
        const isHeader = R === 0;
        (ws as any)[addr].s = {
          ...(ws as any)[addr].s,
          font: { bold: isHeader, sz: isHeader ? 12 : 11 },
          alignment: { horizontal: isHeader ? "center" : "left", vertical: "center", wrapText: true, ...(ws as any)[addr].s?.alignment },
          border: BASE_BORDER,
        };
      }
    }

    const headerIndex: Record<string, number> = {};
    COLS.forEach((h, i) => (headerIndex[h as string] = i));

    // Hàng dữ liệu #1
    const r = 1;
    // DATE -> dd/mm/yyyy + center
    {
      const c = headerIndex["DATE"];
      const addr = XLSX.utils.encode_cell({ r, c });
      const cell = (ws as any)[addr];
      if (cell) {
        cell.t = "d";
        cell.z = "dd/mm/yyyy";
        cell.s = { ...cell.s, alignment: { ...cell.s?.alignment, horizontal: "center" } };
      }
    }
    // số -> phải
    for (const h of ["CHARGE WEIGHT", "GROSS WEIGHT", "VAT", "FSC"]) {
      const c = headerIndex[h];
      const addr = XLSX.utils.encode_cell({ r, c });
      const cell = (ws as any)[addr];
      if (cell) {
        cell.t = "n";
        cell.z = "0.00";
        cell.s = { ...cell.s, alignment: { ...cell.s?.alignment, horizontal: "right" } };
      }
    }

    // Header viền dày + khung ngoài
    const rTop = range.s.r,
      rBottom = range.e.r,
      cLeft = range.s.c,
      cRight = range.e.c;
    for (let c = cLeft; c <= cRight; c++) {
      const addr = XLSX.utils.encode_cell({ r: rTop, c });
      if (!(ws as any)[addr]) (ws as any)[addr] = { t: "s", v: "" };
      (ws as any)[addr].s = { ...(ws as any)[addr].s, border: { top: MED, right: MED, bottom: MED, left: MED } };
    }
    for (let c = cLeft; c <= cRight; c++) {
      let addr = XLSX.utils.encode_cell({ r: rTop, c });
      (ws as any)[addr].s = { ...(ws as any)[addr].s, border: { ...(ws as any)[addr].s?.border, top: MED } };
      addr = XLSX.utils.encode_cell({ r: rBottom, c });
      (ws as any)[addr].s = { ...(ws as any)[addr].s, border: { ...(ws as any)[addr].s?.border, bottom: MED } };
    }
    for (let rr = rTop; rr <= rBottom; rr++) {
      let addr = XLSX.utils.encode_cell({ r: rr, c: cLeft });
      (ws as any)[addr].s = { ...(ws as any)[addr].s, border: { ...(ws as any)[addr].s?.border, left: MED } };
      addr = XLSX.utils.encode_cell({ r: rr, c: cRight });
      (ws as any)[addr].s = { ...(ws as any)[addr].s, border: { ...(ws as any)[addr].s?.border, right: MED } };
    }

    (ws as any)["!rows"] = [{ hpt: 28 }, { hpt: 28 }];

    XLSX.utils.book_append_sheet(wb, ws, "IMPORT");
    XLSX.writeFile(wb, "GWE_Order_Import_Template_v1.8.xlsx", { cellDates: true });
  };

  /* ===== Grid data ===== */
  const rowsForGrid = rawRows.map((r, i) => ({
    id: i,
    index: i + 1,

    DATE: safeStr(r.DATE),
    CAWB: safeStr(r["CAWB (optional)"]),

    CUSTOMER_CODE: safeStr(r["CUSTOMER CODE"]),
    SUBCARRIER_CODE: safeStr(r["SUB CARRIER CODE"]),
    SUPPLIER_CODE: safeStr(r["SUPPLIER CODE"]),
    SERVICE_CODE: safeStr(r["SERVICE CODE"]),

    DESTINATION: safeStr(r.DESTINATION),
    TYPE: safeStr(r.TYPE),
    CHARGE_WEIGHT: safeStr(r["CHARGE WEIGHT"]),
    GROSS_WEIGHT: safeStr(r["GROSS WEIGHT"]),
    DIMENSIONS: safeStr(r.DIMENSIONS),

    NOTE: safeStr(r.NOTE),
    VAT: safeStr(r.VAT),
    FSC: safeStr(r.FSC),
  }));

  const errorMap = new Map<number, string>(errors.map((e) => [e.index, e.message]));
  const errorSet = new Set(errorMap.keys());

  const filteredRows = React.useMemo(() => {
    if (viewTab === 1) return rowsForGrid.filter((r) => errorSet.has(r.index - 1)); // Errors
    if (viewTab === 2) return rowsForGrid.filter((r) => !errorSet.has(r.index - 1)); // OK
    return rowsForGrid;
  }, [rowsForGrid, viewTab, errorSet]);

  const totalErrors = errorSet.size;
  const totalOK = rawRows.length - totalErrors;

  const columns: GridColDef[] = [
    { field: "index", headerName: "#", width: 70, sortable: false },
    { field: "DATE", headerName: "DATE", width: 120, sortable: false },
    { field: "CAWB", headerName: "CAWB (optional)", width: 160, sortable: false },

    { field: "CUSTOMER_CODE", headerName: "CUSTOMER CODE", minWidth: 180, flex: 1, sortable: false },
    { field: "SUBCARRIER_CODE", headerName: "SUB CARRIER CODE", minWidth: 180, flex: 1, sortable: false },
    { field: "SUPPLIER_CODE", headerName: "SUPPLIER CODE", minWidth: 160, flex: 1, sortable: false },
    { field: "SERVICE_CODE", headerName: "SERVICE CODE", minWidth: 160, flex: 1, sortable: false },
    { field: "DESTINATION", headerName: "DESTINATION", minWidth: 140, flex: 1, sortable: false },

    { field: "TYPE", headerName: "TYPE", width: 100, sortable: false },
    { field: "CHARGE_WEIGHT", headerName: "CHARGE WEIGHT", width: 140, type: "number", sortable: false },
    { field: "GROSS_WEIGHT", headerName: "GROSS WEIGHT", width: 140, type: "number", sortable: false },
    { field: "DIMENSIONS", headerName: "DIMENSIONS", minWidth: 240, flex: 1, sortable: false },

    { field: "NOTE", headerName: "NOTE", minWidth: 200, flex: 1, sortable: false },
    { field: "VAT", headerName: "VAT", width: 90, sortable: false },
    { field: "FSC", headerName: "FSC", width: 90, sortable: false },

    {
      field: "state",
      headerName: "State",
      width: 110,
      sortable: false,
      renderCell: (p) => {
        const idx = (p.row.index as number) - 1;
        const hasErr = errorSet.has(idx);
        return <Chip color={hasErr ? "error" : "success"} size="small" label={hasErr ? "Error" : "OK"} />;
      },
    },
    {
      field: "errorMessage",
      headerName: "Error Message",
      minWidth: 240,
      flex: 1,
      sortable: false,
      renderCell: (p) => {
        const idx = (p.row.index as number) - 1;
        const msg = errorMap.get(idx) || "";
        return (
          <Typography variant="body2" color="error">
            {msg}
          </Typography>
        );
      },
    },
    {
      field: "actions",
      headerName: "",
      width: 80,
      sortable: false,
      renderCell: (p) => {
        const idx = (p.row.index as number) - 1;
        return (
          <Tooltip title="Remove this row">
            <IconButton color="error" size="small" onClick={() => handleRemoveRow(idx)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        );
      },
    },
  ];

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="xl" fullWidth>
        <DialogTitle>Import Orders — Tự động kiểm tra & phân loại</DialogTitle>
        <DialogContent dividers>
          <Stack gap={2}>
            <Stack direction="row" alignItems="center" gap={2} flexWrap="wrap">
              <Button variant="outlined" onClick={handleDownloadTemplate}>
                Download Template
              </Button>
              <input ref={fileInputRef} type="file" accept=".xlsx,.xls" onChange={handlePickFile} />
              <Box flex={1} />
              <Button variant="outlined" color="warning" disabled={!errors.length} onClick={handleRemoveErrorRows}>
                Remove error rows
              </Button>
              <Button variant="outlined" onClick={resetForNextImport}>
                Clear
              </Button>
            </Stack>

            {(validating || creating) && <LinearProgress />}

            {!!rawRows.length && (
              <Alert severity={totalErrors ? "warning" : "success"} variant="outlined">
                Total rows <b>{rawRows.length}</b> — OK <b>{totalOK}</b> — Errors <b>{totalErrors}</b>
              </Alert>
            )}

            {serverResult && (
              <Alert severity={serverResult.failed?.length ? "warning" : "success"} variant="outlined">
                Inserted: <b>{serverResult.insertedCount}</b> — Failed: <b>{serverResult.failed?.length || 0}</b>
              </Alert>
            )}

            <Tabs value={viewTab} onChange={(_, v) => setViewTab(v)}>
              <Tab label={`All (${rawRows.length})`} />
              <Tab label={`Errors (${totalErrors})`} />
              <Tab label={`OK (${totalOK})`} />
            </Tabs>

            <Box sx={{ height: 560, width: "100%" }}>
              <DataGrid
                rows={filteredRows}
                columns={columns}
                getRowId={(r) => r.id}
                disableRowSelectionOnClick
                pageSizeOptions={[10, 25, 50, 100]}
                initialState={{ pagination: { paginationModel: { page: 0, pageSize: 25 } } }}
                sortingMode="client"
                disableColumnMenu
              />
            </Box>

            {!masterReady && <Alert severity="info">Đang tải danh mục (customers, subcarriers, suppliers, services)...</Alert>}
            {file && masterReady && !rawRows.length && <Alert severity="error">File không có dữ liệu hợp lệ.</Alert>}
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} color="inherit">
            Close
          </Button>
          <Button onClick={handleCreate} variant="contained" disabled={creating || mappedRows.length === 0}>
            {creating ? "Creating..." : `Create Orders (${mappedRows.length} OK)`}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ===== Popup thông báo thành công & reset form để import lại ===== */}
      <Dialog open={successOpen} onClose={() => setSuccessOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Tạo đơn thành công</DialogTitle>
        <DialogContent dividers>
          <Alert severity="success" variant="outlined">
            Đã tạo thành công <b>{successInserted}</b> đơn. Form đã được reset — bạn có thể chọn file mới để import.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            onClick={() => {
              setSuccessOpen(false); // ở lại dialog chính để import tiếp
            }}
          >
            Import another file
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              setSuccessOpen(false);
              handleClose(); // đóng luôn dialog import
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
