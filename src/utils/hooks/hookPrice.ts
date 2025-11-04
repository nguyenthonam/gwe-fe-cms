// utils/hooks/hookPrice.ts
import * as XLSX from "sheetjs-style";
import { EPRODUCT_TYPE, ECURRENCY } from "@/types/typeGlobals";
import { IPurchasePriceGroup } from "@/types/typePurchasePrice";
import { ISalePriceGroup } from "@/types/typeSalePrice";

/* ----------------- Helpers ----------------- */
type RowCell = string | number | null;

const NUM_FORMAT_ALL = "[$-42A]#,##0.##"; // "[$-42A]#,##0.##;[Red]-#,##0.##"; // "[$-42A]#,##0.00";

const formatWeight = (w: number): string => {
  const str = Number(w).toFixed(1);
  return str.endsWith(".0") ? str.slice(0, -2) : str;
};

const getZones = (datas: Array<{ zone: number }>) => [...new Set(datas.map((d) => d.zone))].sort((a, b) => a - b);

const getGroupCurrency = (datas: Array<{ currency: ECURRENCY }>): ECURRENCY => {
  const arr = [...new Set(datas.map((d) => d.currency))];
  return (arr[0] || ECURRENCY.VND) as ECURRENCY;
};

const getCode = (val: any): string => {
  if (!val) return "";
  if (typeof val === "object") return val.code ?? val._id ?? "";
  return String(val);
};

// Build header + rows cho section
const buildSection = (datas: any[], opts: { perKg?: boolean }) => {
  if (!datas.length) return { header: [] as string[], rows: [] as RowCell[][] };

  const zones = getZones(datas);
  const header = [opts.perKg ? "Weight (kg-range)" : "Weight (kg)", ...zones.map(String)];

  if (opts.perKg) {
    const ranges = [...new Set(datas.map((d) => `${formatWeight(d.weightMin)}–${formatWeight(d.weightMax)}`))].sort((a, b) => Number(a.split("–")[0]) - Number(b.split("–")[0]));
    const rows = ranges.map((range) => {
      const [min, max] = range.split("–").map(Number);
      return [
        range,
        ...zones.map((z) => {
          const d = datas.find((x: any) => x.zone === z && Number(formatWeight(x.weightMin)) === Number(formatWeight(min)) && Number(formatWeight(x.weightMax)) === Number(formatWeight(max)));
          return d ? Number(d.price) : null;
        }),
      ] as RowCell[];
    });
    return { header, rows };
  }

  const weights = [...new Set(datas.map((d) => formatWeight(d.weightMax)))].sort((a, b) => Number(a) - Number(b));
  const rows = weights.map(
    (w) =>
      [
        w,
        ...zones.map((z) => {
          const d = datas.find((x: any) => formatWeight(x.weightMax) === w && x.zone === z);
          return d ? Number(d.price) : null;
        }),
      ] as RowCell[]
  );
  return { header, rows };
};

/* ----- Styling helpers (KHÔNG ghi đè v/t) ----- */
const setCellStyle = (ws: XLSX.WorkSheet, r: number, c: number, style: any) => {
  const addr = XLSX.utils.encode_cell({ r, c });
  const cell = (ws as any)[addr] || ((ws as any)[addr] = {});
  cell.s = style; // chỉ gán style, giữ nguyên v/t hiện có
};

const applyHeaderStyle = (ws: XLSX.WorkSheet, row: number, colLen: number, style: any) => {
  for (let c = 0; c < colLen; c++) setCellStyle(ws, row, c, style);
};

// ép NUMBER + set format + xoá cache text `w` để tránh hiển thị "…,"
const coerceNumberCell = (cell: any, numFmt: string) => {
  const v = cell?.v;
  // ép string kiểu "2,968,919." / "1.234,56" -> number
  const n =
    typeof v === "number" && Number.isFinite(v)
      ? v
      : ((): number | null => {
          if (typeof v !== "string") return null;
          let s = v.trim();
          if (!s) return null;
          s = s.replace(/[.,]$/, ""); // bỏ dấu . hoặc , ở cuối
          const lastComma = s.lastIndexOf(",");
          const lastDot = s.lastIndexOf(".");
          let dec = "";
          if (lastComma > lastDot) dec = ",";
          else if (lastDot > lastComma) dec = ".";
          if (dec) {
            const thou = dec === "," ? "." : ",";
            s = s.split(thou).join("");
            s = s.replace(dec, ".");
          } else {
            s = s.replace(/[.,]/g, "");
          }
          const num = Number(s);
          return Number.isFinite(num) ? num : null;
        })();

  if (n !== null) {
    cell.v = n; // <-- number thật
    cell.t = "n";
    cell.z = numFmt;
    delete cell.w; // <-- QUAN TRỌNG: xoá cache text
  } else {
    cell.v = null;
    delete cell.t;
    cell.z = numFmt;
    delete cell.w;
  }
};

