import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import AppProvider from "@/components/app-provider";
import { Toaster } from "@/components/ui/sonner";
import { baseOpenGraph } from "@/app/shared-metadata";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: {
    default:
      "Bin Restaurant 🍕 | Hương vị hoàng gia & trải nghiệm ẩm thực thượng lưu",
    template: "%s | Bin Restaurant 🍕",
  },
  description:
    "Bin Restaurant – nơi bạn tận hưởng hành trình ẩm thực hoàng gia giữa không gian sang trọng, dịch vụ chuyên nghiệp và menu phong phú từ Pizza Gà BBQ nhiệt đới đến Cơm trắng hầm thịt bò đậm đà.",
  keywords: [
    "Bin Restaurant",
    "nhà hàng cao cấp",
    "ẩm thực hoàng gia",
    "pizza gà BBQ",
    "thịt hầm cà rốt",
  ],

  authors: [{ name: "Bin Restaurant", url: "https://binrestaurant.io.vn" }],
  creator: "Vo Dinh Quan",
  metadataBase: new URL("https://binrestaurant.io.vn"),

  alternates: {
    canonical: "/",
    languages: {
      "vi-VN": "/",
      "en-US": "/en",
    },
  },

  openGraph: baseOpenGraph,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* JSON‑LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Restaurant",
              name: "Bin Restaurant",
              url: "https://binrestaurant.io.vn",
              logo: "https://binrestaurant.io.vn/favicon.ico",
              image: "https://binrestaurant.io.vn/og-image.jpg",
              sameAs: [
                "https://www.facebook.com/binrestaurant",
                "https://www.instagram.com/binrestaurant",
                "https://zalo.me/1234567890",
                "https://www.youtube.com/@binrestaurant",
                "https://github.com/Vo-Dinh-Quan/QR-Food-Ordering",
              ],
              address: {
                "@type": "PostalAddress",
                streetAddress: "123 Đường Sang Trọng",
                addressLocality: "TP. Hồ Chí Minh",
                addressCountry: "VN",
              },
              servesCuisine: ["Vietnamese", "Italian", "Fine Dining"],
            }),
          }}
        />
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}>
        <AppProvider>
          {/*ThemeProvider của dark mode */}
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange>
            {children}
            <Toaster />
          </ThemeProvider>
        </AppProvider>
      </body>
    </html>
  );
}
