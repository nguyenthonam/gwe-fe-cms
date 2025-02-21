"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { BillData } from "@/types/bill";
import { useReactToPrint } from "react-to-print";
import BillPrint from "@/components/BillPrint";
import CountryInput from "@/components/CountryInput";
import CarrierInput from "@/components/CarrierInput";
import PackageCodeInput from "./PackageCodeInput";

export default function BillForm() {
  const [isSticky, setIsSticky] = useState(false);
  const { register, handleSubmit, setValue } = useForm<BillData>();
  const [billData, setBillData] = useState<BillData | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const printRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      // if (menuRef.current) {
      //   const menuTop = menuRef.current.offsetTop;
      //   setIsSticky(window.scrollY >= menuTop);
      //   console.log("Issticky:", window.scrollY, menuTop, isSticky);
      // }
      if (formRef.current) {
        setIsSticky(window.scrollY >= formRef.current.offsetTop - 80);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const onSubmit = (data: BillData) => {
    console.log("********: ", data);
    setBillData(data);
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef,
  });

  return (
    <div className="container mx-auto">
      <div ref={menuRef} className={` bg-white transition-all ${isSticky ? "fixed top-0 left-0 right-0 z-50 shadow-md" : "relative"}`}>
        <div className={`container flex justify-between gap-4 mx-auto ${isSticky ? "p-4" : "py-4"}`}>
          <h1 className="text-3xl font-bold">ĐƠN HÀNG VẬN CHUYỂN</h1>
          <div>
            <button onClick={() => formRef.current?.requestSubmit()} className="bg-blue-500 text-white p-2 rounded-lg shadow-md hover:bg-blue-600 transition-all">
              Tạo Hóa Đơn
            </button>
          </div>
        </div>
      </div>
      {/* Form nhập thông tin */}
      <form ref={formRef} onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-2">
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
                    <input {...register("customer")} type="text" placeholder="Please enter..." className="w-full h-[26px] p-1 border border-gray-500" required />
                  </td>
                </tr>
                <tr>
                  <td className="p-2 w-[120px]">
                    <label className="text-sm font-medium text-gray-700">GWE Ref</label>
                  </td>
                  <td className="p-2">
                    <input {...register("GWERef")} type="text" placeholder="Please enter..." className="w-full h-[26px] max-w-[250px] p-1 border border-gray-500" required />
                  </td>
                </tr>
                <tr>
                  <td className="p-2 w-[120px]">
                    <label className="text-sm font-medium text-gray-700">Carrier Ref</label>
                  </td>
                  <td className="p-2">
                    <input {...register("carrierRef")} type="text" placeholder="Please enter..." className="w-full h-[26px] max-w-[250px] p-1 border border-gray-500" required />
                  </td>
                </tr>
                <tr>
                  <td className="p-2 w-[120px]">
                    <label className="text-sm font-medium text-gray-700">Carrier</label>
                  </td>
                  <td className="p-2">
                    <div className="max-w-[250px] h-[26px]">
                      <CarrierInput className="h-[26px]" onChange={(value) => setValue("carrier", value)} />
                    </div>
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
                    <input {...register("sender.name")} type="text" placeholder="Please enter..." className="w-full h-[26px] p-1 border border-gray-500" required />
                  </td>
                </tr>
                <tr>
                  <td className="p-2 w-[120px]">
                    <label className="text-sm font-medium text-gray-700">Address Line 1</label>
                  </td>
                  <td className="p-2">
                    <input {...register("sender.address1")} type="text" placeholder="Please enter..." className="w-full h-[26px] p-1 border border-gray-500" required />
                  </td>
                </tr>
                <tr>
                  <td className="p-2 w-[120px]">
                    <label className="text-sm font-medium text-gray-700">Address Line 2</label>
                  </td>
                  <td className="p-2">
                    <input {...register("sender.address2")} type="text" placeholder="Please enter..." className="w-full h-[26px] p-1 border border-gray-500" required />
                  </td>
                </tr>
                <tr>
                  <td className="p-2 w-[120px]">
                    <label className="text-sm font-medium text-gray-700">Address Line 3</label>
                  </td>
                  <td className="p-2">
                    <input {...register("sender.address3")} type="text" placeholder="Please enter..." className="w-full h-[26px] p-1 border border-gray-500" required />
                  </td>
                </tr>
                <tr>
                  <td className="p-2 w-[120px]">
                    <label className="text-sm font-medium text-gray-700">Phone</label>
                  </td>
                  <td className="p-2">
                    <input {...register("sender.phone")} type="text" placeholder="Please enter..." className="w-full h-[26px] max-w-[250px] p-1 border border-gray-500" required />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mb-2 bg-gray-200 border  border-gray-400 rounded-sm">
            <h2 className="p-2 mb-2 border-b-[1px] border-gray-500 font-bold bg-blue-500 text-white">Recipient Information</h2>
            <table className="w-full mb-2 border-collapse">
              <tbody>
                <tr>
                  <td className="p-2 w-[120px]">
                    <label className="text-sm font-medium text-gray-700">Name</label>
                  </td>
                  <td className="p-2">
                    <input {...register("recipient.name")} type="text" placeholder="Please enter..." className="w-full h-[26px] p-1 border border-gray-500" required />
                  </td>
                </tr>
                <tr>
                  <td className="p-2 w-[120px]">
                    <label className="text-sm font-medium text-gray-700">Attention</label>
                  </td>
                  <td className="p-2">
                    <input {...register("recipient.attention")} type="text" placeholder="Please enter..." className="w-full h-[26px] p-1 border border-gray-500" required />
                  </td>
                </tr>
                <tr>
                  <td className="p-2 w-[120px]">
                    <label className="text-sm font-medium text-gray-700">Address Line 1</label>
                  </td>
                  <td className="p-2">
                    <input {...register("recipient.address1")} type="text" placeholder="Please enter..." className="w-full h-[26px] p-1 border border-gray-500" required />
                  </td>
                </tr>
                <tr>
                  <td className="p-2 w-[120px]">
                    <label className="text-sm font-medium text-gray-700">Address Line 2</label>
                  </td>
                  <td className="p-2">
                    <input {...register("recipient.address2")} type="text" placeholder="Please enter..." className="w-full h-[26px] p-1 border border-gray-500" required />
                  </td>
                </tr>
                <tr>
                  <td className="p-2 w-[120px]">
                    <label className="text-sm font-medium text-gray-700">Address Line 3</label>
                  </td>
                  <td className="p-2">
                    <input {...register("recipient.address3")} type="text" placeholder="Please enter..." className="w-full h-[26px] p-1 border border-gray-500" required />
                  </td>
                </tr>
                <tr>
                  <td className="p-2 w-[120px]">
                    <label className="text-sm font-medium text-gray-700">City</label>
                  </td>
                  <td className="p-2">
                    <input {...register("recipient.city")} type="text" placeholder="Please enter..." className="w-full h-[26px] max-w-[250px] p-1 border border-gray-500" required />
                  </td>
                </tr>
                <tr>
                  <td className="p-2 w-[120px]">
                    <label className="text-sm font-medium text-gray-700">State</label>
                  </td>
                  <td className="p-2">
                    <input {...register("recipient.state")} type="text" placeholder="Please enter..." className="w-full h-[26px] max-w-[250px] p-1 border border-gray-500" required />
                  </td>
                </tr>
                <tr>
                  <td className="p-2 w-[120px]">
                    <label className="text-sm font-medium text-gray-700">Post Code</label>
                  </td>
                  <td className="p-2">
                    <input {...register("recipient.postCode")} type="text" placeholder="Please enter..." className="w-full h-[26px] max-w-[250px] p-1 border border-gray-500" required />
                  </td>
                </tr>
                <tr>
                  <td className="p-2 w-[120px]">
                    <label className="text-sm font-medium text-gray-700">Country</label>
                  </td>
                  <td className="p-2">
                    <div className="max-w-[250px]">
                      <CountryInput className="h-[26px]" onChange={(value) => setValue("recipient.country", value)} />
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="p-2 w-[120px]">
                    <label className="text-sm font-medium text-gray-700">Phone</label>
                  </td>
                  <td className="p-2">
                    <input {...register("recipient.phone")} type="text" placeholder="Please enter..." className="w-full h-[26px] max-w-[250px] p-1 border border-gray-500" required />
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
                    <label className="text-sm font-medium text-gray-700">Contents</label>
                  </td>
                  <td className="p-2">
                    <input {...register("package.content")} type="text" placeholder="Please enter..." className="w-full h-[26px] p-1 border border-gray-500" required />
                  </td>
                </tr>
                <tr>
                  <td className="p-2 w-[120px]">
                    <label className="text-sm font-medium text-gray-700">Product Code</label>
                  </td>
                  <td className="p-2">
                    <div className="max-w-[250px] h-[26px]">
                      <PackageCodeInput className="h-[26px]" onChange={(value) => setValue("package.code", value)} />
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="p-2 w-[120px]">
                    <label className="text-sm font-medium text-gray-700">Weight</label>
                  </td>
                  <td className="p-2">
                    <input {...register("package.weight")} type="number" placeholder="Please enter..." className="w-full h-[26px] max-w-[250px] p-1 border border-gray-500" required />
                  </td>
                </tr>
                <tr>
                  <td className="p-2 w-[120px]">
                    <label className="text-sm font-medium text-gray-700">PCEs</label>
                  </td>
                  <td className="p-2">
                    <input {...register("package.PCEs")} type="number" placeholder="Please enter..." className="w-full h-[26px] max-w-[250px] p-1 border border-gray-500" required />
                  </td>
                </tr>
                <tr>
                  <td className="p-2 w-[120px]">
                    <label className="text-sm font-medium text-gray-700">Declared Value</label>
                  </td>
                  <td className="p-2">
                    <input {...register("package.declaredValue")} type="number" placeholder="Please enter..." className="w-full h-[26px] max-w-[250px] p-1 border border-gray-500" required />
                  </td>
                </tr>
                <tr>
                  <td className="p-2 w-[120px]">
                    <label className="text-sm font-medium text-gray-700">Currency</label>
                  </td>
                  <td className="p-2">
                    <input
                      {...register("package.currency")}
                      type="text"
                      placeholder="Please enter..."
                      defaultValue={"USD"}
                      className="w-full h-[26px] max-w-[250px] p-1 border border-gray-500"
                      required
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          Tạo hóa đơn
        </button> */}
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
