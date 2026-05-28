import { Box, Button, Table, TableHead, TableBody, TableRow, TableCell, Typography, Stack, IconButton, Paper, Alert } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { IDimension } from "@/types/typeGlobals";
import { calculateVolumeWeight } from "@/utils/hooks/hookBill";
import NumericInput from "@/components/Globals/NumericInput";
import { formatNumberVi } from "@/utils/hooks/hookNumber";
import { RequiredLabel } from "@/components/commons/RequiredLabel";

interface Props {
  volWeightRate?: number | null;
  dimensions: IDimension[];
  setDimensions: (rows: IDimension[]) => void;
  disabled?: boolean;
  className?: string;
  title?: string;
  errors?: { [key: string]: string };
  onClearErrors?: (...keys: string[]) => void;
}

type NumericLike = string | number | null | undefined;

const toNumberSafe = (value: NumericLike, fallback = 0): number => {
  if (value === null || value === undefined || value === "") return fallback;
  const normalized = String(value).trim().replace(/\s/g, "").replace(/,/g, ".");
  const numberValue = Number(normalized);
  return Number.isFinite(numberValue) ? numberValue : fallback;
};

const dimensionErrorKey = (index: number, field: keyof IDimension) => `dimensions_${index}_${String(field)}`;

export default function OrderDimensionSection({ volWeightRate, dimensions, setDimensions, disabled, className, title = "Package Dimensions", errors = {}, onClearErrors }: Props) {
  const safeDimensions = Array.isArray(dimensions) ? dimensions : [];

  const handleInputChange = (no: number, field: keyof IDimension, value: string) => {
    const index = no - 1;
    onClearErrors?.("dimensions", dimensionErrorKey(index, field), "quantity", "declaredWeight");

    setDimensions(
      safeDimensions.map((row, idx) => {
        if (idx !== index) return row;

        const nextRow: any = {
          ...row,
          [field]: value,
        };

        const length = field === "length" ? toNumberSafe(value) : toNumberSafe(row.length);
        const width = field === "width" ? toNumberSafe(value) : toNumberSafe(row.width);
        const height = field === "height" ? toNumberSafe(value) : toNumberSafe(row.height);

        if (["length", "width", "height"].includes(String(field))) {
          nextRow.volumeWeight = volWeightRate && length > 0 && width > 0 && height > 0 ? calculateVolumeWeight(length, width, height, volWeightRate) : 0;
        }

        return nextRow;
      }),
    );
  };

  const addRow = () => {
    onClearErrors?.("dimensions", "quantity", "declaredWeight");
    setDimensions([
      ...safeDimensions,
      {
        no: safeDimensions.length + 1,
        length: 0,
        width: 0,
        height: 0,
        grossWeight: 0,
        volumeWeight: 0,
      },
    ]);
  };

  const deleteRow = (no: number) => {
    onClearErrors?.("dimensions", "quantity", "declaredWeight");
    const nextRows = safeDimensions.filter((r) => r.no !== no).map((r, idx) => ({ ...r, no: idx + 1 }));
    setDimensions(nextRows);
  };

  return (
    <Box className={className}>
      <Paper>
        <Typography
          variant="h6"
          sx={{
            mb: 2,
            background: "#2196f3",
            color: "#fff",
            px: 2,
            py: 1,
            textTransform: "uppercase",
          }}
        >
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

        {errors.dimensions && (
          <Box sx={{ px: 2, pb: 1 }}>
            <Alert severity="warning">{errors.dimensions}</Alert>
          </Box>
        )}

        <Box sx={{ overflowX: "auto", px: 2, pb: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ background: "#e3f2fd" }}>
                <TableCell align="center" width="70px">
                  No
                </TableCell>
                <TableCell align="center" width="130px">
                  <RequiredLabel required>Length (cm)</RequiredLabel>
                </TableCell>
                <TableCell align="center" width="130px">
                  <RequiredLabel required>Width (cm)</RequiredLabel>
                </TableCell>
                <TableCell align="center" width="130px">
                  <RequiredLabel required>Height (cm)</RequiredLabel>
                </TableCell>
                <TableCell align="center" width="150px">
                  <RequiredLabel required>Gross Weight (kg)</RequiredLabel>
                </TableCell>
                <TableCell align="center" width="130px">
                  Volume Weight (kg)
                </TableCell>
                {!disabled && <TableCell align="center">Action</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {safeDimensions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={disabled ? 6 : 7} align="center">
                    <Typography color="text.secondary" sx={{ py: 2 }}>
                      No package yet. Click Add Package to enter package dimensions.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}

              {safeDimensions.map((row, idx) => (
                <TableRow key={row.no || idx}>
                  <TableCell align="center">{idx + 1}</TableCell>
                  {(["length", "width", "height", "grossWeight"] as (keyof IDimension)[]).map((field) => {
                    const key = dimensionErrorKey(idx, field);
                    return (
                      <TableCell align="center" key={field} sx={{ minWidth: 130 }}>
                        <NumericInput
                          disabled={disabled}
                          fullWidth
                          size="small"
                          value={String(row[field] ?? "")}
                          onChange={(val) => handleInputChange(row.no || idx + 1, field, val)}
                          sx={{ bgcolor: "#fff" }}
                          error={!!errors[key]}
                          helperText={errors[key] || ""}
                        />
                      </TableCell>
                    );
                  })}
                  <TableCell align="center">
                    <Typography sx={{ fontWeight: 600 }}>{formatNumberVi(row.volumeWeight) || 0}</Typography>
                  </TableCell>
                  {!disabled && (
                    <TableCell align="center">
                      <IconButton aria-label="delete" color="error" onClick={() => deleteRow(row.no || idx + 1)} size="small">
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
