import BillForm from "@/components/Bill/BillForm";
import { Container } from "@mui/material";

export default function Bill() {
  return (
    <Container maxWidth="lg" sx={{ padding: "0" }}>
      <BillForm />
    </Container>
  );
}
