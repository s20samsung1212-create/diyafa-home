import type { Metadata } from "next";
import { Tajawal } from "next/font/google";
import "./globals.css";
import { WishlistProvider } from "@/context/WishlistContext";

// تهيئة الخط العربي الفاخر (Tajawal)
const tajawal = Tajawal({
  subsets: ["arabic"],
  weight: ["400", "500", "700", "800"],
  variable: "--font-tajawal",
});

// معلومات الموقع لمحركات البحث (SEO & Metadata)
export const metadata: Metadata = {
  title: "ضيافة هوم | DIYAFFA HOME - الفخامة والرقي في الضيافة والمنزل",
  description: "المتجر الإلكتروني الأول لأطقم الضيافة الفاخرة، الكريستال، والديكورات الملكية المنسقة.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={tajawal.variable}>
      <body className="bg-[#0f0d0b] text-[#f5ebd9] min-h-screen antialiased selection:bg-[#e2c99a] selection:text-[#0f0d0b]">
        {/* ربط مزود قائمة المفضلة التفاعلية بكامل شجرة التطبيق */}
        <WishlistProvider>
          {children}
        </WishlistProvider>
      </body>
    </html>
  );
}