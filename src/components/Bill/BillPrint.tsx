import React, { useImperativeHandle, useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useReactToPrint } from "react-to-print";
import Barcode from "./Barcode";
import { BillData } from "@/types/bill";
import { SquareCheck, Square } from "lucide-react";
import styles from "@/styles/components/Bill/BillPrint.module.css";

interface IProps {
  data: BillData | null;
}

// Định nghĩa kiểu dữ liệu cho ref
export interface IBillPrintRef {
  handlePrint: () => any;
  handleSaveAndPrint: () => any;
}

const BillPrint = React.forwardRef(({ data }: IProps, ref: any) => {
  const billPrintRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: billPrintRef,
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
    pdf.save(data?.GWERef || "GXxxxxxx"); // Lưu file PDF

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

  return (
    <div ref={billPrintRef} className={`${styles.container}`}>
      <div className={styles.header}>
        <div className={styles.logo}>
          <img src="logo-2.jpg" alt="Company Logo" width={"100%"} />
        </div>
        <div className="flex-grow">
          <h2 className={styles.headerTitle}>GATEWAY EXPRESS COMPANY LIMITED</h2>
          <p className={styles.headerText} style={{ marginBottom: "4px" }}>
            <span className="mr-1 underline underline-offset-2">Address:</span>
            <span>22/40 YEN THE STREET, WARD 2, TAN BINH DISTRICT, HO CHI MINH CITY</span>
          </p>
          <div className="flex justify-between gap-4">
            <p className={styles.headerText}>
              <span className="mr-2 underline underline-offset-2">Tel:</span>
              <b>(84) 28 3547 1747</b>
            </p>
            <p className={styles.headerText}>
              <span className="mr-2 underline underline-offset-2">Hotline:</span>
              <b>0944 247 267 - 0938 373 343</b>
            </p>
          </div>
          <div className="flex justify-between gap-4">
            <p className={styles.headerText}>
              <span className="underline underline-offset-2">Email:</span> <b>info@gatewayexpress.com.vn</b>
            </p>
            <b className={styles.headerText}>www.gatewayexpress.vn</b>
          </div>
        </div>
        <div className={styles.barcode}>
          <Barcode value="GX123456" />
        </div>
      </div>

      <table className={styles.table}>
        <tbody>
          <tr className={styles.tableRow} style={{ border: "none" }}>
            <td className={styles.tableData}>
              <div className="flex justify-between mb-2">
                <b>Shipper company name and address:</b>
                <b style={{ fontSize: "18px" }}>{data?.carrier}</b>
              </div>
            </td>
            <td className={styles.tableData} style={{ border: "none" }}>
              <b>Consignee company name and address:</b>
            </td>
          </tr>
          <tr className={styles.tableRow}>
            <td className={styles.tableData}>
              {data?.customer && (
                <>
                  <span>{data.customer}</span>
                  <br />
                </>
              )}
              <b>ATTN:</b> <span>{data?.sender?.name ? data.sender.name : ""}</span>
              <br />
              <b>ADDR:</b> <span>{data?.sender?.address1 ? data.sender.address1 : ""}</span>
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
              <b>TEL:</b> <span>{data?.sender?.phone ? data.sender.phone : ""}</span>
              <br />
              <p style={{ minHeight: "40px" }}>
                <b>NOTE:</b> <span>{data?.note ? data.note : ""}</span>
              </p>
              <br />
            </td>
            <td className={styles.tableData} style={{ border: "none" }}>
              {data?.recipient?.address2 && (
                <>
                  <span>{data.recipient.name}</span>
                  <br />
                </>
              )}
              <b>ATTN:</b> <span>{data?.recipient?.attention ? data.recipient.attention : ""}</span>
              <br />
              <b>ADDR:</b> <span>{data?.recipient?.address1 ? data.recipient.address1 : ""}</span>
              <br />
              {data?.recipient?.address2 && (
                <>
                  <span>{data.recipient.address2}</span>
                  <br />
                </>
              )}
              {data?.recipient?.address3 && (
                <>
                  <span>{data.recipient.address3}</span>
                  <br />
                </>
              )}
              <b>TEL:</b> <span>{data?.recipient?.phone ? data.recipient.phone : ""}</span>
              <br />
            </td>
          </tr>
          <tr className={styles.tableRow}>
            <td className={styles.tableData}>
              <div className="py-[6px] flex justify-between">
                <b>Type of product:</b>
                <div className="flex">
                  <span className="flex items-end gap-1 mr-2">{data?.package?.code && data.package.code === "DOCUMENT" ? <SquareCheck size={20} /> : <Square size={20} />} DOCUMENT</span>
                  <span className="flex items-end gap-1 mr-2">{data?.package?.code && data.package.code === "PARCEL" ? <SquareCheck size={20} /> : <Square size={20} />} PARCEL</span>
                </div>
              </div>
            </td>
            <td className={styles.tableData} style={{ border: "none" }}>
              <div className="py-[6px] flex justify-between">
                <b>Number of package:</b>
                <span> {data?.package?.PCEs || 0}</span>
                <b>Weight in Kg:</b>
                <span className="mr-4">{data?.package?.weight || 0}</span>
              </div>
            </td>
          </tr>
          <tr className={styles.tableRow}>
            <td className={styles.tableData} style={{ padding: "0px 8px" }}>
              <div className=" grid grid-cols-2 grid-rows-[1fr] min-h-[44px]">
                <div className="py-[4px] pr-[8px] border-r-2 border-black">
                  <b>Description of contents:</b>
                  <br />
                  <p className="text-center">{data?.package?.content}</p>
                </div>
                <div className="py-[4px] pl-[8px]">
                  <b>Declared value for custom:</b>
                  <br />
                  <p className="text-center">{data?.package?.declaredValue}</p>
                </div>
              </div>
            </td>
            <td className={styles.tableData} style={{ border: "none" }}>
              <div className="mb-2">
                <b>Dimension in CM (Length x Width x Height):</b>
                <br />
                <div className="pl-[40px]">
                  {data?.package?.dimensions &&
                    data.package.dimensions.map((item, idx) => (
                      <p key={item.no + idx}>
                        Kiện {item.no}: {item?.length || 0}x{item?.width || 0}x{item?.height || 0}
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
          <b>Shipper's signature:</b>
          <p className="h-[70px]"></p>
          <p className="mt-auto">Date & Time:</p>
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
});

BillPrint.displayName = "Bill Print";
export default BillPrint;
