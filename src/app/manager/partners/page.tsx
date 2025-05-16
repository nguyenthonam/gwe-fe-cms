"use client";
import { useState } from "react";
import { Box, Tabs, Tab, Paper, Typography, Container } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { ActionMenu } from "@/components/Globals/ActionMenu";
import PartnerManagerView from "@/components/Partners/PartnerManagerView";
import StaffManagerView from "@/components/Staff/StaffManagerView";

const dummyRows = Array.from({ length: 5 }, (_, i) => ({
  id: i,
  code: `C00${i}`,
  name: `Company ${i}`,
  taxCode: `123456789${i}`,
  address: `123 Main St, City ${i}`,
  type: "Agency",
  userId: `U00${i}`,
  email: `user${i}@mail.com`,
  role: i % 2 === 0 ? "Admin" : "User",
}));

export default function PartnerManagementTabs() {
  const [tabIndex, setTabIndex] = useState(0);
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  const handleEditCompany = (company: any) => {
    console.log("Edit Company", company);
  };
  const handleToggleCompanyLock = (company: any) => {
    console.log("Toggle Company Lock", company);
  };
  const handleEditEmployee = (employee: any) => {
    console.log("Edit Employee", employee);
  };
  const handleToggleEmployeeLock = (employee: any) => {
    console.log("Toggle Employee Lock", employee);
  };

  const employeeColumns: GridColDef[] = [
    { field: "userId", headerName: "USER ID", width: 120 },
    { field: "name", headerName: "NAME", width: 200 },
    { field: "email", headerName: "EMAIL", width: 220 },
    { field: "address", headerName: "ADDRESS", width: 250 },
    { field: "role", headerName: "ROLE", width: 120 },
    {
      field: "actions",
      headerName: "ACTION",
      width: 150,
      renderCell: ({ row }) => (
        <>
          <ActionMenu onEdit={() => handleEditEmployee(row)} onLockUnlock={() => handleToggleEmployeeLock(row)} status={row?.status} />
        </>
      ),
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ padding: "0" }}>
      <Box
        className="p-6 space-y-4"
        sx={{
          maxWidth: "calc(100vw - 120px)",
        }}
      >
        <Typography variant="h5" mb={2}>
          ĐỐI TÁC
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
