"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Box, Typography, Paper, Tabs, Tab, Container } from "@mui/material";
import { lightBlue } from "@mui/material/colors";
import ExchangeRateManagerView from "@/components/ExchangeRates/ExchangeRateManagerView";
import ExtraFeeManagerView from "@/components/ExtraFees/ExtraFeeManagerView";
import PurchasePriceManagerView from "@/components/PurchasePrices/PurchasePriceManagerView";
import SalePriceManagerView from "@/components/SalePrices/SalePriceManagerView";
import ZoneManagerView from "@/components/Zones/ZoneManagerView";
import CAWBCodeManagerView from "@/components/CAWBCodes/CAWBCodeManagerView";
// import VATRateManagerView from "@/components/VATRates/VATRateManagerView";

export default function PricesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Lấy tab index từ URL query (nếu có)
  const tabParam = Number(searchParams.get("tab"));
  const [tabIndex, setTabIndex] = useState(Number.isInteger(tabParam) && tabParam >= 0 ? tabParam : 0);

  // Khi url ?tab= đổi, sync lại state tabIndex
  useEffect(() => {
    if (Number.isInteger(tabParam) && tabParam >= 0 && tabParam !== tabIndex) {
      setTabIndex(tabParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabParam]);

  // Khi đổi tab, cập nhật lại url
  const handleTabChange = (_: any, newIndex: number) => {
    setTabIndex(newIndex);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", newIndex.toString());
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <Container maxWidth="lg" sx={{ padding: "0" }}>
      <Box
        className="p-6 space-y-4"
        sx={{
          maxWidth: "calc(100vw - 120px)",
        }}
      >
        <Typography variant="h5" mb={2} fontWeight="bold" sx={{ color: lightBlue[500] }}>
          QUẢN LÝ GIÁ
        </Typography>

        <Tabs value={tabIndex} onChange={handleTabChange}>
          <Tab label="Giá mua" />
          <Tab label="Giá bán" />
          <Tab label="Phụ phí" />
          <Tab label="Khu vực" />
          <Tab label="Mã chuyến bay" />
          {/* <Tab label="Thuế" /> */}
          <Tab label="Tỉ giá" />
        </Tabs>

        <Box mt={2} className="w-full ">
          <Paper>
            {tabIndex === 0 && <PurchasePriceManagerView />}
            {tabIndex === 1 && <SalePriceManagerView />}
            {tabIndex === 2 && <ExtraFeeManagerView />}
            {tabIndex === 3 && <ZoneManagerView />}
            {tabIndex === 4 && <CAWBCodeManagerView />}
            {/* {tabIndex === 5 && <VATRateManagerView />} */}
            {tabIndex === 5 && <ExchangeRateManagerView />}
          </Paper>
        </Box>
      </Box>
    </Container>
  );
}
