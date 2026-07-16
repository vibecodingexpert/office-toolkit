"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"

export function CTA() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-violet-500/10 to-transparent dark:from-primary/15 dark:via-violet-500/10" />

      <div className="absolute inset-0 overflow-hidden [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]">
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }}
        className="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8"
      >
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 dark:bg-primary/20">
          <Sparkles className="h-7 w-7 text-primary" />
        </div>

        <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          Ready to supercharge your productivity?
        </h2>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          Join thousands of professionals who use Office Toolkit Pro to get
          more done in less time. Start for free, no credit card required.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/signup">
            <Button variant="primary" size="xl">
              Get Started Free
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          <Link href="/pricing">
            <Button variant="outline" size="xl">
              View Pricing
            </Button>
          </Link>
        </div>
      </motion.div>
    </section>
  )
}
