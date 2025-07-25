"use client";
import { Box, Grid, Typography, TextField, MenuItem, FormControl, InputLabel, Select } from "@mui/material";
import { ECURRENCY, EPRODUCT_TYPE } from "@/types/typeGlobals";
import NumericInput from "@/components/Globals/NumericInput";

interface Props {
  content: string;
  setContent: (v: string) => void;
  productType?: EPRODUCT_TYPE;
  setProductType: (v: EPRODUCT_TYPE) => void;
  declaredWeight: string;
  quantity: string;
  declaredValue: string;
  setDeclaredValue: (v: string) => void;
  currency?: ECURRENCY;
  setCurrency: (v: ECURRENCY) => void;
  disabled?: boolean;
}

export default function OrderProductSection(props: Props) {
  const { disabled, content, setContent, productType, setProductType, declaredWeight, quantity, declaredValue, setDeclaredValue, currency, setCurrency } = props;
  return (
    <Box sx={{ p: 2 }}>
      {/* Contents */}
      <Grid container alignItems="center" spacing={2} mb={1}>
        <Grid size={4}>
          <Typography variant="body2" sx={{ textTransform: "uppercase" }}>
            Shipment Content
          </Typography>
        </Grid>
        <Grid size={8}>
          <TextField disabled={disabled} value={content || ""} onChange={(e) => setContent(e.target.value)} fullWidth size="small" required placeholder="Describe goods/content" />
        </Grid>
      </Grid>
      {/* Product Type */}
      <Grid container alignItems="center" spacing={2} mb={1}>
        <Grid size={4}>
          <Typography variant="body2" sx={{ textTransform: "uppercase" }}>
            Product Type
          </Typography>
        </Grid>
        <Grid size={8}>
          <FormControl fullWidth size="small">
            <Select disabled={disabled} value={productType} onChange={(e) => setProductType(e.target.value as EPRODUCT_TYPE)}>
              <MenuItem value={EPRODUCT_TYPE.DOCUMENT}>Document</MenuItem>
              <MenuItem value={EPRODUCT_TYPE.PARCEL}>Parcel</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
      {/* PCEs */}
      <Grid container alignItems="center" spacing={2} mb={1}>
        <Grid size={4}>
          <Typography variant="body2" sx={{ textTransform: "uppercase" }}>
            PCEs
          </Typography>
        </Grid>
        <Grid size={8}>
          <TextField value={quantity || ""} size="small" fullWidth disabled InputProps={{ readOnly: true }} sx={{ bgcolor: "#f5f5f5" }} />
        </Grid>
      </Grid>
      {/* Declared Weight */}
      <Grid container alignItems="center" spacing={2} mb={1}>
        <Grid size={4}>
          <Typography variant="body2" sx={{ textTransform: "uppercase" }}>
            Declared Weight (kg)
          </Typography>
        </Grid>
        <Grid size={8}>
          <TextField value={declaredWeight || ""} size="small" fullWidth disabled InputProps={{ readOnly: true }} sx={{ bgcolor: "#f5f5f5" }} />
        </Grid>
      </Grid>
      {/* Declared Value */}
      <Grid container alignItems="center" spacing={2} mb={1}>
        <Grid size={4}>
          <Typography variant="body2" sx={{ textTransform: "uppercase" }}>
            Declared Value
          </Typography>
        </Grid>
        <Grid size={8}>
          <NumericInput disabled={disabled} label="" value={declaredValue} onChange={setDeclaredValue} fullWidth size="small" placeholder="Value for Customs" />
        </Grid>
      </Grid>
      {/* Currency */}
      <Grid container alignItems="center" spacing={2} mb={1}>
        <Grid size={4}>
          <Typography variant="body2" sx={{ textTransform: "uppercase" }}>
            Currency
          </Typography>
        </Grid>
        <Grid size={8}>
          <FormControl fullWidth size="small">
            <InputLabel>Currency</InputLabel>
            <Select disabled={disabled} value={currency} label="Currency" onChange={(e) => setCurrency(e.target.value as ECURRENCY)}>
              {Object.values(ECURRENCY).map((cur) => (
                <MenuItem key={cur} value={cur}>
                  {cur}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </Box>
  );
}
