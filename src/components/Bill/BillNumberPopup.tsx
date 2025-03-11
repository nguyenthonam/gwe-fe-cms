import React, { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from "@mui/material";

interface BillPopupProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (billNumber: number) => void;
}

export default function BillNumberInputPopup({ open, onClose, onConfirm }: BillPopupProps) {
  const [billNumber, setBillNumber] = useState<string>("2"); // Chuyển thành string để kiểm soát input

  const handleConfirm = () => {
    const finalValue = billNumber === "" ? 0 : Number(billNumber);
    onConfirm(finalValue);
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;

    if (val.length > 1) {
      val = val.replace(/^0+/, ""); // Loại bỏ số 0 đầu tiên nếu có nhiều chữ số
    }

    if (/^\d*$/.test(val)) {
      // Chỉ cho phép nhập số
      setBillNumber(val);
    }
  };
  const handleBlur = () => {
    setBillNumber((prev) => (prev === "" ? "0" : prev)); // Đặt lại 0 nếu input trống
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
          type="text" // Dùng text thay vì number để tránh lỗi
          fullWidth
          variant="outlined"
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
          Hủy
        </Button>
        <Button onClick={handleConfirm} color="primary">
          Xác nhận
        </Button>
      </DialogActions>
    </Dialog>
  );
}
