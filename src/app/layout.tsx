import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
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
      <body>
        <Header />
        <main className="w-full flex-grow container mx-auto p-4">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
