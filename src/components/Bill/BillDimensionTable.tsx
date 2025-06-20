"use client";
import { Box, Typography } from "@mui/material";
import DimensionTable from "../Globals/DimensionTable";

interface Props {
  dimensions: any[];
  onChange: (rows: any[]) => void;
  disabled?: boolean;
}
export default function BillDimensionTable({ dimensions, onChange, disabled }: Props) {
  return (
    <Box mb={2} bgcolor="#fff" p={2} borderRadius={2} boxShadow={1}>
      <Typography variant="subtitle1" fontWeight={700} mb={2} color="primary">
        Dimension
      </Typography>
      <DimensionTable dimensions={dimensions} onRowsChange={onChange} disabled={disabled} />
    </Box>
  );
}
