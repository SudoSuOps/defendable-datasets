import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Shell } from "@/components/Shell";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://defendabledatasets.com"),
  title: {
    default: "DefendableDatasets | Open datasets with receipts",
    template: "%s | DefendableDatasets",
  },
  description:
    "Browse, verify, compose, and export fine-tune-ready datasets from a living graph.",
  keywords: [
    "datasets",
    "fine-tuning",
    "dataset registry",
    "AI datasets",
    "data provenance",
    "SHA256",
    "Hugging Face",
    "DefendableOS",
    "DefendableCloud",
    "Defendable GRO Ops",
    "GRO Ops",
    "grow operations datasets",
    "regulated operations datasets",
  ],
  authors: [{ name: "DefendableOS", url: "https://defendableos.com" }],
  creator: "DefendableOS",
  publisher: "DefendableOS",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "https://defendabledatasets.com",
    siteName: "DefendableDatasets",
    title: "DefendableDatasets | Open datasets with receipts",
    description:
      "Browse, verify, compose, and export fine-tune-ready datasets for DefendableOS, DefendableCloud, GRO Ops, and builders from a living graph.",
    images: [
      {
        url: "/og.svg",
        width: 1200,
        height: 630,
        alt: "DefendableDatasets living dataset graph",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@mrdefendable",
    creator: "@mrdefendable",
    title: "DefendableDatasets | Open datasets with receipts",
    description:
      "Browse, verify, compose, and export fine-tune-ready datasets for DefendableOS, DefendableCloud, GRO Ops, and builders from a living graph.",
    images: ["/og.svg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
