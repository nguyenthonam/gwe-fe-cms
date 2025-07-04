import React, { useRef, forwardRef, useImperativeHandle, useState, useEffect } from "react";
import { useReactToPrint } from "react-to-print";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from "@mui/material";
import BillNumberDialog from "./NumberOfBillPrintDialog";
import { IOrder } from "@/types/typeOrder";
import "@/styles/components/Bill/BillPrint.css";

interface IProps {
  data: IOrder | null;
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
  const printRef = useRef<HTMLDivElement | null>(null);

  useImperativeHandle(ref, () => ({
    open: () => setOpen(true),
    close: () => setOpen(false),
  }));

  // Fix bug: Không gọi in nếu chưa có data hoặc đang đóng popup!
  useEffect(() => {
    if (!open) return; // chỉ auto print khi dialog mở
    if (!data) return; // không có dữ liệu, không gọi in
    if (billNumber > 0) {
      handlePrint();
    }
    // eslint-disable-next-line
  }, [billNumber, isConfirm, open, data]);

  // Xử lý confirm số bản in
  const handleConfirm = (num: number) => {
    if (billNumber === num) {
      setIsConfirm((prev) => !prev);
    } else {
      setBillNumber(num);
    }
  };

  // Sửa lại useReactToPrint cho đúng
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: data?.trackingCode ? data.trackingCode + "-shipping-mark" : "Shipping-mark",
    preserveAfterPrint: true,
    // onAfterPrint: () => setOpen(false), // Tuỳ nhu cầu: có thể auto đóng popup sau khi in
  });

  // Nếu không có dữ liệu, render thông báo rõ ràng trên UI
  const BillView = ({ className }: { className?: string }) => {
    if (!data) {
      return (
        <div className={`flex w-full h-[100vh] flex-col items-center justify-center text-center text-[40px] font-bold bill a4-landscape ${className}`}>
          <Typography color="error" variant="h6">
            Không có dữ liệu đơn hàng!
          </Typography>
        </div>
      );
    }
    return (
      <div className={`flex w-full h-[100vh] flex-col items-center justify-center text-center text-[40px] font-bold bill a4-landscape ${className}`}>
        {data?.trackingCode && <p className=" mb-[8px] underline underline-offset-3">{data?.trackingCode}</p>}
        {data?.recipient?.fullname && <p>{data.recipient.fullname}</p>}
        <p>
          <span className="underline underline-offset-3">ATTN:</span> {data?.recipient?.attention}
        </p>
        <p>
          <span className="underline underline-offset-3">ADDR:</span> {data?.recipient?.address1}
        </p>
        <div>
          {data?.recipient?.address2 && <p>{data.recipient.address2}</p>}
          {data?.recipient?.address3 && <p>{data.recipient.address3}</p>}
          {(data?.recipient?.city || data?.recipient?.state || data?.recipient?.postCode || data?.recipient?.country) && (
            <p>
              {data?.recipient?.city + " "}
              {data?.recipient?.state + " "}
              {data?.recipient?.postCode + " "}
              {typeof data?.recipient?.country === "object" ? data.recipient.country?.name : data.recipient.country}
            </p>
          )}
        </div>
        <p>
          <span className="underline underline-offset-3">TEL:</span> {data?.recipient?.phone}
        </p>
      </div>
    );
  };

  return (
    <>
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle className="mb-2 border-b-2 border-gray-300">
          <p className="uppercase text-blue-600">SHIPPING MARK</p>
        </DialogTitle>
        <DialogContent>
          <div ref={printRef}>
            {/* Nếu không có dữ liệu, chỉ show 1 lần */}
            {data ? Array.from({ length: billNumber }).map((_, idx) => <BillView key={"shipping-mark-" + idx} className={idx > 0 ? "print-shipping-mart-only" : ""} />) : <BillView />}
          </div>
        </DialogContent>
        <DialogActions className="border-t-2 border-gray-300">
          <Button
            className="font-bold hover:bg-blue-500 hover:text-white"
            onClick={() => setOpenBillNumber(true)}
            color="primary"
            variant="text"
            disabled={!data} // Không cho in nếu không có dữ liệu
          >
            In
          </Button>
          <Button className="text-gray-500" onClick={() => setOpen(false)}>
            Đóng
          </Button>
        </DialogActions>
      </Dialog>
      <BillNumberDialog open={openBillNumber} onClose={() => setOpenBillNumber(false)} onConfirm={handleConfirm} />
    </>
  );
});
BillShippingMarkPopup.displayName = "Bill Shipping Mark";
export default BillShippingMarkPopup;
