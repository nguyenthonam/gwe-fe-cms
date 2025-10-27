"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Box, Typography, Paper, Tabs, Tab, Container } from "@mui/material";
import SupplierManagerView from "@/components/Suppliers/SupplierManagerView";
import { lightBlue } from "@mui/material/colors";

export default function SuppliersPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Get tab index from URL; default to 0 if missing or invalid
  const tabParam = Number(searchParams.get("tab"));
  const [tabIndex, setTabIndex] = useState(Number.isInteger(tabParam) && tabParam >= 0 ? tabParam : 0);

  // Sync tab index when query param changes
  useEffect(() => {
    const nextTab = Number.isInteger(tabParam) && tabParam >= 0 ? tabParam : 0;
    if (tabIndex !== nextTab) setTabIndex(nextTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabParam]);

  // Update URL when tab changes (without reload)
  const handleTabChange = (_: any, newValue: number) => {
    setTabIndex(newValue);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", newValue.toString());
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <Container maxWidth="xl" sx={{ padding: "0" }}>
      <Box className="space-y-4">
        <Typography variant="h5" mb={2} fontWeight="bold" sx={{ color: lightBlue[500] }}>
          SUPPLIER MANAGEMENT
        </Typography>

        <Tabs value={tabIndex} onChange={handleTabChange}>
          <Tab label="Suppliers" />
        </Tabs>

        <Box mt={2} className="w-full">
          <Paper>{tabIndex === 0 && <SupplierManagerView />}</Paper>
        </Box>
      </Box>
    </Container>
  );
}
