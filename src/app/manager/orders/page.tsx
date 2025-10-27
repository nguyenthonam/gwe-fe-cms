"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Box, Tabs, Tab, Paper, Typography, Container } from "@mui/material";
import OrderManagerView from "@/components/Orders/OrderManagerView";
import { lightBlue } from "@mui/material/colors";

export default function OrdersPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Get tab index from URL query; default to 0 if invalid or missing
  const tabParam = Number(searchParams.get("tab"));
  const tabDefault = Number.isInteger(tabParam) && tabParam >= 0 ? tabParam : 0;
  const [tabIndex, setTabIndex] = useState(tabDefault);

  // Sync state when ?tab= changes
  useEffect(() => {
    const nextTab = Number.isInteger(tabParam) && tabParam >= 0 ? tabParam : 0;
    if (nextTab !== tabIndex) setTabIndex(nextTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabParam]);

  // Update URL when tab changes
  const handleTabChange = (_: any, newIndex: number) => {
    setTabIndex(newIndex);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", newIndex.toString());
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <Container maxWidth="xl" sx={{ padding: "0" }}>
      <Box className="space-y-4 max-w-[100vw]">
        <Typography variant="h5" mb={2} sx={{ fontWeight: "bold", color: lightBlue[500] }}>
          ORDER MANAGEMENT
        </Typography>
        <Tabs value={tabIndex} onChange={handleTabChange}>
          <Tab label="Orders" />
        </Tabs>

        <Box mt={2} className="w-full">
          <Paper>{tabIndex === 0 && <OrderManagerView />}</Paper>
        </Box>
      </Box>
    </Container>
  );
}
