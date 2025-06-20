"use client";
import { useState } from "react";
import { Box, Typography, Paper, Tabs, Tab, Container } from "@mui/material";
import { lightBlue } from "@mui/material/colors";
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
          QUẢN LÝ KHU VỰC
        </Typography>

        <Tabs value={tabIndex} onChange={(_, newIndex) => setTabIndex(newIndex)}>
          <Tab label="Zone" />
        </Tabs>

        <Box mt={2} className="w-full ">
          <Paper>{tabIndex === 0 && <ZoneManagerView />}</Paper>
        </Box>
      </Box>
    </Container>
  );
}
