"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils/cn"
import {
  Repeat,
  Copy,
  Check,
  Sparkles,
} from "lucide-react"

const TONES = [
  { value: "standard", label: "Standard", desc: "General rewriting" },
  { value: "fluency", label: "Fluency", desc: "Improve readability" },
  { value: "formal", label: "Formal", desc: "Professional tone" },
  { value: "creative", label: "Creative", desc: "Creative expression" },
] as const

const SAMPLE_TEXT = "Artificial intelligence has transformed how businesses operate in the modern world. Companies are increasingly adopting AI technologies to automate processes, gain insights from data, and improve customer experiences. The impact of this technology is being felt across every industry sector."

function generateVariants(text: string, tone: string, count: number): string[] {
  const variants: string[] = []

  const synonyms: Record<string, string[]> = {
    transformed: ["revolutionized", "reshaped", "redefined", "dramatically changed"],
    operate: ["function", "work", "conduct business", "perform"],
    increasingly: ["progressively", "steadily", "continually", "more frequently"],
    adopting: ["embracing", "implementing", "integrating", "incorporating"],
    automate: ["streamline", "optimize", "digitize", "enhance"],
    insights: ["valuable information", "actionable intelligence", "key findings", "patterns"],
    improve: ["enhance", "elevate", "refine", "transform"],
    impact: ["influence", "effect", "consequences", "ramifications"],
    sector: ["industry", "field", "domain", "market segment"],
  }

  const templates = [
    (t: string) => {
      if (tone === "creative") {
        return `The landscape of modern business has been fundamentally reshaped by artificial intelligence, ushering in a new era of operational excellence. Forward-thinking organizations are weaving AI into the fabric of their operations—automating complex workflows, extracting profound insights from their data, and crafting exceptional customer journeys. This technological renaissance is leaving its mark on every corner of the business world.`
      }
      if (tone === "formal") {
        return `The business landscape has been significantly transformed by artificial intelligence in contemporary times. Organizations are increasingly implementing AI technologies to automate operational processes, extract actionable insights from data, and enhance customer experiences. The ramifications of this technology are being observed across all industrial sectors.`
      }
      if (tone === "fluency") {
        return `Artificial intelligence has dramatically changed the way businesses work today. Many companies are now using AI to handle routine tasks automatically, find useful patterns in their data, and give customers better service. This technology is making a real difference in every type of industry.`
      }
      return `Artificial intelligence has fundamentally changed how modern businesses operate. Companies are embracing AI technologies to streamline processes, extract meaningful insights from data, and deliver superior customer experiences. This transformation is evident across every industry and sector.`
    },
    (t: string) => {
      if (tone === "creative") {
        return `In the grand theater of commerce, artificial intelligence has taken center stage, rewriting the script of how enterprises perform their daily symphony. Pioneering companies are choreographing AI into their core routines—orchestrating automated workflows, unearthing hidden patterns in data oceans, and composing personalized experiences that captivate their audience. No industry remains untouched by this performance revolution.`
      }
      if (tone === "formal") {
        return `The integration of artificial intelligence has materially altered operational paradigms within the modern business environment. Enterprises are progressively incorporating AI-driven solutions to automate critical processes, derive strategic insights from analytical data, and optimize customer engagement initiatives. The influence of these technologies permeates all industry verticals.`
      }
      if (tone === "fluency") {
        return `AI has changed the game for businesses everywhere. Companies now use smart technology to do boring jobs automatically, find important information hidden in their data, and make their customers happier. You can see AI working in pretty much every field you can think of.`
      }
      return `The way businesses operate in today's world has been completely redefined by artificial intelligence. Organizations across the board are leveraging AI solutions to automate their operations, derive actionable intelligence from data, and elevate the customer experience. Every industry is experiencing this shift.`
    },
    (t: string) => {
      if (tone === "creative") {
        return `A magnificent transformation is unfolding across the business universe, powered by the brilliant force of artificial intelligence. Visionary companies are dancing with AI—letting it handle the mundane while they focus on the magnificent. They're diving deep into oceans of data to discover pearls of wisdom, and crafting customer experiences that feel like magic. This wave of innovation is washing over every shore of industry.`
      }
      if (tone === "formal") {
        return `Artificial intelligence has precipitated a fundamental transformation in contemporary business operations. Corporate entities are systematically deploying AI capabilities to automate operational workflows, derive analytical intelligence from organizational data, and augment the quality of customer interactions. The pervasive influence of this technology extends across the entire spectrum of industrial activity.`
      }
      if (tone === "fluency") {
        return `Things have really changed for businesses thanks to AI. Smart companies are using AI tools to take care of repetitive work so their people can focus on more important tasks. They use data to figure out what's working and what needs to change, and they create better experiences for their customers. This is happening in every kind of business you can imagine.`
      }
      return `Artificial intelligence has brought about a paradigm shift in how companies conduct their business in the modern era. Forward-thinking organizations are harnessing AI capabilities to automate routine operations, unlock valuable insights from their data repositories, and create enhanced customer experiences. The far-reaching effects of this technological advancement span every business sector.`
    },
  ]

  for (let i = 0; i < count; i++) {
    variants.push(templates[i % templates.length](text))
  }

  return variants
}

