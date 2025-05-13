"use client";
import { useState } from "react";
import { Box, Tabs, Tab, Paper, Typography, Button, TextField, IconButton, Container } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Add, Edit, Lock, LockOpen } from "@mui/icons-material";
import { pages } from "next/dist/build/templates/app-page";
import { ActionMenu } from "@/components/Globals/ActionMenu";
import { ICompany } from "@/types/typeCompany";

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
  const [selectedCompany, setSelectedCompany] = useState<ICompany>();
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

  const companyColumns: GridColDef[] = [
    { field: "code", headerName: "CODE", width: 120 },
    { field: "name", headerName: "NAME", width: 200 },
    { field: "taxCode", headerName: "TAX CODE", width: 150 },
    { field: "address", headerName: "ADDRESS", width: 250 },
    { field: "type", headerName: "TYPE", width: 100 },
    {
      field: "actions",
      headerName: "ACTION",
      width: 150,
      renderCell: ({ row }) => (
        <>
          <ActionMenu onEdit={() => handleEditCompany(row)} onLockUnlock={() => handleToggleCompanyLock(row)} status={row?.status} />
        </>
      ),
    },
  ];

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
      <Box className="p-6 space-y-4">
        <Typography variant="h5" mb={2}>
          ĐỐI TÁC
        </Typography>
        <Tabs value={tabIndex} onChange={handleTabChange}>
          <Tab label="Thông tin Đối Tác" />
          <Tab label="Nhân viên Đối Tác" />
        </Tabs>

        <Box mt={2} className="w-full ">
          <Paper sx={{ p: 2 }}>
            <Box mb={2} display="flex" justifyContent="space-between" alignItems="center">
              <TextField size="small" placeholder="Tìm kiếm..." />
              <Box display="flex" gap={1}>
                <Button variant="contained" startIcon={<Add />}>
                  Tạo mới
                </Button>
                <Button variant="outlined">Xuất Excel</Button>
              </Box>
            </Box>
            {tabIndex === 0 ? (
              <DataGrid autoHeight rows={dummyRows} columns={companyColumns} pageSizeOptions={[5]} />
            ) : (
              <DataGrid autoHeight rows={dummyRows} columns={employeeColumns} pageSizeOptions={[5]} />
            )}
          </Paper>
        </Box>
      </Box>
    </Container>
  );
}
