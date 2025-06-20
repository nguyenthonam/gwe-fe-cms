"use client";
import { Box, Typography } from "@mui/material";
import Field from "@/components/Globals/Field";

interface Props {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}
export default function BillNoteForm({ value, onChange, disabled }: Props) {
  return (
    <Box mb={2} bgcolor="#fff" p={2} borderRadius={2} boxShadow={1}>
      <Typography variant="subtitle1" fontWeight={700} mb={2} color="primary">
        Note
      </Typography>
      <Field label="Note" value={value} onChange={onChange} multiline minRows={3} disabled={disabled} />
    </Box>
  );
}
