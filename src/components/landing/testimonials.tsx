"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { testimonials } from "@/lib/utils/tools-data"
import { cn } from "@/lib/utils/cn"
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react"

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "h-4 w-4",
            i < rating
              ? "fill-amber-400 text-amber-400"
              : "fill-muted text-muted"
          )}
        />
      ))}
    </div>
  )
}

function TestimonialCard({
  testimonial,
  index,
}: {
  testimonial: (typeof testimonials)[0]
  index: number
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] as const }}
      className="flex h-full flex-col rounded-2xl border border-border bg-card p-6 sm:p-8"
    >
      <div className="mb-4 flex items-center gap-1">
        <StarRating rating={testimonial.rating} />
      </div>
      <blockquote className="flex-1 text-sm leading-relaxed text-muted-foreground sm:text-base">
        <Quote className="mb-2 h-5 w-5 text-primary/40" />
        &ldquo;{testimonial.content}&rdquo;
      </blockquote>
      <div className="mt-6 flex items-center gap-3 border-t border-border pt-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-violet-500 text-xs font-bold text-primary-foreground">
          {testimonial.name
            .split(" ")
            .map((n) => n[0])
            .join("")}
        </div>
        <div>
          <div className="text-sm font-semibold text-foreground">
            {testimonial.name}
          </div>
          <div className="text-xs text-muted-foreground">
            {testimonial.role}, {testimonial.company}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export function Testimonials() {
  const [current, setCurrent] = React.useState(0)
  const [isPaused, setIsPaused] = React.useState(false)
  const timeoutRef = React.useRef<ReturnType<typeof setInterval> | null>(null)

  const [visibleCount, setVisibleCount] = React.useState(1)
  React.useEffect(() => {
    const update = () => setVisibleCount(window.innerWidth >= 1024 ? 3 : window.innerWidth >= 640 ? 2 : 1)
    update()
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [])
  const totalSlides = Math.max(0, testimonials.length - visibleCount)
  const maxIndex = Math.min(current, totalSlides)

  const next = React.useCallback(() => {
    setCurrent((prev) => (prev >= totalSlides ? 0 : prev + 1))
  }, [totalSlides])

  const prev = React.useCallback(() => {
    setCurrent((prev) => (prev <= 0 ? totalSlides : prev - 1))
  }, [totalSlides])

  React.useEffect(() => {
    if (isPaused) return
    timeoutRef.current = setInterval(next, 5000)
    return () => {
      if (timeoutRef.current) clearInterval(timeoutRef.current)
    }
  }, [isPaused, next])

  return (
    <section id="testimonials" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Loved by professionals
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Hear from the people who use Office Toolkit Pro every day to
            get their work done.
          </p>
        </motion.div>

        <div
          className="relative mt-16"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="overflow-hidden">
            <AnimatePresence mode="popLayout">
              <motion.div
                key={current}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] as const }}
                className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
              >
                {testimonials
                  .slice(maxIndex, maxIndex + visibleCount)
                  .map((testimonial, i) => (
                    <TestimonialCard
                      key={testimonial.id}
                      testimonial={testimonial}
                      index={i}
                    />
                  ))}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-8 flex items-center justify-center gap-3">
            <button
              onClick={prev}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              aria-label="Previous testimonials"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="flex gap-2">
              {Array.from({ length: totalSlides + 1 }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={cn(
                    "h-2 rounded-full transition-all",
                    i === maxIndex
                      ? "w-8 bg-primary"
                      : "w-2 bg-border hover:bg-muted-foreground/30"
                  )}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
            <button
              onClick={next}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              aria-label="Next testimonials"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
