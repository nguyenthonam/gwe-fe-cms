"use client";

import { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import { TextField, InputAdornment, List, ListItem, ListItemButton, ListItemText, Paper, IconButton } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { ICarrier } from "@/types/typeCarrier";

interface IProps {
  value?: string | ICarrier | null;
  carriers: ICarrier[];
  onChange: (carrier: ICarrier | null) => void;
  className?: string;
  required?: boolean;
  label?: string;
}

export interface ICarrierInputHandle {
  resetValue: () => void;
}

const CarrierInput = forwardRef<ICarrierInputHandle, IProps>(({ value, carriers, onChange, className, required = false, label = "Carrier" }, ref) => {
  const [inputValue, setInputValue] = useState<string>("");
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [filtered, setFiltered] = useState<ICarrier[]>(carriers);

  useImperativeHandle(ref, () => ({
    resetValue: () => {
      setInputValue("");
      onChange(null);
    },
  }));

  // Khi carriers prop thay đổi, reset lại filter
  useEffect(() => {
    setFiltered(carriers);
  }, [carriers]);

  // Khi chọn lại value từ ngoài, đồng bộ inputValue
  useEffect(() => {
    if (typeof value === "object" && value?.name) setInputValue(value.name);
    else if (typeof value === "string") {
      const found = carriers.find((c) => c._id === value || c.name === value);
      setInputValue(found?.name || "");
    } else setInputValue("");
  }, [value, carriers]);

  // Lọc carrier theo input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    setShowDropdown(true);

    setFiltered(carriers.filter((c) => c.name.toLowerCase().includes(val.toLowerCase()) || (c.code && c.code.toLowerCase().includes(val.toLowerCase()))));
  };

  const handleSelect = (carrier: ICarrier) => {
    setInputValue(carrier.name);
    setShowDropdown(false);
    onChange(carrier);
  };

  // Đóng dropdown khi click ngoài
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!(e.target as HTMLElement)?.closest(".carrier-select-root")) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className={`carrier-select-root relative w-full ${className || ""}`}>
      <TextField
        label={label}
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => setShowDropdown(true)}
        required={required}
        fullWidth
        size="small"
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton size="small" onClick={() => setShowDropdown((s) => !s)}>
                {showDropdown ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      {showDropdown && (
        <Paper className="absolute z-10 w-full left-0 mt-1 max-h-56 overflow-auto">
          <List>
            {filtered.length > 0 ? (
              filtered.map((carrier) => (
                <ListItem key={carrier._id} disablePadding>
                  <ListItemButton onClick={() => handleSelect(carrier)}>
                    <ListItemText
                      primary={
                        <span>
                          <strong>{carrier.name}</strong> {carrier.code && <span className="text-gray-500">({carrier.code})</span>}
                        </span>
                      }
                    />
                  </ListItemButton>
                </ListItem>
              ))
            ) : (
              <ListItem>
                <ListItemText primary="Không tìm thấy Carrier" />
              </ListItem>
            )}
          </List>
        </Paper>
      )}
    </div>
  );
});

CarrierInput.displayName = "CarrierInput";
export default CarrierInput;
