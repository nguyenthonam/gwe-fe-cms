"use client";
import { Box, Typography, Divider, Paper, Tabs, Tab, Container } from "@mui/material";
import CompanyCarrierManagerView from "@/components/Carriers/CompanyCarrierManagerView";
import CarrierManagerView from "@/components/Carriers/CarrierManagerView";
import CAWBCodeManagerView from "@/components/Carriers/CAWBCodeManagerView";
import { useState } from "react";

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
        <Typography variant="h5" mb={2} fontWeight="bold">
          QUẢN LÝ HÃNG BAY
        </Typography>

        <Tabs value={tabIndex} onChange={(_, newIndex) => setTabIndex(newIndex)}>
          <Tab label="Hãng Bay" />
          <Tab label="Nhà Vận Chuyển" />
          <Tab label="CAWB Code" />
        </Tabs>

        <Box mt={2} className="w-full ">
          <Paper>
            {tabIndex === 0 && <CompanyCarrierManagerView />}
            {tabIndex === 1 && <CarrierManagerView />}
            {tabIndex === 2 && <CAWBCodeManagerView />}
          </Paper>
        </Box>
      </Box>
    </Container>
  );
}
