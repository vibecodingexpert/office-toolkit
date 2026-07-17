"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProgressBar } from "@/components/ui/progress-bar"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils/cn"
import {
  Repeat,
  Copy,
  Check,
  Sparkles,
} from "lucide-react"

const MODES = [
  { value: "standard", label: "Standard", desc: "General rewriting with synonyms" },
  { value: "fluency", label: "Fluency", desc: "Improve readability and flow" },
  { value: "formal", label: "Formal", desc: "Professional and academic tone" },
  { value: "creative", label: "Creative", desc: "Creative and expressive" },
  { value: "concise", label: "Concise", desc: "Shorten while preserving meaning" },
] as const

const SYNONYM_DB: Record<string, string[]> = {
  transformed: ["revolutionized", "reshaped", "redefined", "dramatically changed", "metamorphosed"],
  operate: ["function", "work", "conduct business", "perform", "run"],
  increasingly: ["progressively", "steadily", "continually", "more frequently", "ever more"],
  adopting: ["embracing", "implementing", "integrating", "incorporating", "assimilating"],
  automate: ["streamline", "optimize", "digitize", "enhance", "computerize"],
  insights: ["valuable information", "actionable intelligence", "key findings", "patterns", "revelations"],
  improve: ["enhance", "elevate", "refine", "transform", "augment"],
  impact: ["influence", "effect", "consequences", "ramifications", "footprint"],
  sector: ["industry", "field", "domain", "market segment", "vertical"],
  important: ["crucial", "vital", "paramount", "essential", "critical"],
  good: ["excellent", "outstanding", "superb", "exceptional", "remarkable"],
  big: ["substantial", "significant", "considerable", "immense", "enormous"],
  help: ["assist", "aid", "support", "facilitate", "enable"],
  use: ["utilize", "employ", "leverage", "apply", "deploy"],
  show: ["demonstrate", "illustrate", "exhibit", "reveal", "display"],
  need: ["require", "necessitate", "demand", "call for", "entail"],
  change: ["modify", "alter", "adjust", "adapt", "revise"],
  create: ["generate", "produce", "develop", "craft", "forge"],
  think: ["believe", "consider", "deem", "reckon", "contemplate"],
  find: ["discover", "uncover", "detect", "locate", "identify"],
}

function replaceWithSynonyms(text: string, density: number): string {
  const words = text.split(/\b/)
  for (let i = 0; i < words.length; i++) {
    const word = words[i].toLowerCase().replace(/[^a-z]/g, "")
    if (word.length > 3 && SYNONYM_DB[word] && Math.random() < density) {
      const synonyms = SYNONYM_DB[word]
      const replacement = synonyms[Math.floor(Math.random() * synonyms.length)]
      const isCapitalized = words[i][0] === words[i][0]?.toUpperCase()
      words[i] = isCapitalized
        ? replacement.charAt(0).toUpperCase() + replacement.slice(1)
        : replacement
    }
  }
  return words.join("")
}

function generateVariants(text: string, mode: string, count: number): string[] {
  const variants: string[] = []
  const densities: Record<string, number> = {
    standard: 0.4,
    fluency: 0.25,
    formal: 0.35,
    creative: 0.5,
    concise: 0.2,
  }
  const density = densities[mode] ?? 0.3
  const templates = getTemplates(mode)
  for (let i = 0; i < count; i++) {
    const template = templates[i % templates.length]
    const transformed = template(text)
    const withSynonyms = replaceWithSynonyms(transformed, density)
    variants.push(withSynonyms)
  }
  return variants
}

