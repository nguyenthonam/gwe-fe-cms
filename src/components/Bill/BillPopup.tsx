import React, { useRef, forwardRef, useImperativeHandle, useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";
import BillPrint, { IBillPrintRef } from "./BillPrint";
import { IBillData } from "@/types/bill";

interface IProps {
  data: IBillData | null;
}
export interface IBillPopupHandle {
  open: () => void;
  close: () => void;
}

const BillPopup = forwardRef(({ data }: IProps, ref: any) => {
  const [open, setOpen] = useState(false);
  const printRef = useRef<IBillPrintRef | null>(null);

  // Expose functions to parent via ref
  useImperativeHandle(ref, () => ({
    open: () => setOpen(true),
    close: () => setOpen(false),
  }));

  return (
    <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
      <DialogTitle className="mb-2 border-b-2 border-gray-300">
        <p className="uppercase text-blue-600">THÔNG TIN IN HÓA ĐƠN</p>
      </DialogTitle>
      <DialogContent>
        <BillPrint ref={printRef} data={data} />
      </DialogContent>
      <DialogActions className="border-t-2 border-gray-300">
        <Button className="font-bold hover:bg-blue-500 hover:text-white" onClick={() => printRef.current?.handlePrint()} color="primary" variant="text">
          In Hóa Đơn
        </Button>
        <Button className="text-gray-500" onClick={() => setOpen(false)}>
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  );
});

export default BillPopup;
