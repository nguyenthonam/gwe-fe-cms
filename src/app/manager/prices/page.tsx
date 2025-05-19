"use client";
import { useState } from "react";
import { Box, Typography, Paper, Tabs, Tab, Container } from "@mui/material";
import { lightBlue } from "@mui/material/colors";
import ExchangeRateManagerView from "@/components/ExchangeRates/ExchangeRateManagerView";
import ExtraFeeManagerView from "@/components/ExtraFees/ExtraFeeManagerView";
import PurchasePriceManagerView from "@/components/PurchasePrices/PurchasePriceManagerView";
import SalePriceManagerView from "@/components/SalePrices/SalePriceManagerView";

export default function CarrierManagementView() {
  const [tabIndex, setTabIndex] = useState(0);

  return (
    <Container maxWidth="lg" sx={{ padding: "0" }}>
      <Box
        className="p-6 space-y-4"
        sx={{
          maxWidth: "calc(100vw - 120px)",
        }}
      >
        <Typography variant="h5" mb={2} fontWeight="bold" sx={{ color: lightBlue[500] }}>
          QUẢN LÝ GIÁ
        </Typography>

        <Tabs value={tabIndex} onChange={(_, newIndex) => setTabIndex(newIndex)}>
          <Tab label="Tỉ giá tiền tệ" />
          <Tab label="Phụ phí" />
          <Tab label="Giá mua" />
          <Tab label="Giá bán" />
        </Tabs>

        <Box mt={2} className="w-full ">
          <Paper>
            {tabIndex === 0 && <ExchangeRateManagerView />}
            {tabIndex === 1 && <ExtraFeeManagerView />}
            {tabIndex === 2 && <PurchasePriceManagerView />}
            {tabIndex === 3 && <SalePriceManagerView />}
          </Paper>
        </Box>
      </Box>
    </Container>
  );
}
