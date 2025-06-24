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

  // Lấy tab index từ URL query, mặc định là 0 nếu không có hoặc không hợp lệ
  const tabParam = Number(searchParams.get("tab"));
  const tabDefault = Number.isInteger(tabParam) && tabParam >= 0 ? tabParam : 0;
  const [tabIndex, setTabIndex] = useState(tabDefault);

  // Khi url ?tab= đổi, sync lại state tabIndex
  useEffect(() => {
    const nextTab = Number.isInteger(tabParam) && tabParam >= 0 ? tabParam : 0;
    if (nextTab !== tabIndex) setTabIndex(nextTab);
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
        <Typography variant="h5" mb={2} sx={{ fontWeight: "bold", color: lightBlue[500] }}>
          QUẢN LÝ ĐƠN HÀNG
        </Typography>
        <Tabs value={tabIndex} onChange={handleTabChange}>
          <Tab label="Đơn Hàng" />
        </Tabs>

        <Box mt={2} className="w-full ">
          <Paper>{tabIndex === 0 && <OrderManagerView />}</Paper>
        </Box>
      </Box>
    </Container>
  );
}
