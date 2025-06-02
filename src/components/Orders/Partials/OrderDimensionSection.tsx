"use client";
import { Box, Paper, Typography } from "@mui/material";
import { IDimension } from "@/types/typeGlobals";
import DimensionTable from "@/components/Globals/DimensionTable";
import { useEffect } from "react";

interface Props {
  volWeightRate: number | null;
  dimensions?: IDimension[];
  setDimensions: (rows: IDimension[]) => void;
  disabled?: boolean;
}

export default function OrderDimensionSection({ volWeightRate, dimensions, setDimensions, disabled }: Props) {
  useEffect(() => {
    console.log("OrderDimensionSection mounted or dimensions changed", dimensions);
  }, [dimensions, setDimensions]);
  return (
    <Box className="mb-2">
      <Paper>
        <Typography variant="h6" sx={{ mb: 2, background: "#2196f3", color: "#fff", px: 2, py: 1 }}>
          Dimension
        </Typography>
        <DimensionTable className="px-2 mb-2" volWeightRate={volWeightRate} dimensions={dimensions} onRowsChange={setDimensions} disabled={disabled} />
      </Paper>
    </Box>
  );
}
