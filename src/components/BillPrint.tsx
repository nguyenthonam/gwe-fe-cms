import React from "react";
import Image from "next/image";
import Barcode from "@/components/Barcode";
import { BillData } from "@/types/bill";

const BillPrint = React.forwardRef(({ data }: { data: BillData }, ref: any) => {
  return (
    <div ref={ref} className="border p-4 w-full mx-auto bg-white">
      {/* Logo công ty */}
      <div className="text-center">
        {/* Hiển thị barcode và QR code */}
        <div className="flex justify-between gap-4 mt-4">
          <Image src="/logo.png" alt="Company Logo" width={200} height={50} />

          <Barcode value={data.GWERef} />
        </div>

        <h2 className="text-lg font-bold">HÓA ĐƠN GỬI HÀNG</h2>
      </div>

      {/* Thông tin hóa đơn */}
      <div className="mt-4">
        <p>
          <strong>Người gửi:</strong> {data.sender.name}
        </p>
        <p>
          <strong>Người nhận:</strong> {data.recipient.name}
        </p>
        <p>
          <strong>Mã vận đơn:</strong> {data.GWERef}
        </p>
      </div>
    </div>
  );
});

BillPrint.displayName = "Bill Print";
export default BillPrint;
