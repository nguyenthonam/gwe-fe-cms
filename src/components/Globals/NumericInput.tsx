"use client";
import { TextField, TextFieldProps } from "@mui/material";

interface NumericInputProps extends Omit<TextFieldProps, "onChange" | "value"> {
  disabled?: boolean;
  value: string;
  onChange: (value: string) => void;
}

export default function NumericInput({ value, onChange, disabled, ...props }: NumericInputProps) {
  const regex = /^(\d+)?(\.\d*)?$/;
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === "" || regex.test(val)) {
      onChange(val);
    }
  };

  return <TextField {...props} value={value} onChange={handleChange} disabled={disabled} inputMode="decimal" type="text" autoComplete="off" />;
}
