import fs from "fs";
import path from "path";

const utilsFile = () => {
  // Hàm đọc currentIndex từ file
  const readFile = (filePath: string) => {
    try {
      const dirPath = path.dirname(filePath); // Lấy đường dẫn thư mục
      // Kiểm tra và tạo thư mục nếu chưa có
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }

      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify({ currentIndex: 1 }, null, 2)); // Nếu file chưa tồn tại, bắt đầu từ 1
        return 1;
      }
      const data = fs.readFileSync(filePath, "utf-8");

      return JSON.parse(data);
    } catch (error) {
      console.error("Error reading index:", error);
      return 1;
    }
  };

  // Hàm ghi currentIndex vào file
  const writeFile = (filePath: string, value: any) => {
    try {
      fs.writeFileSync(filePath, JSON.stringify({ currentIndex: value }, null, 2));
    } catch (error) {
      console.error("Error writing index:", error);
    }
  };
  return { readFile, writeFile };
};

export default utilsFile;
