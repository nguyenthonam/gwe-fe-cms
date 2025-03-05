import path from "path";
import { NextResponse } from "next/server";
import { utilsBill, utilsFile } from "@/libs/utils";

// Đường dẫn đến file lưu currentIndex
const filePath = path.join(process.cwd(), "src/datas", "BillDB.json");

export async function GET() {
  try {
    const { generateHAWBCode } = utilsBill();
    const { readFile, writeFile } = utilsFile();

    // Đọc chỉ số hiện tại từ file
    const res = readFile(filePath);
    let index = res?.currentIndex || 1;

    // Sinh code mới
    const newCode = generateHAWBCode(index);

    // Cập nhật chỉ số và lưu vào file
    index++;
    writeFile(filePath, index);

    return NextResponse.json({ code: newCode });
  } catch (err) {
    return NextResponse.json({ status: "ERROR", code: null, data: err });
  }
}
