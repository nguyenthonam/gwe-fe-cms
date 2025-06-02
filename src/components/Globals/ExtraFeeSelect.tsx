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
  return (
    <Select
      label={label}
      multiple
      fullWidth
      value={value}
      onChange={(e) => onChange(e.target.value as string[])}
      renderValue={(selected) =>
        (selected as string[])
          .map((id) => extraFeeList.find((f) => f._id === id)?.name)
          .filter(Boolean)
          .join(", ")
      }
      size="small"
      disabled={disabled}
      required={required}
    >
      {extraFeeList.map((fee) => (
        <MenuItem key={fee._id} value={fee._id}>
          <Checkbox checked={value.indexOf(fee._id) > -1} size="small" />
          <ListItemText primary={<Typography>{fee.name}</Typography>} />
        </MenuItem>
      ))}
    </Select>
  );
}
