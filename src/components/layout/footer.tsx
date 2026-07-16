"use client"

import Link from "next/link"
import { FileText, Heart } from "lucide-react"

const productLinks = [
  { label: "Tools", href: "/tools" },
  { label: "Dashboard", href: "/dashboard" },
]

const resourceLinks = [
  { label: "Features", href: "/features" },
  { label: "About", href: "/about" },
]

const legalLinks = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
]

const linkSections = [
  { title: "Product", links: productLinks },
  { title: "Resources", links: resourceLinks },
  { title: "Legal", links: legalLinks },
]

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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
                      className="text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">
              Company
            </h4>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-sm">
                <FileText className="h-4 w-4 text-white" />
              </div>
              <span className="text-base font-bold">OfficeToolkit</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Your complete office suite for documents, images, and more.
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-border py-8 sm:flex-row">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>&copy; {new Date().getFullYear()} OfficeToolkit.</span>
            <span className="hidden sm:inline">All rights reserved.</span>
            <span className="hidden items-center gap-1 sm:flex">
              Made with <Heart className="h-3 w-3 fill-primary text-primary" />
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
