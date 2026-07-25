import type { Metadata } from "next";
import { Fraunces, Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700", "900"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-numeric",
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "DineFlow | Smart Restaurant Management",
  description:
    "A warm, AI-assisted restaurant operations UI for customer ordering, live kitchen status, reservations, and owner insights.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`h-full antialiased ${fraunces.variable} ${inter.variable} ${spaceGrotesk.variable}`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
