import * as React from "react";
import "@src/css/app.css";
import { Noto_Kufi_Arabic, DM_Sans, Urbanist } from "next/font/google";
import AppProvider from "@lib/appProvider";
import { fetchAppData } from "@src/actions";
import { Metadata } from "next/types";

export const generateMetadata = async (): Promise<Metadata> => {
  const data = await fetchAppData({ language: "en", currency: "usd" });

  const meta_data = data?.data?.app;
  if (!meta_data) {
    return {
      title: "404",
      description: "404",
    };
  }

  const { home_title, meta_description, favicon_img, header_logo_img } =
    meta_data;

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL!),
    alternates: {
      canonical: "/",
      languages: {
        "en-US": "/en",
        "ar-SA": "/ar",
      },
    },
    icons: {
      icon: favicon_img,
      shortcut: header_logo_img,
      apple: header_logo_img,
    },
    keywords: "some keyword",
    title: home_title,
    authors: [],
    robots: "",
    applicationName: home_title,
    creator: home_title,
    publisher: home_title,
    generator: "Next.js",
    referrer: "origin-when-cross-origin",
    description: meta_description,
    openGraph: {
      title: home_title,
      description: meta_description,
      url: process.env.NEXT_PUBLIC_SITE_URL!,
      siteName: home_title,
      images: [
        {
          url: header_logo_img,
          width: 1200,
          height: 630,
        },
      ],
      locale: "en_US",
      type: "website",
    },
  };
};

const dmSans = DM_Sans({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  display: "swap",
});

const notoKufiArabic = Noto_Kufi_Arabic({
  weight: ["400", "700"],
  subsets: ["arabic"],
  display: "swap",
});
const urbanist = Urbanist({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-urbanist",
  display: "swap",
});
export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: "en" | "ar" }>; // 👈 mark params as a Promise
}) {
  const { lang } = await params; // 👈 await it

  const isArabic = lang === "ar";
  const fontClass = isArabic ? notoKufiArabic.className : urbanist.className;

  return (
    <html lang={lang} dir={isArabic ? "rtl" : "ltr"}>
      <body className={fontClass}>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
