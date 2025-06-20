"use client";
import { Typography, TextField } from "@mui/material";
import React from "react";

interface FieldProps {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  multiline?: boolean;
  minRows?: number;
  type?: string;
  placeholder?: string;
}

export default function Field({ label, value, onChange, required = false, disabled = false, multiline = false, minRows = 1, type = "text", placeholder = "" }: FieldProps) {
  return (
    <div style={{ marginBottom: 12 }}>
      <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
        {label}
        {required ? <span style={{ color: "red" }}> *</span> : null}
      </Typography>
      <TextField
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        required={required}
        disabled={disabled}
        multiline={multiline}
        minRows={minRows}
        type={type}
        placeholder={placeholder}
        fullWidth
        size="small"
        InputLabelProps={{ shrink: false }}
      />
    </div>
  );
}
