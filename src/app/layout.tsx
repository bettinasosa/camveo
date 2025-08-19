import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "USDT/VES P2P Market - Binance P2P Prices",
  description:
    "Real-time Binance P2P prices for USDT vs Venezuelan Bolivares. Track the best buy and sell offers with live updates.",
  keywords: [
    "USDT",
    "VES",
    "Binance",
    "P2P",
    "cryptocurrency",
    "Venezuela",
    "Bolivares",
    "trading"
  ],
  authors: [{ name: "Camveo" }],
  robots: "index, follow"
}

export const viewport = {
  width: "device-width",
  initialScale: 1
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
