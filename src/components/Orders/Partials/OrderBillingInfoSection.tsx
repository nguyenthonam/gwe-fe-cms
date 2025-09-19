"use client";
import { FormControl, InputLabel, MenuItem, Select, Grid, TextField } from "@mui/material";

interface Props {
  partners: { _id: string; name: string }[];
  carriers: { _id: string; name: string }[];
  suppliers: { _id: string; name: string }[];
  services: { _id: string; code: string; name: string }[];
  partnerId: string;
  setPartnerId: (v: string) => void;
  carrierId: string;
  setCarrierId: (v: string) => void;
  supplierId: string;
  setSupplierId: (v: string) => void;
  serviceId: string;
  setServiceId: (v: string) => void;
  carrierAirWaybillCode: string;
  setCarrierAirWaybillCode: (v: string) => void;
  disabled?: boolean;
}

export default function OrderBillingInfoSection({
  partners,
  carriers,
  suppliers,
  services,
  partnerId,
  setPartnerId,
  carrierId,
  setCarrierId,
  supplierId,
  setSupplierId,
  serviceId,
  setServiceId,
  carrierAirWaybillCode,
  setCarrierAirWaybillCode,
  disabled = false,
}: Props) {
  return (
    <Grid container spacing={2} sx={{ p: 2 }}>
      <Grid size={12}>
        <FormControl fullWidth size="small">
          <TextField
            label="Carrier Air Waybill Code"
            value={carrierAirWaybillCode}
            onChange={(e) => setCarrierAirWaybillCode(e.target.value)}
            fullWidth
            size="small"
            placeholder="Enter CAWB code if available"
            disabled={disabled}
          />
        </FormControl>
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <FormControl fullWidth size="small" disabled={disabled}>
          <InputLabel>Customer</InputLabel>
          <Select value={partnerId} label="Customer" onChange={(e) => setPartnerId(e.target.value)}>
            {partners.map((p) => (
              <MenuItem key={p._id} value={p._id}>
                {p.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <FormControl fullWidth size="small" disabled={disabled}>
          <InputLabel>Sub Carrier</InputLabel>
          <Select value={carrierId} label="Sub Carrier" onChange={(e) => setCarrierId(e.target.value)}>
            {carriers.map((c) => (
              <MenuItem key={c._id} value={c._id}>
                {c.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <FormControl fullWidth size="small" disabled={disabled}>
          <InputLabel>Supplier</InputLabel>
          <Select value={supplierId} label="Supplier" onChange={(e) => setSupplierId(e.target.value)}>
            {suppliers.map((s) => (
              <MenuItem key={s._id} value={s._id}>
                {s.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <FormControl fullWidth size="small" disabled={disabled}>
          <InputLabel>Service</InputLabel>
          <Select value={serviceId} label="Service" onChange={(e) => setServiceId(e.target.value)}>
            {services.map((s) => (
              <MenuItem key={s._id} value={s._id}>
                {s.code}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  );
}
