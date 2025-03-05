import React, { useImperativeHandle, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { IBillData } from "@/types";
import "@/styles/components/Bill/BillPrint.css";
interface IProps {
  data: IBillData | null;
  billNumber: number;
}
interface IBillView {
  className?: string;
}

// Định nghĩa kiểu dữ liệu cho ref
export interface IBillShippingMarkRef {
  handlePrint: () => void;
}

const BillShippingMark = React.forwardRef<IBillShippingMarkRef, IProps>(({ data, billNumber }, ref) => {
  const billPrintRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: billPrintRef,
    documentTitle: data?.HAWBCode + "-shipping-mark" || `GX-${Date.now().toString()}-shipping-mark`,
    preserveAfterPrint: true,
  });

  useImperativeHandle(ref, () => {
    return {
      handlePrint: handlePrint,
    };
  });

  const BillView = ({ className }: IBillView) => {
    return (
      <div className={`flex w-full h-[100vh] flex-col items-center justify-center text-center text-[40px] font-bold bill a4-landscape ${className}`}>
        {data?.HAWBCode && <p className=" mb-[8px] underline underline-offset-3">{data?.HAWBCode}</p>}
        {data?.recipient?.name && <p>{data.recipient.name}</p>}
        <p>
          <span className="underline underline-offset-3">ATTN:</span> {data?.recipient?.attention}
        </p>
        <p>
          <span className="underline underline-offset-3">ADDR:</span> {data?.recipient?.address1}
        </p>
        <div>
          {data?.recipient?.address2 && (
            <>
              <p>{data.recipient.address2}</p>
            </>
          )}
          {data?.recipient?.address3 && (
            <>
              <p>{data.recipient.address3}</p>
            </>
          )}
          {(data?.recipient?.city || data?.recipient?.state || data?.recipient?.postCode || data?.recipient?.country) && (
            <>
              <p>
                {data?.recipient?.city + " "}
                {data?.recipient?.state + " "}
                {data?.recipient?.postCode + " "}
                {data?.recipient?.country}
              </p>
            </>
          )}
        </div>
        <p>
          <span className="underline underline-offset-3">TEL:</span> {data?.recipient?.phone}
        </p>
      </div>
    );
  };

  return (
    <div ref={billPrintRef}>
      {Array.from({ length: billNumber }).map((v, idx) => (
        <BillView key={"shipping-mark-" + idx} className={idx > 0 ? "print-shipping-mart-only" : ""} />
      ))}
    </div>
  );
});

BillShippingMark.displayName = "Bill Shipping Mark";
export default BillShippingMark;
