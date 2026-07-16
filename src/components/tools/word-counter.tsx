"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils/cn"
import {
  Hash,
  Copy,
  Check,
  Type,
  BookOpen,
  Clock,
  Mic,
  RotateCcw,
  ChartBarBig,
  FileText,
} from "lucide-react"

interface WordFrequency {
  word: string
  count: number
}

interface Stats {
  words: number
  characters: number
  charactersNoSpaces: number
  sentences: number
  paragraphs: number
  lines: number
  readingTime: string
  speakingTime: string
  avgWordLength: number
  topKeywords: WordFrequency[]
}

function computeStats(text: string): Stats {
  const trimmed = text.trim()
  const words = trimmed ? trimmed.split(/\s+/).length : 0
  const characters = text.length
  const charactersNoSpaces = text.replace(/\s/g, "").length
  const sentences = trimmed ? (trimmed.match(/[.!?]+/g) || []).length : 0
  const paragraphs = trimmed ? trimmed.split(/\n\s*\n/).filter(Boolean).length : 0
  const lines = trimmed ? trimmed.split("\n").length : 0
  const avgWordLength = words > 0 ? charactersNoSpaces / words : 0

  const wpm = 200
  const spm = 150
  const wordCount = words
  const readingMinutes = wordCount / wpm
  const speakingMinutes = wordCount / spm

  const readingTime =
    readingMinutes < 1
      ? "< 1 min"
      : `${Math.ceil(readingMinutes)} min ${Math.round((readingMinutes % 1) * 60)} sec`

  const speakingTime =
    speakingMinutes < 1
      ? "< 1 min"
      : `${Math.ceil(speakingMinutes)} min ${Math.round((speakingMinutes % 1) * 60)} sec`

  const wordFreq: Record<string, number> = {}
  const wordList = trimmed
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter(Boolean)

  wordList.forEach((w) => {
    wordFreq[w] = (wordFreq[w] || 0) + 1
  })

  const topKeywords = Object.entries(wordFreq)
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 15)

  return {
    words,
    characters,
    charactersNoSpaces,
    sentences,
    paragraphs,
    lines,
    readingTime,
    speakingTime,
    avgWordLength,
    topKeywords,
  }
}

function StatCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string | number; color: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
        </div>
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", color)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  )
}

export function WordCounter() {
  const [input, setInput] = React.useState("")
  const [copied, setCopied] = React.useState(false)

  const stats = React.useMemo(() => computeStats(input), [input])

  const handleCopy = React.useCallback(async () => {
    const report = [
      `Word Counter Report`,
      `-------------------`,
      `Words: ${stats.words}`,
      `Characters: ${stats.characters}`,
      `Characters (no spaces): ${stats.charactersNoSpaces}`,
      `Sentences: ${stats.sentences}`,
      `Paragraphs: ${stats.paragraphs}`,
      `Lines: ${stats.lines}`,
      `Reading Time: ${stats.readingTime}`,
      `Speaking Time: ${stats.speakingTime}`,
      `Average Word Length: ${stats.avgWordLength.toFixed(2)}`,
      ``,
      `Top Keywords:`,
      ...stats.topKeywords.slice(0, 10).map((k) => `  ${k.word}: ${k.count}`),
    ].join("\n")

    try {
      await navigator.clipboard.writeText(report)
      setCopied(true)
      toast.success("Statistics copied")
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
          <h2 className="text-lg font-semibold">Word Counter</h2>
          <p className="text-sm text-muted-foreground">
            Count words, characters, and analyze your text
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">Text Input</label>
          {input && (
            <span className="text-xs text-muted-foreground">{input.length.toLocaleString()} chars</span>
          )}
        </div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste or type your text here to analyze..."
          rows={8}
          className="w-full resize-y rounded-xl border border-border bg-background p-4 text-sm text-foreground placeholder-muted-foreground shadow-sm transition-all focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        <StatCard icon={Type} label="Words" value={stats.words.toLocaleString()} color="bg-blue-500/10 text-blue-500" />
        <StatCard icon={Hash} label="Characters" value={stats.characters.toLocaleString()} color="bg-violet-500/10 text-violet-500" />
        <StatCard icon={ChartBarBig} label="Chars (no space)" value={stats.charactersNoSpaces.toLocaleString()} color="bg-emerald-500/10 text-emerald-500" />
        <StatCard icon={FileText} label="Sentences" value={stats.sentences.toLocaleString()} color="bg-amber-500/10 text-amber-500" />
        <StatCard icon={BookOpen} label="Paragraphs" value={stats.paragraphs.toLocaleString()} color="bg-rose-500/10 text-rose-500" />
        <StatCard icon={BookOpen} label="Lines" value={stats.lines.toLocaleString()} color="bg-indigo-500/10 text-indigo-500" />
        <StatCard icon={Clock} label="Reading Time" value={stats.readingTime} color="bg-cyan-500/10 text-cyan-500" />
        <StatCard icon={Mic} label="Speaking Time" value={stats.speakingTime} color="bg-orange-500/10 text-orange-500" />
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">
          Avg word length: <strong className="text-foreground">{stats.avgWordLength.toFixed(2)}</strong> characters
        </span>
      </div>

      {stats.topKeywords.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-foreground">Top Keywords</h3>
          <div className="flex flex-wrap gap-2">
            {stats.topKeywords.map((kw) => (
              <Badge key={kw.word} variant="secondary" className="text-xs">
                {kw.word}
                <span className="ml-1.5 text-muted-foreground">×{kw.count}</span>
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <Button variant="outline" onClick={handleCopy} icon={copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}>
          {copied ? "Copied" : "Copy Statistics"}
        </Button>
        {input && (
          <Button variant="ghost" onClick={() => setInput("")} icon={<RotateCcw className="h-4 w-4" />}>
            Clear
          </Button>
        )}
      </div>
    </Card>
  )
}
