"use client";

import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, Divider, Paper, Stack } from "@mui/material";
import Grid from "@mui/material/Grid";
import { IOrder } from "@/types/typeOrder";
import { EnumChip } from "@/components/Globals/EnumChip";
import { formatNumberVi } from "@/utils/hooks/hookNumber";
import { formatDate } from "@/utils/hooks/hookDate";
import { ECURRENCY } from "@/types/typeGlobals";

/** Currency theo v1.1 */
function currencyOf(order?: IOrder): ECURRENCY | null | undefined {
  return order?.currency ?? order?.basePrice?.purchasePrice?.currency ?? order?.basePrice?.salePrice?.currency ?? ECURRENCY.VND;
}

/** Hiển thị name/code/_id nếu là object, ngược lại string */
function displayRef(val: any): string {
  if (!val) return "-";
  if (typeof val === "object") return val?.name || val?.code || val?._id || "-";
  return String(val);
}

interface Props {
  open: boolean;
  onClose: () => void;
  order: IOrder | null;
}

export default function OrderDetailDialog({ open, onClose, order }: Props) {
  if (!order) return null;

  const cur = currencyOf(order);

  const purchaseBase = Number(order?.basePrice?.purchasePrice?.value ?? 0);
  const saleBase = Number(order?.basePrice?.salePrice?.value ?? 0);

  const extraFeesTotal = Number(order?.extraFees?.extraFeesTotal ?? 0);

  const fscPurchase = Number(order?.extraFees?.fscFeeValue?.purchaseFSCFee ?? 0);
  const fscSale = Number(order?.extraFees?.fscFeeValue?.saleFSCFee ?? 0);

  const vatPurchase = Number(order?.vat?.purchaseVATTotal ?? 0);
  const vatSale = Number(order?.vat?.saleVATTotal ?? 0);

  const totalPurchase = Number(order?.totalPrice?.purchaseTotal ?? 0);
  const totalSale = Number(order?.totalPrice?.saleTotal ?? 0);

  const profit = totalSale - totalPurchase;

  /** Item: label + value, value render trong div để tránh div-trong-p */
  const DetailItem = ({ label, value }: { label: string; value?: React.ReactNode }) => (
    <Grid size={{ xs: 12, md: 6 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5, textTransform: "uppercase" }}>
        {label}
      </Typography>
      <Box component="div" sx={{ mb: 1, typography: "body2" }}>
        {value ?? "-"}
      </Box>
    </Grid>
  );

  function SectionPaper({ title, children }: { title: string; children: React.ReactNode }) {
    return (
      <Paper elevation={2} sx={{ px: 2, py: 2, bgcolor: "#fafbfc", mb: 1 }}>
        <Typography variant="subtitle1" fontWeight={700} color="primary" sx={{ mb: 1, textTransform: "uppercase", letterSpacing: 1 }} component="div">
          {title}
        </Typography>
        <Divider sx={{ mb: 2 }} />
        {children}
      </Paper>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle color="primary" sx={{ fontWeight: "bold" }}>
        ORDER DETAILS
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={3} mt={0.5}>
          {/* ⭐ System Note for Admin – only show if exists */}
          {order.systemNote && (
            <Paper
              elevation={3}
              sx={{
                p: 2,
                mb: 1,
                borderLeft: "4px solid #f44336",
                bgcolor: "#ffebee",
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, textTransform: "uppercase" }}>
                System Pricing Notes (for Admin)
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  whiteSpace: "pre-line",
                  fontFamily: "monospace",
                }}
              >
                {order.systemNote}
              </Typography>
            </Paper>
          )}

          {/* Billing */}
          <SectionPaper title="Billing Information">
            <Grid container spacing={2}>
              <DetailItem label="HAWB" value={order.trackingCode || "-"} />
              <DetailItem label="AWB" value={order.carrierAirWaybillCode || "-"} />
              <DetailItem label="Customer" value={order.partner?.partnerName || "-"} />
              <DetailItem label="Supplier" value={displayRef(order.supplierId)} />
              <DetailItem label="Sub Carrier" value={displayRef(order.carrierId)} />
              <DetailItem label="Service" value={displayRef(order.serviceId)} />
              <DetailItem label="Currency" value={order.currency || cur || "-"} />
              <DetailItem label="Order Status" value={<EnumChip type="orderStatus" value={order.orderStatus} />} />
            </Grid>
          </SectionPaper>

          {/* Sender */}
          <SectionPaper title="Sender Information">
            <Grid container spacing={2}>
              <DetailItem label="Company Name" value={order.sender?.fullname || "-"} />
              <DetailItem label="Contact Number" value={order.sender?.phone || "-"} />
              <DetailItem label="Address" value={[order.sender?.address1, order.sender?.address2, order.sender?.address3].filter(Boolean).join(", ") || "-"} />
            </Grid>
          </SectionPaper>

          {/* Recipient */}
          <SectionPaper title="Recipient Information">
            <Grid container spacing={2}>
              <DetailItem label="Company Name" value={order.recipient?.fullname || "-"} />
              <DetailItem label="Contact Number" value={order.recipient?.phone || "-"} />
              <DetailItem label="Address" value={[order.recipient?.address1, order.recipient?.address2, order.recipient?.address3].filter(Boolean).join(", ") || "-"} />
              <DetailItem label="Country" value={order.recipient?.country ? `${order.recipient.country.name} (${order.recipient.country.code})` : "-"} />
              <DetailItem label="City/State" value={[order.recipient?.city, order.recipient?.state].filter(Boolean).join(" / ") || "-"} />
              <DetailItem label="Post Code" value={order.recipient?.postCode || "-"} />
            </Grid>
          </SectionPaper>

          {/* Product */}
          <SectionPaper title="Product Information">
            <Grid container spacing={2}>
              <DetailItem label="Product Type" value={order.productType || "-"} />
              <DetailItem label="Contents" value={order.packageDetail?.content || "-"} />
              <DetailItem label="Declared Weight (kg)" value={formatNumberVi(order.packageDetail?.declaredWeight) ?? "-"} />
              <DetailItem label="Pcs" value={formatNumberVi(order.packageDetail?.quantity) ?? "-"} />
              <DetailItem label="Declared Value" value={formatNumberVi(order.packageDetail?.declaredValue || 0)} />
              <DetailItem label="Dimensions (cm)" value={order.packageDetail?.dimensions?.length ? order.packageDetail.dimensions.map((d) => `${d.length}x${d.width}x${d.height}`).join(", ") : "-"} />
              <DetailItem label="Chargeable Weight" value={formatNumberVi(order.chargeableWeight) ?? "-"} />
            </Grid>
          </SectionPaper>

          {/* Pricing */}
          <SectionPaper title="Pricing & Fees">
            <Grid container spacing={2}>
              <DetailItem label="Base Rate (Buying)" value={formatNumberVi(purchaseBase)} />
              <DetailItem label="Base Rate (Selling)" value={formatNumberVi(saleBase)} />
              <DetailItem label="Extra Fees (Total)" value={formatNumberVi(extraFeesTotal)} />
              <DetailItem label="FSC (Buying)" value={formatNumberVi(fscPurchase)} />
              <DetailItem label="FSC (Selling)" value={formatNumberVi(fscSale)} />
              <DetailItem label="VAT (Buying)" value={formatNumberVi(vatPurchase)} />
              <DetailItem label="VAT (Selling)" value={formatNumberVi(vatSale)} />
              <DetailItem label="Total (Buying)" value={formatNumberVi(totalPurchase)} />
              <DetailItem label="Total (Selling)" value={formatNumberVi(totalSale)} />
              <DetailItem label="Profit" value={formatNumberVi(profit)} />
            </Grid>
          </SectionPaper>

          {/* Note (customer note) */}
          <SectionPaper title="Note">
            <Typography variant="body2" sx={{ minHeight: 24 }}>
              {order.note || "-"}
            </Typography>
          </SectionPaper>

          {/* Status */}
          <SectionPaper title="Status">
            <Grid container spacing={2}>
              <DetailItem label="Updated At" value={order.updatedAt ? formatDate(order.updatedAt) : "-"} />
              <DetailItem label="Created At" value={order.createdAt ? formatDate(order.createdAt) : "-"} />
            </Grid>
          </SectionPaper>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Box flex={1} />
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
