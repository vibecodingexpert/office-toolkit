"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { testimonials } from "@/lib/utils/tools-data"
import { cn } from "@/lib/utils/cn"
import { Star, ChevronLeft, ChevronRight } from "lucide-react"

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={cn("h-4 w-4", i < rating ? "fill-amber-400 text-amber-400" : "fill-muted text-muted")} />
      ))}
    </div>
  )
}

export function Testimonials() {
  const [current, setCurrent] = React.useState(0)
  const [isPaused, setIsPaused] = React.useState(false)
  const timeoutRef = React.useRef<ReturnType<typeof setInterval> | null>(null)

  const next = React.useCallback(() => {
    setCurrent((prev) => (prev + 1) % testimonials.length)
  }, [])

  const prev = React.useCallback(() => {
    setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }, [])

  React.useEffect(() => {
    if (isPaused) return
    timeoutRef.current = setInterval(next, 5000)
    return () => { if (timeoutRef.current) clearInterval(timeoutRef.current) }
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
            Hear from the people who use Office Toolkit Pro every day.
          </p>
        </motion.div>
        <div
          className="relative mt-16 mx-auto max-w-3xl"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
                  <StarRating rating={testimonials[current].rating} />
                  <blockquote className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
                    &ldquo;{testimonials[current].content}&rdquo;
                  </blockquote>
                  <div className="mt-6 flex items-center gap-3 border-t border-border pt-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-cyan-500 text-xs font-bold text-primary-foreground">
                      {testimonials[current].name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-foreground">{testimonials[current].name}</div>
                      <div className="text-xs text-muted-foreground">{testimonials[current].role}, {testimonials[current].company}</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="mt-8 flex items-center justify-center gap-3">
            <button
              onClick={prev}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={cn("h-2 rounded-full transition-all", i === current ? "w-8 bg-primary" : "w-2 bg-border hover:bg-muted-foreground/30")}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>
            <button
              onClick={next}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              aria-label="Next testimonial"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
