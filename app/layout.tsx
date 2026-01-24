import type React from "react"
import type { Metadata, Viewport } from "next"
import { Analytics } from "@vercel/analytics/next"
import { GoogleAnalytics } from "@next/third-parties/google"
import { ClientProviders } from "@/components/client-providers"
import FCMInitializer from "@/src/components/FCMInitializer"
import "./globals.css"

export const metadata: Metadata = {
  title: "If u? | 매일의 질문으로 세상을 알아가기",
  description: "하루의 질문에 투표하고 커뮤니티와 함께 다양한 관점을 나누세요.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon-192.png",
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "If u?",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#3b4cf6",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko">
      <body className={`font-sans antialiased`}>
        <ClientProviders>
           <FCMInitializer />
          {children}
        </ClientProviders>
        <Analytics />
        <GoogleAnalytics gaId="G-RLFTLVP8DN" />
      </body>
    </html>
  )
}
