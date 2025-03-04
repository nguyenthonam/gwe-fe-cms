"use client";

import { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";

interface BarcodeProps {
  value: string;
}

export default function Barcode({ value }: BarcodeProps) {
  const barcodeRef = useRef(null);

  useEffect(() => {
    if (barcodeRef.current) {
      JsBarcode(barcodeRef.current, value, { format: "CODE128", fontOptions: "bold", fontSize: 30 });

      // Đặt width 100% và giữ tỷ lệ height auto
      const svg: any = barcodeRef.current;
      svg.style.width = "100%";
      svg.style.height = "90px";
    }
  }, [value]);

  return <svg ref={barcodeRef} style={{ width: "100%" }}></svg>;
}