const applyTableStyle = (ws: XLSX.WorkSheet, startRow: number, rows: (string | number | null)[][], colLen: number, numFmt: string, mkCellStyle: (isWeight: boolean) => any) => {
  for (let r = 0; r < rows.length; r++) {
    for (let c = 0; c < colLen; c++) {
      const addr = XLSX.utils.encode_cell({ r: startRow + r, c });
      const cell = (ws as any)[addr] || ((ws as any)[addr] = {});

      // Cột 0 (Weight): nếu là range "a–b" giữ text; còn lại ép number
      if (c === 0 && typeof cell.v === "string" && cell.v.includes("–")) {
        delete cell.t;
        delete cell.z;
        delete cell.w;
      } else {
        coerceNumberCell(cell, numFmt);
      }

      // chỉ gán style, không đụng v/t
      const style = mkCellStyle(c === 0);
      cell.s = style;
    }
  }
};

const lastColFromHeaders = (...lens: number[]) => Math.max(...lens.map((n) => (Number.isFinite(n) && n! > 0 ? n! : 1))) - 1;

/* ----------------- Core generic exporter ----------------- */
const exportPriceGroupToExcelFull = (kind: "purchase" | "sale", group: any) => {
  const allDatas = Array.isArray(group?.datas) ? group.datas : [];

  const docDatas = allDatas.filter((d: any) => d.productType === EPRODUCT_TYPE.DOCUMENT);
  const parcelDatas = allDatas.filter((d: any) => d.productType === EPRODUCT_TYPE.PARCEL && !d.isPricePerKG);
  const perKgDatas = allDatas.filter((d: any) => d.productType === EPRODUCT_TYPE.PARCEL && d.isPricePerKG);

  const currency = getGroupCurrency(allDatas);
  const doc = buildSection(docDatas, { perKg: false });
  const par = buildSection(parcelDatas, { perKg: false });
  const per = buildSection(perKgDatas, { perKg: true });

  const carrierCode = getCode(group.carrierId);
  const partnerOrSupplierCode = kind === "sale" ? getCode(group.partnerId) : getCode(group.supplierId);
  const serviceCode = getCode(group.serviceId);

  const mainTitle = ["BẢNG GIÁ DỊCH VỤ CHUYỂN PHÁT NHANH QUỐC TẾ"];
  const subTitle = [(kind === "sale" ? "GIÁ BÁN" : "GIÁ MUA") + `: ${carrierCode} - ${partnerOrSupplierCode}   |   Service: ${serviceCode}   |   Currency: ${currency}`];

  const AOA: RowCell[][] = [];
  AOA.push(mainTitle, subTitle, []);

  // Document
  const docTitleRow = AOA.length;
  let docHeaderRow: number | null = null;
  let docTableRow: number | null = null;
  if (doc.rows.length) {
    AOA.push(["Document Rates:"]);
    docHeaderRow = AOA.length;
    AOA.push(doc.header);
    docTableRow = AOA.length;
    AOA.push(...doc.rows);
    AOA.push([]);
  }

  // Non-Document
  const parTitleRow = AOA.length;
  let parHeaderRow: number | null = null;
  let parTableRow: number | null = null;
  if (par.rows.length) {
    AOA.push(["Non-Document Rates:"]);
    parHeaderRow = AOA.length;
    AOA.push(par.header);
    parTableRow = AOA.length;
    AOA.push(...par.rows);
    AOA.push([]);
  }

  // Per-KG
  let perTitleRow: number | null = null;
  let perHeaderRow: number | null = null;
  let perTableRow: number | null = null;
  if (per.rows.length) {
    perTitleRow = AOA.length;
    AOA.push(["Rates per KG (for shipments from 30.1 kg and up)"]);
    perHeaderRow = AOA.length;
    AOA.push(per.header);
    perTableRow = AOA.length;
    AOA.push(...per.rows);
    AOA.push([]);
  }

  // Sheet
  const ws = XLSX.utils.aoa_to_sheet(AOA);
  const lastCol = lastColFromHeaders(doc.header.length, par.header.length, per.header.length);

  // Merge
  const merges: Array<{ s: { r: number; c: number }; e: { r: number; c: number } }> = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: lastCol } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: lastCol } },
  ];
  if (doc.rows.length) merges.push({ s: { r: docTitleRow, c: 0 }, e: { r: docTitleRow, c: lastCol } });
  if (par.rows.length) merges.push({ s: { r: parTitleRow, c: 0 }, e: { r: parTitleRow, c: lastCol } });
  if (per.rows.length && perTitleRow !== null) merges.push({ s: { r: perTitleRow, c: 0 }, e: { r: perTitleRow, c: lastCol } });
  ws["!merges"] = [...(ws["!merges"] || []), ...merges];

  // Styles
  const borderThin = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
  const titleStyle = { font: { bold: true, sz: 18, color: { rgb: "C65911" }, name: "Arial" }, alignment: { horizontal: "center", vertical: "center" } };
  const subTitleStyle = { font: { bold: true, sz: 14, name: "Arial" }, alignment: { horizontal: "center" } };
  const sectionTitleStyle = { font: { bold: true, sz: 13, color: { rgb: "1b4786" }, name: "Arial" }, alignment: { horizontal: "center", vertical: "center" } };
  const headerStyle = {
    font: { bold: true, color: { rgb: "C65911" }, name: "Arial", sz: 11 },
    fill: { fgColor: { rgb: "FFFACD" } },
    alignment: { horizontal: "center", vertical: "center" },
    border: borderThin,
  };
  const mkCellStyle = (isWeight: boolean) => ({
    font: { name: "Arial", sz: 10 },
    alignment: { horizontal: isWeight ? "center" : "right", vertical: "center" },
    border: borderThin,
  });

  // Titles & headers
  setCellStyle(ws, 0, 0, titleStyle);
  setCellStyle(ws, 1, 0, subTitleStyle);
  if (doc.rows.length) setCellStyle(ws, docTitleRow, 0, sectionTitleStyle);
  if (par.rows.length) setCellStyle(ws, parTitleRow, 0, sectionTitleStyle);
  if (per.rows.length && perTitleRow !== null) setCellStyle(ws, perTitleRow, 0, sectionTitleStyle);

  if (docHeaderRow !== null) applyHeaderStyle(ws, docHeaderRow, doc.header.length, headerStyle);
  if (parHeaderRow !== null) applyHeaderStyle(ws, parHeaderRow, par.header.length, headerStyle);
  if (perHeaderRow !== null) applyHeaderStyle(ws, perHeaderRow, per.header.length, headerStyle);

  // Bảng dữ liệu: ÉP NUMBER + 1 format (xoá cache `w`)
  if (docTableRow !== null) applyTableStyle(ws, docTableRow, doc.rows, doc.header.length, NUM_FORMAT_ALL, mkCellStyle);
  if (parTableRow !== null) applyTableStyle(ws, parTableRow, par.rows, par.header.length, NUM_FORMAT_ALL, mkCellStyle);
  if (perTableRow !== null) applyTableStyle(ws, perTableRow, per.rows, per.header.length, NUM_FORMAT_ALL, mkCellStyle);

  (ws as any)["!cols"] = Array(lastCol + 1).fill({ wch: 18 });

  // Save
  const wb = XLSX.utils.book_new();
  const sheetName = (kind === "sale" ? `GiaBan_${carrierCode}_${partnerOrSupplierCode}` : `GiaMua_${carrierCode}_${partnerOrSupplierCode}`).slice(0, 31);
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, `${sheetName}.xlsx`);
};

/* ----------------- Public APIs ----------------- */
export const exportPurchasePriceGroupToExcelFull = (group: IPurchasePriceGroup) => {
  exportPriceGroupToExcelFull("purchase", group as any);
};
export const exportSalePriceGroupToExcelFull = (group: ISalePriceGroup) => {
  exportPriceGroupToExcelFull("sale", group as any);
};
