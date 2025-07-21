"use client";

import { Box, CircularProgress, Typography } from "@mui/material";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import { motion } from "framer-motion";

export default function Loading() {
  return (
    <Box minHeight="100vh" display="flex" flexDirection="column" justifyContent="center" alignItems="center" bgcolor="#f4f6f8" gap={2}>
      {/* Animated Icon */}
      <motion.div animate={{ x: [0, 20, -20, 0] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}>
        <LocalShippingIcon sx={{ fontSize: 64, color: "#1976d2" }} />
      </motion.div>

      {/* Loading Text */}
      <Typography variant="h6" fontWeight="bold" color="text.secondary">
        Preparing your logistics data...
      </Typography>

      {/* Spinner */}
      <CircularProgress color="primary" />
    </Box>
  );
}
