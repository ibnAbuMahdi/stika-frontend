import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";

// Poppins for normal text
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

// Inter as fallback (since Satoshi requires custom loading)
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Stika - Where Ads Meet the Road",
  description: "Transform everyday commutes into dynamic advertising opportunities with Stika. Turning tricycles into mobile billboards.",
  icons: {
    icon: "/stika_1.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} ${inter.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
