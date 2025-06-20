import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";

interface CarrierSelectProps {
  value: string;
  onChange: (v: string) => void;
  carriers: { _id: string; name: string }[];
  label?: string;
  required?: boolean;
}

const CarrierSelect = ({ value, onChange, carriers, label = "Carrier", required }: CarrierSelectProps) => (
  <FormControl fullWidth size="small">
    <InputLabel>{label}</InputLabel>
    <Select label={label} value={value} required={required} onChange={(e) => onChange(e.target.value as string)}>
      {carriers.map((c) => (
        <MenuItem value={c._id} key={c._id}>
          {c.name}
        </MenuItem>
      ))}
    </Select>
  </FormControl>
);

export default CarrierSelect;
