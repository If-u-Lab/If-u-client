import type React from "react"
import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import { ClientProviders } from "@/components/client-providers"
import "./globals.css"

export const metadata: Metadata = {
  title: "If U? | 매일의 질문으로 세상을 알아가기",
  description: "하루의 질문에 투표하고 커뮤니티와 함께 다양한 관점을 나누세요.",
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
          {children}
        </ClientProviders>
        <Analytics />
      </body>
    </html>
  )
}
