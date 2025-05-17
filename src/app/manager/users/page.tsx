"use client";
import UsersManager from "@/components/Users/UsersManager";
import { Box, Container } from "@mui/material";
// import { CompanyManagerComponent } from "@/components/CompanyManagerComponent";

export default function UsersPage() {
  return (
    <Container maxWidth="lg" sx={{ padding: "0" }}>
      <Box className="p-6 space-y-4">
        <UsersManager />
      </Box>
    </Container>
  );
}
