"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils/cn"
import {
  SpellCheck,
  Copy,
  Check,
  Sparkles,
  RotateCcw,
  Info,
} from "lucide-react"

const SAMPLE_TEXTS = [
  "Their are many ways too improve your writing skills. Its important too practice regularly and seek feedback from others. The key is two be consistent and never give up on youre goals. Every day you can make progress if you put in the effort.",
  "The company's financial report was prepeared by the accouting department. They had reviewed the numbers carefully before submiting it too the board of directors. However their was a mistake in the quarterly projections which caused confusion among the stakeholders.",
  "He dont think that the project will be finish on time. The team have been working hard but their facing several challenges. The manager should of assigned more resources to the project from the start.",
]

function generateCorrections(text: string): { fixed: string; changes: { original: string; corrected: string; explanation: string }[] } {
  const corrections: { original: string; corrected: string; explanation: string }[] = []
  let fixed = text

  const rules = [
    { pattern: /\bTheir\b(?!\s*are\b|\s*was\b|\s*were\b)/g, correct: "Their", check: /\bTheir\b(?!\s*(have|had|been|is|was|were|are|will|can|could|would|should|may|might|must|does|do|did|has|had))\b/g, fix: "Their", explanation: "Correct possessive form" },
    { pattern: /\bThere\b/gi, correct: "There", check: /\bthere\b/gi, fix: "there", explanation: "Location or existence" },
    { pattern: /\bTheir\b(?=\s+(is|was|were|are|has|have|had|will|can|could|would|should|may|might|must))\b/gi, correct: "There", check: /\btheir\s+(is|was|were|are|has|have|had|will|can|could|would|should|may|might|must)\b/gi, fix: "there", explanation: "Use 'there' as an introductory subject" },
  ]

  if (/\btheir\s+are\b/i.test(fixed)) {
    const match = fixed.match(/\b([Tt])heir\s+(are)\b/)
    if (match) {
      corrections.push({
        original: `${match[1] === "T" ? "Their" : "their"} are`,
        corrected: `${match[1] === "T" ? "There" : "there"} are`,
        explanation: "Use 'There are' to indicate existence of something",
      })
      fixed = fixed.replace(/\b([Tt])heir\s+(are)\b/g, "$1here are")
    }
  }

  if (/\btheir\s+was\b/i.test(fixed)) {
    const match = fixed.match(/\b([Tt])heir\s+(was)\b/)
    if (match) {
      corrections.push({
        original: `${match[1] === "T" ? "Their" : "their"} was`,
        corrected: `${match[1] === "T" ? "There" : "there"} was`,
        explanation: "Use 'There was' to indicate existence of something",
      })
      fixed = fixed.replace(/\b([Tt])heir\s+(was)\b/g, "$1here was")
    }
  }

  if (/\b([Tt])heir\s+(is|were|are|has|have|had|will|can|could|would|should|may|might|must)\b/i.test(fixed)) {
    fixed = fixed.replace(/\b([Tt])heir\s+(is|were|are|has|have|had|will|can|could|would|should|may|might|must)\b/gi, (m, t, v) => {
      corrections.push({
        original: m,
        corrected: `${t === "T" ? "T" : "t"}here ${v}`,
        explanation: "Use 'there' as introductory subject",
      })
      return `${t === "T" ? "T" : "t"}here ${v}`
    })
  }

  const commonErrors: any[] = [
    [/\btoo\b(?!\s+(much|many|big|small|often|late|early|far|close|long|short|fast|slow|good|bad|well|late|soon))\b/g, "to", "Use 'to' as preposition or infinitive marker"],
    [/\btwo\b(?=\s+(be|have|do|make|take|go|come|see|know|think|want|give|find|tell|ask|try|leave|call))\b/gi, "to", "Use 'to' before verbs"],
    [/\byoure\b/gi, "your", "Use 'your' as possessive form"],
    [/\bim\b/gi, "I'm", "Use 'I'm' as contraction of 'I am'"],
    [/\bdont\b/gi, "don't", "Add apostrophe for contraction"],
    [/\bdoesnt\b/gi, "doesn't", "Add apostrophe for contraction"],
    [/\bdidnt\b/gi, "didn't", "Add apostrophe for contraction"],
    [/\bwont\b/gi, "won't", "Add apostrophe for contraction"],
    [/\bcouldnt\b/gi, "couldn't", "Add apostrophe for contraction"],
    [/\bwouldnt\b/gi, "wouldn't", "Add apostrophe for contraction"],
    [/\bshouldnt\b/gi, "shouldn't", "Add apostrophe for contraction"],
    [/\bisnt\b/gi, "isn't", "Add apostrophe for contraction"],
    [/\barent\b/gi, "aren't", "Add apostrophe for contraction"],
    [/\bwasnt\b/gi, "wasn't", "Add apostrophe for contraction"],
    [/\bwerent\b/gi, "weren't", "Add apostrophe for contraction"],
    [/\bhavent\b/gi, "haven't", "Add apostrophe for contraction"],
    [/\bhasnt\b/gi, "hasn't", "Add apostrophe for contraction"],
    [/\bhadnt\b/gi, "hadn't", "Add apostrophe for contraction"],
    [/\bits\s+(a|an|the|my|your|his|her|its|our|their|this|that|these|those)\b/gi, (m: string) => {
      const fixed = m.replace(/\bits\b/i, (w) => (w === "ITS" ? "It's" : "it's"))
      corrections.push({ original: m, corrected: fixed, explanation: "Use 'it's' as contraction of 'it is'" })
      return fixed
    }],
    [/\bshould\s+of\b/gi, "should have", "Use 'should have' instead of 'should of'"],
    [/\bwould\s+of\b/gi, "would have", "Use 'would have' instead of 'would of'"],
    [/\bcould\s+of\b/gi, "could have", "Use 'could have' instead of 'could of'"],
    [/\bmight\s+of\b/gi, "might have", "Use 'might have' instead of 'might of'"],
    [/\bmust\s+of\b/gi, "must have", "Use 'must have' instead of 'must of'"],
    [/\bprepear\w*\b/gi, "prepare", "Correct spelling"],
    [/\bprepaired\b/gi, "prepared", "Correct spelling of 'prepared'"],
    [/\bprepearing\b/gi, "preparing", "Correct spelling of 'preparing'"],
    [/\boccured\b/gi, "occurred", "Double the 'r' in past tense"],
    [/\boccuring\b/gi, "occurring", "Double the 'r' in present participle"],
    [/\brecieve\w*\b/gi, (m: string) => m.replace(/recieve/gi, "recei" + (m[3] === 'e' ? 've' : '')), "I before E except after C"],
    [/\breciept\b/gi, "receipt", "Correct spelling - 'i before e' rule"],
    [/\baccomodat\w*\b/gi, (m: string) => m.replace(/accomodat/gi, "accommodat"), "Double the 'm' and 'c'"],
    [/\bcalender\b/gi, "calendar", "Correct spelling of 'calendar'"],
    [/\bdefinately\b/gi, "definitely", "Correct spelling of 'definitely'"],
    [/\bseperate\b/gi, "separate", "There's 'a rat' in separate"],
    [/\btommorow\b/gi, "tomorrow", "Correct spelling of 'tomorrow'"],
    [/\balot\b/gi, "a lot", "Two words, not one"],
    [/\balright\b/gi, "all right", "Two words is more formal"],
  ]

  for (const entry of commonErrors) {
    const pattern = entry[0] as RegExp
    const replacement = entry[1] as string | ((m: string) => string)
    const explanation = (entry[2] as string) || ""
    if (typeof replacement === "string" && pattern.test(fixed)) {
      const match = fixed.match(pattern)
      if (match) {
        corrections.push({
          original: match[0],
          corrected: replacement,
          explanation: explanation as string,
        })
        fixed = fixed.replace(pattern, replacement)
      }
    } else if (typeof replacement === "function") {
      fixed = fixed.replace(pattern, replacement as unknown as string)
    }
  }

  if (/\bhe\s+don't\b/i.test(fixed)) {
    corrections.push({
      original: "he don't",
      corrected: "he doesn't",
      explanation: "Third person singular requires 'doesn't'",
    })
    fixed = fixed.replace(/\bhe\s+don't\b/gi, "he doesn't")
  }
  if (/\bshe\s+don't\b/i.test(fixed)) {
    corrections.push({
      original: "she don't",
      corrected: "she doesn't",
      explanation: "Third person singular requires 'doesn't'",
    })
    fixed = fixed.replace(/\bshe\s+don't\b/gi, "she doesn't")
  }
  if (/\bit\s+don't\b/i.test(fixed)) {
    corrections.push({
      original: "it don't",
      corrected: "it doesn't",
      explanation: "Third person singular requires 'doesn't'",
    })
    fixed = fixed.replace(/\bit\s+don't\b/gi, "it doesn't")
  }

  if (/\bthe\s+team\s+(have|has)\b/i.test(fixed)) {
    const match = fixed.match(/\bthe\s+team\s+(have)\b/i)
    if (match) {
      corrections.push({
        original: "the team have",
        corrected: "the team has",
        explanation: "Collective nouns typically take singular verbs",
      })
      fixed = fixed.replace(/\bthe\s+team\s+have\b/gi, "the team has")
    }
  }

  const subjVerbAgreements = [
    { pattern: /\b(he|she|it)\s+(have)\b/gi, correct: "has" },
    { pattern: /\b(he|she|it)\s+(do)\s+not\b/gi, correct: "does not" },
    { pattern: /\b(they|we|you|i)\s+(has)\b/gi, correct: "have" },
  ]

  for (const { pattern, correct } of subjVerbAgreements) {
    if (pattern.test(fixed)) {
      const match = fixed.match(pattern)
      if (match) {
        corrections.push({
          original: match[0],
          corrected: `${match[1]} ${correct}`,
          explanation: "Subject-verb agreement",
        })
        fixed = fixed.replace(pattern, `$1 ${correct}`)
      }
    }
  }

  return { fixed, changes: corrections }
}

function highlightChanges(text: string, changes: { original: string; corrected: string }[]): React.ReactNode[] {
  const nodes: React.ReactNode[] = [text]
  
  for (const change of changes) {
    const lastIndex = nodes.length - 1
    const lastNode = nodes[lastIndex]
    if (typeof lastNode === "string") {
      const parts = lastNode.split(change.original)
      if (parts.length > 1) {
        const newNodes: React.ReactNode[] = []
        parts.forEach((part, i) => {
          newNodes.push(part)
          if (i < parts.length - 1) {
            newNodes.push(
              <span key={`${change.original}-${i}`} className="relative inline-flex items-center gap-1">
                <span className="rounded bg-red-500/20 px-0.5 text-red-500 line-through decoration-red-500">{change.original}</span>
                <span className="rounded bg-emerald-500/20 px-0.5 text-emerald-500">{change.corrected}</span>
              </span>
            )
          }
        })
        nodes.splice(lastIndex, 1, ...newNodes)
      }
    }
  }

  return nodes
}

export function GrammarFixer() {
  const [text, setText] = React.useState("")
  const [output, setOutput] = React.useState<{ fixed: string; changes: { original: string; corrected: string; explanation: string }[] } | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [copied, setCopied] = React.useState(false)

  const handleFix = React.useCallback(async () => {
    if (!text.trim()) {
      toast.error("Please enter text to fix")
      return
    }

    setLoading(true)
    await new Promise((r) => setTimeout(r, 800 + Math.random() * 1200))
    const result = generateCorrections(text)
    setOutput(result)
    setLoading(false)
    toast.success(`${result.changes.length} correction${result.changes.length !== 1 ? "s" : ""} applied`)
  }, [text])

  const handleCopy = React.useCallback(async () => {
    if (!output) return
    try {
      await navigator.clipboard.writeText(output.fixed)
      setCopied(true)
      toast.success("Copied to clipboard")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Failed to copy")
    }
  }, [output])

  const handleReset = React.useCallback(() => {
    setText("")
    setOutput(null)
    setCopied(false)
  }, [])

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-violet-500/20 shadow-sm">
          <SpellCheck className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Grammar Fixer</h1>
          <p className="text-sm text-muted-foreground">Fix grammar and spelling errors</p>
        </div>
      </motion.div>

      <Card className="space-y-6 p-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Text to Fix</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste or type text with grammar errors..."
            rows={6}
            className="w-full resize-y rounded-2xl border border-border bg-background p-4 text-sm text-foreground placeholder-muted-foreground shadow-sm transition-all focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
          />
        </div>

        <Button
          onClick={handleFix}
          loading={loading}
          fullWidth
          size="lg"
          icon={<Sparkles className="h-5 w-5" />}
        >
          Fix Grammar
        </Button>
      </Card>

      <AnimatePresence>
        {output && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              <div className="flex items-center justify-between border-b border-border px-5 py-3">
                <span className="text-sm font-medium text-foreground">Fixed Text</span>
                <div className="flex items-center gap-2">
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
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleReset}
                    className="flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Reset
                  </motion.button>
                </div>
              </div>
              <div className="p-5">
                <p className="whitespace-pre-wrap text-sm text-foreground">
                  {highlightChanges(output.fixed, output.changes)}
                </p>
              </div>
            </div>

            {output.changes.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
              >
                <div className="flex items-center gap-2 border-b border-border px-5 py-3">
                  <Info className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">
                    {output.changes.length} Correction{output.changes.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="divide-y divide-border">
                  {output.changes.map((change, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-start gap-3 p-4"
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                        {i + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded bg-red-500/20 px-1.5 py-0.5 text-xs font-medium text-red-500 line-through">
                            {change.original}
                          </span>
                          <span className="text-xs text-muted-foreground">→</span>
                          <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-xs font-medium text-emerald-500">
                            {change.corrected}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">{change.explanation}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
