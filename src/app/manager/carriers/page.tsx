"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Box, Typography, Paper, Tabs, Tab, Container } from "@mui/material";
import { lightBlue } from "@mui/material/colors";
import CompanyCarrierManagerView from "@/components/Carriers/CompanyCarrierManagerView";
import CarrierManagerView from "@/components/Carriers/CarrierManagerView";
import ServiceManagerView from "@/components/Services/ServiceManagerView";

export default function CarriersPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Lấy tab từ query (nếu có), mặc định là 0
  const tabParam = Number(searchParams.get("tab"));
  const [tabIndex, setTabIndex] = useState(Number.isInteger(tabParam) && tabParam >= 0 ? tabParam : 0);

  // Khi query tab trên url đổi, đồng bộ tabIndex (ví dụ khi user paste link mới)
  useEffect(() => {
    if (Number.isInteger(tabParam) && tabParam >= 0 && tabParam !== tabIndex) {
      setTabIndex(tabParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabParam]);

  // Khi đổi tab trên UI, update lại query trên url
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
          QUẢN LÝ HÃNG BAY
        </Typography>

        <Tabs value={tabIndex} onChange={handleTabChange}>
          <Tab label="Hãng Bay" />
          <Tab label="Nhà Vận Chuyển" />
          <Tab label="Dịch vụ" />
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
