"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { pricingPlans } from "@/lib/utils/tools-data"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils/cn"
import { Check, CreditCard } from "lucide-react"

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  }),
}

export function Pricing() {
  const [isYearly, setIsYearly] = React.useState(false)

  const getPrice = (plan: (typeof pricingPlans)[0]) => {
    if (plan.price === 0) return "Free"
    const monthlyPrice = plan.price
    const displayPrice = isYearly ? monthlyPrice * 10 : monthlyPrice
    return `$${displayPrice}`
  }

  return (
    <section id="pricing" className="relative py-24 sm:py-32 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Start for free, upgrade when you need more power.
            No hidden fees, no surprises.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="mt-10 flex items-center justify-center gap-4"
        >
          <span
            className={cn(
              "text-sm font-medium transition-colors",
              !isYearly ? "text-foreground" : "text-muted-foreground"
            )}
          >
            Monthly
          </span>
          <button
            onClick={() => setIsYearly(!isYearly)}
            className={cn(
              "relative h-7 w-12 rounded-full transition-colors",
              isYearly ? "bg-primary" : "bg-border"
            )}
            aria-label="Toggle billing period"
          >
            <span
              className={cn(
                "absolute left-0.5 top-0.5 h-6 w-6 rounded-full bg-background shadow-sm transition-transform",
                isYearly && "translate-x-5"
              )}
            />
          </button>
          <span
            className={cn(
              "text-sm font-medium transition-colors",
              isYearly ? "text-foreground" : "text-muted-foreground"
            )}
          >
            Yearly
          </span>
          {isYearly && (
            <Badge variant="success" size="sm" animated dot>
              Save 17%
            </Badge>
          )}
        </motion.div>

        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          {pricingPlans.map((plan, i) => (
            <motion.div
              key={plan.id}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={cardVariants}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className={cn(
                "relative flex flex-col rounded-2xl border p-8 transition-shadow",
                plan.highlighted
                  ? "border-primary/50 bg-card shadow-lg shadow-primary/10"
                  : "border-border bg-card"
              )}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge variant="popular" size="lg" animated dot>
                    {plan.badge}
                  </Badge>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-foreground">
                  {plan.name}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {plan.description}
                </p>
              </div>

              <div className="mb-8">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold tracking-tight text-foreground">
                    {getPrice(plan)}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-sm text-muted-foreground">
                      /{isYearly ? "year" : "month"}
                    </span>
                  )}
                </div>
              </div>

              <ul className="mb-8 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <a href={plan.price === 0 ? "/tools" : "/signup"}>
                <Button
                  variant={plan.highlighted ? "primary" : "outline"}
                  size="lg"
                  fullWidth
                >
                  {plan.price === 0 ? "Get Started" : "Subscribe"}
                  <CreditCard className="h-4 w-4" />
                </Button>
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
