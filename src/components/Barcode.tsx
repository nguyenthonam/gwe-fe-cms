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
      JsBarcode(barcodeRef.current, value, { format: "CODE128" });
    }
  }, [value]);

  return <svg ref={barcodeRef} width={150}></svg>;
}
