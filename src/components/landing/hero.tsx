"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sparkles, ArrowRight, Zap, Shield, Users } from "lucide-react"

const stats = [
  { value: "100+", label: "Professional Tools", icon: Zap },
  { value: "10K+", label: "Active Users", icon: Users },
  { value: "99.9%", label: "Uptime Guarantee", icon: Shield },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
}

const statVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.8 + i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  }),
}

function FloatingOrb({ className, delay = 0, style }: { className: string; delay?: number; style?: React.CSSProperties }) {
  return (
      <motion.div
        className={`absolute rounded-full mix-blend-multiply dark:mix-blend-screen ${className}`}
        style={style}
        animate={{
          x: [0, 30, -20, 0],
          y: [0, -40, 20, 0],
          scale: [1, 1.1, 0.95, 1],
        }}
        transition={{
          duration: 8,
          delay,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
  )
}

function AnimatedGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(129,140,248,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(129,140,248,0.05)_1px,transparent_1px)]" style={{ backgroundSize: '64px 64px' }} />
    </div>
  )
}

export function Hero() {
  const [counter, setCounter] = React.useState({ tools: 0, users: 0, uptime: 0 })

  React.useEffect(() => {
    const duration = 2000
    const steps = 60
    const interval = duration / steps
    let step = 0

    const timer = setInterval(() => {
      step++
      const progress = step / steps
      const easeOut = 1 - Math.pow(1 - progress, 3)
      setCounter({
        tools: Math.round(easeOut * 100),
        users: Math.round(easeOut * 10000),
        uptime: Math.round(easeOut * 999) / 10,
      })
      if (step >= steps) clearInterval(timer)
    }, interval)

    return () => clearInterval(timer)
  }, [])

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-background pt-16">
      <AnimatedGrid />

      <FloatingOrb
        className="h-72 w-72 bg-primary/20 dark:bg-primary/10 blur-3xl"
        style={{ top: '10%', left: '5%' }}
      />
      <FloatingOrb
        className="h-96 w-96 bg-violet-500/20 dark:bg-violet-500/10 blur-3xl"
        style={{ bottom: '10%', right: '5%' }}
        delay={2}
      />
      <FloatingOrb
        className="h-64 w-64 bg-amber-500/15 dark:bg-amber-500/10 blur-3xl"
        style={{ top: '40%', left: '50%' }}
        delay={4}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mx-auto max-w-4xl text-center"
        >
          <motion.div variants={itemVariants} className="mb-6 flex justify-center">
            <Badge variant="pro" size="lg" animated dot>
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              Now with AI-Powered Tools
            </Badge>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
          >
            <span className="text-foreground">All-in-One </span>
            <span className="text-gradient">Productivity Suite</span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl"
          >
            Over <span className="font-semibold text-foreground">100+ professional tools</span> for PDFs,
            images, documents, development, AI, security, and more. Convert, edit, and transform
            your files instantly — all in one place.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Link href="/signup">
              <Button variant="primary" size="xl">
                Get Started Free
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/tools">
              <Button variant="outline" size="xl">
                Explore Tools
              </Button>
            </Link>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3"
          >
            {stats.map((stat, i) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={stat.label}
                  custom={i}
                  initial="hidden"
                  animate="visible"
                  variants={statVariants}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 dark:bg-primary/20">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-3xl font-bold tracking-tight text-foreground">
                    {stat.label === "100+ Tools" || stat.label === "Professional Tools"
                      ? `${counter.tools}+`
                      : stat.label === "Active Users"
                      ? `${counter.users.toLocaleString()}+`
                      : `${counter.uptime}%`}
                  </div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </motion.div>
              )
            })}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
