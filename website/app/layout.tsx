import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin", "vietnamese"],
});

export const metadata: Metadata = {
  title: "XangMate — Tính chi phí xăng dầu",
  description:
    "Công cụ tính toán chi phí nhiên liệu nhanh chóng cho xe máy và ô tô tại Việt Nam. Giá xăng cập nhật realtime từ PVOIL.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
