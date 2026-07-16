"use client"

import { motion } from "framer-motion"
import { LayoutGrid, Sparkles, Users, Shield, Monitor, Code2 } from "lucide-react"

const features = [
  {
    icon: LayoutGrid,
    title: "100+ Professional Tools",
    description: "Access a comprehensive suite of PDF, image, document, developer, audio, video, and utility tools in one place.",
  },
  {
    icon: Sparkles,
    title: "AI-Powered Features",
    description: "Leverage cutting-edge AI for background removal, image enhancement, content generation, and smart translations.",
  },
  {
    icon: Users,
    title: "Real-Time Collaboration",
    description: "Work together with your team in real-time. Share files, edit simultaneously, and streamline your workflows.",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Bank-grade encryption, secure file processing, automatic deletion after 24 hours, and full GDPR compliance.",
  },
  {
    icon: Monitor,
    title: "Cross-Platform Access",
    description: "Works flawlessly on desktop, tablet, and mobile. No downloads needed — access directly from your browser.",
  },
  {
    icon: Code2,
    title: "Developer API Access",
    description: "Integrate our tools into your own applications with a powerful REST API and comprehensive documentation.",
  },
]

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
                className="group rounded-xl border border-border bg-card p-6 transition-shadow hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
