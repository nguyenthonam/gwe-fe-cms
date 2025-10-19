"use client";

import { COUNTRIES } from "@/utils/constants";
import { Autocomplete, TextField, Box, Typography, Stack } from "@mui/material";

export interface ICountry {
  code: string;
  name: string;
}

interface Props {
  value?: string | null; // code, ví dụ: "VN"
  onChange?: (country: ICountry | null) => void;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  error?: boolean;
  helperText?: string;
  placeholder?: string;
}

export default function CountrySelect({ value, onChange, label = "Country", required, disabled, fullWidth = true, error, helperText, placeholder = "Tìm theo code hoặc tên..." }: Props) {
  // Tìm object theo code
  const selected = COUNTRIES.find((c) => c.code === value) || null;

  return (
    <Autocomplete
      options={COUNTRIES}
      getOptionLabel={(option) => `${option.code} - ${option.name}`}
      filterOptions={(options, { inputValue }) => {
        const v = inputValue.toLowerCase().trim();
        return options.filter((c) => c.code.toLowerCase().includes(v) || c.name.toLowerCase().includes(v));
      }}
      value={selected}
      onChange={(_, val) => onChange?.(val || null)}
      renderInput={(params) => <TextField {...params} label={label} required={required} disabled={disabled} error={error} helperText={helperText} placeholder={placeholder} fullWidth={fullWidth} />}
      renderOption={(props, option) => (
        <Box component="li" {...props} key={option.code}>
          <Stack direction="row" spacing={2} alignItems="center" width="100%">
            <Typography fontWeight={700} sx={{ minWidth: 48 }}>
              {option.code}
            </Typography>
            <Typography color="text.secondary" flex={1}>
              {option.name}
            </Typography>
          </Stack>
        </Box>
      )}
      isOptionEqualToValue={(o, v) => o.code === v.code}
      noOptionsText="Không tìm thấy quốc gia"
      size="small"
      sx={{ minWidth: "200px" }}
      
    />
  );
}
