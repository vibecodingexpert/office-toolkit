"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { LayoutGrid, Sparkles, Users, Shield, Monitor, Code2 } from "lucide-react"
import { cn } from "@/lib/utils/cn"

const features = [
  {
    icon: LayoutGrid,
    title: "100+ Professional Tools",
    description: "Access a comprehensive suite of PDF, image, document, developer, audio, video, and utility tools in one place.",
    gradient: "from-primary/20 via-primary/10 to-transparent",
    iconGradient: "from-primary to-violet-500",
  },
  {
    icon: Sparkles,
    title: "AI-Powered Features",
    description: "Leverage cutting-edge AI for background removal, image enhancement, content generation, and smart translations.",
    gradient: "from-cyan-500/20 via-cyan-500/10 to-transparent",
    iconGradient: "from-cyan-500 to-blue-500",
  },
  {
    icon: Users,
    title: "Real-Time Collaboration",
    description: "Work together with your team in real-time. Share files, edit simultaneously, and streamline your workflows.",
    gradient: "from-emerald-500/20 via-emerald-500/10 to-transparent",
    iconGradient: "from-emerald-500 to-teal-500",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Bank-grade encryption, secure file processing, automatic deletion after 24 hours, and full GDPR compliance.",
    gradient: "from-violet-500/20 via-violet-500/10 to-transparent",
    iconGradient: "from-violet-500 to-purple-500",
  },
  {
    icon: Monitor,
    title: "Cross-Platform Access",
    description: "Works flawlessly on desktop, tablet, and mobile. No downloads needed — access directly from your browser.",
    gradient: "from-amber-500/20 via-amber-500/10 to-transparent",
    iconGradient: "from-amber-500 to-orange-500",
  },
  {
    icon: Code2,
    title: "Developer API Access",
    description: "Integrate our tools into your own applications with a powerful REST API and comprehensive documentation.",
    gradient: "from-rose-500/20 via-rose-500/10 to-transparent",
    iconGradient: "from-rose-500 to-pink-500",
  },
]

export function Features() {
  return (
    <section id="features" className="relative py-24 sm:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.02] to-transparent" />
      <div className="absolute top-1/3 left-1/4 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute bottom-1/3 right-1/4 h-64 w-64 rounded-full bg-cyan-500/5 blur-3xl" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Everything you need to be productive
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            A complete toolkit designed for professionals who demand the best. No fluff, just powerful tools that work.
          </p>
        </motion.div>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          transition={{ staggerChildren: 0.1 }}
          className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                variants={{
                  hidden: { opacity: 0, y: 40 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
                }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="group relative rounded-xl border border-border bg-card p-6 transition-all duration-200 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20"
              >
                <div
                  className={cn(
                    "absolute inset-0 rounded-xl bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                    feature.gradient
                  )}
                />
                <div className="relative">
                  <div className={cn(
                    "mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm ring-1 ring-white/10 transition-transform group-hover:scale-110 group-hover:shadow-md",
                    feature.iconGradient
                  )}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
