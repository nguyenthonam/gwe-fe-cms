import React, { useRef, forwardRef, useImperativeHandle, useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";
import BillShippingMark, { IBillShippingMarkRef } from "./BillShippingMark";
import { IBillData } from "@/types/bill";
import BillNumberPopup from "./BillNumberPopup";

interface IProps {
  data: IBillData | null;
}
export interface IBillShippingMarkPopupHandle {
  open: () => void;
  close: () => void;
}

const BillShippingMarkPopup = forwardRef<IBillShippingMarkPopupHandle, IProps>(({ data }, ref) => {
  const [open, setOpen] = useState(false);
  const [billNumber, setBillNumber] = useState(2);
  const [isConfirm, setIsConfirm] = useState(true);
  const [openBillNumber, setOpenBillNumber] = useState(false);
  const printRef = useRef<IBillShippingMarkRef | null>(null);

  // Expose functions to parent via ref
  useImperativeHandle(ref, () => ({
    open: () => setOpen(true),
    close: () => setOpen(false),
  }));
  useEffect(() => {
    if (billNumber > 0) {
      printRef.current?.handlePrint();
    }
  }, [billNumber, isConfirm]); // Theo dõi billNumber, tự động gọi print khi cập nhật

  const handleConfirm = (num: number) => {
    if (billNumber === num) {
      setIsConfirm(!isConfirm);
    } else {
      setBillNumber(num);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle className="mb-2 border-b-2 border-gray-300">
          <p className="uppercase text-blue-600">SHIPPING MARK</p>
        </DialogTitle>
        <DialogContent>
          <BillShippingMark ref={printRef} data={data} billNumber={billNumber} />
        </DialogContent>
        <DialogActions className="border-t-2 border-gray-300">
          <Button className="font-bold hover:bg-blue-500 hover:text-white" onClick={() => setOpenBillNumber(true)} color="primary" variant="text">
            In
          </Button>
          <Button className="text-gray-500" onClick={() => setOpen(false)}>
            Đóng
          </Button>
        </DialogActions>
      </Dialog>
      <BillNumberPopup open={openBillNumber} onClose={() => setOpenBillNumber(false)} onConfirm={handleConfirm} />
    </>
  );
});
BillShippingMarkPopup.displayName = "Bill Shipping Mark";
export default BillShippingMarkPopup;
