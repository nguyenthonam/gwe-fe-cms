"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { IBillData } from "@/types";
import CountryInput, { ICountryInputHandle } from "./CountryInput";
import CarrierInput, { ICarrierInputHandle } from "./CarrierInput";
import PackageCodeInput, { IPackageCodeInputHandle } from "./PackageCodeInput";
import { Button } from "@mui/material";
import { red } from "@mui/material/colors";
import BillPopup, { IBillPopupHandle } from "./BillPopup";
import BillShippingMarkPopup, { IBillShippingMarkPopupHandle } from "./BillShippingMarkPopup";
import { useNotification } from "@/contexts/NotificationProvider";
import { IDimension } from "@/types/typeGlobals";
import DimensionTable from "../Globals/DimensionTable";

const DEFAULT_VALUE = {
  customer: "",
  HAWBCode: "",
  CAWBCode: "",
  carrier: "",
  sender: {
    name: "",
    address1: "",
    address2: "",
    address3: "",
    phone: "",
  },
  recipient: {
    name: "",
    attention: "",
    address1: "",
    address2: "",
    address3: "",
    phone: "",
    country: "",
    city: "",
    state: "",
    postCode: "",
  },
  note: "",
};

export default function BillForm() {
  const {
    register,
    handleSubmit,
    setValue: setRegister,
    reset: resetForm,
  } = useForm<IBillData>({
    defaultValues: DEFAULT_VALUE,
  });
  const [billData, setBillData] = useState<IBillData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const carrierRef = useRef<ICarrierInputHandle>(null);
  const countryRef = useRef<ICountryInputHandle>(null);
  const packageCodeRef = useRef<IPackageCodeInputHandle>(null);
  const billPopupRef = useRef<IBillPopupHandle>(null);
  const billShippingMarkPopupRef = useRef<IBillShippingMarkPopupHandle>(null);
  const { showNotification } = useNotification();

  const fetchHAWBCode = async () => {
    const res = await fetch("/api/generate-house-code");
    const data = await res.json();
    return data?.code || null;
  };

  const onSubmit = async (data: IBillData) => {
    setIsLoading(true);
    const code = await fetchHAWBCode();
    setRegister("HAWBCode", code);
    data.HAWBCode = code || 1;
    setBillData(data);
    showNotification("Tạo đơn hàng thành công!", "success");
    setIsLoading(false);
  };
  const onDimensionChange = (rows: IDimension[] | null) => {
    setRegister("package.dimensions", rows);
  };
  const onClearForm = () => {
    setBillData(null);
    resetForm();
    carrierRef.current?.resetValue();
    countryRef.current?.resetValue();
    packageCodeRef.current?.resetValue();
  };

  return (
    <div className="container mx-auto">
      <div ref={menuRef} className={`bg-white transition-all sticky top-[56px] md:top-[64px] z-50`}>
        <div className={`flex flex-col md:flex-row md:justify-between gap-4 py-4 `}>
          <h1 className="text-2xl md:text-3xl font-bold">VẬN ĐƠN</h1>
          <div className="flex gap-2 overflow-auto">
            <Button
              className="font-bold hover:bg-blue-500 hover:text-white capitalize"
              color="primary"
              variant="outlined"
              disabled={!!billData?.HAWBCode}
              loading={isLoading}
              loadingPosition="start"
              onClick={() => formRef.current?.requestSubmit()}
            >
              Create Bill
            </Button>
            <Button className="font-bold hover:bg-red-500 hover:text-white capitalize" sx={{ color: red[500], borderColor: red[500] }} variant="outlined" onClick={onClearForm}>
              Clear
            </Button>
            <Button className="font-bold hover:bg-teal-500 hover:text-white capitalize" color="teal" variant="outlined" disabled={!billData?.HAWBCode} onClick={() => billPopupRef.current?.open()}>
              Print Bill
            </Button>
            <Button
              className="font-bold hover:bg-teal-500 hover:text-white capitalize"
              color="teal"
              variant="outlined"
              disabled={!billData?.HAWBCode}
              onClick={() => billShippingMarkPopupRef.current?.open()}
            >
              Print Shipping Mark
            </Button>
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
                    <label className="text-sm font-medium text-gray-700">HAWB Code</label>
                  </td>
                  <td className="p-2">
                    <input {...register("HAWBCode")} type="text" placeholder="Please enter..." className="w-full h-[26px] max-w-[250px] p-1 border border-gray-500" disabled />
                  </td>
                </tr>
                <tr>
                  <td className="p-2 w-[120px]">
                    <label className="text-sm font-medium text-gray-700">CAWB Code</label>
                  </td>
                  <td className="p-2">
                    <input {...register("CAWBCode")} type="text" placeholder="Please enter..." className="w-full h-[26px] max-w-[250px] p-1 border border-gray-500" />
                  </td>
                </tr>
                <tr>
                  <td className="p-2 w-[120px]">
                    <label className="text-sm font-medium text-gray-700">Carrier</label>
                  </td>
                  <td className="p-2">
                    <div className="max-w-[250px] h-[26px]">
                      <CarrierInput ref={carrierRef} className="h-[26px]" onChange={(value) => setRegister("carrier", value)} required />
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
                      <CountryInput ref={countryRef} className="h-[26px]" onChange={(value) => setRegister("recipient.country", value)} required />
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
                      <PackageCodeInput ref={packageCodeRef} className="h-[26px]" onChange={(value) => setRegister("package.code", value)} />
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
        <BillShippingMarkPopup ref={billShippingMarkPopupRef} data={billData} />
      </div>
    </div>
  );
}
