import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Stack, Divider, Box, Table, TableHead, TableRow, TableCell, TableBody, useTheme, Grid } from "@mui/material";
import { IPurchasePriceGroup } from "@/types/typePurchasePrice";
import { EPRODUCT_TYPE, ECURRENCY } from "@/types/typeGlobals";
import { lightBlue } from "@mui/material/colors";

function formatWeight(w: number) {
  return Number(w).toFixed(1);
}
function formatCurrency(value: number, currency: ECURRENCY) {
  if (currency === ECURRENCY.VND) return value.toLocaleString("vi-VN");
  return value.toLocaleString("vi-VN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ` ${currency}`;
}

function PriceTable({ label, currency, zones, rows, headerTitle = "Weight (kg)" }: { label: string; currency: string; zones: number[]; rows: any[]; headerTitle?: string }) {
  const theme = useTheme();
  return (
    <Box sx={{ my: 3, overflowX: "auto" }}>
      <Typography fontWeight={700} fontSize={15} color="primary.dark" mb={0.5} letterSpacing={0.5}>
        {label}
      </Typography>
      <Typography fontWeight={600} fontSize={13} color="#1b4786" mb={1}>
        Currency: {currency}
      </Typography>
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
  );
}

export default function PurchasePriceDetailDialog({ open, group, onClose }: { open: boolean; group: IPurchasePriceGroup; onClose: () => void }) {
  if (!group) return null;
  const datas = Array.isArray((group as any).datas) ? group.datas : [];

  const docDatas = datas.filter((d) => d.productType === EPRODUCT_TYPE.DOCUMENT);
  const parcelDatas = datas.filter((d) => d.productType === EPRODUCT_TYPE.PARCEL && !d.isPricePerKG);
  const perKgDatas = datas.filter((d) => d.productType === EPRODUCT_TYPE.PARCEL && d.isPricePerKG);

  const getZones = (datas: typeof group.datas) => [...new Set(datas.map((d) => d.zone))].sort((a, b) => a - b);
  const getCurrency = (datas: typeof group.datas) => [...new Set(datas.map((d) => d.currency))].join(", ");

  const docZones = getZones(docDatas);
  const docCurrency = getCurrency(docDatas);
  const docWeight = [...new Set(docDatas.map((d) => formatWeight(d.weightMax)))].sort((a, b) => Number(a) - Number(b));
  const docRows = docWeight.map((w) => [
    w,
    ...docZones.map((z) => {
      const d = docDatas.find((d) => formatWeight(d.weightMax) === w && d.zone === z);
      return d ? formatCurrency(d.price, d.currency) : "";
    }),
  ]);

  const parcelZones = getZones(parcelDatas);
  const parcelCurrency = getCurrency(parcelDatas);
  const parcelWeight = [...new Set(parcelDatas.map((d) => formatWeight(d.weightMax)))].sort((a, b) => Number(a) - Number(b));
  const parcelRows = parcelWeight.map((w) => [
    w,
    ...parcelZones.map((z) => {
      const d = parcelDatas.find((d) => formatWeight(d.weightMax) === w && d.zone === z);
      return d ? formatCurrency(d.price, d.currency) : "";
    }),
  ]);

  const perKgZones = getZones(perKgDatas);
  const perKgCurrency = getCurrency(perKgDatas);
  const perKgRanges = [...new Set(perKgDatas.map((d) => `${formatWeight(d.weightMin)}–${formatWeight(d.weightMax)}`))].sort((a, b) => {
    const [aMin] = a.split("–").map(Number);
    const [bMin] = b.split("–").map(Number);
    return aMin - bMin;
  });
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

  const infoItems = [
    { label: "Supplier", value: typeof group.supplierId === "object" ? group.supplierId?.code : group.supplierId },
    { label: "Sub Carrier", value: typeof group.carrierId === "object" ? group.carrierId?.code : group.carrierId },
    { label: "Service", value: typeof group.serviceId === "object" ? group.serviceId?.code : group.serviceId },
    { label: "Currency", value: datas[0]?.currency ?? "" },
  ];

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
              <Grid size={6} key={item.label}>
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
        {perKgRows.length > 0 && <PriceTable label="Rates per KG for shipments from 30.1kg and above" currency={perKgCurrency} zones={perKgZones} rows={perKgRows} headerTitle="Range (kg)" />}
      </DialogContent>
      <DialogActions sx={{ background: "#fafbfc", borderTop: "1px solid #e0e0e0" }}>
        <Button variant="contained" color="primary" onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
