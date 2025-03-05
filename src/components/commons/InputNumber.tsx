import React from "react";
import { useState } from "react";

interface NumberInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value?: number;
  handleOnChange?: (value: string | number) => void;
}

const NumberInput: React.FC<NumberInputProps> = ({ value, handleOnChange, ...props }) => {
  const [inputValue, setInputValue] = useState(value);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue: number | string = e.target.value;

    // Nếu không có dấu "." => Loại bỏ số 0 đứng đầu (trừ số 0 duy nhất)
    if (!newValue.includes(".")) {
      newValue = parseFloat(newValue.replace(/^0+/, ""));
      setInputValue(newValue);
    }

    handleOnChange?.(newValue); // Trả về giá trị mới
  };

  return <input type="number" className="number-input border-1 rounded" value={inputValue} onChange={handleChange} {...props} />;
};

export default NumberInput;
