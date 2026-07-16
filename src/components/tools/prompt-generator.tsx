"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils/cn"
import {
  Sparkles,
  Copy,
  Check,
  RefreshCw,
} from "lucide-react"

const AI_TOOLS = [
  { value: "chatgpt", label: "ChatGPT", color: "#10a37f" },
  { value: "claude", label: "Claude", color: "#d97706" },
  { value: "gemini", label: "Gemini", color: "#4285f4" },
  { value: "copilot", label: "GitHub Copilot", color: "#8957e5" },
  { value: "perplexity", label: "Perplexity", color: "#1a56db" },
]

const STYLES = [
  { value: "detailed", label: "Detailed", desc: "Comprehensive with examples" },
  { value: "concise", label: "Concise", desc: "Short and direct" },
  { value: "creative", label: "Creative", desc: "Imaginative and open-ended" },
] as const

function generatePrompts(goal: string, tool: string, style: string, count: number): string[] {
  const prompts: string[] = []
  const toolName = AI_TOOLS.find(t => t.value === tool)?.label || "AI"

  const templates = [
    `You are an expert assistant specialized in helping with "${goal}". Please provide comprehensive guidance that covers the following aspects:

1. **Core Principles**: What are the fundamental concepts I need to understand?
2. **Step-by-Step Approach**: Break down the process into actionable steps
3. **Best Practices**: What are the recommended practices in this area?
4. **Common Pitfalls**: What should I avoid or watch out for?
5. **Resources**: What tools, references, or resources would you recommend?

Please format your response with clear headings and actionable advice. Assume I have basic knowledge but need expert-level guidance.`,
    `I need your help with "${goal}". 

Please act as a ${toolName} expert and provide me with:
- A clear explanation of the key concepts
- Practical examples I can apply immediately
- A structured approach to tackle this effectively
- Tips to avoid common mistakes

Keep the response focused and actionable. Use examples where relevant.`,
    `Help me master "${goal}" by providing:

1. A beginner-friendly overview
2. Intermediate techniques and strategies
3. Advanced tips for experts

For each level, include:
- Key concepts to understand
- Practical exercises to try
- Common challenges and solutions

Tailor the response to be ${style === "concise" ? "brief and direct" : style === "detailed" ? "comprehensive and thorough" : "creative and engaging"}.`,
    `I want to learn about "${goal}" in depth. 

As a ${toolName} expert, please:
1. Explain why this matters and its real-world applications
2. Break down the topic into digestible chunks
3. Provide concrete examples that illustrate each point
4. Suggest ways to practice and apply what I learn
5. Recommend further resources for deeper learning

Please use analogies and real-world comparisons to make complex ideas accessible.`,
    `Create a personalized learning plan for "${goal}".

Structure it as follows:
- **Week 1**: Foundations and core concepts
- **Week 2**: Practical application and hands-on practice
- **Week 3**: Advanced techniques and optimization
- **Week 4**: Mastery and real-world projects

For each week, specify:
- Learning objectives
- Key resources (articles, videos, tutorials)
- Practice exercises
- Success metrics

Make this ${style === "concise" ? "streamlined and efficient" : style === "detailed" ? "comprehensive and thorough" : "inspiring and motivational"}.`,
  ]

  for (let i = 0; i < count; i++) {
    const template = templates[i % templates.length]
    prompts.push(template)
  }

  return prompts
}

export function PromptGenerator() {
  const [goal, setGoal] = React.useState("")
  const [tool, setTool] = React.useState("chatgpt")
  const [style, setStyle] = React.useState<(typeof STYLES)[number]["value"]>("detailed")
  const [loading, setLoading] = React.useState(false)
  const [prompts, setPrompts] = React.useState<string[]>([])
  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null)

  const handleGenerate = React.useCallback(async () => {
    if (!goal.trim()) {
      toast.error("Please enter a goal or objective")
      return
    }

    setLoading(true)
    await new Promise((r) => setTimeout(r, 1000 + Math.random() * 1000))
    const results = generatePrompts(goal, tool, style, 3)
    setPrompts(results)
    setLoading(false)
    toast.success("Prompts generated")
  }, [goal, tool, style])

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
          <Sparkles className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Prompt Generator</h1>
          <p className="text-sm text-muted-foreground">Generate effective AI prompts</p>
        </div>
      </motion.div>

      <Card className="space-y-6 p-6">
        <Input
          label="Goal / Objective"
          placeholder="What do you want the AI to help you with?"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
        />

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">AI Tool</label>
          <div className="flex flex-wrap gap-2">
            {AI_TOOLS.map((t) => (
              <button
                key={t.value}
                onClick={() => setTool(t.value)}
                className={cn(
                  "rounded-xl border px-4 py-2 text-sm font-medium transition-all",
                  tool === t.value
                    ? "border-primary/50 bg-primary/5 text-primary shadow-sm"
                    : "border-border text-foreground hover:border-primary/30"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Prompt Style</label>
          <div className="grid grid-cols-3 gap-3">
            {STYLES.map((s) => (
              <button
                key={s.value}
                onClick={() => setStyle(s.value)}
                className={cn(
                  "rounded-xl border p-3 text-left transition-all",
                  style === s.value
                    ? "border-primary/50 bg-primary/5 text-primary shadow-sm"
                    : "border-border text-foreground hover:border-primary/30"
                )}
              >
                <div className="text-sm font-medium">{s.label}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">{s.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <Button
          onClick={handleGenerate}
          loading={loading}
          fullWidth
          size="lg"
          icon={<Sparkles className="h-5 w-5" />}
        >
          Generate Prompts
        </Button>
      </Card>

      <AnimatePresence>
        {prompts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">
                3 Prompt Variants
              </h3>
              <span className="text-xs text-muted-foreground">
                Optimized for {AI_TOOLS.find(t => t.value === tool)?.label}
              </span>
            </div>
            {prompts.map((prompt, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.15 }}
                className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
              >
                <div className="flex items-center justify-between border-b border-border px-5 py-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                      {index + 1}
                    </span>
                    <span className="text-sm font-medium text-foreground">
                      Variant {index + 1}
                    </span>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleCopy(prompt, index)}
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
                  <div className="whitespace-pre-wrap text-sm text-foreground/80 leading-relaxed">
                    {prompt.split(/(\*\*[^*]+\*\*)/g).map((part, i) => {
                      if (part.startsWith("**") && part.endsWith("**")) {
                        return <strong key={i} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>
                      }
                      if (part.startsWith("- **")) {
                        return <li key={i} className="ml-4 list-disc">{part.slice(4, -4)}</li>
                      }
                      if (part.startsWith("1. ") || part.startsWith("2. ") || part.startsWith("3. ") || part.startsWith("4. ") || part.startsWith("5. ")) {
                        return <li key={i} className="ml-4 list-decimal">{part.slice(3)}</li>
                      }
                      return <span key={i}>{part}</span>
                    })}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
