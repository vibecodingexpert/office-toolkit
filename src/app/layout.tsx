import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "@/styles/globals.css"
import { Providers } from "@/components/layout/providers"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Office Toolkit Pro - All-in-One Productivity Suite",
  description:
    "100+ free and premium online tools for PDF, images, documents, developers, AI, security, and more. Convert, edit, compress, and transform your files instantly.",
  keywords: [
    "PDF tools",
    "image editor",
    "document converter",
    "developer tools",
    "AI tools",
    "online utilities",
    "productivity suite",
  ],
  authors: [{ name: "Office Toolkit Pro" }],
  openGraph: {
    title: "Office Toolkit Pro - All-in-One Productivity Suite",
    description:
      "100+ free and premium online tools for PDF, images, documents, developers, AI, security, and more.",
    type: "website",
    siteName: "Office Toolkit Pro",
  },
  twitter: {
    card: "summary_large_image",
    title: "Office Toolkit Pro - All-in-One Productivity Suite",
    description:
      "100+ free and premium online tools for PDF, images, documents, developers, AI, security, and more.",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0b" },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <meta name="apple-mobile-web-app-title" content="OT Pro" />
        <meta name="application-name" content="Office Toolkit Pro" />
      </head>
      <body className="min-h-full bg-background font-sans text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
