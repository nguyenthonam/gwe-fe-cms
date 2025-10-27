"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Box, Typography, Paper, Tabs, Tab, Container } from "@mui/material";
import { lightBlue } from "@mui/material/colors";
import CompanyCarrierManagerView from "@/components/Carriers/CompanyCarrierManagerView";
import CarrierManagerView from "@/components/Carriers/SubCarriers/CarrierManagerView";
import ServiceManagerView from "@/components/Services/ServiceManagerView";

export default function CarriersPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Get tab from query (if any), default is 0
  const tabParam = Number(searchParams.get("tab"));
  const [tabIndex, setTabIndex] = useState(Number.isInteger(tabParam) && tabParam >= 0 ? tabParam : 0);

  // Sync tabIndex when tab query changes in URL (e.g. user pastes new link)
  useEffect(() => {
    if (Number.isInteger(tabParam) && tabParam >= 0 && tabParam !== tabIndex) {
      setTabIndex(tabParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabParam]);

  // When user changes tab in UI, update the URL query
  const handleTabChange = (_: any, newIndex: number) => {
    setTabIndex(newIndex);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", newIndex.toString());
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <Container maxWidth="xl" sx={{ padding: "0" }}>
      <Box
        className="space-y-4"
        sx={{
          maxWidth: "calc(100vw - 120px)",
        }}
      >
        <Typography variant="h5" mb={2} fontWeight="bold" sx={{ color: lightBlue[500] }}>
          CARRIER MANAGEMENT
        </Typography>

        <Tabs value={tabIndex} onChange={handleTabChange}>
          <Tab label="Carriers" />
          <Tab label="Sub Carriers" />
          <Tab label="Services" />
        </Tabs>

        <Box mt={2} className="w-full ">
          <Paper>
            {tabIndex === 0 && <CompanyCarrierManagerView />}
            {tabIndex === 1 && <CarrierManagerView />}
            {tabIndex === 2 && <ServiceManagerView />}
          </Paper>
        </Box>
      </Box>
    </Container>
  );
}
