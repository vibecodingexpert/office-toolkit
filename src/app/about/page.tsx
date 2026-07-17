"use client"

import { motion } from "framer-motion"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Shield, Users, Globe, Zap, Heart, Sparkles } from "lucide-react"

const values = [
  { icon: Shield, title: "Security First", description: "Every file processed on our platform is encrypted with AES-256 in transit and at rest. We automatically delete all uploaded files within 24 hours." },
  { icon: Users, title: "User-Focused", description: "We build tools that solve real problems. Every feature is designed with the user experience as the top priority." },
  { icon: Globe, title: "Global Access", description: "Available worldwide with support for multiple languages. No downloads, no installations — just a browser." },
  { icon: Zap, title: "Lightning Fast", description: "Our optimized infrastructure ensures your files are processed in seconds, not minutes." },
  { icon: Heart, title: "Always Free", description: "We believe powerful tools should be accessible to everyone. No hidden fees, no credit card required." },
  { icon: Sparkles, title: "Constant Innovation", description: "We continuously add new tools and features based on user feedback and emerging technologies." },
]

const timeline = [
  { year: "2023", event: "Office Toolkit Pro founded with a mission to make professional tools accessible to everyone" },
  { year: "2024", event: "Launched 50+ tools including PDF, image, and document utilities serving 10,000+ users" },
  { year: "2025", event: "Expanded to 100+ tools with AI features, developer tools, and enterprise-grade security" },
  { year: "2026", event: "Reached 186 professional tools across 11 categories with millions of files processed" },
]

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 pt-16">
        <section className="relative py-24">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-cyan-500/5" />
          <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                About <span className="text-primary">Office Toolkit Pro</span>
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground max-w-2xl mx-auto">
                We are on a mission to provide everyone with professional-grade productivity tools without the enterprise price tag. What started as a collection of PDF utilities has grown into one of the most comprehensive free office toolkits available online.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="py-16 border-t border-border">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-bold text-foreground">Our Story</h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Office Toolkit Pro was created to solve a simple problem: professional productivity tools should not require expensive subscriptions. We saw how individuals, freelancers, and small businesses struggled with the cost of tools like Adobe Acrobat, Canva Pro, and other premium suites. Our team set out to build a free alternative that rivals — and in many ways exceeds — the capabilities of paid tools.
              </p>
            </div>
            <div className="mt-16 space-y-8 max-w-3xl mx-auto">
              {timeline.map((item, i) => (
                <motion.div key={item.year} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="flex gap-6">
                  <div className="flex flex-col items-center">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">{item.year.slice(-2)}</div>
                    {i < timeline.length - 1 && <div className="mt-2 h-full w-px bg-border" />}
                  </div>
                  <div className="pb-8 pt-1">
                    <p className="text-foreground font-medium">{item.year}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{item.event}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-muted/30 border-t border-border">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold text-foreground">Our Values</h2>
              <p className="mt-4 text-muted-foreground">The principles that guide everything we build.</p>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {values.map((value) => {
                const Icon = value.icon
                return (
                  <motion.div key={value.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="rounded-xl border border-border bg-card p-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 mb-4">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground">{value.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{value.description}</p>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
