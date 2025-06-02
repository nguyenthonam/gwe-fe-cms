import React, { useRef, forwardRef, useImperativeHandle, useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";
import BillPrintForm, { IBillPrintRef } from "./BillPrintForm";
import BillNumberDialog from "./NumberOfBillPrintDialog";
import { IOrder } from "@/types/typeOrder";

interface IProps {
  data: IOrder | null;
}
export interface IBillPopupHandle {
  open: () => void;
  close: () => void;
}

const BillPopup = forwardRef<IBillPopupHandle, IProps>(({ data }, ref) => {
  const [open, setOpen] = useState(false);
  const [billNumber, setBillNumber] = useState<number>(2);
  const [openBillNumber, setOpenBillNumber] = useState(false);

  const printRef = useRef<IBillPrintRef | null>(null);

  // Ref expose cho cha
  useImperativeHandle(ref, () => ({
    open: () => setOpen(true),
    close: () => setOpen(false),
  }));

  // Khi xác nhận số bản in, gọi in
  useEffect(() => {
    if (open && billNumber > 0) {
      printRef.current?.handlePrint();
    }
    // eslint-disable-next-line
  }, [billNumber, open]);

  // Xác nhận số bản in, gọi in lại nếu khác số cũ
  const handleConfirm = (num: number) => {
    setBillNumber(num);
    setOpenBillNumber(false);
  };

  return (
    <>
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ mb: 2, borderBottom: "2px solid #e0e0e0" }}>
          <span className="uppercase text-blue-600">THÔNG TIN IN HÓA ĐƠN</span>
        </DialogTitle>
        <DialogContent>
          <BillPrintForm ref={printRef} data={data} billNumber={billNumber} />
        </DialogContent>
        <DialogActions sx={{ borderTop: "2px solid #e0e0e0" }}>
          <Button className="font-bold hover:bg-blue-500 hover:text-white" onClick={() => setOpenBillNumber(true)} color="primary" variant="text">
            In
          </Button>
          <Button className="text-gray-500" onClick={() => setOpen(false)}>
            Đóng
          </Button>
        </DialogActions>
      </Dialog>
      {/* Popup chọn số bản in */}
      <BillNumberDialog open={openBillNumber} onClose={() => setOpenBillNumber(false)} onConfirm={handleConfirm} />
    </>
  );
});

BillPopup.displayName = "BillPopup";
export default BillPopup;
