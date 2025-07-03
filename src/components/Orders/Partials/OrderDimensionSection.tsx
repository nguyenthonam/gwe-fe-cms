import { Box, Button, Table, TableHead, TableBody, TableRow, TableCell, Typography, Stack, IconButton, Paper } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { IDimension } from "@/types/typeGlobals";
import { calculateVolumeWeight } from "@/utils/hooks/hookBill";
import NumericInput from "@/components/Globals/NumericInput";

interface Props {
  volWeightRate?: number | null;
  dimensions: IDimension[];
  setDimensions: (rows: IDimension[]) => void;
  disabled?: boolean;
  className?: string;
  title?: string;
}

export default function OrderDimensionSection({ volWeightRate, dimensions, setDimensions, disabled, className, title = "Dimension" }: Props) {
  // Hàm cập nhật field (dùng array mới, KHÔNG dùng state local)
  // const handleInputChange = (no: number, field: keyof IDimension, value: number) => {
  //   setDimensions(
  //     dimensions.map((row, idx) =>
  //       idx === no - 1
  //         ? {
  //             ...row,
  //             [field]: value,
  //             volumeWeight:
  //               field === "length" || field === "width" || field === "height"
  //                 ? volWeightRate
  //                   ? calculateVolumeWeight(field === "length" ? value : row.length, field === "width" ? value : row.width, field === "height" ? value : row.height, volWeightRate)
  //                   : 0
  //                 : row.volumeWeight,
  //           }
  //         : row
  //     )
  //   );
  // };
  const handleInputChange = (no: number, field: keyof IDimension, value: string) => {
    setDimensions(
      dimensions.map((row, idx) =>
        idx === no - 1
          ? {
              ...row,
              [field]: value, // để nguyên string ở state!
              // Nếu muốn tính toán volumeWeight thì phải kiểm tra giá trị có hợp lệ mới convert
              volumeWeight:
                field === "length" || field === "width" || field === "height"
                  ? volWeightRate && value && !isNaN(Number(value))
                    ? calculateVolumeWeight(
                        field === "length" ? Number(value) : Number(row.length),
                        field === "width" ? Number(value) : Number(row.width),
                        field === "height" ? Number(value) : Number(row.height),
                        volWeightRate
                      )
                    : 0
                  : row.volumeWeight,
            }
          : row
      )
    );
  };

  const addRow = () => {
    setDimensions([
      ...dimensions,
      {
        no: dimensions.length + 1,
        length: 0,
        width: 0,
        height: 0,
        grossWeight: 0,
        volumeWeight: 0,
      },
    ]);
  };

  const deleteRow = (no: number) => {
    if (dimensions.length === 1) {
      setDimensions([{ no: 1, length: 0, width: 0, height: 0, grossWeight: 0, volumeWeight: 0 }]);
      return;
    }
    setDimensions(dimensions.filter((r) => r.no !== no).map((r, idx) => ({ ...r, no: idx + 1 })));
  };

  return (
    <Box className={className}>
      <Paper>
        <Typography variant="h6" sx={{ mb: 2, background: "#2196f3", color: "#fff", px: 2, py: 1 }}>
          {title}
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2, px: 2 }}>
          {!disabled && (
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={addRow}
              sx={{
                bgcolor: "#e3f2fd",
                color: "#1976d2",
                borderColor: "#1976d2",
                fontSize: "12px",
              }}
            >
              Add Package
            </Button>
          )}
        </Stack>
        <Box sx={{ overflowX: "auto", px: 2, pb: 2 }}>
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
              {dimensions.map((row, idx) => (
                <TableRow key={row.no}>
                  <TableCell align="center">{idx + 1}</TableCell>
                  {(["length", "width", "height", "grossWeight"] as (keyof IDimension)[]).map((field) => (
                    <TableCell align="center" key={field} sx={{ "& .MuiInputBase-input": { width: "50px" } }}>
                      <NumericInput disabled={disabled} fullWidth size="small" value={String(row[field] ?? "")} onChange={(val) => handleInputChange(row.no, field, val)} sx={{ bgcolor: "#fff" }} />
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
      </Paper>
    </Box>
  );
}
