"use client";
import { Grid, TextField, MenuItem, FormControl, InputLabel, Select } from "@mui/material";
import { ECURRENCY, EPRODUCT_TYPE } from "@/types/typeGlobals";
import NumericInput from "@/components/Globals/NumericInput";

interface Props {
  content: string;
  setContent: (v: string) => void;
  productType: EPRODUCT_TYPE;
  setProductType: (v: EPRODUCT_TYPE) => void;
  declaredWeight: string;
  setDeclaredWeight: (v: string) => void;
  quantity: string;
  setQuantity: (v: string) => void;
  declaredValue: string;
  setDeclaredValue: (v: string) => void;
  currency: ECURRENCY;
  setCurrency: (v: ECURRENCY) => void;
}

export default function OrderProductSection(props: Props) {
  const { content, setContent, productType, setProductType, declaredWeight, setDeclaredWeight, quantity, setQuantity, declaredValue, setDeclaredValue, currency, setCurrency } = props;
  return (
    <Grid container spacing={2} sx={{ p: 2 }}>
      <Grid size={{ xs: 12, md: 6 }}>
        <TextField label="Contents" value={content} onChange={(e) => setContent(e.target.value)} fullWidth size="small" required />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <FormControl fullWidth size="small">
          <InputLabel>Product Type</InputLabel>
          <Select value={productType} label="Product Type" onChange={(e) => setProductType(e.target.value as EPRODUCT_TYPE)}>
            <MenuItem value={EPRODUCT_TYPE.DOCUMENT}>DOCUMENT</MenuItem>
            <MenuItem value={EPRODUCT_TYPE.PARCEL}>PARCEL</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid size={{ xs: 12, md: 3 }}>
        <NumericInput label="Declared Weight (kg)" value={declaredWeight} onChange={setDeclaredWeight} fullWidth size="small" required />
      </Grid>
      <Grid size={{ xs: 12, md: 3 }}>
        <NumericInput label="PCEs" value={quantity} onChange={setQuantity} fullWidth size="small" required />
      </Grid>
      <Grid size={{ xs: 12, md: 3 }}>
        <NumericInput label="Declared Value" value={declaredValue} onChange={setDeclaredValue} fullWidth size="small" />
      </Grid>
      <Grid size={{ xs: 12, md: 3 }}>
        <FormControl fullWidth size="small">
          <InputLabel>Currency</InputLabel>
          <Select value={currency} label="Currency" onChange={(e) => setCurrency(e.target.value as ECURRENCY)}>
            {Object.values(ECURRENCY).map((cur) => (
              <MenuItem key={cur} value={cur}>
                {cur}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  );
}
