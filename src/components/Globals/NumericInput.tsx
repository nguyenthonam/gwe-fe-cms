"use client";

import { TextField, TextFieldProps } from "@mui/material";

interface NumericInputProps extends Omit<TextFieldProps, "onChange" | "value"> {
  value: string;
  onChange: (value: string) => void;
}

export default function NumericInput({ value, onChange, ...props }: NumericInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (/^\d*\.?\d*$/.test(val)) {
      onChange(val);
    }
  };

  return (
    <TextField
      {...props}
      type="text"
      inputMode="decimal"
      value={value}
      onChange={handleChange}
      onKeyDown={(e) => {
        const allowedKeys = ["Backspace", "Tab", "Delete", "ArrowLeft", "ArrowRight", "Home", "End", "."];
        const isDigit = /^[0-9]$/.test(e.key);
        if (!isDigit && !allowedKeys.includes(e.key)) {
          e.preventDefault();
        }
      }}
    />
  );
}
