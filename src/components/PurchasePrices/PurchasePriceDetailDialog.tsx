"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Stack,
  Divider,
  Box,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  useTheme,
  Grid,
  Collapse,
  IconButton,
} from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import { IPurchasePriceGroup } from "@/types/typePurchasePrice";
import { EPRODUCT_TYPE } from "@/types/typeGlobals";
import { lightBlue } from "@mui/material/colors";
import { getId } from "@/utils/hooks/hookGlobals";
import { formatNumberVi } from "@/utils/hooks/hookNumber";

/* ========= Helpers ========= */

// Chuẩn hoá để so sánh số cân nặng (tránh lỗi float)
const normalizeWeight = (w: number): number => Number((Number(w) || 0).toFixed(1));

const getCode = (val: any): string => {
  if (!val) return "";
  if (typeof val === "object") return val.code ?? getId(val) ?? "";
  return String(val);
};

type PriceTableProps = {
  label: string;
  currency: string;
  zones: number[];
  rows: any[];
  headerTitle?: string;
};

/* ========= Sub component: PriceTable (có thể thu gọn/mở rộng) ========= */

const PriceTable: React.FC<PriceTableProps> = ({ label, currency, zones, rows, headerTitle = "Weight (kg)" }) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(true);

  const handleToggle = () => {
    setExpanded((prev) => !prev);
  };

  return (
    <Box sx={{ my: 2 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: expanded ? 1 : 0.5 }}>
        <Box>
          <Typography fontWeight={700} fontSize={15} color="primary.dark" letterSpacing={0.5}>
            {label}
          </Typography>
          <Typography fontWeight={600} fontSize={13} color="#1b4786">
            Currency: {currency}
          </Typography>
        </Box>
        <IconButton size="small" onClick={handleToggle}>
          {expanded ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
        </IconButton>
      </Stack>

      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Box sx={{ overflowX: "auto" }}>
          <Table
            size="small"
            sx={{
              minWidth: 800,
              border: "1px solid #f1f1f1",
              background: "#fff",
              borderRadius: 2,
              overflow: "hidden",
              boxShadow: theme.shadows[1],
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    background: "#FFFACD",
                    color: "#C65911",
                    border: "1px solid #f1f1f1",
                    textAlign: "center",
                    minWidth: 100,
                  }}
                >
                  {headerTitle}
                </TableCell>
                {zones.map((z) => (
                  <TableCell
                    key={z}
                    sx={{
                      fontWeight: 700,
                      background: "#FFFACD",
                      color: "#C65911",
                      border: "1px solid #f1f1f1",
                      textAlign: "center",
                      minWidth: 80,
                    }}
                  >
                    Zone {z}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row, i) => (
                <TableRow key={i}>
                  <TableCell
                    sx={{
                      border: "1px solid #f1f1f1",
                      background: "#fafbfc",
                      fontWeight: 600,
                      textAlign: "center",
                      width: 110,
                    }}
                  >
                    {row[0]}
                  </TableCell>
                  {row.slice(1).map((cell: any, idx: number) => (
                    <TableCell
                      key={idx}
                      sx={{
                        border: "1px solid #f1f1f1",
                        textAlign: "right",
                        fontFamily: "inherit",
                        background: "#fff",
                      }}
                    >
                      {cell}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </Collapse>
    </Box>
  );
};

/* ========= Main component ========= */

type PurchasePriceDetailDialogProps = {
  open: boolean;
  group: IPurchasePriceGroup | null;
  onClose: () => void;
  /** Callback xoá toàn bộ group (bảng giá). Parent sẽ gọi API & reload. */
  onDeleteGroup?: (group: IPurchasePriceGroup) => Promise<void> | void;
};

const PurchasePriceDetailDialog: React.FC<PurchasePriceDetailDialogProps> = ({ open, group, onClose, onDeleteGroup }) => {
  const [deleting, setDeleting] = useState(false);

  if (!group) return null;
  const datas = Array.isArray((group as any).datas) ? group.datas : [];

  const docDatas = datas.filter((d) => d.productType === EPRODUCT_TYPE.DOCUMENT);
  const parcelDatas = datas.filter((d) => d.productType === EPRODUCT_TYPE.PARCEL && !d.isPricePerKG);
  const perKgDatas = datas.filter((d) => d.productType === EPRODUCT_TYPE.PARCEL && d.isPricePerKG);

  const getZones = (arr: typeof datas): number[] => [...new Set(arr.map((d) => d.zone))].sort((a, b) => a - b);

  const getCurrencies = (arr: typeof datas): string => [...new Set(arr.map((d) => d.currency))].join(", ");

  /* ---------- Document table ---------- */

  const docZones = getZones(docDatas);
  const docCurrency = getCurrencies(docDatas);

  const docWeights = [...new Set(docDatas.map((d) => normalizeWeight(d.weightMax)))].sort((a, b) => a - b);

  const docRows = docWeights.map((w) => [
    // hiển thị cân nặng kiểu Việt Nam
    formatNumberVi(w),
    ...docZones.map((z) => {
      const d = docDatas.find((item) => normalizeWeight(item.weightMax) === w && item.zone === z);
      // hiển thị giá cũng dùng cùng 1 format
      return d ? formatNumberVi(d.price) : "";
    }),
  ]);

  /* ---------- Parcel table (non per-KG) ---------- */

  const parcelZones = getZones(parcelDatas);
  const parcelCurrency = getCurrencies(parcelDatas);

  const parcelWeights = [...new Set(parcelDatas.map((d) => normalizeWeight(d.weightMax)))].sort((a, b) => a - b);

  const parcelRows = parcelWeights.map((w) => [
    formatNumberVi(w),
    ...parcelZones.map((z) => {
      const d = parcelDatas.find((item) => normalizeWeight(item.weightMax) === w && item.zone === z);
      return d ? formatNumberVi(d.price) : "";
    }),
  ]);

  /* ---------- Per-KG table ---------- */

  const perKgZones = getZones(perKgDatas);
  const perKgCurrency = getCurrencies(perKgDatas);

  const perKgRangeMap = new Map<string, { min: number; max: number }>();

  perKgDatas.forEach((d) => {
    const min = normalizeWeight(d.weightMin);
    const max = normalizeWeight(d.weightMax);
    const key = `${min}-${max}`;
    if (!perKgRangeMap.has(key)) {
      perKgRangeMap.set(key, { min, max });
    }
  });

  const perKgRanges = [...perKgRangeMap.values()].sort((a, b) => a.min - b.min);

  const perKgRows = perKgRanges.map((range) => [
    // Range hiển thị "30,1–70,0" (vẫn dùng cùng formatNumberVi cho 2 đầu)
    `${formatNumberVi(range.min)}–${formatNumberVi(range.max)}`,
    ...perKgZones.map((z) => {
      const d = perKgDatas.find((item) => item.zone === z && normalizeWeight(item.weightMin) === range.min && normalizeWeight(item.weightMax) === range.max);
      return d ? formatNumberVi(d.price) : "";
    }),
  ]);

  /* ---------- Header info ---------- */

  const infoItems = [
    { label: "Supplier", value: getCode(group.supplierId) },
    { label: "Sub Carrier", value: getCode(group.carrierId) },
    { label: "Service", value: getCode(group.serviceId) },
    { label: "Currency", value: getCurrencies(datas) },
  ];

  /* ---------- Delete entire group ---------- */

  const handleDeleteAll = async () => {
    if (!group || !onDeleteGroup) return;
    const confirmed = window.confirm("Are you sure you want to delete the entire price table?");
    if (!confirmed) return;

    try {
      setDeleting(true);
      await onDeleteGroup(group);
    } catch (err) {
      // parent nên handle toast, nhưng ở đây không show gì thêm
      // hoặc anh có thể import useNotification để bắn noti tại đây
      console.error("Error deleting price group:", err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
      <DialogTitle
        sx={{
          color: lightBlue[500],
          background: "#fafbfc",
          borderBottom: "1px solid #e0e0e0",
          pb: 2,
          fontWeight: 700,
          fontSize: 20,
          letterSpacing: 0.5,
        }}
      >
        PURCHASE PRICE TABLE
      </DialogTitle>

      <DialogContent dividers sx={{ background: "#f6f8fa" }}>
        <Stack direction="row" spacing={3} alignItems="center" sx={{ mb: 2 }}>
          <Grid container spacing={2}>
            {infoItems.map((item) => (
              <Grid key={item.label} size={6}>
                <Typography>
                  {item.label}: <b>{item.value}</b>
                </Typography>
              </Grid>
            ))}
          </Grid>
        </Stack>

        <Divider sx={{ my: 2 }} />

        {docRows.length > 0 && <PriceTable label="Document Rates" currency={docCurrency} zones={docZones} rows={docRows} />}
        {parcelRows.length > 0 && <PriceTable label="Non-Document Rates" currency={parcelCurrency} zones={parcelZones} rows={parcelRows} />}
        {perKgRows.length > 0 && <PriceTable label="Rates per KG (for shipments from 30.1 kg and up)" currency={perKgCurrency} zones={perKgZones} rows={perKgRows} headerTitle="Range (kg)" />}
      </DialogContent>

      <DialogActions sx={{ background: "#fafbfc", borderTop: "1px solid #e0e0e0" }}>
        {onDeleteGroup && (
          <Button variant="outlined" color="error" onClick={handleDeleteAll} disabled={deleting}>
            Delete entire price table
          </Button>
        )}

        <Box sx={{ flexGrow: 1 }} />

        <Button variant="contained" color="primary" onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PurchasePriceDetailDialog;
