import { useState } from "react";
import { IDimension } from "@/types/bill";
import { Button } from "@/components/commons";

interface IProps {
  onRowsChange: (updatedRows: IDimension[]) => void;
  className?: string;
}
export default function DimensionTable({ onRowsChange, className }: IProps) {
  const FACTOR = 5000; // Hệ số qui đổi trong vận chuyển (cm³/kg)
  const [rows, setRows] = useState<IDimension[]>([{ no: 1, length: 0, width: 0, height: 0, gross: 0, volume: 0 }]);

  // Hàm tính Volume (m³)
  const calculateVolume = (length: number, width: number, height: number) => {
    if (isNaN(length) || isNaN(width) || isNaN(height)) return 0;
    return parseFloat(((length * width * height) / FACTOR).toFixed(3)); // cm³ → m³
  };

  // Hàm cập nhật giá trị khi user chỉnh sửa input
  const handleInputChange = (id: number, field: string, value: number) => {
    setRows((prevRows) => {
      const updatedRows = prevRows.map((row) =>
        row.no === id
          ? {
              ...row,
              [field]: value,
              volume:
                field === "length" || field === "width" || field === "height"
                  ? calculateVolume(field === "length" ? value : row.length, field === "width" ? value : row.width, field === "height" ? value : row.height)
                  : row.volume,
            }
          : row
      );
      onRowsChange(updatedRows); // Cập nhật dữ liệu ra component cha
      return updatedRows;
    });
  };

  // Thêm hàng mới
  const addRow = () => {
    setRows([...rows, { no: rows.length + 1, length: 0, width: 0, height: 0, gross: 0, volume: 0 }]);
  };
  // Xóa hàng theo ID
  const deleteRow = (id: number) => {
    if (rows.length === 1) {
      setRows([{ no: 1, length: 0, width: 0, height: 0, gross: 0, volume: 0 }]);
      return;
    }
    setRows(rows.filter((row) => row.no !== id));
  };

  return (
    <div className={className}>
      <Button className="mb-2 btn btn-primary" onClick={addRow}>
        + Add Package
      </Button>
      <div className="w-full overflow-auto">
        <table className="table">
          <thead>
            <tr className="bg-gray-300">
              <th className="border border-gray-400 p-2">No</th>
              <th className="border border-gray-400 p-2">Length (cm)</th>
              <th className="border border-gray-400 p-2">Width (cm)</th>
              <th className="border border-gray-400 p-2">Height (cm)</th>
              <th className="border border-gray-400 p-2">Gross (kg)</th>
              <th className="border border-gray-400 p-2">Volume (m³)</th>
              <th className="border border-gray-400 p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.no} className="border">
                <td className="border border-gray-400 p-2 text-center">{index + 1}</td>
                {["length", "width", "height", "gross"].map((field) => (
                  <td key={field} className="border border-gray-400 p-2">
                    <input
                      type="number"
                      className="number-input border-1 rounded"
                      min={0}
                      value={row[field as keyof typeof row]}
                      onChange={(e) => handleInputChange(row.no, field, Number(e.target.value))}
                    />
                  </td>
                ))}
                <td className="border border-gray-400 p-2 text-center">{row.volume}</td>
                <td className="border border-gray-400 p-2 text-center">
                  <Button onClick={() => deleteRow(row.no)} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">
                    Xóa
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
