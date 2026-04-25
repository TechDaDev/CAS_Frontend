import type { Metadata } from "next";
import "./globals.css";
import { Cairo } from "next/font/google";
import { Providers } from "@/app/providers";
import { env } from "@/lib/env";

const cairo = Cairo({
  subsets: ["arabic"],
  variable: "--font-cairo",
});

export const metadata: Metadata = {
  title: `${env.NEXT_PUBLIC_APP_NAME} - منصة OMS`,
  description: "منصة أتمتة سير العمل الإداري للمؤسسات الأكاديمية",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${cairo.variable} antialiased font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
