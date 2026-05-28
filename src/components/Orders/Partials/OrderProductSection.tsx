"use client";

import { Box, Grid, TextField, MenuItem, FormControl, InputLabel, Select } from "@mui/material";
import { ECURRENCY, EPRODUCT_TYPE } from "@/types/typeGlobals";
import NumericInput from "@/components/Globals/NumericInput";
import { formatNumberVi } from "@/utils/hooks/hookNumber";
import { RequiredLabel } from "@/components/commons/RequiredLabel";

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
  errors?: { [key: string]: string };
  requiredFields?: string[];
}

export default function OrderProductSection(props: Props) {
  const { disabled, content, setContent, productType, setProductType, declaredWeight, quantity, declaredValue, setDeclaredValue, currency, setCurrency, errors = {}, requiredFields = [] } = props;

  const isRequired = (field: string) => requiredFields.includes(field);

  return (
    <Box sx={{ p: 2 }}>
      <Grid container alignItems="center" spacing={2} mb={1}>
        <Grid size={4}>
          <RequiredLabel required={isRequired("content")}>Shipment Content</RequiredLabel>
        </Grid>
        <Grid size={8}>
          <TextField
            disabled={disabled}
            value={content || ""}
            onChange={(e) => setContent(e.target.value)}
            fullWidth
            size="small"
            required={isRequired("content")}
            placeholder="DOCUMENT / CLOTHES / SAMPLE..."
            error={!!errors.content}
            helperText={errors.content || ""}
          />
        </Grid>
      </Grid>

      <Grid container alignItems="center" spacing={2} mb={1}>
        <Grid size={4}>
          <RequiredLabel required={isRequired("productType")}>Product Type</RequiredLabel>
        </Grid>
        <Grid size={8}>
          <FormControl fullWidth size="small" error={!!errors.productType} required={isRequired("productType")}>
            <Select disabled={disabled} value={productType || ""} onChange={(e) => setProductType(e.target.value as EPRODUCT_TYPE)}>
              <MenuItem value={EPRODUCT_TYPE.DOCUMENT}>Document</MenuItem>
              <MenuItem value={EPRODUCT_TYPE.PARCEL}>Parcel</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Grid container alignItems="center" spacing={2} mb={1}>
        <Grid size={4}>
          <RequiredLabel required={isRequired("quantity")}>PCEs</RequiredLabel>
        </Grid>
        <Grid size={8}>
          <TextField
            value={formatNumberVi(quantity)}
            size="small"
            fullWidth
            disabled
            InputProps={{ readOnly: true }}
            sx={{ bgcolor: "#f5f5f5" }}
            error={!!errors.quantity}
            helperText={errors.quantity || "Auto calculated from package rows"}
          />
        </Grid>
      </Grid>

      <Grid container alignItems="center" spacing={2} mb={1}>
        <Grid size={4}>
          <RequiredLabel required={isRequired("declaredWeight")}>Declared Weight (kg)</RequiredLabel>
        </Grid>
        <Grid size={8}>
          <TextField
            value={formatNumberVi(declaredWeight)}
            size="small"
            fullWidth
            disabled
            InputProps={{ readOnly: true }}
            sx={{ bgcolor: "#f5f5f5" }}
            error={!!errors.declaredWeight}
            helperText={errors.declaredWeight || "Auto calculated from gross weight"}
          />
        </Grid>
      </Grid>

      <Grid container alignItems="center" spacing={2} mb={1}>
        <Grid size={4}>
          <RequiredLabel required={isRequired("declaredValue")}>Declared Value</RequiredLabel>
        </Grid>
        <Grid size={8}>
          <NumericInput
            disabled={disabled}
            label=""
            value={declaredValue}
            onChange={setDeclaredValue}
            fullWidth
            size="small"
            placeholder="Value for customs, optional"
            error={!!errors.declaredValue}
            helperText={errors.declaredValue || ""}
          />
        </Grid>
      </Grid>

      <Grid container alignItems="center" spacing={2} mb={1}>
        <Grid size={4}>
          <RequiredLabel required={isRequired("currency")}>Currency</RequiredLabel>
        </Grid>
        <Grid size={8}>
          <FormControl fullWidth size="small" required={isRequired("currency")} error={!!errors.currency}>
            <InputLabel>Currency</InputLabel>
            <Select disabled={disabled} value={currency || ""} label="Currency" onChange={(e) => setCurrency(e.target.value as ECURRENCY)}>
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
