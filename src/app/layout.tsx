import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "@/styles/globals.css";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Header />
        <main className="w-full flex-grow container mx-auto p-4">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
