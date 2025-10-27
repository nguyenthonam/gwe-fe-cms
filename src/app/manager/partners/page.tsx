"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Box, Tabs, Tab, Paper, Typography, Container } from "@mui/material";
import CustomerManagerView from "@/components/Partners/PartnerManagerView";
import StaffManagerView from "@/components/Staff/StaffManagerView";
import { lightBlue } from "@mui/material/colors";

export default function CustomersPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Get tab index from URL, default to 0 if invalid
  const tabParam = Number(searchParams.get("tab"));
  const [tabIndex, setTabIndex] = useState(Number.isInteger(tabParam) && tabParam >= 0 ? tabParam : 0);

  // Sync tab index when query changes
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
        <Typography variant="h5" mb={2} sx={{ fontWeight: "bold", color: lightBlue[500] }}>
          CUSTOMER MANAGEMENT
        </Typography>
        <Tabs value={tabIndex} onChange={handleTabChange}>
          <Tab label="Customer Information" />
          <Tab label="Customer Staff" />
        </Tabs>

        <Box mt={2} className="w-full">
          <Paper>
            {tabIndex === 0 && <CustomerManagerView />}
            {tabIndex === 1 && <StaffManagerView />}
          </Paper>
        </Box>
      </Box>
    </Container>
  );
}
