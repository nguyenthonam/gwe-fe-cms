import * as XLSX from "sheetjs-style";
import { IPurchasePriceGroup } from "@/types/typePurchasePrice";
import { EPRODUCT_TYPE, ECURRENCY } from "@/types/typeGlobals";
import { ISalePriceGroup } from "@/types/typeSalePrice";

function formatWeight(w: number) {
  return Number(w).toFixed(1);
}
function formatCurrency(value: number, currency: ECURRENCY) {
  if (currency === ECURRENCY.VND) return value.toLocaleString("vi-VN");
  return value.toLocaleString("vi-VN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ` ${currency}`;
}

export function exportPurchasePriceGroupToExcelFull(group: IPurchasePriceGroup) {
  // --- Data split ---
  const docDatas = group.datas.filter((d) => d.productType === EPRODUCT_TYPE.DOCUMENT);
  const parcelDatas = group.datas.filter((d) => d.productType === EPRODUCT_TYPE.PARCEL && !d.isPricePerKG);
  const perKgDatas = group.datas.filter((d) => d.productType === EPRODUCT_TYPE.PARCEL && d.isPricePerKG);

  // Helper
  const getZones = (datas: typeof group.datas) => [...new Set(datas.map((d) => d.zone))].sort((a, b) => a - b);

  // --- Document Rates ---
  const docZones = getZones(docDatas);
  const docWeight = [...new Set(docDatas.map((d) => formatWeight(d.weightMax)))].sort((a, b) => Number(a) - Number(b));
  const docHeader = ["Weight (kg)", ...docZones.map((z) => z.toString())];
  const docRows = docWeight.map((w) => [
    w,
    ...docZones.map((z) => {
      const d = docDatas.find((d) => formatWeight(d.weightMax) === w && d.zone === z);
      return d ? formatCurrency(d.price, d.currency) : "";
    }),
  ]);

  // --- Non-Document Rates ---
  const parcelZones = getZones(parcelDatas);
  const parcelWeight = [...new Set(parcelDatas.map((d) => formatWeight(d.weightMax)))].sort((a, b) => Number(a) - Number(b));
  const parcelHeader = ["Weight (kg)", ...parcelZones.map((z) => z.toString())];
  const parcelRows = parcelWeight.map((w) => [
    w,
    ...parcelZones.map((z) => {
      const d = parcelDatas.find((d) => formatWeight(d.weightMax) === w && d.zone === z);
      return d ? formatCurrency(d.price, d.currency) : "";
    }),
  ]);

  // --- Per KG Rates ---
  const perKgZones = getZones(perKgDatas);
  const perKgRanges = [...new Set(perKgDatas.map((d) => `${formatWeight(d.weightMin)}–${formatWeight(d.weightMax)}`))].sort((a, b) => {
    const [aMin] = a.split("–").map(Number);
    const [bMin] = b.split("–").map(Number);
    return aMin - bMin;
  });
  const perKgHeader = ["Weight (kg)", ...perKgZones.map((z) => z.toString())];
  const perKgRows = perKgRanges.map((range) => {
    const [min, max] = range.split("–").map(Number);
    return [
      range,
      ...perKgZones.map((z) => {
        const d = perKgDatas.find((d) => d.zone === z && Number(formatWeight(d.weightMin)) === Number(formatWeight(min)) && Number(formatWeight(d.weightMax)) === Number(formatWeight(max)));
        return d ? formatCurrency(d.price, d.currency) : "";
      }),
    ];
  });

  // Title/Meta
  const carrierName = typeof group.carrierId === "object" ? group.carrierId?.code : group.carrierId || "";
  const supplierName = typeof group.supplierId === "object" ? group.supplierId?.code : group.supplierId || "";
  const mainTitle = [`BẢNG  GIÁ DỊCH VỤ CHUYỂN PHÁT NHANH QUỐC TẾ`];
  const subTitle = [`GIÁ MUA: ${carrierName} - ${supplierName}`];

  // --- Build Sheet ---
  const sheetAOA: (string | number)[][] = [];
  // Add Title
  sheetAOA.push(mainTitle);
  sheetAOA.push(subTitle);
  sheetAOA.push([]); // Blank

  // Section 1: Document Rates
  const docTitleRow = sheetAOA.length;
  sheetAOA.push(["Document Rates:"]);
  const docHeaderRow = sheetAOA.length;
  sheetAOA.push(docHeader);
  const docTableRow = sheetAOA.length;
  sheetAOA.push(...docRows);
  sheetAOA.push([]);

  // Section 2: Non-Document Rates
  const parcelTitleRow = sheetAOA.length;
  sheetAOA.push(["Non-Document Rates:"]);
  const parcelHeaderRow = sheetAOA.length;
  sheetAOA.push(parcelHeader);
  const parcelTableRow = sheetAOA.length;
  sheetAOA.push(...parcelRows);
  sheetAOA.push([]);

  // Section 3: Per KG Rates (if any)
  let perKgTitleRow = null,
    perKgHeaderRow = null,
    perKgTableRow = null;
  if (perKgRows.length > 0) {
    perKgTitleRow = sheetAOA.length;
    sheetAOA.push(["Giá cước mỗi kg với lô hàng từ 30.1kg trở lên"]);
    perKgHeaderRow = sheetAOA.length;
    sheetAOA.push(perKgHeader);
    perKgTableRow = sheetAOA.length;
    sheetAOA.push(...perKgRows);
    sheetAOA.push([]);
  }

  // Setup Sheet
  const ws = XLSX.utils.aoa_to_sheet(sheetAOA);

  // --- Calculate column count for merging ---
  const lastCol = Math.max(docHeader.length, parcelHeader.length, perKgHeader.length) - 1;

  // --- Merge ---
  ws["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: lastCol } }, // Title
    { s: { r: 1, c: 0 }, e: { r: 1, c: lastCol } }, // Subtitle
    { s: { r: docTitleRow, c: 0 }, e: { r: docTitleRow, c: lastCol } }, // Doc title
    { s: { r: parcelTitleRow, c: 0 }, e: { r: parcelTitleRow, c: lastCol } }, // Parcel title
    ...(perKgTitleRow !== null ? [{ s: { r: perKgTitleRow, c: 0 }, e: { r: perKgTitleRow, c: lastCol } }] : []),
  ];

  // --- Styles ---
  const border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
  const titleStyle = {
    font: { bold: true, sz: 18, color: { rgb: "C65911" }, name: "Arial" },
    alignment: { horizontal: "center", vertical: "center" },
  };
  const subTitleStyle = { font: { bold: true, sz: 14, name: "Arial" }, alignment: { horizontal: "center" } };
  const sectionTitleStyle = {
    font: { bold: true, sz: 13, color: { rgb: "1b4786" }, name: "Arial" },
    alignment: { horizontal: "center", vertical: "center" },
  };
  const headerStyle = {
    font: { bold: true, color: { rgb: "C65911" }, name: "Arial", sz: 11 },
    fill: { fgColor: { rgb: "FFFACD" } },
    alignment: { horizontal: "center", vertical: "center" },
    border,
  };
  const cellStyle = (isWeight = false) => ({
    font: { name: "Arial", sz: 10 },
    alignment: { horizontal: isWeight ? "center" : "right", vertical: "center" },
    border,
  });

  function safeSetCellStyle(cell: string, style: any) {
    if (!ws[cell]) ws[cell] = { t: "s", v: "" };
    ws[cell].s = style;
  }

  // Style Title
  safeSetCellStyle("A1", titleStyle);
  safeSetCellStyle("A2", subTitleStyle);

  // Section titles
  safeSetCellStyle(XLSX.utils.encode_cell({ r: docTitleRow, c: 0 }), sectionTitleStyle);
  safeSetCellStyle(XLSX.utils.encode_cell({ r: parcelTitleRow, c: 0 }), sectionTitleStyle);
  if (perKgTitleRow !== null) safeSetCellStyle(XLSX.utils.encode_cell({ r: perKgTitleRow, c: 0 }), sectionTitleStyle);

  // Header rows
  function styleHeaderRow(row: number, colLen: number) {
    for (let i = 0; i < colLen; ++i) {
      const cell = XLSX.utils.encode_cell({ r: row, c: i });
      safeSetCellStyle(cell, headerStyle);
    }
  }
  styleHeaderRow(docHeaderRow, docHeader.length);
  styleHeaderRow(parcelHeaderRow, parcelHeader.length);
  if (perKgHeaderRow !== null) styleHeaderRow(perKgHeaderRow, perKgHeader.length);

  // Table cells
  function styleTable(startRow: number, rows: any[][], colLen: number) {
    for (let r = 0; r < rows.length; ++r) {
      for (let c = 0; c < colLen; ++c) {
        const cell = XLSX.utils.encode_cell({ r: startRow + r, c });
        safeSetCellStyle(cell, cellStyle(c === 0));
      }
    }
  }
  styleTable(docTableRow, docRows, docHeader.length);
  styleTable(parcelTableRow, parcelRows, parcelHeader.length);
  if (perKgTableRow !== null) styleTable(perKgTableRow, perKgRows, perKgHeader.length);

  // Column widths
  ws["!cols"] = Array(lastCol + 1).fill({ wch: 18 });

  // Workbook & Save
  const wb = XLSX.utils.book_new();
  const sheetName = `GiaMua_${carrierName}_${supplierName}`.slice(0, 31);
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, `${sheetName}.xlsx`);
}

