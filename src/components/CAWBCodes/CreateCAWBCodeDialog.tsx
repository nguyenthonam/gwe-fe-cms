import { Dialog, DialogTitle, DialogContent, DialogActions, Button, MenuItem, Select, TextField, Stack, Box, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useNotification } from "@/contexts/NotificationProvider";
import { ICarrier } from "@/types/typeCarrier";
import { getCarriersApi } from "@/utils/apis/apiCarrier";
import { createCAWBCodeApi } from "@/utils/apis/apiCAWBCode";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateCAWBCodeDialog({ open, onClose, onCreated }: Props) {
  const [carrierId, setCarrierId] = useState("");
  const [rawInput, setRawInput] = useState("");
  const [parsedCodes, setParsedCodes] = useState<string[]>([]);
  const [carriers, setCarriers] = useState<ICarrier[]>([]);
  const [loading, setLoading] = useState(false);

  const { showNotification } = useNotification();

  useEffect(() => {
    if (open) {
      fetchCarriers();
      setRawInput("");
      setParsedCodes([]);
      setCarrierId("");
    }
  }, [open]);

  const fetchCarriers = async () => {
    try {
      const res = await getCarriersApi();
      setCarriers(res?.data?.data?.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleParse = () => {
    const lines = rawInput
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line);
    const unique = [...new Set(lines)];
    setParsedCodes(unique);
  };

  const handleSubmit = async () => {
    if (!carrierId || parsedCodes.length === 0) {
      showNotification("Please select a carrier and enter valid codes.", "warning");
      return;
    }

    try {
      setLoading(true);
      const res = await createCAWBCodeApi({ carrierId, codes: parsedCodes });
      showNotification(res?.data?.message || "Codes created successfully!", "success");
      onCreated();
    } catch (err: any) {
      showNotification(err.message || "Failed to create codes", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Batch Add CAWB Codes</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <Select fullWidth value={carrierId} onChange={(e) => setCarrierId(e.target.value)} displayEmpty>
            <MenuItem value="">Select Sub Carrier</MenuItem>
            {carriers.map((carrier) => (
              <MenuItem key={carrier._id} value={carrier._id}>
                {carrier.name}
              </MenuItem>
            ))}
          </Select>

          <TextField
            multiline
            minRows={6}
            label="Paste codes from Excel (one code per line)"
            value={rawInput}
            onChange={(e) => setRawInput(e.target.value)}
            placeholder={`Eg:\nAB12345678\nAB12345679\n...`}
          />

          <Button onClick={handleParse} variant="outlined">
            Parse Codes
          </Button>

          {parsedCodes.length > 0 && (
            <Box>
              <Typography variant="subtitle2">Parsed Codes ({parsedCodes.length}):</Typography>
              <Box sx={{ maxHeight: 150, overflowY: "auto", border: "1px solid #ddd", p: 1, borderRadius: 1 }}>
                <Stack spacing={0.5}>
                  {parsedCodes.map((code, index) => (
                    <Typography key={index} variant="body2">
                      {code}
                    </Typography>
                  ))}
                </Stack>
              </Box>
            </Box>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} disabled={loading} variant="contained">
          Create Codes
        </Button>
      </DialogActions>
    </Dialog>
  );
}
