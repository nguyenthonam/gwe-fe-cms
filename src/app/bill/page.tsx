import BillForm from "@/components/Bill/BillForm";
import { Container } from "@mui/material";

export default function Bill() {
  return (
    <Container maxWidth="xl" sx={{ padding: "0" }}>
      <BillForm />
    </Container>
  );
}
