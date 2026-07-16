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
  Lightbulb,
  ArrowRight,
} from "lucide-react"

function improvePrompt(prompt: string, goal: string): { improved: string; tips: string[] } {
  const tips: string[] = []
  let improved = prompt

  if (!prompt.toLowerCase().includes("role") && !prompt.toLowerCase().includes("act as") && !prompt.toLowerCase().includes("you are")) {
    tips.push("Add a role/ persona for the AI (e.g., 'Act as an expert in...')")
    improved = `Act as an expert in ${goal || "this field"}. ${improved}`
  }

  if (!prompt.includes("?") && prompt.length > 50) {
    tips.push("Include specific questions to get more targeted responses")
    improved += "\n\nSpecifically, please address the following questions:\n1. [Question 1]\n2. [Question 2]\n3. [Question 3]"
  }

  if (prompt.length < 100) {
    tips.push("Add more context and specific details to get better results")
    improved = improved.replace(
      /(Act as.*?\. )/,
      "$1Provide comprehensive, well-structured responses with practical examples. "
    )
  }

  if (!prompt.toLowerCase().includes("format") && !prompt.toLowerCase().includes("output")) {
    tips.push("Specify the desired output format (e.g., bullet points, paragraphs, step-by-step)")
    improved += "\n\nPlease format your response with:\n- Clear headings and subheadings\n- Bullet points for key concepts\n- Practical examples where relevant\n- A summary at the end"
  }

  if (!prompt.toLowerCase().includes("example") && !prompt.toLowerCase().includes("instance")) {
    tips.push("Request concrete examples to illustrate key points")
    improved = improved.replace(
      /(Please format.*?\.)/,
      "$1\n\nInclude at least 2-3 concrete, real-world examples that illustrate the key concepts."
    )
  }

  if (!prompt.toLowerCase().includes("step") && !prompt.toLowerCase().includes("guid")) {
    tips.push("Ask for step-by-step guidance or a structured approach")
    improved += "\n\nPlease provide a step-by-step guide or framework for implementing these concepts."
  }

  if (!prompt.toLowerCase().includes("level") && !prompt.toLowerCase().includes("beginner") && !prompt.toLowerCase().includes("expert")) {
    tips.push("Specify your knowledge level for appropriately tailored responses")
    improved = `(I'm looking for an intermediate-level explanation)\n\n${improved}`
  }

  improved = improved.replace(
    /(Please (format|provide).*?\.)/,
    "$1\n\n**Constraints:**\n- Be concise yet comprehensive\n- Use simple language for complex concepts\n- Provide actionable takeaways\n- Include relevant examples from real-world scenarios"
  )

  tips.push("Add constraints and specific requirements to narrow the focus")
  tips.push("Include the desired tone (professional, casual, academic, etc.)")
  tips.push("Specify what NOT to include (avoid common mistakes, jargon, etc.)")

  return { improved, tips }
}

export function PromptImprover() {
  const [prompt, setPrompt] = React.useState("")
  const [goal, setGoal] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [result, setResult] = React.useState<{ improved: string; tips: string[] } | null>(null)
  const [copied, setCopied] = React.useState(false)

  const handleImprove = React.useCallback(async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt to improve")
      return
    }

    setLoading(true)
    await new Promise((r) => setTimeout(r, 1000 + Math.random() * 1000))
    const res = improvePrompt(prompt, goal)
    setResult(res)
    setLoading(false)
    toast.success("Prompt improved")
  }, [prompt, goal])

  const handleCopy = React.useCallback(async () => {
    if (!result) return
    try {
      await navigator.clipboard.writeText(result.improved)
      setCopied(true)
      toast.success("Copied to clipboard")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Failed to copy")
    }
  }, [result])

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
          <p className="text-sm text-muted-foreground">Enhance your AI prompts for better results</p>
        </div>
      </motion.div>

      <Card className="space-y-6 p-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Your Prompt</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Paste the prompt you want to improve..."
            rows={5}
            className="w-full resize-y rounded-2xl border border-border bg-background p-4 text-sm text-foreground placeholder-muted-foreground shadow-sm transition-all focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
          />
        </div>

        <Input
          label="Goal (optional)"
          placeholder="What are you trying to achieve?"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
        />

        <Button
          onClick={handleImprove}
          loading={loading}
          fullWidth
          size="lg"
          icon={<Sparkles className="h-5 w-5" />}
        >
          Improve Prompt
        </Button>
      </Card>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              <div className="flex items-center justify-between border-b border-border px-5 py-3">
                <span className="text-sm font-medium text-foreground">Improved Prompt</span>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCopy}
                  className="flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                >
                  {copied ? (
                    <><Check className="h-3.5 w-3.5 text-emerald-500" /> Copied</>
                  ) : (
                    <><Copy className="h-3.5 w-3.5" /> Copy</>
                  )}
                </motion.button>
              </div>
              <div className="p-5">
                <div className="whitespace-pre-wrap text-sm text-foreground leading-relaxed">
                  {result.improved}
                </div>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
            >
              <div className="flex items-center gap-2 border-b border-border px-5 py-3">
                <Lightbulb className="h-4 w-4 text-amber-500" />
                <span className="text-sm font-medium text-foreground">Tips for Improvement</span>
              </div>
              <div className="p-5">
                <div className="space-y-3">
                  {result.tips.map((tip, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-start gap-3"
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-xs font-medium text-amber-500">
                        {i + 1}
                      </span>
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        <span className="text-sm text-foreground/80">{tip}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
