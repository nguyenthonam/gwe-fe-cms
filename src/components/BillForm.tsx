"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { BillData } from "@/types/bill";
import { useReactToPrint } from "react-to-print";
import BillPrint from "@/components/BillPrint";
import CountryInput from "@/components/CountryInput";
import CarrierInput from "@/components/CarrierInput";

export default function BillForm() {
  const { register, handleSubmit, setValue } = useForm<BillData>();
  const [billData, setBillData] = useState<BillData | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const onSubmit = (data: BillData) => {
    console.log("********: ", data);
    setBillData(data);
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef,
  });

  return (
    <div className="container mx-auto p-4">
      {/* Form nhập thông tin */}
      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-2">
        <div>
          <div className="mb-2 bg-gray-200 border  border-gray-400 rounded-sm">
            <h2 className="p-2 mb-2 border-b-[1px] border-gray-500 font-bold bg-blue-500 text-white">Billing Information</h2>
            <table className="w-full mb-2 border-collapse">
              <tbody>
                <tr>
                  <td className="p-2 w-[120px]">
                    <label className="text-sm font-medium text-gray-700">Customer</label>
                  </td>
                  <td className="p-2">
                    <input {...register("customer")} type="text" placeholder="Please enter..." className="w-full p-1 border border-gray-500" required />
                  </td>
                </tr>
                <tr>
                  <td className="p-2 w-[120px]">
                    <label className="text-sm font-medium text-gray-700">GWE Ref</label>
                  </td>
                  <td className="p-2">
                    <input {...register("GWERef")} type="text" placeholder="Please enter..." className="w-full p-1 border border-gray-500" required />
                  </td>
                </tr>
                <tr>
                  <td className="p-2 w-[120px]">
                    <label className="text-sm font-medium text-gray-700">Carrier Ref</label>
                  </td>
                  <td className="p-2">
                    <input {...register("carrierRef")} type="text" placeholder="Please enter..." className="w-full p-1 border border-gray-500" required />
                  </td>
                </tr>
                <tr>
                  <td className="p-2 w-[120px]">
                    <label className="text-sm font-medium text-gray-700">Carrier</label>
                  </td>
                  <td className="p-2">
                    <CarrierInput onChange={(value) => setValue("carrier", value)} />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mb-2 bg-gray-200 border  border-gray-400 rounded-sm">
            <h2 className="p-2 mb-2 border-b-[1px] border-gray-500 font-bold bg-blue-500 text-white">Sender Information</h2>
            <table className="w-full mb-2 border-collapse">
              <tbody>
                <tr>
                  <td className="p-2 w-[120px]">
                    <label className="text-sm font-medium text-gray-700">Sender</label>
                  </td>
                  <td className="p-2">
                    <input {...register("sender.name")} type="text" placeholder="Please enter..." className="w-full p-1 border border-gray-500" required />
                  </td>
                </tr>
                <tr>
                  <td className="p-2 w-[120px]">
                    <label className="text-sm font-medium text-gray-700">Address Line 1</label>
                  </td>
                  <td className="p-2">
                    <input {...register("sender.address1")} type="text" placeholder="Please enter..." className="w-full p-1 border border-gray-500" required />
                  </td>
                </tr>
                <tr>
                  <td className="p-2 w-[120px]">
                    <label className="text-sm font-medium text-gray-700">Address Line 2</label>
                  </td>
                  <td className="p-2">
                    <input {...register("sender.address2")} type="text" placeholder="Please enter..." className="w-full p-1 border border-gray-500" required />
                  </td>
                </tr>
                <tr>
                  <td className="p-2 w-[120px]">
                    <label className="text-sm font-medium text-gray-700">Address Line 3</label>
                  </td>
                  <td className="p-2">
                    <input {...register("sender.address3")} type="text" placeholder="Please enter..." className="w-full p-1 border border-gray-500" required />
                  </td>
                </tr>
                <tr>
                  <td className="p-2 w-[120px]">
                    <label className="text-sm font-medium text-gray-700">Phone</label>
                  </td>
                  <td className="p-2">
                    <input {...register("sender.phone")} type="text" placeholder="Please enter..." className="w-full p-1 border border-gray-500" required />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <div className="mb-2 bg-gray-200 border  border-gray-400 rounded-sm">
            <h2 className="p-2 mb-2 border-b-[1px] border-gray-500 font-bold bg-blue-500 text-white">Product Information</h2>
            <table className="w-full mb-2 border-collapse">
              <tbody>
                <tr>
                  <td className="p-2 w-[120px]">
                    <label className="text-sm font-medium text-gray-700">Sender</label>
                  </td>
                  <td className="p-2">
                    <input {...register("sender.name")} type="text" placeholder="Please enter..." className="w-full p-1 border border-gray-500" required />
                  </td>
                </tr>
                <tr>
                  <td className="p-2 w-[120px]">
                    <label className="text-sm font-medium text-gray-700">Address Line 1</label>
                  </td>
                  <td className="p-2">
                    <input {...register("sender.address1")} type="text" placeholder="Please enter..." className="w-full p-1 border border-gray-500" required />
                  </td>
                </tr>
                <tr>
                  <td className="p-2 w-[120px]">
                    <label className="text-sm font-medium text-gray-700">Address Line 2</label>
                  </td>
                  <td className="p-2">
                    <input {...register("sender.address2")} type="text" placeholder="Please enter..." className="w-full p-1 border border-gray-500" required />
                  </td>
                </tr>
                <tr>
                  <td className="p-2 w-[120px]">
                    <label className="text-sm font-medium text-gray-700">Address Line 3</label>
                  </td>
                  <td className="p-2">
                    <input {...register("sender.address3")} type="text" placeholder="Please enter..." className="w-full p-1 border border-gray-500" required />
                  </td>
                </tr>
                <tr>
                  <td className="p-2 w-[120px]">
                    <label className="text-sm font-medium text-gray-700">Phone</label>
                  </td>
                  <td className="p-2">
                    <input {...register("sender.phone")} type="text" placeholder="Please enter..." className="w-full p-1 border border-gray-500" required />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          Tạo hóa đơn
        </button>
      </form>

      {/* Hiển thị hóa đơn để in */}
      {billData && (
        <div className="mt-6">
          <BillPrint ref={printRef} data={billData} />
          <button onClick={() => handlePrint()} className="mt-4 bg-green-500 text-white p-2 rounded">
            In Hóa Đơn
          </button>
        </div>
      )}
    </div>
  );
}
