import path from "path";
import { NextResponse } from "next/server";
import { useBill, useFile } from "@/libs/hooks";

// Đường dẫn đến file lưu currentIndex
const filePath = path.join(process.cwd(), "src/datas", "BillDB.json");

export async function GET() {
  try {
    const { generateHAWBCode } = useBill();
    const { readFile, writeFile } = useFile();

    // Đọc chỉ số hiện tại từ file
    let res = readFile(filePath);
    let index = res?.currentIndex || 1;

    // Sinh code mới
    const newCode = generateHAWBCode(index);

    // Cập nhật chỉ số và lưu vào file
    index++;
    writeFile(filePath, index);

    return NextResponse.json({ code: newCode });
  } catch (err) {
    return NextResponse.json({ status: "ERROR", code: null });
  }
}
