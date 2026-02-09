import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "EmbPay — All-in-One Payment Processing & E-Commerce",
    template: "%s | EmbPay",
  },
  description:
    "EmbPay is an all-in-one payment processing and e-commerce solution. Accept payments, sell digital products, embed checkout anywhere — all with a single platform.",
  keywords: [
    "payment processing",
    "e-commerce",
    "digital products",
    "stripe",
    "checkout",
    "embeddable checkout",
    "sell online",
    "subscriptions",
    "order bumps",
  ],
  authors: [{ name: "EmbPay" }],
  creator: "EmbPay",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "EmbPay",
    title: "EmbPay — Accept Payments Anywhere. Embed Everywhere.",
    description:
      "All-in-one payment processing for creators and businesses. Embeddable checkout, order bumps, subscriptions, and more.",
  },
  twitter: {
    card: "summary_large_image",
    title: "EmbPay — Accept Payments Anywhere. Embed Everywhere.",
    description:
      "All-in-one payment processing for creators and businesses. Start free.",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-slate-950 text-white antialiased">
        {children}
      </body>
    </html>
  );
}
