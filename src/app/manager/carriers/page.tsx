"use client";
import { useState } from "react";
import { Box, Typography, Paper, Tabs, Tab, Container } from "@mui/material";
import { lightBlue } from "@mui/material/colors";
import CompanyCarrierManagerView from "@/components/Carriers/CompanyCarrierManagerView";
import CarrierManagerView from "@/components/Carriers/CarrierManagerView";
import CAWBCodeManagerView from "@/components/Carriers/CAWBCodeManagerView";
import ServiceManagerView from "@/components/Services/ServiceManagerView";
import ZoneManagerView from "@/components/Zones/ZoneManagerView";

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
          QUẢN LÝ HÃNG BAY
        </Typography>

        <Tabs value={tabIndex} onChange={(_, newIndex) => setTabIndex(newIndex)}>
          <Tab label="Hãng Bay" />
          <Tab label="Nhà Vận Chuyển" />
          <Tab label="Dịch vụ" />
          <Tab label="CAWB Code" />
          <Tab label="Zone" />
        </Tabs>

        <Box mt={2} className="w-full ">
          <Paper>
            {tabIndex === 0 && <CompanyCarrierManagerView />}
            {tabIndex === 1 && <CarrierManagerView />}
            {tabIndex === 2 && <ServiceManagerView />}
            {tabIndex === 3 && <CAWBCodeManagerView />}
            {tabIndex === 4 && <ZoneManagerView />}
          </Paper>
        </Box>
      </Box>
    </Container>
  );
}
