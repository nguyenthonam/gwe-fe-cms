"use client";

import dynamic from "next/dynamic";

const BillForm = dynamic(() => import("@/components/Bill/BillForm"), { ssr: false });

export default function BillClientPage() {
  return <BillForm />;
}
