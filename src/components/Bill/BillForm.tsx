"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { IBillData, IDimension } from "@/types";
import CountryInput from "./CountryInput";
import CarrierInput from "./CarrierInput";
import PackageCodeInput from "./PackageCodeInput";
import DimensionTable from "./DimensionTable";
import { Button } from "@/components/commons";
import BillPopup, { IBillPopupHandle } from "./BillPopup";

export default function BillForm() {
  const { register, handleSubmit, setValue: setRegister } = useForm<IBillData>();
  const [billData, setBillData] = useState<IBillData | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const billPopupRef = useRef<IBillPopupHandle>(null);

  const onSubmit = (data: IBillData) => {
    setBillData(data);
  };
  const onDimensionChange = (rows: IDimension[] | null) => {
    setRegister("package.dimensions", rows);
  };

  return (
    <div className="container mx-auto">
      <div ref={menuRef} className={`bg-white transition-all sticky top-0 z-50`}>
        <div className={`flex flex-col md:flex-row md:justify-between gap-4 py-4 `}>
          <h1 className="text-2xl md:text-3xl font-bold">ĐƠN HÀNG VẬN CHUYỂN</h1>
          <div className="flex gap-2 overflow-auto">
            <Button onClick={() => formRef.current?.requestSubmit()} className="btn btn-primary text-[14px] md:text-[16px]">
              Create Bill
            </Button>
            <Button className="btn btn-secondary text-[14px] md:text-[16px]" onClick={() => billPopupRef.current?.open()}>
              Print Bill
            </Button>
            <Button className="btn btn-secondary text-[14px] md:text-[16px]">Print Shipping Mark</Button>
            <Button className="btn btn-dark text-[14px] md:text-[16px]">Clear Form</Button>
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
                    <input {...register("customer")} type="text" placeholder="Please enter..." className="w-full h-[26px] p-1 border border-gray-500" />
                  </td>
                </tr>
                <tr>
                  <td className="p-2 w-[120px]">
                    <label className="text-sm font-medium text-gray-700">GWE Ref</label>
                  </td>
                  <td className="p-2">
                    <input {...register("GWERef")} type="text" placeholder="Please enter..." className="w-full h-[26px] max-w-[250px] p-1 border border-gray-500" />
                  </td>
                </tr>
                <tr>
                  <td className="p-2 w-[120px]">
                    <label className="text-sm font-medium text-gray-700">Carrier Ref</label>
                  </td>
                  <td className="p-2">
                    <input {...register("carrierRef")} type="text" placeholder="Please enter..." className="w-full h-[26px] max-w-[250px] p-1 border border-gray-500" />
                  </td>
                </tr>
                <tr>
                  <td className="p-2 w-[120px]">
                    <label className="text-sm font-medium text-gray-700">Carrier</label>
                  </td>
                  <td className="p-2">
                    <div className="max-w-[250px] h-[26px]">
                      <CarrierInput className="h-[26px]" onChange={(value) => setRegister("carrier", value)} required />
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
                    <input {...register("sender.name")} type="text" placeholder="Please enter..." className="w-full h-[26px] p-1 border border-gray-500" />
                  </td>
                </tr>
                <tr>
                  <td className="p-2 w-[120px]">
                    <label className="text-sm font-medium text-gray-700">Address Line 1</label>
                  </td>
                  <td className="p-2">
                    <input {...register("sender.address1")} type="text" placeholder="Please enter..." className="w-full h-[26px] p-1 border border-gray-500" />
                  </td>
                </tr>
                <tr>
                  <td className="p-2 w-[120px]">
                    <label className="text-sm font-medium text-gray-700">Address Line 2</label>
                  </td>
                  <td className="p-2">
                    <input {...register("sender.address2")} type="text" placeholder="Please enter..." className="w-full h-[26px] p-1 border border-gray-500" />
                  </td>
                </tr>
                <tr>
                  <td className="p-2 w-[120px]">
                    <label className="text-sm font-medium text-gray-700">Address Line 3</label>
                  </td>
                  <td className="p-2">
                    <input {...register("sender.address3")} type="text" placeholder="Please enter..." className="w-full h-[26px] p-1 border border-gray-500" />
                  </td>
                </tr>
                <tr>
                  <td className="p-2 w-[120px]">
                    <label className="text-sm font-medium text-gray-700">Phone</label>
                  </td>
                  <td className="p-2">
                    <input {...register("sender.phone")} type="text" placeholder="Please enter..." className="w-full h-[26px] max-w-[250px] p-1 border border-gray-500" />
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
                    <input {...register("recipient.attention")} type="text" placeholder="Please enter..." className="w-full h-[26px] p-1 border border-gray-500" />
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
                    <input {...register("recipient.address2")} type="text" placeholder="Please enter..." className="w-full h-[26px] p-1 border border-gray-500" />
                  </td>
                </tr>
                <tr>
                  <td className="p-2 w-[120px]">
                    <label className="text-sm font-medium text-gray-700">Address Line 3</label>
                  </td>
                  <td className="p-2">
                    <input {...register("recipient.address3")} type="text" placeholder="Please enter..." className="w-full h-[26px] p-1 border border-gray-500" />
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
                    <input {...register("recipient.postCode")} type="text" placeholder="Please enter..." className="w-full h-[26px] max-w-[250px] p-1 border border-gray-500" />
                  </td>
                </tr>
                <tr>
                  <td className="p-2 w-[120px]">
                    <label className="text-sm font-medium text-gray-700">Country</label>
                  </td>
                  <td className="p-2">
                    <div className="max-w-[250px]">
                      <CountryInput className="h-[26px]" onChange={(value) => setRegister("recipient.country", value)} required />
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
                      <PackageCodeInput className="h-[26px]" onChange={(value) => setRegister("package.code", value)} />
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="p-2 w-[120px]">
                    <label className="text-sm font-medium text-gray-700">Weight</label>
                  </td>
                  <td className="p-2">
                    <input
                      {...register("package.weight")}
                      type="number"
                      defaultValue={0}
                      min={0}
                      placeholder="Please enter..."
                      className="w-full h-[26px] max-w-[250px] p-1 border border-gray-500 number-input text-left"
                      required
                    />
                  </td>
                </tr>
                <tr>
                  <td className="p-2 w-[120px]">
                    <label className="text-sm font-medium text-gray-700">PCEs</label>
                  </td>
                  <td className="p-2">
                    <input
                      {...register("package.PCEs")}
                      type="number"
                      defaultValue={1}
                      min={0}
                      placeholder="Please enter..."
                      className="number-input h-[26px] max-w-[250px] border border-gray-500 text-left"
                      required
                    />
                  </td>
                </tr>
                <tr>
                  <td className="p-2 w-[125px]">
                    <label className="text-sm font-medium text-gray-700">Declared Value</label>
                  </td>
                  <td className="p-2">
                    <input
                      {...register("package.declaredValue")}
                      type="number"
                      defaultValue={0}
                      min={0}
                      placeholder="Please enter..."
                      className="number-input h-[26px] max-w-[250px] border border-gray-500 text-left"
                    />
                  </td>
                </tr>
                <tr>
                  <td className="p-2 w-[120px]">
                    <label className="text-sm font-medium text-gray-700">Currency</label>
                  </td>
                  <td className="p-2">
                    <input {...register("package.currency")} type="text" placeholder="Please enter..." defaultValue={"USD"} className="w-full h-[26px] max-w-[250px] p-1 border border-gray-500" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mb-2 bg-gray-200 border  border-gray-400 rounded-sm">
            <h2 className="p-2 mb-2 border-b-[1px] border-gray-500 font-bold bg-blue-500 text-white">Dimension</h2>
            <DimensionTable className="px-2 mb-2" onRowsChange={onDimensionChange} />
          </div>
          <div className="mb-2 bg-gray-200 border  border-gray-400 rounded-sm">
            <h2 className="p-2 mb-2 border-b-[1px] border-gray-500 font-bold bg-blue-500 text-white">Note</h2>
            <div className="mb-2 px-2">
              <textarea {...register("note")} rows={4} placeholder="" className="w-full  p-1 border border-gray-500" />
            </div>
          </div>
        </div>

        {/* <Button type="submit" className="bg-blue-500 text-white p-2 rounded">
          Create Billing
        </Button> */}
      </form>

      {/* Hiển thị hóa đơn để in */}
      <div className="mt-6">
        <BillPopup ref={billPopupRef} data={billData} />
      </div>
    </div>
  );
}
