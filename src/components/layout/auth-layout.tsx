"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils/cn"
import { Sparkles } from "lucide-react"

interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  subtitle?: string
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-background overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-background pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative w-full max-w-md px-4 py-8"
      >
        <div className="flex flex-col items-center">
          <Link href="/" className="flex items-center gap-2.5 mb-8 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-violet-500 shadow-lg shadow-primary/20 group-hover:shadow-primary/30 transition-shadow">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              Office Toolkit<span className="text-primary"> Pro</span>
            </span>
          </Link>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-2 text-sm text-muted-foreground">
                {subtitle}
              </p>
            )}
          </div>

          <div className="w-full">
            {children}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
