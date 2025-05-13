// app/orders/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Button, Container } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { TextField, MenuItem, Box } from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import * as XLSX from "xlsx";
import dayjs from "dayjs";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [filters, setFilters] = useState({ customer: "", destination: "", from: null, to: null });

  useEffect(() => {
    // Fake data for UI demo
    const demoData = Array.from({ length: 10 }).map((_, i) => ({
      id: i + 1,
      date: dayjs().format("YYYY-MM-DD"),
      customerName: "Customer A",
      supplier: "Supplier X",
      carrier: "Carrier Y",
      service: "Express",
      hawb: `HAWB${i + 1}`,
      awb: `AWB${i + 1}`,
      type: "Doc",
      destination: "USA",
      grossWeight: 10,
      volWeight: 12,
      chargeWeight: 12,
      dimensionPC1: "40x30x20",
      dimensionPC2: "50x40x30",
      note: "Handle with care",
      buyingRate: 100,
      extraFeeBuy: 10,
      ppxdBuy: 5,
      vatBuy: 11.5,
      totalBuy: 126.5,
      sellingRate: 150,
      extraFeeSell: 20,
      ppxdSell: 10,
      vatSell: 18,
      totalSell: 198,
      profit: 71.5,
    }));
    setOrders(demoData);
  }, []);

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(orders);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");
    XLSX.writeFile(workbook, "orders.xlsx");
  };

  const columns: GridColDef[] = [
    { field: "date", headerName: "DATE", width: 120 },
    { field: "customerName", headerName: "CUSTOMER NAME", width: 200 },
    { field: "supplier", headerName: "SUPPLIER", width: 150 },
    { field: "carrier", headerName: "CARRIER", width: 150 },
    { field: "service", headerName: "SERVICE", width: 120 },
    { field: "hawb", headerName: "HAWB", width: 150 },
    { field: "awb", headerName: "AWB", width: 150 },
    { field: "type", headerName: "TYPE", width: 100 },
    { field: "destination", headerName: "DESTINATION", width: 130 },
    { field: "grossWeight", headerName: "GROSS WEIGHT", width: 140 },
    { field: "volWeight", headerName: "VOL WEIGHT", width: 130 },
    { field: "chargeWeight", headerName: "CHARGE WEIGHT", width: 150 },
    { field: "dimensionPC1", headerName: "DIMENSION PC1", width: 150 },
    { field: "dimensionPC2", headerName: "DIMENSION PC2", width: 150 },
    { field: "note", headerName: "NOTE", width: 200 },
    { field: "buyingRate", headerName: "BASE RATE (BUYING)", width: 170 },
    { field: "extraFeeBuy", headerName: "EXTRA FEE", width: 120 },
    { field: "ppxdBuy", headerName: "PPXD", width: 100 },
    { field: "vatBuy", headerName: "VAT", width: 100 },
    { field: "totalBuy", headerName: "TOTAL", width: 130 },
    { field: "sellingRate", headerName: "BASE RATE (SELLING)", width: 180 },
    { field: "extraFeeSell", headerName: "EXTRA FEE", width: 120 },
    { field: "ppxdSell", headerName: "PPXD", width: 100 },
    { field: "vatSell", headerName: "VAT", width: 100 },
    { field: "totalSell", headerName: "TOTAL", width: 130 },
    { field: "profit", headerName: "PROFIT", width: 120 },
  ];

  return (
    <Container maxWidth="lg" sx={{ padding: "0" }}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Box className="p-6 space-y-4">
          <h1 className="text-2xl font-bold">Quản lý Đơn hàng</h1>

          {/* Filter */}
          <Box className="flex gap-4 flex-wrap overflow-auto">
            <TextField label="Customer" select size="small" value={filters.customer}>
              <MenuItem value="">All</MenuItem>
              <MenuItem value="Customer A">Customer A</MenuItem>
              <MenuItem value="Customer B">Customer B</MenuItem>
            </TextField>

            <TextField label="Destination" size="small" value={filters.destination} onChange={(e) => setFilters((prev) => ({ ...prev, destination: e.target.value }))} />

            <DatePicker
              label="From Date"
              value={filters.from}
              onChange={(value) => setFilters((prev: any) => ({ ...prev, from: value }))}
              slotProps={{
                textField: {
                  size: "small", // 👈 This sets the size
                  sx: {
                    "& .MuiInputBase-root": {
                      height: 36, // 👈 Set your desired height here
                    },
                    "& .MuiInputBase-input": {
                      padding: "8px 10px", // 👈 Optional: adjust input padding
                    },
                  },
                },
              }}
            />

            <DatePicker
              label="To Date"
              value={filters.to}
              onChange={(value) => setFilters((prev: any) => ({ ...prev, to: value }))}
              slotProps={{
                textField: {
                  size: "small", // 👈 This sets the size
                  sx: {
                    "& .MuiInputBase-root": {
                      height: 36, // 👈 Set your desired height here
                    },
                    "& .MuiInputBase-input": {
                      padding: "8px 10px", // 👈 Optional: adjust input padding
                    },
                  },
                },
              }}
            />

            <Button variant="outlined" onClick={() => {}}>
              Filter
            </Button>
            <Button variant="contained" color="success" onClick={handleExportExcel}>
              Export Excel
            </Button>
          </Box>

          {/* Order Table */}
          <Box className="bg-white rounded-xl shadow w-full max-w-[80vw]">
            <DataGrid rows={orders} columns={columns} autoHeight pageSizeOptions={[10]} checkboxSelection />
          </Box>
        </Box>
      </LocalizationProvider>
    </Container>
  );
}
