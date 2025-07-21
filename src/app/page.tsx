"use client";

import { Button, Container, Typography, Stack, Paper } from "@mui/material";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import PhoneIcon from "@mui/icons-material/Phone";

export default function Home() {
  return (
    <Container maxWidth="md" sx={{ py: 10 }}>
      <Paper
        elevation={4}
        sx={{
          p: 4,
          backgroundColor: "#1976d2",
          borderRadius: 3,
          color: "white",
        }}
      >
        {/* Header */}
        <Stack direction="row" spacing={2} alignItems="center" mb={2}>
          <LocalShippingIcon sx={{ fontSize: 40 }} />
          <Typography variant="h5" fontWeight="bold">
            GATEWAY EXPRESS
          </Typography>
        </Stack>

        {/* Main Title */}
        <Typography variant="h3" fontWeight="bold" mb={2}>
          Gửi hàng quốc tế
        </Typography>

        {/* Description */}
        <Typography variant="body1" sx={{ lineHeight: 1.7, mb: 3 }}>
          Với nhiều năm kinh nghiệm trong lĩnh vực vận chuyển hàng không quốc tế, Gateway Express với đội ngũ chuyên viên năng động, tận tâm với công việc sẽ giúp quý khách gửi hàng nhanh chóng, tiết
          kiệm và đơn giản nhất.
        </Typography>

        {/* Hotline Buttons */}
        <Stack direction="row" spacing={2}>
          <Button variant="contained" color="info" startIcon={<PhoneIcon />} href="tel:0938373343" sx={{ textTransform: "none", fontWeight: "bold" }}>
            0938 373 343
          </Button>
          <Button variant="contained" color="success" startIcon={<PhoneIcon />} href="tel:0944247267" sx={{ textTransform: "none", fontWeight: "bold" }}>
            0944 247 267
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
}
