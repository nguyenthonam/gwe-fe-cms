"use client";
import { Box, Stack, Button, TextField, Select, MenuItem, Typography } from "@mui/material";
import { ECURRENCY } from "@/types/typeGlobals";
import { ISurchargeDetail } from "@/types/typeOrder";
import NumericInput from "@/components/Globals/NumericInput";

interface Props {
  surcharges: ISurchargeDetail[];
  setSurcharges: (arr: ISurchargeDetail[]) => void;
}

export default function OrderSurchargeSection({ surcharges, setSurcharges }: Props) {
  return (
    <Box gap={2}>
      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: "bold" }}>
        Additional Charges
      </Typography>
      {surcharges.map((fee, idx) => (
        <Stack direction="row" spacing={1} key={idx}>
          <TextField
            label="Charge Name"
            value={fee.name}
            onChange={(e) => {
              const s = [...surcharges];
              s[idx].name = e.target.value;
              setSurcharges(s);
            }}
            size="small"
            placeholder="Enter charge name"
          />
          <NumericInput
            label="Amount"
            value={String(fee.amount)}
            onChange={(value) => {
              const s = [...surcharges];
              s[idx].amount = Number(value);
              setSurcharges(s);
            }}
            fullWidth
            size="small"
            sx={{ width: "120px" }}
            placeholder="Enter amount"
          />
          <Select
            label="Currency"
            value={fee.currency}
            onChange={(e) => {
              const s = [...surcharges];
              s[idx].currency = e.target.value;
              setSurcharges(s);
            }}
            size="small"
            sx={{ width: "80px" }}
          >
            {Object.values(ECURRENCY).map((cur) => (
              <MenuItem value={cur} key={cur}>
                {cur}
              </MenuItem>
            ))}
          </Select>
          <Button color="error" onClick={() => setSurcharges(surcharges.filter((_, i) => i !== idx))}>
            Delete
          </Button>
        </Stack>
      ))}
      <Button variant="outlined" onClick={() => setSurcharges([...surcharges, { name: "", amount: 0, currency: ECURRENCY.VND }])} sx={{ mt: 1 }}>
        Add Charge
      </Button>
    </Box>
  );
}
