"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { Copy, Check, Hash, RotateCcw, ChartBarBig } from "lucide-react"

function getCharFrequency(text: string): [string, number][] {
  const freq: Record<string, number> = {}
  for (const ch of text) {
    if (ch.trim()) {
      freq[ch] = (freq[ch] || 0) + 1
    }
  }
  return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 10)
}

export function CharacterCounter() {
  const [text, setText] = React.useState("")
  const [copied, setCopied] = React.useState(false)

  const charsWithSpaces = text.length
  const charsWithoutSpaces = text.replace(/\s/g, "").length
  const words = text.trim() ? text.trim().split(/\s+/).length : 0
  const sentences = text ? text.split(/[.!?]+/).filter((s) => s.trim()).length : 0
  const lines = text ? text.split("\n").length : 0
  const paragraphs = text ? text.split(/\n\s*\n/).filter((p) => p.trim()).length : 0
  const avgWordLength = words > 0 ? charsWithoutSpaces / words : 0
  const charFreq = getCharFrequency(text)

  const stats = [
    { label: "Characters (with spaces)", value: charsWithSpaces },
    { label: "Characters (without spaces)", value: charsWithoutSpaces },
    { label: "Words", value: words },
    { label: "Sentences", value: sentences },
    { label: "Lines", value: lines },
    { label: "Paragraphs", value: paragraphs },
  ]

  const handleCopy = React.useCallback(async () => {
    const statsText = stats.map((s) => `${s.label}: ${s.value}`).join("\n")
    try {
      await navigator.clipboard.writeText(statsText)
      setCopied(true)
      toast.success("Stats copied to clipboard")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Failed to copy")
    }
  }, [stats])

  return (
    <Card className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Hash className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Character Counter</h2>
          <p className="text-sm text-muted-foreground">
            Analyze text with real-time character, word, and sentence statistics
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Input Text</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste or type your text here..."
          rows={8}
          className="w-full resize-y rounded-xl border border-border bg-background p-4 text-sm text-foreground placeholder-muted-foreground shadow-sm transition-all focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
        />
      </div>

      {text && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-border bg-muted/30 p-3 text-center"
              >
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <div className="mt-1 text-[11px] text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ChartBarBig className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Character Frequency</span>
            </div>
            <div className="text-xs text-muted-foreground">
              Avg word length: {avgWordLength.toFixed(1)}
            </div>
          </div>

          {charFreq.length > 0 && (
            <div className="space-y-1.5">
              {charFreq.map(([char, count]) => {
                const maxCount = charFreq[0][1]
                const pct = (count / maxCount) * 100
                return (
                  <div key={char} className="flex items-center gap-3">
                    <span className="w-6 text-center text-sm font-mono font-bold text-foreground">
                      {char === " " ? "␣" : char}
                    </span>
                    <div className="flex-1 h-5 rounded-md bg-muted overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="h-full rounded-md bg-primary/60"
                      />
                    </div>
                    <span className="w-8 text-right text-xs tabular-nums text-muted-foreground">
                      {count}
                    </span>
                  </div>
                )
              })}
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="ghost" onClick={handleCopy} icon={copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}>
              {copied ? "Copied" : "Copy Stats"}
            </Button>
            <Button variant="ghost" onClick={() => setText("")} icon={<RotateCcw className="h-4 w-4" />}>
              Clear
            </Button>
          </div>
        </motion.div>
      )}
    </Card>
  )
}
