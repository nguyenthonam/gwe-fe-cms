"use client";
import { Box, Typography } from "@mui/material";
import CarrierSelect from "../Globals/CarrierSelect";
import Field from "../Globals/Field";

interface Props {
  form: any;
  onChange: (key: string, value: any) => void;
  disabled?: boolean;
}
export default function BillBillingInfo({ form, onChange, disabled }: Props) {
  // const carriers = ...; // preload nếu cần
  return (
    <Box mb={2} bgcolor="#fff" p={2} borderRadius={2} boxShadow={1}>
      <Typography variant="subtitle1" fontWeight={700} mb={2} color="primary">
        Billing Information
      </Typography>
      <Field label="Customer" value={form.customer} onChange={(v) => onChange("customer", v)} disabled={disabled} />
      <Field label="HAWB Code" value={form.HAWBCode} disabled />
      <Field label="CAWB Code" value={form.CAWBCode} onChange={(v) => onChange("CAWBCode", v)} disabled={disabled} />
      {/* Nếu muốn dropdown Carrier: */}
      <CarrierSelect carriers={[]} value={form.carrier} onChange={(v) => onChange("carrier", v)} required={!disabled} />
    </Box>
  );
}