function getTemplates(mode: string): ((text: string) => string)[] {
  const lowerFirst = (s: string) => s.charAt(0).toLowerCase() + s.slice(1)
  switch (mode) {
    case "creative":
      return [
        (text) => "Imagine this: " + lowerFirst(text),
        (text) => "Picture this: " + lowerFirst(text),
        (text) => "Consider this: " + lowerFirst(text),
      ]
    case "formal":
      return [
        (text) => "It is evident that " + lowerFirst(text),
        (text) => "One may observe that " + lowerFirst(text),
        (text) => "It should be noted that " + lowerFirst(text),
      ]
    case "fluency":
      return [
        (text) => "Ultimately, " + lowerFirst(text),
        (text) => text,
        (text) => "In essence, " + lowerFirst(text),
      ]
    case "concise":
      return [
        (text) => text.replace(/\b(very|really|quite|basically|actually|just|truly|literally|honestly)\b/gi, "").replace(/\s{2,}/g, " ").trim(),
        (text) => text.replace(/\b(in order to)\b/gi, "to").replace(/\b(due to the fact that)\b/gi, "because").replace(/\b(at this point in time)\b/gi, "now").replace(/\b(a large number of)\b/gi, "many").replace(/\b(the majority of)\b/gi, "most"),
        (text) => text.replace(/\b(it is worth noting that|it should be noted that|it is important to)\b/gi, "").replace(/\b(in a timely manner)\b/gi, "promptly").replace(/\s{2,}/g, " ").trim(),
      ]
    default:
      return [
        (text) => text,
        (text) => text,
        (text) => text,
      ]
  }
}

function highlightChanges(original: string, variant: string): React.ReactNode {
  const origWords = original.split(/\s+/)
  const varWords = variant.split(/\s+/)
  const result: React.ReactNode[] = []
  const maxLen = Math.max(origWords.length, varWords.length)

  for (let i = 0; i < maxLen; i++) {
    if (origWords[i] !== varWords[i]) {
      if (varWords[i]) {
        result.push(
          <span key={i} className="rounded bg-emerald-500/20 px-0.5 text-emerald-500 font-medium">
            {varWords[i]}
          </span>
        )
      }
    } else if (varWords[i]) {
      result.push(<span key={i}> {varWords[i]}</span>)
    }
  }

  return <span>{result}</span>
}

export function Paraphraser() {
  const [text, setText] = React.useState("")
  const [mode, setMode] = React.useState<(typeof MODES)[number]["value"]>("standard")
  const [loading, setLoading] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  const [variants, setVariants] = React.useState<string[]>([])
  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null)

  const handleParaphrase = React.useCallback(async () => {
    if (!text.trim()) {
      toast.error("Please enter text to paraphrase")
      return
    }

    setLoading(true)
    setProgress(0)

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + Math.random() * 15
        return next >= 90 ? 90 : next
      })
    }, 200)

    await new Promise((r) => setTimeout(r, 1000 + Math.random() * 1500))

    clearInterval(interval)
    setProgress(100)

    const results = generateVariants(text, mode, 3)
    setVariants(results)
    setLoading(false)
    toast.success(`3 variants generated in ${mode} mode`)
  }, [text, mode])

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
          <p className="text-sm text-muted-foreground">Rewrite text in different styles with synonym replacement</p>
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
          <label className="text-sm font-medium text-foreground">Mode</label>
          <div className="grid grid-cols-5 gap-3">
            {MODES.map((m) => (
              <button
                key={m.value}
                onClick={() => setMode(m.value)}
                className={cn(
                  "rounded-xl border p-3 text-left transition-all",
                  mode === m.value
                    ? "border-primary/50 bg-primary/5 text-primary shadow-sm"
                    : "border-border text-foreground hover:border-primary/30"
                )}
              >
                <div className="text-sm font-medium">{m.label}</div>
                <div className="mt-0.5 text-[10px] text-muted-foreground">{m.desc}</div>
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

        {loading && (
          <ProgressBar value={progress} variant="gradient" showPercentage label="Rewriting..." />
        )}
      </Card>

      <AnimatePresence>
        {variants.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">
                3 Variants — {mode} mode
              </h3>
              <span className="text-xs text-muted-foreground">Changed words highlighted</span>
            </div>
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
                    {highlightChanges(text, variant)}
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
