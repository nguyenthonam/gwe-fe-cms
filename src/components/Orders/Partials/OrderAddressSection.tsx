"use client";
import CountrySelect from "@/components/Globals/CountrySelect";
import { IBasicContactInfor } from "@/types/typeGlobals";
import { Grid, Typography, TextField, Box } from "@mui/material";

interface Props {
  label: string;
  data: IBasicContactInfor;
  setData: (v: any) => void;
  showCountry?: boolean;
  required?: boolean;
  disabled?: boolean;
}

export default function OrderAddressSection({ label, data, setData, showCountry = false, required = true, disabled }: Props) {
  return (
    <Box sx={{ p: 2 }}>
      {/* Name */}
      <Grid container alignItems="center" spacing={2} mb={1}>
        <Grid size={4}>
          <Typography variant="body2">{label} Name</Typography>
        </Grid>
        <Grid size={8}>
          <TextField disabled={disabled} value={data.fullname || ""} onChange={(e) => setData((d: any) => ({ ...d, fullname: e.target.value }))} size="small" required={required} fullWidth />
        </Grid>
      </Grid>
      {/* Attention (nếu có) */}
      {"attention" in data && (
        <Grid container alignItems="center" spacing={2} mb={1}>
          <Grid size={4}>
            <Typography variant="body2">Attention</Typography>
          </Grid>
          <Grid size={8}>
            <TextField disabled={disabled} value={data.attention || ""} onChange={(e) => setData((d: any) => ({ ...d, attention: e.target.value }))} size="small" fullWidth />
          </Grid>
        </Grid>
      )}
      {/* Phone */}
      <Grid container alignItems="center" spacing={2} mb={1}>
        <Grid size={4}>
          <Typography variant="body2">Phone</Typography>
        </Grid>
        <Grid size={8}>
          <TextField disabled={disabled} value={data.phone || ""} onChange={(e) => setData((d: any) => ({ ...d, phone: e.target.value }))} size="small" required={required} fullWidth />
        </Grid>
      </Grid>
      {/* Address 1 */}
      <Grid container alignItems="center" spacing={2} mb={1}>
        <Grid size={4}>
          <Typography variant="body2">Address 1</Typography>
        </Grid>
        <Grid size={8}>
          <TextField disabled={disabled} value={data.address1 || ""} onChange={(e) => setData((d: any) => ({ ...d, address1: e.target.value }))} size="small" required={required} fullWidth />
        </Grid>
      </Grid>
      {/* Address 2 */}
      <Grid container alignItems="center" spacing={2} mb={1}>
        <Grid size={4}>
          <Typography variant="body2">Address 2</Typography>
        </Grid>
        <Grid size={8}>
          <TextField disabled={disabled} value={data.address2 || ""} onChange={(e) => setData((d: any) => ({ ...d, address2: e.target.value }))} size="small" fullWidth />
        </Grid>
      </Grid>
      {/* Address 3 */}
      <Grid container alignItems="center" spacing={2} mb={1}>
        <Grid size={4}>
          <Typography variant="body2">Address 3</Typography>
        </Grid>
        <Grid size={8}>
          <TextField disabled={disabled} value={data.address3 || ""} onChange={(e) => setData((d: any) => ({ ...d, address3: e.target.value }))} size="small" fullWidth />
        </Grid>
      </Grid>
      {/* City */}
      {"city" in data && (
        <Grid container alignItems="center" spacing={2} mb={1}>
          <Grid size={4}>
            <Typography variant="body2">City</Typography>
          </Grid>
          <Grid size={8}>
            <TextField disabled={disabled} value={data.city || ""} onChange={(e) => setData((d: any) => ({ ...d, city: e.target.value }))} size="small" required={required} fullWidth />
          </Grid>
        </Grid>
      )}
      {/* State */}
      {"state" in data && (
        <Grid container alignItems="center" spacing={2} mb={1}>
          <Grid size={4}>
            <Typography variant="body2">State</Typography>
          </Grid>
          <Grid size={8}>
            <TextField disabled={disabled} value={data.state || ""} onChange={(e) => setData((d: any) => ({ ...d, state: e.target.value }))} size="small" required={required} fullWidth />
          </Grid>
        </Grid>
      )}
      {/* Post Code */}
      {"postCode" in data && (
        <Grid container alignItems="center" spacing={2} mb={1}>
          <Grid size={4}>
            <Typography variant="body2">Post Code</Typography>
          </Grid>
          <Grid size={8}>
            <TextField disabled={disabled} value={data.postCode || ""} onChange={(e) => setData((d: any) => ({ ...d, postCode: e.target.value }))} size="small" fullWidth />
          </Grid>
        </Grid>
      )}
      {/* Country (optional) */}
      {showCountry && (
        <Grid container alignItems="center" spacing={2} mb={1}>
          <Grid size={4}>
            <Typography variant="body2">Country</Typography>
          </Grid>
          <Grid size={8}>
            <CountrySelect disabled={disabled} value={data.country?.code} onChange={(country) => setData((d: any) => ({ ...d, country }))} label="Country" required={required} />
          </Grid>
        </Grid>
      )}
    </Box>
  );
}
