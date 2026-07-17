"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProgressBar } from "@/components/ui/progress-bar"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils/cn"
import {
  Sparkles,
  Copy,
  Check,
  TrendingUp,
  MessageSquare,
  Target,
  Gauge,
  Lightbulb,
} from "lucide-react"

const PERFORMANCE_GOALS = [
  "Better accuracy", "More creative", "More concise", "More detailed",
  "Better structured", "More actionable", "More professional",
] as const

function analyzePrompt(prompt: string): {
  clarity: number
  specificity: number
  structure: number
  actionability: number
  suggestions: { area: string; issue: string; improvement: string }[]
} {
  const suggestions: { area: string; issue: string; improvement: string }[] = []
  let clarity = 50
  let specificity = 50
  let structure = 50
  let actionability = 50

  if (!prompt.includes("?") && !prompt.includes("how") && !prompt.includes("what") && !prompt.includes("why")) {
    clarity -= 15
    suggestions.push({ area: "Clarity", issue: "Missing interrogative framing", improvement: "Add a clear question or directive at the start" })
  } else {
    clarity += 15
  }

  if (prompt.length < 50) {
    specificity -= 20
    suggestions.push({ area: "Specificity", issue: "Prompt too short/ambiguous", improvement: "Add more context, constraints, and examples" })
  } else if (prompt.length > 100) {
    specificity += 10
  }

  if (prompt.includes("example") || prompt.includes("e.g.") || prompt.includes("for instance") || prompt.includes("like")) {
    specificity += 15
  } else {
    suggestions.push({ area: "Specificity", issue: "No examples provided", improvement: "Include an example of the desired output" })
  }

  if (!prompt.includes("format") && !prompt.includes("output") && !prompt.includes("structure") && !prompt.includes("as") && !prompt.includes("style")) {
    structure -= 15
    suggestions.push({ area: "Structure", issue: "Missing format specification", improvement: "Specify the desired output format (list, paragraph, table, etc.)" })
  } else {
    structure += 15
  }

  if (!prompt.includes("step") && !prompt.includes("list") && !prompt.includes("number") && !prompt.includes("bullet")) {
    structure -= 5
  }

  if (!prompt.includes("audience") && !prompt.includes("for") && !prompt.includes("target")) {
    actionability -= 15
    suggestions.push({ area: "Actionability", issue: "No target audience specified", improvement: "Define who the output is for (beginners, experts, executives)" })
  } else {
    actionability += 15
  }

  if (!prompt.includes("tone") && !prompt.includes("style") && !prompt.includes("voice") && !prompt.includes("professional") && !prompt.includes("casual")) {
    actionability -= 10
    suggestions.push({ area: "Actionability", issue: "Missing tone specification", improvement: "Specify the desired tone (professional, casual, academic, etc.)" })
  } else {
    actionability += 10
  }

  if (!prompt.includes("constraint") && !prompt.includes("limit") && !prompt.includes("max") && !prompt.includes("avoid") && !prompt.includes("not")) {
    structure -= 10
    suggestions.push({ area: "Structure", issue: "No constraints or boundaries", improvement: "Specify what to avoid or any length/scope constraints" })
  }

  if (!prompt.includes("context") && !prompt.includes("background") && !prompt.includes("situation") && !prompt.includes("scenario")) {
    clarity -= 10
    suggestions.push({ area: "Clarity", issue: "Missing context", improvement: "Provide background information to ground the AI's response" })
  } else {
    clarity += 10
  }

  if (prompt.includes("good") || prompt.includes("great") || prompt.includes("best") || prompt.includes("nice")) {
    clarity -= 5
    suggestions.push({ area: "Clarity", issue: "Vague qualifiers", improvement: "Replace vague words (good, great) with specific criteria" })
  }

  suggestions.push({
    area: "General",
    issue: "Chain of thought potential",
    improvement: "Ask the AI to 'think step by step' or explain its reasoning for complex tasks",
  })

  clarity = Math.max(10, Math.min(100, clarity))
  specificity = Math.max(10, Math.min(100, specificity))
  structure = Math.max(10, Math.min(100, structure))
  actionability = Math.max(10, Math.min(100, actionability))

  return { clarity, specificity, structure, actionability, suggestions }
}

function applyGoalImprovement(prompt: string, goal: string): string {
  const goalFramings: Record<string, string> = {
    "Better accuracy": "Be precise and fact-check every claim. If uncertain, state your confidence level.",
    "More creative": "Think outside the box. Use metaphors, analogies, and novel approaches. Avoid clichés.",
    "More concise": "Be brief and direct. Use short sentences. Remove unnecessary words. Aim for 50% less text.",
    "More detailed": "Be thorough and exhaustive. Cover edge cases, variations, and exceptions. Include examples.",
    "Better structured": "Organize the response with clear headings, bullet points, and logical flow. Use a structured format.",
    "More actionable": "Provide concrete steps, specific recommendations, and actionable takeaways. Include timelines.",
    "More professional": "Use formal language, proper terminology, and a professional tone. Support claims with evidence.",
  }

  const framing = goalFramings[goal] || "Be thorough and accurate."
  return `${prompt.trim()}\n\n[Additional instructions: ${framing}]`
}

