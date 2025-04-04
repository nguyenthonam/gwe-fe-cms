import React, { useImperativeHandle, useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useReactToPrint } from "react-to-print";
import Barcode from "./Barcode";
import { IBillData } from "@/types";
import Icon from "@mui/material/Icon";
import Image from "next/image";
import styles from "@/styles/components/Bill/BillPrint.module.css";
import "@/styles/components/Bill/BillPrint.css";
import utilsDate from "@/utils/hooks/hookDate";
interface IProps {
  data: IBillData | null;
  billNumber?: number;
}
interface IBillView {
  className?: string;
}

// Định nghĩa kiểu dữ liệu cho ref
export interface IBillPrintRef {
  handlePrint: () => void;
  handleSaveAndPrint: () => void;
}

const BillPrint = React.forwardRef<IBillPrintRef, IProps>(({ data, billNumber = 2 }, ref) => {
  const billPrintRef = useRef<HTMLDivElement>(null);

  const { getCurrentDate } = utilsDate();

  const handlePrint = useReactToPrint({
    contentRef: billPrintRef,
    documentTitle: data?.HAWBCode || `GX-${Date.now().toString()}`,
    preserveAfterPrint: true,
  });
  const handleSaveAndPrint = async () => {
    if (!billPrintRef.current) return;

    // Chụp nội dung của hóa đơn thành hình ảnh
    // const canvas = await html2canvas(billPrintRef.current);
    const canvas = await html2canvas(billPrintRef.current, {
      scale: 2, // Tăng gấp 2 lần độ phân giải
    });

    const imgData = canvas.toDataURL("image/png");

    // Tạo file PDF
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(data?.HAWBCode || "GXxxxxxx"); // Lưu file PDF

    // Mở hộp thoại in sau khi lưu
    setTimeout(() => {
      window.open(pdf.output("bloburl"), "_blank");
    }, 1000);
  };

  useImperativeHandle(ref, () => {
    return {
      handlePrint: handlePrint,
      handleSaveAndPrint: handleSaveAndPrint,
    };
  });

  const BillView = ({ className }: IBillView) => {
    return (
      <div className={`${styles.bill} bill a4-portrait ${className}`}>
        <div className={styles.header}>
          <div className={styles.logo}>
            <div className="w-full h-full">
              <Image className="max-w-full w-full h-auto" src="/logo-04.png" alt="Company Logo" width={100} height={100} />
            </div>
          </div>
          <div className="flex flex-col flex-grow">
            <h2 className={styles.headerTitle + " mt-2"}>GATEWAY EXPRESS COMPANY LIMITED</h2>
            <p className={styles.headerText + " mt-auto mb-1"}>
              <span className="mr-1 underline underline-offset-2">Address:</span>
              <span>22/40 YEN THE STREET, WARD 2, TAN BINH DISTRICT, HO CHI MINH CITY</span>
            </p>
            <div className="mb-1 flex justify-between gap-4">
              <p className={styles.headerText}>
                <span className="mr-2 underline underline-offset-2">Tel:</span>
                <b>(84) 28 3547 1747</b>
              </p>
              <p className={styles.headerText + " mr-4"}>
                <span className="mr-2 underline underline-offset-2">Hotline:</span>
                <b>0944 247 267 - 0938 373 343</b>
              </p>
            </div>
            <div className="flex justify-between gap-4">
              <p className={styles.headerText}>
                <span className="underline underline-offset-2">Email:</span> <b>info@gatewayexpress.com.vn</b>
              </p>
              <b className={styles.headerText + " mr-4"}>www.gatewayexpress.vn</b>
            </div>
          </div>
          <div className={styles.barcode}>
            {data?.HAWBCode && <Barcode value={data.HAWBCode} />}{" "}
            {data?.CAWBCode && (
              <p className="text-center text-[10px]">
                <b>{data?.CAWBCode}</b>
              </p>
            )}
          </div>
        </div>

        <table className={styles.table}>
          <tbody>
            <tr className={styles.tableRow} style={{ border: "none" }}>
              <td className={styles.tableData} colSpan={2}>
                <p>
                  <b>Shipper company name and address:</b>
                </p>
                <p className="w-full pr-[14px] size-[16px] uppercase text-right min-h-[14px]" style={{ lineHeight: 1 }}>
                  <b>{data?.carrier}</b>
                </p>
              </td>
              <td className={styles.tableData} style={{ border: "none" }}>
                <b>Consignee company name and address:</b>
              </td>
            </tr>
            <tr className={styles.tableRow}>
              <td className={styles.tableData + " uppercase"} colSpan={2}>
                {data?.customer && (
                  <>
                    <b>{data.customer}</b>
                    <br />
                  </>
                )}
                <span>ATTN:</span> <span>{data?.sender?.name ? data.sender.name : ""}</span>
                <br />
                <span>ADD:</span> <span>{data?.sender?.address1 ? data.sender.address1 : ""}</span>
                <br />
                {data?.sender?.address2 && (
                  <>
                    <span>{data.sender.address2}</span>
                    <br />
                  </>
                )}
                {data?.sender?.address3 && (
                  <>
                    <span>{data.sender.address3}</span>
                    <br />
                  </>
                )}
                <span>CONTACT NUMBER:</span> <span>{data?.sender?.phone ? data.sender.phone : ""}</span>
                <br />
                <p style={{ minHeight: "40px" }}>
                  <span>NOTE:</span> <span>{data?.note ? data.note : ""}</span>
                </p>
              </td>
              <td className={styles.tableData + " uppercase"} style={{ border: "none" }}>
                {data?.recipient?.address2 && (
                  <>
                    <b>{data.recipient.name}</b>
                    <br />
                  </>
                )}
                <p>
                  <span>ATTN:</span> <span>{data?.recipient?.attention ? data.recipient.attention : ""}</span>
                </p>
                <p>
                  <span>ADD:</span> <span>{data?.recipient?.address1 ? data.recipient.address1 : ""}</span>
                </p>
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
                <p>
                  <span>CONTACT NUMBER:</span> <span>{data?.recipient?.phone ? data.recipient.phone : ""}</span>
                </p>
              </td>
            </tr>
            <tr className={styles.tableRow}>
              <td className={styles.tableData} colSpan={2}>
                <div className="py-[2px] flex justify-between items-center">
                  <b>Type of product:</b>
                  <div className="inline-flex">
                    <p className="inline-flex items-center mr-2">
                      {data?.package?.code && data.package.code === "DOCUMENT" ? (
                        <Icon className="my-auto" sx={{ fontSize: "18px !important" }}>
                          check_box
                        </Icon>
                      ) : (
                        <Icon className="my-auto" sx={{ fontSize: "18px !important" }}>
                          check_box_outline_blank
                        </Icon>
                      )}{" "}
                      <span className="mt-[1px]">DOCUMENT</span>
                    </p>
                    <p className="inline-flex items-center mr-2">
                      {data?.package?.code && data.package.code === "PARCEL" ? (
                        <Icon className="my-auto" sx={{ fontSize: "18px !important" }}>
                          check_box
                        </Icon>
                      ) : (
                        <Icon className="my-auto" sx={{ fontSize: "18px !important" }}>
                          check_box_outline_blank
                        </Icon>
                      )}{" "}
                      <span className="mt-[1px]">PARCEL</span>
                    </p>
                  </div>
                </div>
              </td>
              <td className={styles.tableData} style={{ border: "none" }}>
                <div className="py-[2px] flex justify-between items-center">
                  <b>Number of package:</b>
                  <span> {data?.package?.PCEs || 0}</span>
                  <b>Weight in Kg:</b>
                  <span className="mr-4">{data?.package?.weight || 0}</span>
                </div>
              </td>
            </tr>
            <tr className={styles.tableRow}>
              <td className={styles.tableData}>
                <p>
                  <b>Description of contents:</b>
                </p>
                <p className="text-center uppercase">{data?.package?.content}</p>
              </td>
              <td className={styles.tableData}>
                <p>
                  <b>Declared value for custom:</b>
                </p>
                <p className="text-center">
                  {data?.package?.declaredValue} {data?.package?.currency}
                </p>
              </td>
              <td className={styles.tableData + " !border-none"}>
                <div className="mb-1">
                  <p>
                    <b>Dimension in CM (Length x Width x Height):</b>
                  </p>
                  <div className="pl-[40px]">
                    {data?.package?.dimensions &&
                      data.package.dimensions.map((item, idx) => (
                        <p key={item.no + idx}>
                          PIECE {item.no}: {item?.length || 0}x{item?.width || 0}x{item?.height || 0}
                        </p>
                      ))}
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div className="px-[8px] grid grid-cols-[30%_30%_40%] text-[12px]">
          <div className="flex flex-col py-[2px] pr-[8px] border-r-2 border-black">
            <b>Shipper&apos;s signature:</b>
            <p className="h-[70px]"></p>
            <p className="mt-auto">Date & Time: {getCurrentDate()}</p>
          </div>
          <div className="flex flex-col py-[2px] px-[8px] border-r-2 border-black">
            <b>Picked up by Gateway Express:</b>
            <span>Signature:</span>
            <p className="h-[70px]"></p>
            <p>Date & Time:</p>
          </div>
          <div className="flex flex-col py-[2px] pl-[8px]">
            <b>Received in good condition by Consignee:</b>
            <span>Signature:</span>
            <p className="h-[70px]"></p>
            <p>Date & Time:</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.container} ref={billPrintRef}>
      {/* <BillView />
      <BillView className="print-only" /> */}
      {Array.from({ length: billNumber }).map((v, idx) => (
        <BillView key={"shipping-mark-" + idx} className={idx > 0 ? "print-only" : ""} />
      ))}
    </div>
  );
});

BillPrint.displayName = "Bill Print";
export default BillPrint;
