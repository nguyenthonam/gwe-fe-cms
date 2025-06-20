"use client";
import { Box, Typography } from "@mui/material";
import Field from "@/components/Globals/Field";
import CountrySelect from "@/components/Globals/CountrySelect";

interface Props {
  form: any;
  onChange: (group: string, key: string, value: any) => void;
  disabled?: boolean;
}
export default function BillRecipientInfo({ form, onChange, disabled }: Props) {
  return (
    <Box mb={2} bgcolor="#fff" p={2} borderRadius={2} boxShadow={1}>
      <Typography variant="subtitle1" fontWeight={700} mb={2} color="primary">
        Recipient Information
      </Typography>
      <Field label="Name" value={form.recipient.name} onChange={(v) => onChange("recipient", "name", v)} required={!disabled} disabled={disabled} />
      <Field label="Attention" value={form.recipient.attention} onChange={(v) => onChange("recipient", "attention", v)} disabled={disabled} />
      <Field label="Phone" value={form.recipient.phone} onChange={(v) => onChange("recipient", "phone", v)} required={!disabled} disabled={disabled} />
      <Field label="Address 1" value={form.recipient.address1} onChange={(v) => onChange("recipient", "address1", v)} required={!disabled} disabled={disabled} />
      <Field label="Address 2" value={form.recipient.address2} onChange={(v) => onChange("recipient", "address2", v)} disabled={disabled} />
      <Field label="Address 3" value={form.recipient.address3} onChange={(v) => onChange("recipient", "address3", v)} disabled={disabled} />
      <Field label="City" value={form.recipient.city} onChange={(v) => onChange("recipient", "city", v)} required={!disabled} disabled={disabled} />
      <Field label="State" value={form.recipient.state} onChange={(v) => onChange("recipient", "state", v)} required={!disabled} disabled={disabled} />
      <Field label="Post Code" value={form.recipient.postCode} onChange={(v) => onChange("recipient", "postCode", v)} disabled={disabled} />
      <CountrySelect value={form.recipient.country} onChange={(v) => onChange("recipient", "country", v || "")} required={!disabled} />
    </Box>
  );
}
