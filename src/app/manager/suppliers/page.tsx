"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Box, Typography, Paper, Tabs, Tab, Container } from "@mui/material";
import CompanySupplierManagerView from "@/components/Suppliers/CompanySupplierManagerView";
import SupplierManagerView from "@/components/Suppliers/SupplierManagerView";
import { lightBlue } from "@mui/material/colors";

export default function SuppliersPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Lấy tab index từ URL, mặc định là 0 nếu không có hoặc lỗi
  const tabParam = Number(searchParams.get("tab"));
  const [tabIndex, setTabIndex] = useState(Number.isInteger(tabParam) && tabParam >= 0 ? tabParam : 0);

  // Khi query tab thay đổi, đồng bộ lại state
  useEffect(() => {
    const nextTab = Number.isInteger(tabParam) && tabParam >= 0 ? tabParam : 0;
    if (tabIndex !== nextTab) setTabIndex(nextTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabParam]);

  // Khi đổi tab, cập nhật lại url (không reload trang)
  const handleTabChange = (_: any, newValue: number) => {
    setTabIndex(newValue);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", newValue.toString());
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
          QUẢN LÝ NHÀ CUNG CẤP
        </Typography>

        <Tabs value={tabIndex} onChange={handleTabChange}>
          <Tab label="Công ty nhà cung cấp" />
          <Tab label="Nhà cung cấp" />
        </Tabs>

        <Box mt={2} className="w-full ">
          <Paper>
            {tabIndex === 0 && <CompanySupplierManagerView />}
            {tabIndex === 1 && <SupplierManagerView />}
          </Paper>
        </Box>
      </Box>
    </Container>
  );
}
