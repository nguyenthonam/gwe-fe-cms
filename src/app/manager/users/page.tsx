"use client";
import UsersManager from "@/components/Users/UsersManager";
import { Container } from "@mui/material";
// import { CompanyManagerComponent } from "@/components/CompanyManagerComponent";

export default function UsersPage() {
  return (
    <Container maxWidth="lg" sx={{ padding: "0" }}>
      <UsersManager />
    </Container>
  );
}
