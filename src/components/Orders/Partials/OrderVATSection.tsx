"use client";
import NumericInput from "@/components/Globals/NumericInput";
import { Typography } from "@mui/material";

interface Props {
  customVATPercentage: number | "";
  setCustomVATPercentage: (v: number) => void;
  disabled?: boolean;
}

export default function OrderVATSection({ customVATPercentage, setCustomVATPercentage, disabled = false }: Props) {
  return (
    <div>
      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: "bold" }}>
        Custom VAT for Order (%)
      </Typography>
      <NumericInput label="VAT" value={String(customVATPercentage)} onChange={(value) => setCustomVATPercentage(Number(value))} fullWidth size="small" disabled={disabled} />
    </div>
  );
}
