import React, { useRef, forwardRef, useImperativeHandle, useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";
import BillPrint, { IBillPrintRef } from "./BillPrint";
import { IBillData } from "@/types/typeBill";
import BillNumberPopup from "./BillNumberPopup";

interface IProps {
  data: IBillData | null;
}
export interface IBillPopupHandle {
  open: () => void;
  close: () => void;
}

const BillPopup = forwardRef<IBillPopupHandle, IProps>(({ data }, ref) => {
  const [open, setOpen] = useState(false);
  const [billNumber, setBillNumber] = useState(2);
  const [isConfirm, setIsConfirm] = useState(true);
  const [openBillNumber, setOpenBillNumber] = useState(false);

  const printRef = useRef<IBillPrintRef | null>(null);

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
          <p className="uppercase text-blue-600">THÔNG TIN IN HÓA ĐƠN</p>
        </DialogTitle>
        <DialogContent>
          <BillPrint ref={printRef} data={data} billNumber={billNumber} />
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

BillPopup.displayName = "Bill Popup";
export default BillPopup;
