"use client";

import { useRef, useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface Carriers {
  name: string;
}

const carriers: Carriers[] = [{ name: "DHL SIN" }, { name: "CT EU" }, { name: "CLE" }, { name: "DHL ECOM" }, { name: "FEDEX SIN" }];

interface CarrierInputProps {
  onChange: (value: string) => void; // Callback để gửi giá trị ra ngoài
}

export default function CountryInput({ onChange }: CarrierInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (value: string) => {
    setInputValue(value);
    onChange(value); // Xuất giá trị ra component cha
  };

  const handleSelect = (carrier: Carriers) => {
    const selectedValue = `${carrier.name}`;
    handleChange(selectedValue);
    setShowDropdown(false);
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Input */}
      <input
        type="text"
        className="w-full p-1 pr-[25px] border border-gray-500"
        placeholder="Please enter..."
        value={inputValue}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => setShowDropdown(true)}
        onAbort={() => setShowDropdown(false)}
      />
      <ChevronDown
        className={`absolute right-1 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-transform ${showDropdown ? "rotate-180" : "rotate-0"} cursor-pointer`}
        onClick={() => setShowDropdown(!showDropdown)}
      />

      {/* Dropdown */}
      {showDropdown && (
        <ul className="absolute w-full bg-white border rounded-lg shadow-lg mt-1 max-h-[140px] overflow-auto">
          {carriers
            // .filter((c) => c.name.toLowerCase().includes(inputValue.toLowerCase()))
            .map((value, idx) => (
              <li key={value.name + idx} className="p-2 cursor-pointer hover:bg-gray-200" onClick={() => handleSelect(value)}>
                {value.name}
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}
