"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { categories } from "@/lib/utils/tools-data"
import { Button } from "@/components/ui/button"
import { ArrowRight, Puzzle, type LucideIcon } from "lucide-react"
import * as Icons from "lucide-react"

const iconMap: Record<string, LucideIcon> = {
  FileText: Icons.FileText,
  Image: Icons.Image,
  File: Icons.File,
  Code: Icons.Code,
  Video: Icons.Video,
  Music: Icons.Music,
  Briefcase: Icons.Briefcase,
  Building2: Icons.Building2,
  Sparkles: Icons.Sparkles,
  Shield: Icons.Shield,
  Wrench: Icons.Wrench,
}

export function CategoriesShowcase() {
  return (
    <section id="categories" className="relative py-24 sm:py-32 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Browse by category
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Find exactly what you need with our organized tool collections.
          </p>
        </motion.div>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          transition={{ staggerChildren: 0.06 }}
          className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {categories.slice(0, 8).map((category) => {
            const Icon = iconMap[category.icon] || Puzzle
            return (
              <motion.div
                key={category.id}
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
                }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
              >
                <Link
                  href={`/tools?category=${category.id}`}
                  className="group flex items-center gap-4 rounded-xl border border-border bg-card p-5 transition-all hover:shadow-md hover:shadow-primary/5"
                >
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                    style={{ backgroundColor: `${category.color}15` }}
                  >
                    <Icon className="h-6 w-6 transition-transform group-hover:scale-110" style={{ color: category.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-foreground truncate">{category.name}</h3>
                    <p className="mt-0.5 text-xs text-muted-foreground">{category.toolCount} tools</p>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0.5" style={{ color: category.color }} />
                </Link>
              </motion.div>
            )
          })}
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-10 text-center"
        >
          <Link href="/tools">
            <Button variant="outline" size="lg">
              Browse All Tools
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
