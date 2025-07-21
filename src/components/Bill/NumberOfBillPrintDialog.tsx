import React, { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from "@mui/material";

interface BillPopupProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (billNumber: number) => void;
}

export default function BillNumberInputPopup({ open, onClose, onConfirm }: BillPopupProps) {
  const [billNumber, setBillNumber] = useState<string>("2");

  const handleConfirm = () => {
    const finalValue = billNumber === "" ? 0 : Number(billNumber);
    onConfirm(finalValue);
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (val.length > 1) {
      val = val.replace(/^0+/, "");
    }
    if (/^\d*$/.test(val)) {
      setBillNumber(val);
    }
  };

  const handleBlur = () => {
    setBillNumber((prev) => (prev === "" ? "0" : prev));
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle className="mb-2 border-b-2 border-gray-300">
        <p className="uppercase text-blue-600">NUMBER OF BILLS TO PRINT</p>
      </DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          type="text"
          fullWidth
          variant="outlined"
          label="Enter bill quantity"
          value={billNumber}
          onChange={handleChange}
          inputRef={(input) => {
            if (input) {
              input.setAttribute("inputmode", "numeric");
              input.setAttribute("pattern", "[0-9]*");
            }
          }}
          onBlur={handleBlur}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancel
        </Button>
        <Button onClick={handleConfirm} color="primary" variant="contained">
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
}
