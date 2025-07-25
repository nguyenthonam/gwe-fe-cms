import { Grid, TextField, Box } from "@mui/material";
import CountrySelect from "@/components/Globals/CountrySelect";
import { IBasicContactInfor } from "@/types/typeGlobals";
import { RequiredLabel } from "@/components/commons/RequiredLabel";

interface Props {
  label: string;
  data: IBasicContactInfor & { attention?: string | null };
  setData: (v: any) => void;
  showCountry?: boolean;
  requiredFields?: string[];
  disabled?: boolean;
  errors?: { [key: string]: string };
  fieldPrefix?: string;
}

export default function OrderAddressSection({ label, data, setData, showCountry = false, requiredFields = [], disabled, errors = {}, fieldPrefix = "" }: Props) {
  return (
    <Box sx={{ p: 2 }}>
      {/* Full Name */}
      <Grid container alignItems="center" spacing={2} mb={1}>
        <Grid size={4}>
          <RequiredLabel required={requiredFields.includes("fullname")}>{label} Name</RequiredLabel>
        </Grid>
        <Grid size={8}>
          <TextField
            disabled={disabled}
            value={data.fullname || ""}
            onChange={(e) => setData((d: any) => ({ ...d, fullname: e.target.value }))}
            size="small"
            required={requiredFields.includes("fullname")}
            fullWidth
            error={!!errors[`${fieldPrefix}_fullname`]}
            helperText={errors[`${fieldPrefix}_fullname`] || ""}
          />
        </Grid>
      </Grid>
      {/* Attention (if exists) */}
      {"attention" in data && (
        <Grid container alignItems="center" spacing={2} mb={1}>
          <Grid size={4}>
            <RequiredLabel required={requiredFields.includes("attention")}>Attention</RequiredLabel>
          </Grid>
          <Grid size={8}>
            <TextField
              disabled={disabled}
              value={data.attention || ""}
              onChange={(e) => setData((d: any) => ({ ...d, attention: e.target.value }))}
              size="small"
              required={requiredFields.includes("attention")}
              fullWidth
              error={!!errors[`${fieldPrefix}_attention`]}
              helperText={errors[`${fieldPrefix}_attention`] || ""}
            />
          </Grid>
        </Grid>
      )}
      {/* Contact Number */}
      <Grid container alignItems="center" spacing={2} mb={1}>
        <Grid size={4}>
          <RequiredLabel required={requiredFields.includes("phone")}>Contact Number</RequiredLabel>
        </Grid>
        <Grid size={8}>
          <TextField
            disabled={disabled}
            value={data.phone || ""}
            onChange={(e) => setData((d: any) => ({ ...d, phone: e.target.value }))}
            size="small"
            required={requiredFields.includes("phone")}
            fullWidth
            error={!!errors[`${fieldPrefix}_phone`]}
            helperText={errors[`${fieldPrefix}_phone`] || ""}
          />
        </Grid>
      </Grid>
      {/* Address 1 */}
      <Grid container alignItems="center" spacing={2} mb={1}>
        <Grid size={4}>
          <RequiredLabel required={requiredFields.includes("address1")}>Address Line 1</RequiredLabel>
        </Grid>
        <Grid size={8}>
          <TextField
            disabled={disabled}
            value={data.address1 || ""}
            onChange={(e) => setData((d: any) => ({ ...d, address1: e.target.value }))}
            size="small"
            required={requiredFields.includes("address1")}
            fullWidth
            error={!!errors[`${fieldPrefix}_address1`]}
            helperText={errors[`${fieldPrefix}_address1`] || ""}
          />
        </Grid>
      </Grid>
      {/* Address 2 */}
      <Grid container alignItems="center" spacing={2} mb={1}>
        <Grid size={4}>
          <RequiredLabel required={requiredFields.includes("address2")}>Address Line 2</RequiredLabel>
        </Grid>
        <Grid size={8}>
          <TextField
            disabled={disabled}
            value={data.address2 || ""}
            onChange={(e) => setData((d: any) => ({ ...d, address2: e.target.value }))}
            size="small"
            required={requiredFields.includes("address2")}
            fullWidth
            error={!!errors[`${fieldPrefix}_address2`]}
            helperText={errors[`${fieldPrefix}_address2`] || ""}
          />
        </Grid>
      </Grid>
      {/* Address 3 */}
      <Grid container alignItems="center" spacing={2} mb={1}>
        <Grid size={4}>
          <RequiredLabel>Address Line 3</RequiredLabel>
        </Grid>
        <Grid size={8}>
          <TextField disabled={disabled} value={data.address3 || ""} onChange={(e) => setData((d: any) => ({ ...d, address3: e.target.value }))} size="small" fullWidth />
        </Grid>
      </Grid>
      {/* City */}
      {"city" in data && (
        <Grid container alignItems="center" spacing={2} mb={1}>
          <Grid size={4}>
            <RequiredLabel>City</RequiredLabel>
          </Grid>
          <Grid size={8}>
            <TextField disabled={disabled} value={data.city || ""} onChange={(e) => setData((d: any) => ({ ...d, city: e.target.value }))} size="small" fullWidth />
          </Grid>
        </Grid>
      )}
      {/* State/Province */}
      {"state" in data && (
        <Grid container alignItems="center" spacing={2} mb={1}>
          <Grid size={4}>
            <RequiredLabel>State/Province</RequiredLabel>
          </Grid>
          <Grid size={8}>
            <TextField disabled={disabled} value={data.state || ""} onChange={(e) => setData((d: any) => ({ ...d, state: e.target.value }))} size="small" fullWidth />
          </Grid>
        </Grid>
      )}
      {/* Postal Code */}
      {"postCode" in data && (
        <Grid container alignItems="center" spacing={2} mb={1}>
          <Grid size={4}>
            <RequiredLabel>Postal Code</RequiredLabel>
          </Grid>
          <Grid size={8}>
            <TextField disabled={disabled} value={data.postCode || ""} onChange={(e) => setData((d: any) => ({ ...d, postCode: e.target.value }))} size="small" fullWidth />
          </Grid>
        </Grid>
      )}
      {/* Country */}
      {showCountry && (
        <Grid container alignItems="center" spacing={2} mb={1}>
          <Grid size={4}>
            <RequiredLabel required={requiredFields.includes("country")}>Country</RequiredLabel>
          </Grid>
          <Grid size={8}>
            <CountrySelect
              disabled={disabled}
              value={data.country?.code}
              onChange={(country) => setData((d: any) => ({ ...d, country }))}
              label="Country"
              required={requiredFields.includes("country")}
              error={!!errors[`${fieldPrefix}_country`]}
              helperText={errors[`${fieldPrefix}_country`] || ""}
            />
          </Grid>
        </Grid>
      )}
    </Box>
  );
}
