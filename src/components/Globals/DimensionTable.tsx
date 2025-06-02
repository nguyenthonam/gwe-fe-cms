"use client";
import { useState, useEffect } from "react";
import { Box, Button, Table, TableHead, TableBody, TableRow, TableCell, Typography, Stack, IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { calculateVolumeWeight } from "@/utils/hooks/hookBill";
import { IDimension } from "@/types/typeGlobals";
import NumericInput from "./NumericInput";

interface IProps {
  volWeightRate?: number | null;
  dimensions?: IDimension[];
  setDimensions?: (rows: IDimension[]) => void;
  onRowsChange?: (updatedRows: IDimension[]) => void;
  className?: string;
  disabled?: boolean;
}

export interface IDimensionForm extends IDimension {
  no: number;
}

export default function DimensionTable({ volWeightRate, dimensions, disabled, setDimensions, onRowsChange, className }: IProps) {
  // Ưu tiên dùng dimensions/setDimensions nếu có truyền vào để đồng bộ với CreateOrderDialog, nếu không thì tự quản lý state local
  const [rows, setRows] = useState<IDimensionForm[]>([{ no: 1, length: 0, width: 0, height: 0, grossWeight: 0, volumeWeight: 0 }]);

  // Đồng bộ nếu có truyền dimensions/setDimensions từ cha (giúp sử dụng chung cho Dialog hoặc page khác)
  useEffect(() => {
    if (dimensions && setDimensions) {
      setRows(
        dimensions.map((d, idx) => ({
          ...d,
          no: idx + 1,
        }))
      );
    }
    // eslint-disable-next-line
  }, [dimensions]);

  // Khi rows thay đổi, gọi callback ra ngoài (giúp truyền dữ liệu về Dialog cha)
  useEffect(() => {
    setDimensions?.(rows);
    onRowsChange?.(rows);
    // eslint-disable-next-line
  }, [rows]);
  useEffect(() => {
    setRows((prev) => {
      return prev.map((row) => ({
        ...row,
        volumeWeight: volWeightRate && row.length && row.width && row.height ? calculateVolumeWeight(row.length, row.width, row.height, volWeightRate) : 0,
      }));
    });
    // eslint-disable-next-line
  }, [volWeightRate]);

  // Cập nhật field
  const handleInputChange = (no: number, field: keyof IDimension, value: number) => {
    setRows((prev) =>
      prev.map((row) =>
        row.no === no
          ? {
              ...row,
              [field]: value,
              // Khi thay đổi chiều dài, rộng, cao => tính lại volumeWeight
              volumeWeight:
                field === "length" || field === "width" || field === "height"
                  ? volWeightRate
                    ? calculateVolumeWeight(field === "length" ? value : row.length, field === "width" ? value : row.width, field === "height" ? value : row.height, volWeightRate)
                    : 0
                  : row.volumeWeight,
            }
          : row
      )
    );
  };

  // Thêm row
  const addRow = () => {
    setRows([
      ...rows,
      {
        no: rows.length + 1,
        length: 0,
        width: 0,
        height: 0,
        grossWeight: 0,
        volumeWeight: 0,
      },
    ]);
  };

  // Xóa row
  const deleteRow = (no: number) => {
    if (rows.length === 1) {
      setRows([{ no: 1, length: 0, width: 0, height: 0, grossWeight: 0, volumeWeight: 0 }]);
      return;
    }
    setRows(rows.filter((r) => r.no !== no).map((r, idx) => ({ ...r, no: idx + 1 })));
  };

  return (
    <Box className={className}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
        {!disabled && (
          <Button variant="outlined" startIcon={<AddIcon />} onClick={addRow} sx={{ bgcolor: "#e3f2fd", color: "#1976d2", borderColor: "#1976d2", fontSize: "12px" }}>
            Add Package
          </Button>
        )}
      </Stack>
      <Box sx={{ overflowX: "auto" }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ background: "#e3f2fd" }}>
              <TableCell align="center" width={"100px"}>
                No
              </TableCell>
              <TableCell align="center" width={"100px"}>
                Length (cm)
              </TableCell>
              <TableCell align="center" width={"100px"}>
                Width (cm)
              </TableCell>
              <TableCell align="center" width={"100px"}>
                Height (cm)
              </TableCell>
              <TableCell align="center" width={"100px"}>
                Gross (kg)
              </TableCell>
              <TableCell align="center" width={"100px"}>
                Volume (m³)
              </TableCell>
              {!disabled && <TableCell align="center">Action</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, idx) => (
              <TableRow key={row.no}>
                <TableCell align="center">{idx + 1}</TableCell>
                {(["length", "width", "height", "grossWeight"] as (keyof IDimension)[]).map((field) => (
                  <TableCell align="center" key={field} sx={{ "& .MuiInputBase-input": { width: "50px" } }}>
                    <NumericInput
                      disabled={disabled}
                      fullWidth
                      size="small"
                      value={String(row[field] ?? 0)}
                      onChange={(val) => handleInputChange(row.no, field, Number(val))}
                      sx={{ bgcolor: "#fff" }}
                    />
                  </TableCell>
                ))}
                <TableCell align="center">
                  <Typography sx={{ fontWeight: 600 }}>{row.volumeWeight?.toFixed(2) ?? 0}</Typography>
                </TableCell>
                {!disabled && (
                  <TableCell align="center">
                    <IconButton aria-label="delete" color="error" onClick={() => deleteRow(row.no)} size="small">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </Box>
  );
}
