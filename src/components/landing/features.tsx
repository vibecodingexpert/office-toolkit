"use client"

import { motion } from "framer-motion"
import {
  LayoutGrid,
  Sparkles,
  Users,
  Shield,
  Monitor,
  Code2,
} from "lucide-react"

const features = [
  {
    icon: LayoutGrid,
    title: "100+ Professional Tools",
    description:
      "Access a comprehensive suite of PDF, image, document, developer, audio, video, and utility tools — all in one platform.",
    gradient: "from-primary/20 to-violet-500/20",
    iconColor: "text-primary",
  },
  {
    icon: Sparkles,
    title: "AI-Powered Features",
    description:
      "Leverage cutting-edge AI for background removal, image enhancement, content generation, grammar fixing, and smart translations.",
    gradient: "from-amber-500/20 to-orange-500/20",
    iconColor: "text-amber-500",
  },
  {
    icon: Users,
    title: "Real-Time Collaboration",
    description:
      "Work together with your team in real-time. Share files, edit documents simultaneously, and streamline your workflows.",
    gradient: "from-emerald-500/20 to-teal-500/20",
    iconColor: "text-emerald-500",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description:
      "Bank-grade encryption, secure file processing, automatic deletion after 24 hours, and full GDPR compliance.",
    gradient: "from-cyan-500/20 to-blue-500/20",
    iconColor: "text-cyan-500",
  },
  {
    icon: Monitor,
    title: "Cross-Platform Access",
    description:
      "Works flawlessly on desktop, tablet, and mobile. No downloads needed — access all tools directly from your browser.",
    gradient: "from-purple-500/20 to-pink-500/20",
    iconColor: "text-purple-500",
  },
  {
    icon: Code2,
    title: "Developer API Access",
    description:
      "Integrate our tools into your own applications with a powerful REST API. Extensive documentation and SDKs available.",
    gradient: "from-rose-500/20 to-red-500/20",
    iconColor: "text-rose-500",
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
}

export function Features() {
  return (
    <section id="features" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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
            A complete toolkit designed for professionals who demand the best.
            No fluff, just powerful tools that work.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                variants={cardVariants}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card p-8 transition-shadow hover:shadow-lg hover:shadow-primary/5"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 transition-opacity group-hover:opacity-100`}
                />
                <div className="relative z-10">
                  <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-secondary ${feature.iconColor}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-3 text-lg font-semibold text-foreground">
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