export function exportSalePriceGroupToExcelFull(group: ISalePriceGroup) {
  const docDatas = group.datas.filter((d) => d.productType === EPRODUCT_TYPE.DOCUMENT);
  const parcelDatas = group.datas.filter((d) => d.productType === EPRODUCT_TYPE.PARCEL && !d.isPricePerKG);
  const perKgDatas = group.datas.filter((d) => d.productType === EPRODUCT_TYPE.PARCEL && d.isPricePerKG);

  const getZones = (datas: typeof group.datas) => [...new Set(datas.map((d) => d.zone))].sort((a, b) => a - b);

  const docZones = getZones(docDatas);
  const docWeight = [...new Set(docDatas.map((d) => formatWeight(d.weightMax)))].sort((a, b) => Number(a) - Number(b));
  const docHeader = ["Weight (kg)", ...docZones.map((z) => z.toString())];
  const docRows = docWeight.map((w) => [
    w,
    ...docZones.map((z) => {
      const d = docDatas.find((d) => formatWeight(d.weightMax) === w && d.zone === z);
      return d ? formatCurrency(d.price, d.currency) : "";
    }),
  ]);

  const parcelZones = getZones(parcelDatas);
  const parcelWeight = [...new Set(parcelDatas.map((d) => formatWeight(d.weightMax)))].sort((a, b) => Number(a) - Number(b));
  const parcelHeader = ["Weight (kg)", ...parcelZones.map((z) => z.toString())];
  const parcelRows = parcelWeight.map((w) => [
    w,
    ...parcelZones.map((z) => {
      const d = parcelDatas.find((d) => formatWeight(d.weightMax) === w && d.zone === z);
      return d ? formatCurrency(d.price, d.currency) : "";
    }),
  ]);

  const perKgZones = getZones(perKgDatas);
  const perKgRanges = [...new Set(perKgDatas.map((d) => `${formatWeight(d.weightMin)}–${formatWeight(d.weightMax)}`))].sort((a, b) => {
    const [aMin] = a.split("–").map(Number);
    const [bMin] = b.split("–").map(Number);
    return aMin - bMin;
  });
  const perKgHeader = ["Weight (kg)", ...perKgZones.map((z) => z.toString())];
  const perKgRows = perKgRanges.map((range) => {
    const [min, max] = range.split("–").map(Number);
    return [
      range,
      ...perKgZones.map((z) => {
        const d = perKgDatas.find((d) => d.zone === z && Number(formatWeight(d.weightMin)) === Number(formatWeight(min)) && Number(formatWeight(d.weightMax)) === Number(formatWeight(max)));
        return d ? formatCurrency(d.price, d.currency) : "";
      }),
    ];
  });

  const carrierName = typeof group.carrierId === "object" ? group.carrierId?.code : group.carrierId || "";
  const partnerName = typeof group.partnerId === "object" ? group.partnerId?.code : group.partnerId || "";
  const mainTitle = ["BẢNG GIÁ DỊCH VỤ CHUYỂN PHÁT NHANH QUỐC TẾ"];
  const subTitle = [`GIÁ BÁN: ${carrierName} - ${partnerName}`];

  const sheetAOA: (string | number)[][] = [];
  sheetAOA.push(mainTitle);
  sheetAOA.push(subTitle);
  sheetAOA.push([]);

  const docTitleRow = sheetAOA.length;
  sheetAOA.push(["Document Rates:"]);
  const docHeaderRow = sheetAOA.length;
  sheetAOA.push(docHeader);
  const docTableRow = sheetAOA.length;
  sheetAOA.push(...docRows);
  sheetAOA.push([]);

  const parcelTitleRow = sheetAOA.length;
  sheetAOA.push(["Non-Document Rates:"]);
  const parcelHeaderRow = sheetAOA.length;
  sheetAOA.push(parcelHeader);
  const parcelTableRow = sheetAOA.length;
  sheetAOA.push(...parcelRows);
  sheetAOA.push([]);

  let perKgTitleRow = null,
    perKgHeaderRow = null,
    perKgTableRow = null;
  if (perKgRows.length > 0) {
    perKgTitleRow = sheetAOA.length;
    sheetAOA.push(["Giá cước mỗi kg với lô hàng từ 30.1kg trở lên"]);
    perKgHeaderRow = sheetAOA.length;
    sheetAOA.push(perKgHeader);
    perKgTableRow = sheetAOA.length;
    sheetAOA.push(...perKgRows);
    sheetAOA.push([]);
  }

  const ws = XLSX.utils.aoa_to_sheet(sheetAOA);
  const lastCol = Math.max(docHeader.length, parcelHeader.length, perKgHeader.length) - 1;

  ws["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: lastCol } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: lastCol } },
    { s: { r: docTitleRow, c: 0 }, e: { r: docTitleRow, c: lastCol } },
    { s: { r: parcelTitleRow, c: 0 }, e: { r: parcelTitleRow, c: lastCol } },
    ...(perKgTitleRow !== null ? [{ s: { r: perKgTitleRow, c: 0 }, e: { r: perKgTitleRow, c: lastCol } }] : []),
  ];

  const border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
  const titleStyle = {
    font: { bold: true, sz: 18, color: { rgb: "C65911" }, name: "Arial" },
    alignment: { horizontal: "center", vertical: "center" },
  };
  const subTitleStyle = { font: { bold: true, sz: 14, name: "Arial" }, alignment: { horizontal: "center" } };
  const sectionTitleStyle = {
    font: { bold: true, sz: 13, color: { rgb: "1b4786" }, name: "Arial" },
    alignment: { horizontal: "center", vertical: "center" },
  };
  const headerStyle = {
    font: { bold: true, color: { rgb: "C65911" }, name: "Arial", sz: 11 },
    fill: { fgColor: { rgb: "FFFACD" } },
    alignment: { horizontal: "center", vertical: "center" },
    border,
  };
  const cellStyle = (isWeight = false) => ({
    font: { name: "Arial", sz: 10 },
    alignment: { horizontal: isWeight ? "center" : "right", vertical: "center" },
    border,
  });

  function safeSetCellStyle(cell: string, style: any) {
    if (!ws[cell]) ws[cell] = { t: "s", v: "" };
    ws[cell].s = style;
  }

  safeSetCellStyle("A1", titleStyle);
  safeSetCellStyle("A2", subTitleStyle);
  safeSetCellStyle(XLSX.utils.encode_cell({ r: docTitleRow, c: 0 }), sectionTitleStyle);
  safeSetCellStyle(XLSX.utils.encode_cell({ r: parcelTitleRow, c: 0 }), sectionTitleStyle);
  if (perKgTitleRow !== null) safeSetCellStyle(XLSX.utils.encode_cell({ r: perKgTitleRow, c: 0 }), sectionTitleStyle);

  function styleHeaderRow(row: number, colLen: number) {
    for (let i = 0; i < colLen; ++i) {
      const cell = XLSX.utils.encode_cell({ r: row, c: i });
      safeSetCellStyle(cell, headerStyle);
    }
  }
  styleHeaderRow(docHeaderRow, docHeader.length);
  styleHeaderRow(parcelHeaderRow, parcelHeader.length);
  if (perKgHeaderRow !== null) styleHeaderRow(perKgHeaderRow, perKgHeader.length);

  function styleTable(startRow: number, rows: any[][], colLen: number) {
    for (let r = 0; r < rows.length; ++r) {
      for (let c = 0; c < colLen; ++c) {
        const cell = XLSX.utils.encode_cell({ r: startRow + r, c });
        safeSetCellStyle(cell, cellStyle(c === 0));
      }
    }
  }
  styleTable(docTableRow, docRows, docHeader.length);
  styleTable(parcelTableRow, parcelRows, parcelHeader.length);
  if (perKgTableRow !== null) styleTable(perKgTableRow, perKgRows, perKgHeader.length);

  ws["!cols"] = Array(lastCol + 1).fill({ wch: 18 });
  const wb = XLSX.utils.book_new();
  const sheetName = `GiaBan_${carrierName}_${partnerName}`.slice(0, 31);
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, `${sheetName}.xlsx`);
}
