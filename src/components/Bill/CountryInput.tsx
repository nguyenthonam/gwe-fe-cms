"use client";

import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import Icon from "@mui/material/Icon";
import type { ICountry } from "@/types";
import { COUNTRIES } from "@/utils/constants";

const countries: ICountry[] = COUNTRIES;

interface IProps {
  className?: string;
  onChange: (value: string) => void; // Callback để gửi giá trị ra ngoài
  required?: boolean;
}
export interface ICountryInputHandle {
  resetValue: () => void;
}

const CountryInput = forwardRef<ICountryInputHandle, IProps>(({ required, className, onChange }, ref) => {
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

  // Expose functions to parent via ref
  useImperativeHandle(ref, () => ({
    resetValue: () => setInputValue(""),
  }));

  const handleChange = (value: string) => {
    setInputValue(value);
    onChange(value); // Xuất giá trị ra component cha
  };

  const handleSelect = (country: ICountry) => {
    const selectedValue = `${country.code} - ${country.name}`;
    handleChange(selectedValue);
    setShowDropdown(false);
  };

  return (
    <div className={`relative w-full ${className}`} ref={dropdownRef}>
      {/* Input */}
      <input
        type="text"
        className="w-full h-full p-1 pr-[25px] border border-gray-500"
        placeholder="Select country..."
        value={inputValue}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => setShowDropdown(true)}
        required={required}
      />
      <Icon className={`absolute right-1 top-1/2 transform -translate-y-1/2 w-5 h-5 cursor-pointer`} sx={{ fontSize: "18px !important" }} onClick={() => setShowDropdown(!showDropdown)}>
        {showDropdown ? "expand_less" : "expand_more"}
      </Icon>
      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute w-full bg-white border  shadow-lg mt-1 max-h-[140px] overflow-auto">
          <table className="w-full border border-gray-300 border-collapse">
            <thead>
              <tr className="bg-gray-300">
                <th className="px-2 border border-gray-400">Code</th>
                <th className="px-2 border border-gray-400">Name</th>
              </tr>
            </thead>
            <tbody>
              {countries
                .filter(
                  (c) =>
                    c.name.toLowerCase().includes(inputValue.toLowerCase()) ||
                    c.code.toLowerCase().includes(inputValue.toLowerCase()) ||
                    inputValue.toLowerCase() === `${c.code.toLowerCase()} - ${c.name.toLowerCase()}`
                )
                .map((country) => (
                  <tr key={country.code} className="p-2 text-[14px] cursor-pointer hover:bg-gray-200" onClick={() => handleSelect(country)}>
                    <td className="px-2 border-r-[1px] border-gray-400">{country.code}</td>
                    <td className="px-2">{country.name}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
});

CountryInput.displayName = "Country Input";
export default CountryInput;
