"use client";

import { Box, Button, Container, Typography } from "@mui/material";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function NotFound() {
  const router = useRouter();

  return (
    <Container maxWidth="sm" sx={{ minHeight: "100vh", display: "flex", alignItems: "center" }}>
      <Box textAlign="center" width="100%">
        {/* Animated Truck Icon */}
        <motion.div animate={{ x: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}>
          <LocalShippingIcon sx={{ fontSize: 80, color: "primary.main", mb: 2 }} />
        </motion.div>

        <Typography variant="h3" fontWeight="bold" gutterBottom>
          404
        </Typography>
        <Typography variant="h5" color="text.secondary" gutterBottom>
          Page Not Found
        </Typography>
        <Typography variant="body1" color="text.secondary" mb={3}>
          {`The delivery route you're looking for doesn't exist.`}
        </Typography>

        <Button variant="contained" color="primary" onClick={() => router.push("/")}>
          Go Home
        </Button>
      </Box>
    </Container>
  );
}
