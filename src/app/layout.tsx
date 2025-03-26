import type { Metadata } from "next";
import LayoutView from "@/components/LayoutView";
import "@/styles/globals.scss";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Dịch vụ gửi hàng đi quốc tế uy tín tại Ho Chi Minh City | Gateway Express",
  description: "Gateway Express là đơn vị cung cấp dịch vụ gửi hàng quốc tế, chuyển phát nhanh quốc tế uy tín tại Tp. Hồ Chí Minh.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
      </head>
      <body>
        <LayoutView>{children}</LayoutView>
      </body>
    </html>
  );
}
