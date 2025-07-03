import { Select, MenuItem, Checkbox, ListItemText, Typography } from "@mui/material";

interface ExtraFeeSelectProps {
  extraFeeList: { _id: string; name: string }[];
  value: string[];
  onChange: (val: string[]) => void;
  label?: string;
  disabled?: boolean;
  required?: boolean;
}

export default function ExtraFeeMultiSelect({ extraFeeList, value, onChange, label = "Extra Fee áp dụng", disabled, required }: ExtraFeeSelectProps) {
  const isEmpty = !extraFeeList || extraFeeList.length === 0;

  return (
    <Select
      label={label}
      multiple
      fullWidth
      value={value}
      onChange={(e) => onChange(e.target.value as string[])}
      renderValue={(selected) => {
        // Nếu danh sách rỗng
        if (isEmpty)
          return (
            <Typography color="text.secondary" fontStyle="italic">
              Không có danh sách phụ phí!
            </Typography>
          );
        // Nếu không chọn gì
        if (!selected || (selected as string[]).length === 0)
          return (
            <Typography color="text.secondary" fontStyle="italic">
              Chọn phụ phí...
            </Typography>
          );
        // Hiển thị danh sách đã chọn
        return (selected as string[])
          .map((id) => extraFeeList.find((f) => f._id === id)?.name)
          .filter(Boolean)
          .join(", ");
      }}
      size="small"
      disabled={disabled || isEmpty}
      required={required}
      displayEmpty
    >
      {isEmpty ? (
        <MenuItem disabled>
          <Typography color="text.secondary" fontStyle="italic">
            Trống
          </Typography>
        </MenuItem>
      ) : (
        extraFeeList.map((fee) => (
          <MenuItem key={fee._id} value={fee._id}>
            <Checkbox checked={value.indexOf(fee._id) > -1} size="small" />
            <ListItemText primary={<Typography>{fee.name}</Typography>} />
          </MenuItem>
        ))
      )}
    </Select>
  );
}
