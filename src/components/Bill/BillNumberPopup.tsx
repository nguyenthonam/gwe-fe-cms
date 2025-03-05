import React, { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from "@mui/material";

interface BillPopupProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (billNumber: number) => void;
}

export default function BillAmountInputPopup({ open, onClose, onConfirm }: BillPopupProps) {
  const [billNumber, setBillNumber] = useState(2);

  const handleConfirm = () => {
    onConfirm(billNumber);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle className="mb-2 border-b-2 border-gray-300">
        <p className="uppercase text-blue-600">Số Lượng Bill Cần In</p>
      </DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          type="number"
          fullWidth
          variant="outlined"
          value={billNumber}
          onChange={(e) => {
            const newValue = Number(e.target.value);
            if (newValue >= 1) {
              setBillNumber(newValue);
            }
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Hủy
        </Button>
        <Button onClick={handleConfirm} color="primary">
          Xác nhận
        </Button>
      </DialogActions>
    </Dialog>
  );
}
