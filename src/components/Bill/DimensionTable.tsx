import { useState } from "react";
import Button from "../Globals/Button";
import { IDimension } from "@/types/typeGlobals";
import { useNotification } from "@/contexts/NotificationProvider";
import { calculateVolumeWeight } from "@/utils/hooks/hookBill";
import NumericInput from "../Globals/NumericInput";

interface IProps {
  volWeightRate?: number | null;
  onRowsChange: (updatedRows: IDimension[]) => void;
  className?: string;
}
export interface IDimensionForm extends IDimension {
  no: number;
}
export default function DimensionTable({ volWeightRate, onRowsChange, className }: IProps) {
  const [rows, setRows] = useState<IDimensionForm[]>([{ no: 1, length: 0, width: 0, height: 0, grossWeight: 0, volumeWeight: 0 }]);
  const { showNotification } = useNotification();

  // Hàm cập nhật giá trị khi user chỉnh sửa input
  const handleInputChange = (id: number, field: string, value: number) => {
    setRows((prevRows) => {
      const updatedRows = prevRows.map((row) =>
        row.no === id
          ? {
              ...row,
              [field]: value,
              volumeWeight:
                field === "length" || field === "width" || field === "height"
                  ? volWeightRate
                    ? calculateVolumeWeight(field === "length" ? value : row.length, field === "width" ? value : row.width, field === "height" ? value : row.height, volWeightRate)
                    : 0
                  : row.volumeWeight,
            }
          : row
      );

      onRowsChange(updatedRows); // Cập nhật dữ liệu ra component cha
      return updatedRows;
    });
  };

  // Thêm hàng mới
  const addRow = () => {
    setRows([...rows, { no: rows.length + 1, length: 0, width: 0, height: 0, grossWeight: 0, volumeWeight: 0 }]);
  };
  // Xóa hàng theo ID
  const deleteRow = (id: number) => {
    if (rows.length === 1) {
      setRows([{ no: 1, length: 0, width: 0, height: 0, grossWeight: 0, volumeWeight: 0 }]);
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
            <tr className="bg-gray-400">
              <th className="border border-gray-500 p-2">No</th>
              <th className="border border-gray-500 p-2">Length (cm)</th>
              <th className="border border-gray-500 p-2">Width (cm)</th>
              <th className="border border-gray-500 p-2">Height (cm)</th>
              <th className="border border-gray-500 p-2">Gross (kg)</th>
              <th className="border border-gray-500 p-2">Volume (m³)</th>
              <th className="border border-gray-500 p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.no} className="border">
                <td className="border border-gray-400 bg-gray-200 p-2 text-center">{index + 1}</td>
                {["length", "width", "height", "grossWeight"].map((field) => (
                  <td key={field} className="border border-gray-400 bg-gray-200 p-2">
                    {/* <input
                      type="number"
                      className="number-input border-2 border-gray-600 rounded text-center min-w-[50px] "
                      min={0}
                      value={row[field as keyof typeof row]}
                      onChange={(e) => handleInputChange(row.no, field, Number(e.target.value))}
                    /> */}

                    <NumericInput
                      label={field}
                      fullWidth
                      size="small"
                      value={String(row[field as keyof typeof row])}
                      onChange={(val) => handleInputChange(row.no, field, Number(val))}
                      sx={{ bgcolor: "white" }}
                    />
                  </td>
                ))}
                <td className="border border-gray-400 bg-gray-200 p-2 text-center">{row.volumeWeight}</td>
                <td className="border border-gray-400 bg-gray-200 p-2 text-center">
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
