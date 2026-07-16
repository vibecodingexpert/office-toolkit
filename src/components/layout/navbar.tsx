"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils/cn"
import { SearchBar } from "@/components/ui/search-bar"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Menu,
  X,
  LayoutDashboard,
  Cog,
  LogOut,
  User,
  Sparkles,
} from "lucide-react"

const navLinks = [
  { href: "/tools", label: "Tools" },
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
]

export function Navbar() {
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = React.useState(false)
  const [isMobileOpen, setIsMobileOpen] = React.useState(false)
  const [isLoggedIn, setIsLoggedIn] = React.useState(false)

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
        "fixed inset-x-0 top-0 z-40 h-16 transition-all duration-300",
        isScrolled
          ? "glass border-b border-border shadow-sm"
          : "bg-transparent"
      )}
    >
      <nav className="mx-auto flex h-full max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5 mr-6"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-violet-500 shadow-sm">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="hidden text-base font-bold tracking-tight sm:block">
            Office Toolkit<span className="text-primary"> Pro</span>
          </span>
        </Link>

        {/* Desktop nav links */}
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
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="nav-indicator"
                    className="absolute inset-0 rounded-lg bg-accent"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{link.label}</span>
              </Link>
            )
          })}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Search bar */}
        <div className="hidden sm:block">
          <SearchBar />
        </div>

        {/* Theme toggle */}
        <ThemeToggle />

        {/* Auth section */}
        {isLoggedIn ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="outline-none"
              >
                <Avatar
                  size="sm"
                  src=""
                  alt="User"
                  fallback="JD"
                  online
                />
              </motion.button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-foreground">John Doe</span>
                  <span className="text-xs font-normal text-muted-foreground">john@example.com</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard" className="flex items-center gap-2.5">
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/profile" className="flex items-center gap-2.5">
                  <User className="h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings" className="flex items-center gap-2.5">
                  <Cog className="h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setIsLoggedIn(false)}
                className="flex items-center gap-2.5 text-destructive focus:text-destructive"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="hidden items-center gap-2 sm:flex">
            <Button variant="ghost" size="sm" onClick={() => setIsLoggedIn(true)}>
              Login
            </Button>
            <Button variant="primary" size="sm" onClick={() => setIsLoggedIn(true)}>
              Sign Up
            </Button>
          </div>
        )}

        {/* Mobile hamburger */}
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

      {/* Mobile menu overlay */}
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
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-violet-500 shadow-sm">
                      <Sparkles className="h-3.5 w-3.5 text-white" />
                    </div>
                    <span className="text-sm font-bold">
                      Office Toolkit<span className="text-primary"> Pro</span>
                    </span>
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
                                ? "bg-accent text-foreground"
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
                  {isLoggedIn ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Avatar size="sm" src="" alt="User" fallback="JD" />
                        <div>
                          <p className="text-sm font-medium text-foreground">John Doe</p>
                          <p className="text-xs text-muted-foreground">john@example.com</p>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Link
                          href="/dashboard"
                          onClick={() => setIsMobileOpen(false)}
                          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
                        >
                          <LayoutDashboard className="h-4 w-4" />
                          Dashboard
                        </Link>
                        <Link
                          href="/settings"
                          onClick={() => setIsMobileOpen(false)}
                          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
                        >
                          <Cog className="h-4 w-4" />
                          Settings
                        </Link>
                        <button
                          onClick={() => {
                            setIsLoggedIn(false)
                            setIsMobileOpen(false)
                          }}
                          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
                        >
                          <LogOut className="h-4 w-4" />
                          Log out
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        fullWidth
                        onClick={() => {
                          setIsLoggedIn(true)
                          setIsMobileOpen(false)
                        }}
                      >
                        Login
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        fullWidth
                        onClick={() => {
                          setIsLoggedIn(true)
                          setIsMobileOpen(false)
                        }}
                      >
                        Sign Up
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
