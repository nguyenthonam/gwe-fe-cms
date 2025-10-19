"use client";

import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Grid, Box, Divider, Paper, Stack } from "@mui/material";
import { IOrder } from "@/types/typeOrder";
import { EnumChip } from "../Globals/EnumChip";
import { formatCurrency } from "@/utils/hooks/hookCurrency";
import { formatDate } from "@/utils/hooks/hookDate";

/** Normalize any currency-like value to a string for formatCurrency */
function asCurrencyString(cur: unknown): undefined {
  if (!cur) return undefined;
  // if (typeof cur === "string") return cur; // ECURRENCY is a string enum
  if (typeof cur === "object" && (cur as any)?.code && typeof (cur as any).code === "string") {
    return (cur as any).code;
  }
  return undefined;
}

/** Safely show name/code/_id if object, or the string itself */
function displayRef(val: any): string {
  if (!val) return "-";
  if (typeof val === "object") return val?.name || val?.code || val?._id || "-";
  return String(val);
}

/** Prefer partnerName; if partnerId is populated doc, show its name/_id as fallback */
function displayPartner(val: IOrder["partner"]): string {
  if (!val) return "-";
  if (val.partnerName) return val.partnerName;
  if (typeof val.partnerId === "object") return val.partnerId?.name || val.partnerId?._id || "-";
  return "-";
}

interface Props {
  open: boolean;
  onClose: () => void;
  order: IOrder | null;
}

export default function OrderDetailDialog({ open, onClose, order }: Props) {
  if (!order) return null;

  const orderCurrency = asCurrencyString(order.currency);
  const pricing = order.pricing;

  /** Render a system/manual number pair with currency */
  const renderPriceField = (value?: { system: number; manual?: number | null }, currencyLike?: unknown) => {
    if (!value) return "-";
    const cur = asCurrencyString(currencyLike);
    const systemStr = formatCurrency(value.system ?? 0, cur, true);

    if (value.manual != null && value.manual !== value.system) {
      const manualStr = formatCurrency(value.manual ?? 0, cur, true);
      return (
        <Stack direction="column" spacing={0}>
          <span>
            {systemStr} <span style={{ color: "#888" }}>(System)</span>
          </span>
          <span>
            {manualStr} <span style={{ color: "#d32f2f", fontWeight: 500 }}>(Manual)</span>
          </span>
        </Stack>
      );
    }
    return systemStr;
  };

  const DetailItem = ({ label, value }: { label: string; value?: React.ReactNode }) => (
    <Grid size={6}>
      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5, textTransform: "uppercase" }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ mb: 1 }}>
        {value ?? "-"}
      </Typography>
    </Grid>
  );

  function SectionPaper({ title, children }: { title: string; children: React.ReactNode }) {
    return (
      <Paper elevation={2} sx={{ px: 2, py: 2, bgcolor: "#fafbfc", mb: 1 }}>
        <Typography variant="subtitle1" fontWeight={700} color="primary" sx={{ mb: 1, textTransform: "uppercase", letterSpacing: 1 }}>
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
          {/* Billing Section */}
          <SectionPaper title="Billing Information">
            <Grid container spacing={2}>
              <DetailItem label="HAWB" value={order.trackingCode} />
              <DetailItem label="AWB" value={order.carrierAirWaybillCode || "-"} />
              <DetailItem label="Customer" value={displayPartner(order.partner)} />
              <DetailItem label="Supplier" value={displayRef(order.supplierId)} />
              <DetailItem label="Sub Carrier" value={displayRef(order.carrierId)} />
              <DetailItem label="Service" value={displayRef(order.serviceId)} />
              <DetailItem label="Currency" value={orderCurrency || "-"} />
              <DetailItem label="Order Status" value={<EnumChip type="orderStatus" value={order.orderStatus} />} />
            </Grid>
          </SectionPaper>

          {/* Sender */}
          <SectionPaper title="Sender Information">
            <Grid container spacing={2}>
              <DetailItem label="Company Name" value={order.sender?.fullname} />
              <DetailItem label="Contact Number" value={order.sender?.phone} />
              <DetailItem label="Address" value={[order.sender?.address1, order.sender?.address2, order.sender?.address3].filter(Boolean).join(", ") || "-"} />
            </Grid>
          </SectionPaper>

          {/* Recipient */}
          <SectionPaper title="Recipient Information">
            <Grid container spacing={2}>
              <DetailItem label="Company Name" value={order.recipient?.fullname} />
              <DetailItem label="Contact Number" value={order.recipient?.phone} />
              <DetailItem label="Address" value={[order.recipient?.address1, order.recipient?.address2, order.recipient?.address3].filter(Boolean).join(", ") || "-"} />
              <DetailItem label="Country" value={order.recipient?.country ? `${order.recipient.country.name} (${order.recipient.country.code})` : "-"} />
              <DetailItem label="City/State" value={[order.recipient?.city, order.recipient?.state].filter(Boolean).join(" / ") || "-"} />
              <DetailItem label="Post Code" value={order.recipient?.postCode} />
            </Grid>
          </SectionPaper>

          {/* Product Info */}
          <SectionPaper title="Product Information">
            <Grid container spacing={2}>
              <DetailItem label="Product Type" value={order.productType} />
              <DetailItem label="Contents" value={order.packageDetail?.content} />
              <DetailItem label="Declared Weight (kg)" value={order.packageDetail?.declaredWeight} />
              <DetailItem label="Pcs" value={order.packageDetail?.quantity} />
              <DetailItem label="Declared Value" value={formatCurrency(order.packageDetail?.declaredValue || 0, asCurrencyString(order.packageDetail?.currency), true)} />
              <DetailItem label="Dimensions (cm)" value={order.packageDetail?.dimensions?.length ? order.packageDetail.dimensions.map((d) => `${d.length}x${d.width}x${d.height}`).join(", ") : "-"} />
            </Grid>
          </SectionPaper>

          {/* Pricing & Fees */}
          <SectionPaper title="Pricing & Fees">
            <Grid container spacing={2}>
              <DetailItem label="Base Rate (Buying)" value={renderPriceField(pricing?.basePrice?.purchase, pricing?.basePrice?.purchase?.currency)} />
              <DetailItem label="Base Rate (Selling)" value={renderPriceField(pricing?.basePrice?.sale, pricing?.basePrice?.sale?.currency)} />
              <DetailItem label="Extra Fees" value={renderPriceField(pricing?.extraFeeTotal, pricing?.currency)} />
              <DetailItem label="FSC Fee" value={renderPriceField(pricing?.fscFee, pricing?.currency)} />
              <DetailItem label="VAT" value={renderPriceField(pricing?.vat, pricing?.currency)} />
              <DetailItem label="Total (Buying)" value={renderPriceField(pricing?.total?.purchase, pricing?.currency)} />
              <DetailItem label="Total (Selling)" value={renderPriceField(pricing?.total?.sale, pricing?.currency)} />
              <DetailItem
                label="Profit"
                value={
                  pricing?.total?.sale?.system != null && pricing?.total?.purchase?.system != null
                    ? formatCurrency((pricing.total.sale.system || 0) - (pricing.total.purchase.system || 0), asCurrencyString(pricing?.currency), true)
                    : "-"
                }
              />
            </Grid>
          </SectionPaper>

          {/* Note */}
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
