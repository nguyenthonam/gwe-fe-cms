"use client";
import { useState } from "react";
import { Box, Tabs, Tab, Paper, Typography, Container } from "@mui/material";
import PartnerManagerView from "@/components/Partners/PartnerManagerView";
import StaffManagerView from "@/components/Staff/StaffManagerView";
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
          <Tab label="Thông tin Đối Tác" />
          <Tab label="Nhân viên Đối Tác" />
        </Tabs>

        <Box mt={2} className="w-full ">
          <Paper>{tabIndex === 0 ? <PartnerManagerView /> : <StaffManagerView />}</Paper>
        </Box>
      </Box>
    </Container>
  );
}
