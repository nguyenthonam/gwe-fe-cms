"use client";
import { Box, Typography, Divider, Paper, Tabs, Tab } from "@mui/material";
import CompanyCarrierManagerView from "@/components/Carriers/CompanyCarrierManagerView";
import CarrierManagerView from "@/components/Carriers/CarrierManagerView";
import CAWBCodeManagerView from "@/components/Carriers/CAWBCodeManagerView";
import { useState } from "react";

export default function CarrierManagementView() {
  const [tabIndex, setTabIndex] = useState(0);

  return (
    <Box className="p-6 space-y-4 max-w-[calc(100vw-120px)]">
      <Typography variant="h5" fontWeight="bold">
        QUẢN LÝ HÃNG BAY
      </Typography>

      <Tabs value={tabIndex} onChange={(_, newIndex) => setTabIndex(newIndex)}>
        <Tab label="Hãng Bay" />
        <Tab label="Nhà Vận Chuyển" />
        <Tab label="CAWB Code" />
      </Tabs>
      <Box mt={2} p={2}>
        {tabIndex === 0 && <CompanyCarrierManagerView />}
        {tabIndex === 1 && <CarrierManagerView />}
        {tabIndex === 2 && <CAWBCodeManagerView />}
      </Box>

      {/* <Paper sx={{ mt: 2, p: 2 }}>{tabIndex === 0 ? <CompanyCarrierManagerView /> : <CarrierManagerView />}</Paper> */}
    </Box>
  );
}
