"use client";
import { TextField, Button, Stack } from "@mui/material";
import React, { useState } from "react";

interface ExcelPasteBoxProps {
  label?: string;
  onParse: (data: string) => void;
  loading?: boolean;
}

const ExcelPasteBox: React.FC<ExcelPasteBoxProps> = ({ label = "Dán bảng giá từ Excel vào đây", onParse, loading }) => {
  const [value, setValue] = useState("");

  const handleParse = () => {
    onParse(value.trim());
  };

  return (
    <Stack spacing={1}>
      <TextField fullWidth multiline minRows={8} label={label} value={value} onChange={(e) => setValue(e.target.value)} variant="outlined" placeholder={label} disabled={loading} />
      <Button onClick={handleParse} disabled={loading || !value.trim()} variant="contained" color="primary">
        Parse và Preview
      </Button>
    </Stack>
  );
};

export default ExcelPasteBox;
