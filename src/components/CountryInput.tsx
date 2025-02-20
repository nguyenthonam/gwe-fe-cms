"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface Country {
  code: string;
  name: string;
}

const countries: Country[] = [
  { code: "US", name: "United States (+1)" },
  { code: "GB", name: "United Kingdom (+44)" },
  { code: "VN", name: "Vietnam (+84)" },
  { code: "JP", name: "Japan (+81)" },
  { code: "FR", name: "France (+33)" },
];

interface CountryInputProps {
  onChange: (value: string) => void; // Callback để gửi giá trị ra ngoài
}

export default function CountryInput({ onChange }: CountryInputProps) {
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

  const handleSelect = (country: Country) => {
    const selectedValue = `${country.code} - ${country.name}`;
    handleChange(selectedValue);
    setShowDropdown(false);
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Input */}
      <input
        type="text"
        className="w-full p-1 pr-[25px] border border-gray-500"
        placeholder="..."
        value={inputValue}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => setShowDropdown(true)}
      />
      <ChevronDown
        className={`absolute right-1 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-transform ${showDropdown ? "rotate-180" : "rotate-0"} cursor-pointer`}
        onClick={() => setShowDropdown(!showDropdown)}
      />
      {/* Dropdown */}
      {showDropdown && (
        <ul className="absolute w-full bg-white border rounded-lg shadow-lg mt-1 max-h-[140px] overflow-auto">
          {countries
            // .filter((c) => c.name.toLowerCase().includes(inputValue.toLowerCase()) || c.code.toLowerCase().includes(inputValue.toLowerCase()))
            .map((country) => (
              <li key={country.code} className="p-2 cursor-pointer hover:bg-gray-200" onClick={() => handleSelect(country)}>
                {country.code} - {country.name}
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}
