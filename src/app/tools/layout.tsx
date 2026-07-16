import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-16">{children}</main>
      <Footer />
    </div>
  )
}
