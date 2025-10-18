"use client";
import NumericInput from "@/components/Globals/NumericInput";
import { Typography } from "@mui/material";

interface Props {
  customVATPercentage: string;
  setCustomVATPercentage: (v: string) => void;
}

export default function OrderVATSection({ customVATPercentage, setCustomVATPercentage }: Props) {
  return (
    <div>
      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: "bold" }}>
        Custom VAT for Order (%)
      </Typography>
      <NumericInput label="VAT" value={String(customVATPercentage)} onChange={setCustomVATPercentage} fullWidth size="small" />
    </div>
  );
}
