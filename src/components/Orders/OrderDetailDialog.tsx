"use client";

import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Grid, Box, Divider, Paper, Stack } from "@mui/material";
import { IOrder } from "@/types/typeOrder";
import { EnumChip } from "../Globals/EnumChip";
import { formatCurrency } from "@/utils/hooks/hookCurrency";
import { formatDate } from "@/utils/hooks/hookDate";

interface Props {
  open: boolean;
  onClose: () => void;
  order: IOrder | null;
}

export default function OrderDetailDialog({ open, onClose, order }: Props) {
  if (!order) return null;

  const currency = order.currency || undefined;

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
              <DetailItem label="Customer" value={order.partner?.partnerName || "-"} />
              <DetailItem label="Supplier" value={typeof order.supplierId === "object" ? order.supplierId?.name : order.supplierId} />
              <DetailItem label="Sub Carrier" value={typeof order.carrierId === "object" ? order.carrierId?.name : order.carrierId} />
              <DetailItem label="Service" value={typeof order.serviceId === "object" ? order.serviceId?.code : order.serviceId} />
              {/* <DetailItem label="Currency" value={currency} /> Currency added here */}
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
              <DetailItem label="Declared Value" value={formatCurrency(order.packageDetail?.declaredValue || 0, order.packageDetail?.currency, true)} />
              <DetailItem label="Dimensions (cm)" value={order.packageDetail?.dimensions?.length ? order.packageDetail?.dimensions.map((d) => `${d.length}x${d.width}x${d.height}`).join(", ") : "-"} />
            </Grid>
          </SectionPaper>

          {/* Pricing & Fees */}
          <SectionPaper title="Pricing & Fees">
            <Grid container spacing={2}>
              <DetailItem label="Base Rate (Buying)" value={formatCurrency(order.basePrice?.purchasePrice?.value || 0, currency, true)} />
              <DetailItem label="Base Rate (Selling)" value={formatCurrency(order.basePrice?.salePrice?.value || 0, currency, true)} />
              <DetailItem label="VAT (Buying)" value={formatCurrency(order.vat?.purchaseVATTotal || 0, currency, true)} />
              <DetailItem label="VAT (Selling)" value={formatCurrency(order.vat?.saleVATTotal || 0, currency, true)} />
              <DetailItem label="Extra Fees" value={formatCurrency(order.extraFees?.extraFeesTotal || 0, currency, true)} />
              <DetailItem label="Total (Buying)" value={formatCurrency(order.totalPrice?.purchaseTotal || 0, currency, true)} />
              <DetailItem label="Total (Selling)" value={formatCurrency(order.totalPrice?.saleTotal || 0, currency, true)} />
              <DetailItem label="Profit" value={formatCurrency((order.totalPrice?.saleTotal || 0) - (order.totalPrice?.purchaseTotal || 0), currency, true)} />
            </Grid>
          </SectionPaper>

          {/* Note */}
          <SectionPaper title="Note">
            <Typography variant="body2" sx={{ minHeight: 24 }}>
              {order.note || "-"}
            </Typography>
          </SectionPaper>

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

// Helper for each field
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

// Helper for section with shadow, background, and divider
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
