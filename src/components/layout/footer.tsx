"use client"

import Link from "next/link"
import { cn } from "@/lib/utils/cn"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Code2,
  AtSign,
  Briefcase,
  Mail,
  Heart,
  Sparkles,
} from "lucide-react"

const productLinks = [
  { label: "Features", href: "/features" },
  { label: "Pricing", href: "/pricing" },
  { label: "Integrations", href: "/integrations" },
  { label: "API", href: "/api" },
  { label: "Changelog", href: "/changelog" },
]

const toolLinks = [
  { label: "PDF Tools", href: "/tools?category=pdf" },
  { label: "Image Tools", href: "/tools?category=image" },
  { label: "Document Tools", href: "/tools?category=document" },
  { label: "Developer Tools", href: "/tools?category=developer" },
  { label: "AI Tools", href: "/tools?category=ai" },
  { label: "Security Tools", href: "/tools?category=security" },
]

const companyLinks = [
  { label: "About", href: "/about" },
  { label: "Blog", href: "/blog" },
  { label: "Careers", href: "/careers" },
  { label: "Contact", href: "/contact" },
  { label: "Partners", href: "/partners" },
]

const legalLinks = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Cookie Policy", href: "/cookies" },
  { label: "GDPR", href: "/gdpr" },
  { label: "DMCA", href: "/dmca" },
]

const socialLinks = [
  { label: "GitHub", icon: Code2, href: "https://github.com" },
  { label: "Twitter", icon: AtSign, href: "https://twitter.com" },
  { label: "LinkedIn", icon: Briefcase, href: "https://linkedin.com" },
  { label: "Email", icon: Mail, href: "mailto:hello@officetoolkitpro.com" },
]

const linkSections = [
  { title: "Product", links: productLinks },
  { title: "Tools", links: toolLinks },
  { title: "Company", links: companyLinks },
  { title: "Legal", links: legalLinks },
]

export function Footer() {
  return (
    <footer className="relative border-t border-border bg-background">
      {/* Gradient divider */}
      <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Newsletter */}
        <div className="border-b border-border py-12">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-violet-500/20">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-2xl font-bold tracking-tight text-foreground">
              Stay in the loop
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Get product updates, new tool announcements, and productivity tips
              delivered to your inbox.
            </p>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="mx-auto mt-6 flex max-w-md gap-3"
            >
              <Input
                type="email"
                placeholder="Enter your email"
                className="flex-1"
                required
              />
              <Button type="submit" variant="primary">
                Subscribe
              </Button>
            </form>
          </div>
        </div>

        {/* Links grid */}
        <div className="grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
          {linkSections.map((section) => (
            <div key={section.title}>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-border py-8 sm:flex-row">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-primary to-violet-500 shadow-sm">
              <Sparkles className="h-3 w-3 text-white" />
            </div>
            <span>&copy; {new Date().getFullYear()} Office Toolkit Pro.</span>
            <span className="hidden sm:inline">All rights reserved.</span>
            <span className="hidden items-center gap-1 sm:flex">
              Made with <Heart className="h-3 w-3 fill-primary text-primary" /> by
              the OTP team.
            </span>
          </div>

          <div className="flex items-center gap-3">
            {socialLinks.map((social) => {
              const Icon = social.icon
              return (
                <Link
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground hover:bg-accent"
                  aria-label={social.label}
                >
                  <Icon className="h-4 w-4" />
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </footer>
  )
}
