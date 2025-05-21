"use client";
import { useState } from "react";
import { Box, Tabs, Tab, Paper, Typography, Container } from "@mui/material";
import VATRateManagerView from "@/components/VATRates/VATRateManagerView";
import { lightBlue } from "@mui/material/colors";

export default function PartnerManagementTabs() {
  const [tabIndex, setTabIndex] = useState(0);
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ padding: "0" }}>
      <Box
        className="p-6 space-y-4"
        sx={{
          maxWidth: "calc(100vw - 120px)",
        }}
      >
        <Typography variant="h5" mb={2} sx={{ fontWeight: "bold", color: lightBlue[500] }}>
          QUẢN LÝ ĐỐI TÁC
        </Typography>
        <Tabs value={tabIndex} onChange={handleTabChange}>
          <Tab label="Đơn Hàng" />
          <Tab label="VAT (Thuế)" />
          <Tab label="Hệ số tính VOL WEIGHT" />
        </Tabs>

        <Box mt={2} className="w-full ">
          <Paper>
            {tabIndex === 0 && <VATRateManagerView />}
            {tabIndex === 1 && <VATRateManagerView />}
            {tabIndex === 2 && <VATRateManagerView />}
          </Paper>
        </Box>
      </Box>
    </Container>
  );
}
