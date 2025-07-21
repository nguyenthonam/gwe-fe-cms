"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Box, Typography, Button, Container } from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const router = useRouter();

  useEffect(() => {
    console.error("Unexpected error:", error);
  }, [error]);

  return (
    <Container maxWidth="sm" sx={{ minHeight: "100vh", display: "flex", alignItems: "center" }}>
      <Box textAlign="center" width="100%">
        <ErrorOutlineIcon sx={{ fontSize: 80, color: "error.main", mb: 2 }} />
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Something went wrong!
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          We encountered an unexpected error. Please try again or go back to the homepage.
        </Typography>

        <Box mt={4} display="flex" justifyContent="center" gap={2}>
          <Button variant="contained" color="primary" onClick={() => reset()}>
            Try Again
          </Button>
          <Button variant="outlined" onClick={() => router.push("/")}>
            Go Home
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
