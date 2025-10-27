"use client";

import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Box, Stack, Button, Typography, TextField, FormControlLabel, Checkbox, InputAdornment, Tooltip } from "@mui/material";
import Grid from "@mui/material/Grid";
import { Edit } from "@mui/icons-material";

export type TBulkUpdatePayload = {
  vat?: { customVATPercentage: number }; // -1 or 0..100
  extraFees?: { fscFeePercentage: number }; // 0..100
};

export default function BulkUpdateOrdersDialog({
  open,
  onClose,
  onSubmit,
  selectedCount,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (update: TBulkUpdatePayload) => void;
  selectedCount: number;
}) {
  // toggles
  const [enableVAT, setEnableVAT] = useState(false);
  const [enableFSC, setEnableFSC] = useState(false);

  // values
  const [vatValue, setVatValue] = useState<string>("");
  const [fscValue, setFscValue] = useState<string>("");

  const [formError, setFormError] = useState<string>("");

  useEffect(() => {
    if (!open) {
      setEnableVAT(false);
      setEnableFSC(false);
      setVatValue("");
      setFscValue("");
      setFormError("");
    }
  }, [open]);

  const vatError = useMemo(() => {
    if (!enableVAT || vatValue === "") return "";
    const v = Number(vatValue);
    if (Number.isNaN(v)) return "VAT must be a number (-1 or 0..100).";
    if (v === -1) return "";
    if (v < 0 || v > 100) return "VAT must be in range 0..100, or -1 to skip.";
    return "";
  }, [enableVAT, vatValue]);

  const fscError = useMemo(() => {
    if (!enableFSC || fscValue === "") return "";
    const v = Number(fscValue);
    if (Number.isNaN(v)) return "FSC must be a number (0..100).";
    if (v < 0 || v > 100) return "FSC must be in range 0..100.";
    return "";
  }, [enableFSC, fscValue]);

  const changeChips = useMemo(() => {
    const chips: string[] = [];
    if (enableVAT && vatValue !== "") chips.push(`VAT: ${vatValue}%`);
    if (enableFSC && fscValue !== "") chips.push(`FSC: ${fscValue}%`);
    return chips;
  }, [enableVAT, vatValue, enableFSC, fscValue]);

  const handleSubmit = () => {
    setFormError("");

    if (!enableVAT && !enableFSC) {
      setFormError("Please enable at least one field to update.");
      return;
    }
    if (vatError || fscError) {
      setFormError(vatError || fscError);
      return;
    }

    const update: TBulkUpdatePayload = {};
    if (enableVAT && vatValue !== "" && !Number.isNaN(Number(vatValue))) {
      update.vat = { customVATPercentage: Number(vatValue) };
    }
    if (enableFSC && fscValue !== "" && !Number.isNaN(Number(fscValue))) {
      update.extraFees = { fscFeePercentage: Number(fscValue) };
    }
    if (!update.vat && !update.extraFees) {
      setFormError("No changes to update.");
      return;
    }
    onSubmit(update);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ pb: 0 }}>
        <Typography variant="h6">Bulk Update Orders</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Applying to <b>{selectedCount}</b> selected order(s). Enable the checkbox to update a field.
        </Typography>
      </DialogTitle>

      <DialogContent dividers sx={{ pt: 2 }}>
        {formError && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="error">
              {formError}
            </Typography>
          </Box>
        )}

        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
          Pricing Overrides
        </Typography>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack spacing={0.5}>
              <FormControlLabel control={<Checkbox checked={enableVAT} onChange={(e) => setEnableVAT(e.target.checked)} />} label="Update VAT (%)" />
              <TextField
                size="small"
                type="number"
                placeholder="e.g. 8 or -1 (skip)"
                value={vatValue}
                onChange={(e) => setVatValue(e.target.value)}
                disabled={!enableVAT}
                InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                error={!!vatError}
                helperText={vatError || "Valid values: -1 (skip system VAT) or 0..100."}
              />
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Stack spacing={0.5}>
              <FormControlLabel control={<Checkbox checked={enableFSC} onChange={(e) => setEnableFSC(e.target.checked)} />} label="Update FSC (%)" />
              <TextField
                size="small"
                type="number"
                placeholder="e.g. 35"
                value={fscValue}
                onChange={(e) => setFscValue(e.target.value)}
                disabled={!enableFSC}
                InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                error={!!fscError}
                helperText={fscError || "Valid values: 0..100."}
              />
            </Stack>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ position: "sticky", bottom: 0, bgcolor: "background.paper" }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Tooltip title={!changeChips.length ? "No changes yet" : ""}>
          <span>
            <Button onClick={handleSubmit} variant="contained" startIcon={<Edit />} disabled={!changeChips.length || !!vatError || !!fscError}>
              Update {selectedCount ? `(${selectedCount})` : ""}
            </Button>
          </span>
        </Tooltip>
      </DialogActions>
    </Dialog>
  );
}