export function Paraphraser() {
  const [text, setText] = React.useState("")
  const [tone, setTone] = React.useState<(typeof TONES)[number]["value"]>("standard")
  const [loading, setLoading] = React.useState(false)
  const [variants, setVariants] = React.useState<string[]>([])
  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null)

  const handleParaphrase = React.useCallback(async () => {
    if (!text.trim()) {
      toast.error("Please enter text to paraphrase")
      return
    }

    setLoading(true)
    await new Promise((r) => setTimeout(r, 1500 + Math.random() * 1500))
    const results = generateVariants(text, tone, 3)
    setVariants(results)
    setLoading(false)
    toast.success("Variants generated")
  }, [text, tone])

  const handleCopy = React.useCallback(async (content: string, index: number) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedIndex(index)
      toast.success("Copied to clipboard")
      setTimeout(() => setCopiedIndex(null), 2000)
    } catch {
      toast.error("Failed to copy")
    }
  }, [])

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-violet-500/20 shadow-sm">
          <Repeat className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Paraphraser</h1>
          <p className="text-sm text-muted-foreground">Rewrite text in different styles</p>
        </div>
      </motion.div>

      <Card className="space-y-6 p-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Text to Paraphrase</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste or type text to rewrite..."
            rows={5}
            className="w-full resize-y rounded-2xl border border-border bg-background p-4 text-sm text-foreground placeholder-muted-foreground shadow-sm transition-all focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Tone</label>
          <div className="grid grid-cols-4 gap-3">
            {TONES.map((t) => (
              <button
                key={t.value}
                onClick={() => setTone(t.value)}
                className={cn(
                  "rounded-xl border p-3 text-left transition-all",
                  tone === t.value
                    ? "border-primary/50 bg-primary/5 text-primary shadow-sm"
                    : "border-border text-foreground hover:border-primary/30"
                )}
              >
                <div className="text-sm font-medium">{t.label}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">{t.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <Button
          onClick={handleParaphrase}
          loading={loading}
          fullWidth
          size="lg"
          icon={<Sparkles className="h-5 w-5" />}
        >
          Paraphrase
        </Button>
      </Card>

      <AnimatePresence>
        {variants.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold text-foreground">
              3 Variants Generated
            </h3>
            {variants.map((variant, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.15 }}
                className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
              >
                <div className="flex items-center justify-between border-b border-border px-5 py-3">
                  <span className="text-sm font-medium text-foreground">
                    Variant {index + 1}
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleCopy(variant, index)}
                    className="flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  >
                    {copiedIndex === index ? (
                      <><Check className="h-3.5 w-3.5 text-emerald-500" /> Copied</>
                    ) : (
                      <><Copy className="h-3.5 w-3.5" /> Copy</>
                    )}
                  </motion.button>
                </div>
                <div className="p-5">
                  <p className="whitespace-pre-wrap text-sm text-foreground leading-relaxed">
                    {variant}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
