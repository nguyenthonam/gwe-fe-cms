"use client";
import { Box, Typography } from "@mui/material";
import Field from "@/components/Globals/Field";
interface Props {
  form: any;
  onChange: (group: string, key: string, value: any) => void;
  disabled?: boolean;
}
export default function BillSenderInfo({ form, onChange, disabled }: Props) {
  return (
    <Box mb={2} bgcolor="#fff" p={2} borderRadius={2} boxShadow={1}>
      <Typography variant="subtitle1" fontWeight={700} mb={2} color="primary">
        Sender Information
      </Typography>
      <Field label="Sender" value={form.sender.name} onChange={(v) => onChange("sender", "name", v)} required={!disabled} disabled={disabled} />
      <Field label="Phone" value={form.sender.phone} onChange={(v) => onChange("sender", "phone", v)} required={!disabled} disabled={disabled} />
      <Field label="Address 1" value={form.sender.address1} onChange={(v) => onChange("sender", "address1", v)} required={!disabled} disabled={disabled} />
      <Field label="Address 2" value={form.sender.address2} onChange={(v) => onChange("sender", "address2", v)} disabled={disabled} />
      <Field label="Address 3" value={form.sender.address3} onChange={(v) => onChange("sender", "address3", v)} disabled={disabled} />
    </Box>
  );
}
