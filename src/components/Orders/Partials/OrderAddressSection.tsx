"use client";
import CountrySelect from "@/components/Globals/CountrySelect";
import { Grid, TextField } from "@mui/material";

interface Props {
  label: string;
  data: any;
  setData: (v: any) => void;
  showCountry?: boolean;
  required?: boolean;
}

export default function OrderAddressSection({ label, data, setData, showCountry = false, required = true }: Props) {
  return (
    <Grid container spacing={2} sx={{ p: 2 }}>
      <Grid size={{ xs: 12, md: 4 }}>
        <TextField label={label + " Name"} value={data.name} onChange={(e) => setData((d: any) => ({ ...d, name: e.target.value }))} fullWidth size="small" required={required} />
      </Grid>
      {"attention" in data && (
        <Grid size={{ xs: 12, md: 4 }}>
          <TextField label="Attention" value={data.attention} onChange={(e) => setData((d: any) => ({ ...d, attention: e.target.value }))} fullWidth size="small" />
        </Grid>
      )}
      <Grid size={{ xs: 12, md: 4 }}>
        <TextField label="Phone" value={data.phone} onChange={(e) => setData((d: any) => ({ ...d, phone: e.target.value }))} fullWidth size="small" required={required} />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <TextField label="Address 1" value={data.address1} onChange={(e) => setData((d: any) => ({ ...d, address1: e.target.value }))} fullWidth size="small" required={required} />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <TextField label="Address 2" value={data.address2} onChange={(e) => setData((d: any) => ({ ...d, address2: e.target.value }))} fullWidth size="small" />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <TextField label="Address 3" value={data.address3} onChange={(e) => setData((d: any) => ({ ...d, address3: e.target.value }))} fullWidth size="small" />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <TextField label="City" value={data.city || ""} onChange={(e) => setData((d: any) => ({ ...d, city: e.target.value }))} fullWidth size="small" required={required} />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <TextField label="State" value={data.state || ""} onChange={(e) => setData((d: any) => ({ ...d, state: e.target.value }))} fullWidth size="small" required={required} />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <TextField label="Post Code" value={data.postCode || ""} onChange={(e) => setData((d: any) => ({ ...d, postCode: e.target.value }))} fullWidth size="small" />
      </Grid>
      {showCountry && (
        <Grid size={{ xs: 12, md: 4 }}>
          <CountrySelect value={data.country} onChange={(val) => setData((d: any) => ({ ...d, country: val || "" }))} label="Country" required />
        </Grid>
      )}
    </Grid>
  );
}
