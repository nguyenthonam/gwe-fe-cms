"use client";

import { TextField, TextFieldProps } from "@mui/material";
import { useState } from "react";

interface NumericInputProps extends Omit<TextFieldProps, "onChange" | "value"> {
  value: string;
  onChange: (value: string) => void;
}

export default function NumericInput({ value, onChange, ...props }: NumericInputProps) {
  const [internalValue, setInternalValue] = useState(value);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (/^\d*$/.test(val)) {
      setInternalValue(val);
      onChange(val);
    }
  };

  return (
    <TextField
      {...props}
      type="text"
      inputMode="numeric"
      value={value}
      onChange={handleChange}
      onBlur={() => {
        if (value === "") onChange("0");
      }}
      onKeyDown={(e) => {
        const allowedKeys = ["Backspace", "Tab", "Delete", "ArrowLeft", "ArrowRight", "Home", "End"];
        const isDigit = /^[0-9]$/.test(e.key);
        if (!isDigit && !allowedKeys.includes(e.key)) {
          e.preventDefault();
        }
      }}
    />
  );
}
