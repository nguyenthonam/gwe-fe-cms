"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Box, Typography, Paper, Tabs, Tab, Container } from "@mui/material";
import { lightBlue } from "@mui/material/colors";
import ExchangeRateManagerView from "@/components/ExchangeRates/ExchangeRateManagerView";
import ExtraFeeManagerView from "@/components/ExtraFees/ExtraFeeManagerView";
import FSCManagerView from "@/components/FSCFees/FSCManagerView";
import PurchasePriceManagerView from "@/components/PurchasePrices/PurchasePriceManagerView";
import SalePriceManagerView from "@/components/SalePrices/SalePriceManagerView";
import ZoneManagerView from "@/components/Zones/ZoneManagerView";
import CAWBCodeManagerView from "@/components/CAWBCodes/CAWBCodeManagerView";
import VATRateManagerView from "@/components/VATRates/VATRateManagerView";

export default function PricesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Get tab index from URL query
  const tabParam = Number(searchParams.get("tab"));
  const [tabIndex, setTabIndex] = useState(Number.isInteger(tabParam) && tabParam >= 0 ? tabParam : 0);

  // Sync tabIndex with URL param
  useEffect(() => {
    if (Number.isInteger(tabParam) && tabParam >= 0 && tabParam !== tabIndex) {
      setTabIndex(tabParam);
    }
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
      <Box className="space-y-4">
        <Typography variant="h5" mb={2} fontWeight="bold" sx={{ color: lightBlue[500] }}>
          PRICE MANAGEMENT
        </Typography>

        <Tabs value={tabIndex} onChange={handleTabChange} variant="scrollable" scrollButtons="auto" allowScrollButtonsMobile>
          <Tab label="Purchase Price" />
          <Tab label="Sale Price" />
          <Tab label="Zones" />
          <Tab label="VAT" />
          <Tab label="Extra Fees" />
          <Tab label="FSC" />
          <Tab label="CAWB Codes" />
          <Tab label="Exchange Rates" />
        </Tabs>

        <Box mt={2} className="w-full">
          <Paper>
            {tabIndex === 0 && <PurchasePriceManagerView />}
            {tabIndex === 1 && <SalePriceManagerView />}
            {tabIndex === 2 && <ZoneManagerView />}
            {tabIndex === 3 && <VATRateManagerView />}
            {tabIndex === 4 && <ExtraFeeManagerView />}
            {tabIndex === 5 && <FSCManagerView />}
            {tabIndex === 6 && <CAWBCodeManagerView />}
            {tabIndex === 7 && <ExchangeRateManagerView />}
          </Paper>
        </Box>
      </Box>
    </Container>
  );
}
