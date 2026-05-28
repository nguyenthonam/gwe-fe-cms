import { Grid, TextField, Box } from "@mui/material";
import CountrySelect from "@/components/Globals/CountrySelect";
import { IBasicContactInfor } from "@/types/typeGlobals";
import { RequiredLabel } from "@/components/commons/RequiredLabel";

interface Props {
  label: string;
  data: IBasicContactInfor & {
    attention?: string | null;
    country?: any;
    city?: string;
    state?: string;
    postCode?: string;
  };
  setData: (updater: any) => void;
  showCountry?: boolean;
  requiredFields?: string[];
  disabled?: boolean;
  errors?: { [key: string]: string };
  fieldPrefix?: string;
}

export default function OrderAddressSection({ label, data, setData, showCountry = false, requiredFields = [], disabled = false, errors = {}, fieldPrefix = "" }: Props) {
  const errorKey = (field: string) => `${fieldPrefix}_${field}`;
  const isRequired = (field: string) => requiredFields.includes(field);

  const updateField = (field: string, value: any) => {
    setData((prev: any) => ({ ...prev, [field]: value }));
  };

  return (
    <Box sx={{ p: 2 }}>
      <Grid container alignItems="center" spacing={2} mb={1}>
        <Grid size={4}>
          <RequiredLabel required={isRequired("fullname")}>{label} Name</RequiredLabel>
        </Grid>
        <Grid size={8}>
          <TextField
            disabled={disabled}
            value={data.fullname || ""}
            onChange={(e) => updateField("fullname", e.target.value)}
            size="small"
            required={isRequired("fullname")}
            fullWidth
            error={!!errors[errorKey("fullname")]}
            helperText={errors[errorKey("fullname")] || ""}
            placeholder={`${label} name`}
          />
        </Grid>
      </Grid>

      {"attention" in data && (
        <Grid container alignItems="center" spacing={2} mb={1}>
          <Grid size={4}>
            <RequiredLabel required={isRequired("attention")}>Attention</RequiredLabel>
          </Grid>
          <Grid size={8}>
            <TextField
              disabled={disabled}
              value={data.attention || ""}
              onChange={(e) => updateField("attention", e.target.value)}
              size="small"
              required={isRequired("attention")}
              fullWidth
              error={!!errors[errorKey("attention")]}
              helperText={errors[errorKey("attention")] || ""}
              placeholder="Contact person"
            />
          </Grid>
        </Grid>
      )}

      <Grid container alignItems="center" spacing={2} mb={1}>
        <Grid size={4}>
          <RequiredLabel required={isRequired("phone")}>Contact Number</RequiredLabel>
        </Grid>
        <Grid size={8}>
          <TextField
            disabled={disabled}
            value={data.phone || ""}
            onChange={(e) => updateField("phone", e.target.value)}
            size="small"
            required={isRequired("phone")}
            fullWidth
            error={!!errors[errorKey("phone")]}
            helperText={errors[errorKey("phone")] || ""}
            placeholder="Phone number"
          />
        </Grid>
      </Grid>

      <Grid container alignItems="center" spacing={2} mb={1}>
        <Grid size={4}>
          <RequiredLabel required={isRequired("address1")}>Address Line 1</RequiredLabel>
        </Grid>
        <Grid size={8}>
          <TextField
            disabled={disabled}
            value={data.address1 || ""}
            onChange={(e) => updateField("address1", e.target.value)}
            size="small"
            required={isRequired("address1")}
            fullWidth
            error={!!errors[errorKey("address1")]}
            helperText={errors[errorKey("address1")] || ""}
            placeholder="Street / building / address"
          />
        </Grid>
      </Grid>

      <Grid container alignItems="center" spacing={2} mb={1}>
        <Grid size={4}>
          <RequiredLabel required={isRequired("address2")}>Address Line 2</RequiredLabel>
        </Grid>
        <Grid size={8}>
          <TextField
            disabled={disabled}
            value={data.address2 || ""}
            onChange={(e) => updateField("address2", e.target.value)}
            size="small"
            required={isRequired("address2")}
            fullWidth
            error={!!errors[errorKey("address2")]}
            helperText={errors[errorKey("address2")] || ""}
            placeholder="Ward / district / extra address"
          />
        </Grid>
      </Grid>

      <Grid container alignItems="center" spacing={2} mb={1}>
        <Grid size={4}>
          <RequiredLabel required={isRequired("address3")}>Address Line 3</RequiredLabel>
        </Grid>
        <Grid size={8}>
          <TextField
            disabled={disabled}
            value={data.address3 || ""}
            onChange={(e) => updateField("address3", e.target.value)}
            size="small"
            required={isRequired("address3")}
            fullWidth
            error={!!errors[errorKey("address3")]}
            helperText={errors[errorKey("address3")] || ""}
          />
        </Grid>
      </Grid>

      {"city" in data && (
        <Grid container alignItems="center" spacing={2} mb={1}>
          <Grid size={4}>
            <RequiredLabel required={isRequired("city")}>City</RequiredLabel>
          </Grid>
          <Grid size={8}>
            <TextField
              disabled={disabled}
              value={data.city || ""}
              onChange={(e) => updateField("city", e.target.value)}
              size="small"
              required={isRequired("city")}
              fullWidth
              error={!!errors[errorKey("city")]}
              helperText={errors[errorKey("city")] || ""}
            />
          </Grid>
        </Grid>
      )}

      {"state" in data && (
        <Grid container alignItems="center" spacing={2} mb={1}>
          <Grid size={4}>
            <RequiredLabel required={isRequired("state")}>State/Province</RequiredLabel>
          </Grid>
          <Grid size={8}>
            <TextField
              disabled={disabled}
              value={data.state || ""}
              onChange={(e) => updateField("state", e.target.value)}
              size="small"
              required={isRequired("state")}
              fullWidth
              error={!!errors[errorKey("state")]}
              helperText={errors[errorKey("state")] || ""}
            />
          </Grid>
        </Grid>
      )}

      {"postCode" in data && (
        <Grid container alignItems="center" spacing={2} mb={1}>
          <Grid size={4}>
            <RequiredLabel required={isRequired("postCode")}>Postal Code</RequiredLabel>
          </Grid>
          <Grid size={8}>
            <TextField
              disabled={disabled}
              value={data.postCode || ""}
              onChange={(e) => updateField("postCode", e.target.value)}
              size="small"
              required={isRequired("postCode")}
              fullWidth
              error={!!errors[errorKey("postCode")]}
              helperText={errors[errorKey("postCode")] || ""}
            />
          </Grid>
        </Grid>
      )}

      {showCountry && (
        <Grid container alignItems="center" spacing={2} mb={1}>
          <Grid size={4}>
            <RequiredLabel required={isRequired("country")}>Country</RequiredLabel>
          </Grid>
          <Grid size={8}>
            <CountrySelect
              disabled={disabled}
              value={data.country?.code}
              onChange={(country) => updateField("country", country)}
              label="Country"
              required={isRequired("country")}
              error={!!errors[errorKey("country")]}
              helperText={errors[errorKey("country")] || ""}
            />
          </Grid>
        </Grid>
      )}
    </Box>
  );
}
