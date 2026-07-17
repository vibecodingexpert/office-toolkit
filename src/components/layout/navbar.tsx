"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils/cn"
import { useToolStore } from "@/lib/store/use-tool-store"
import { SearchBar } from "@/components/ui/search-bar"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { Button } from "@/components/ui/button"
import { Menu, X, LayoutDashboard, FileText } from "lucide-react"

const navLinks = [
  { href: "/tools", label: "Tools" },
  { href: "/features", label: "Features" },
  { href: "/about", label: "About" },
]

interface NavbarProps {
  variant?: "default" | "dashboard"
}

export function Navbar({ variant = "default" }: NavbarProps) {
  const pathname = usePathname()
  const isSidebarOpen = useToolStore((s) => s.isSidebarOpen)
  const [isScrolled, setIsScrolled] = React.useState(false)
  const [isMobileOpen, setIsMobileOpen] = React.useState(false)
  const isDashboard = variant === "dashboard"

  React.useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  React.useEffect(() => {
    setIsMobileOpen(false)
  }, [pathname])

  return (
    <header
      className={cn(
        "fixed top-0 z-40 h-16 transition-all duration-300",
        isDashboard
          ? "right-0 bg-background/80 backdrop-blur-lg border-b border-border shadow-sm"
          : "inset-x-0",
        isDashboard && isSidebarOpen && "md:left-[260px]",
        isDashboard && !isSidebarOpen && "md:left-[72px]",
        !isDashboard && isScrolled && "bg-background/80 backdrop-blur-lg border-b border-border shadow-sm"
      )}
    >
      <nav className={cn(
        "mx-auto flex h-full items-center gap-4 px-4 sm:px-6 lg:px-8",
        isDashboard ? "max-w-none" : "max-w-7xl"
      )}>
        {!isDashboard && (
          <Link href="/" className="flex shrink-0 items-center gap-2.5 mr-6">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-sm">
              <FileText className="h-4 w-4 text-white" />
            </div>
            <span className="hidden text-base font-bold tracking-tight sm:block">
              OfficeToolkit
            </span>
          </Link>
        )}

        {!isDashboard && (
          <div className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(link.href + "/")
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "relative rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {link.label}
                </Link>
              )
            })}
          </div>
        )}

        <div className="flex-1" />

        <div className="hidden sm:block">
          <SearchBar />
        </div>

        <ThemeToggle />

        {!isDashboard && (
          <Link href="/dashboard">
            <Button variant="primary" size="sm">
              <LayoutDashboard className="h-4 w-4 mr-1.5" />
              Dashboard
            </Button>
          </Link>
        )}

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground md:hidden"
          aria-label="Toggle menu"
        >
          {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </motion.button>
      </nav>

      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm md:hidden"
            onClick={() => setIsMobileOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, x: "100%" }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="fixed inset-y-0 right-0 z-50 w-80 max-w-[85vw] border-l border-border bg-background shadow-2xl"
            >
              <div className="flex h-full flex-col">
                <div className="flex items-center justify-between border-b border-border px-5 py-4">
                  <Link
                    href="/"
                    className="flex items-center gap-2.5"
                    onClick={() => setIsMobileOpen(false)}
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary shadow-sm">
                      <FileText className="h-3.5 w-3.5 text-white" />
                    </div>
                    <span className="text-sm font-bold">OfficeToolkit</span>
                  </Link>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsMobileOpen(false)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </motion.button>
                </div>

                <div className="flex-1 overflow-y-auto px-3 py-4">
                  <div className="mb-4 sm:hidden">
                    <SearchBar />
                  </div>
                  <div className="space-y-1">
                    {navLinks.map((link, i) => {
                      const isActive = pathname === link.href
                      return (
                        <motion.div
                          key={link.href}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                        >
                          <Link
                            href={link.href}
                            onClick={() => setIsMobileOpen(false)}
                            className={cn(
                              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                              isActive
                                ? "bg-primary/10 text-primary"
                                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                            )}
                          >
                            {link.label}
                          </Link>
                        </motion.div>
                      )
                    })}
                  </div>
                </div>

                <div className="border-t border-border p-4">
                  <Link
                    href="/dashboard"
                    onClick={() => setIsMobileOpen(false)}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-white bg-primary"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
