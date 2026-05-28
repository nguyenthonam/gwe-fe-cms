"use client";

import { TextField, TextFieldProps } from "@mui/material";

interface NumericInputProps extends Omit<TextFieldProps, "onChange" | "value"> {
  disabled?: boolean;
  value: string | number | null | undefined;
  onChange: (value: string) => void;
  allowNegative?: boolean;
}

export default function NumericInput({ value, onChange, disabled, allowNegative = false, ...props }: NumericInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;

    const unsignedRegex = /^(\d+)?([,.]\d*)?$/;
    const signedRegex = /^-?(\d+)?([,.]\d*)?$/;
    const regex = allowNegative ? signedRegex : unsignedRegex;

    if (val === "" || regex.test(val)) {
      onChange(val);
    }
  };

  return <TextField {...props} value={value ?? ""} onChange={handleChange} disabled={disabled} inputMode="decimal" type="text" autoComplete="off" />;
}