export function PromptImprover() {
  const [prompt, setPrompt] = React.useState("")
  const [goal, setGoal] = React.useState<(typeof PERFORMANCE_GOALS)[number]>("Better accuracy")
  const [loading, setLoading] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  const [analysis, setAnalysis] = React.useState<{ clarity: number; specificity: number; structure: number; actionability: number; suggestions: { area: string; issue: string; improvement: string }[] } | null>(null)
  const [improvedPrompt, setImprovedPrompt] = React.useState("")
  const [copied, setCopied] = React.useState(false)

  const handleImprove = React.useCallback(async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt to improve")
      return
    }

    setLoading(true)
    setProgress(0)

    const result = analyzePrompt(prompt)
    const improved = applyGoalImprovement(prompt, goal)
    setProgress(100)

    setAnalysis(result)
    setImprovedPrompt(improved)
    setLoading(false)
    toast.success("Prompt improved")
  }, [prompt, goal])

  const handleCopy = React.useCallback(async () => {
    if (!improvedPrompt) return
    try {
      await navigator.clipboard.writeText(improvedPrompt)
      setCopied(true)
      toast.success("Copied to clipboard")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Failed to copy")
    }
  }, [improvedPrompt])

  const scoreColor = (score: number) => {
    if (score >= 70) return "text-emerald-500"
    if (score >= 40) return "text-amber-500"
    return "text-red-500"
  }

  const scoreBarColor = (score: number) => {
    if (score >= 70) return "bg-emerald-500"
    if (score >= 40) return "bg-amber-500"
    return "bg-red-500"
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-violet-500/20 shadow-sm">
          <Sparkles className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Prompt Improver</h1>
          <p className="text-sm text-muted-foreground">Analyze and enhance your AI prompts</p>
        </div>
      </motion.div>

      <Card className="space-y-6 p-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Your Prompt</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Paste the prompt you want to improve..."
            rows={6}
            className="w-full resize-y rounded-2xl border border-border bg-background p-4 text-sm text-foreground placeholder-muted-foreground shadow-sm transition-all focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Performance Goal</label>
          <div className="flex flex-wrap gap-2">
            {PERFORMANCE_GOALS.map((g) => (
              <button
                key={g}
                onClick={() => setGoal(g)}
                className={cn(
                  "rounded-xl border px-3 py-1.5 text-xs font-medium transition-all",
                  goal === g
                    ? "border-primary/50 bg-primary/5 text-primary shadow-sm"
                    : "border-border text-foreground hover:border-primary/30"
                )}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        <Button
          onClick={handleImprove}
          loading={loading}
          fullWidth
          size="lg"
          icon={<TrendingUp className="h-5 w-5" />}
        >
          Analyze & Improve
        </Button>

        {loading && (
          <ProgressBar value={progress} variant="gradient" showPercentage label="Analyzing prompt quality..." />
        )}
      </Card>

      <AnimatePresence>
        {analysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { label: "Clarity", value: analysis.clarity, icon: MessageSquare },
                { label: "Specificity", value: analysis.specificity, icon: Target },
                { label: "Structure", value: analysis.structure, icon: Gauge },
                { label: "Actionability", value: analysis.actionability, icon: Target },
              ].map((metric, i) => (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-sm"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <metric.icon className={cn("h-3.5 w-3.5", scoreColor(metric.value))} />
                    <span className="text-xs text-muted-foreground">{metric.label}</span>
                  </div>
                  <p className={cn("text-2xl font-bold", scoreColor(metric.value))}>{metric.value}%</p>
                  <div className="mt-2 h-1.5 w-full rounded-full bg-muted overflow-hidden">
                    <div className={cn("h-full rounded-full transition-all duration-700", scoreBarColor(metric.value))} style={{ width: `${metric.value}%` }} />
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
            >
              <div className="flex items-center gap-2 border-b border-border px-5 py-3">
                <Lightbulb className="h-4 w-4 text-amber-500" />
                <span className="text-sm font-medium text-foreground">Improvement Suggestions ({analysis.suggestions.length})</span>
              </div>
              <div className="divide-y divide-border">
                {analysis.suggestions.map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-4 px-5"
                  >
                    <div className="flex items-start gap-3">
                      <span className={cn(
                        "mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium",
                        s.area === "Clarity" ? "bg-blue-500/10 text-blue-500" :
                        s.area === "Specificity" ? "bg-violet-500/10 text-violet-500" :
                        s.area === "Structure" ? "bg-amber-500/10 text-amber-500" :
                        s.area === "Actionability" ? "bg-emerald-500/10 text-emerald-500" :
                        "bg-primary/10 text-primary"
                      )}>
                        {s.area}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{s.issue}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{s.improvement}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {improvedPrompt && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
              >
                <div className="flex items-center justify-between border-b border-border px-5 py-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                    <span className="text-sm font-medium text-foreground">Improved Prompt</span>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCopy}
                    className="flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  >
                    {copied ? (<><Check className="h-3.5 w-3.5 text-emerald-500" /> Copied</>) : (<><Copy className="h-3.5 w-3.5" /> Copy</>)}
                  </motion.button>
                </div>
                <pre className="p-5 text-sm text-foreground leading-relaxed whitespace-pre-wrap font-sans">{improvedPrompt}</pre>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
