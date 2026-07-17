"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProgressBar } from "@/components/ui/progress-bar"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils/cn"
import {
  FileText,
  Copy,
  Check,
  Sparkles,
  ListChecks,
  ChartBarBig,
  TextQuote,
  RotateCcw,
  BarChart3,
} from "lucide-react"

const SUMMARY_LEVELS = [
  { value: "short", label: "Short", desc: "Brief overview in 1-2 sentences", ratio: 0.2 },
  { value: "medium", label: "Medium", desc: "Balanced summary with key points", ratio: 0.4 },
  { value: "detailed", label: "Detailed", desc: "Comprehensive summary", ratio: 0.6 },
] as const

const SAMPLE_TEXTS = [
  "Artificial intelligence has transformed the modern workplace in unprecedented ways. From automated data analysis to intelligent customer service systems, AI technologies are reshaping how businesses operate and compete. Machine learning algorithms can now process vast amounts of data in seconds, identifying patterns and insights that would take humans weeks or months to discover. Natural language processing enables computers to understand and generate human language, powering everything from chatbots to translation services. Computer vision systems can analyze images and video with accuracy that rivals or exceeds human performance. However, these advancements also raise important questions about privacy, job displacement, and ethical AI development. Organizations must carefully balance the benefits of AI adoption with responsible implementation practices. The future of work will be defined by how well we integrate these technologies while addressing the societal challenges they present.",
  "Climate change remains one of the most pressing challenges facing humanity today. Rising global temperatures have led to more frequent and severe weather events, including hurricanes, droughts, floods, and wildfires. The scientific consensus is clear: human activities, particularly the burning of fossil fuels and deforestation, are the primary drivers of these changes. The effects are already being felt worldwide, from melting polar ice caps to shifting agricultural zones. Coastal communities face threats from sea-level rise, while inland areas contend with changing precipitation patterns. Despite the daunting nature of these challenges, there are reasons for hope. Renewable energy technologies have become increasingly cost-effective, with solar and wind power now competing favorably with fossil fuels in many markets. Electric vehicles are gaining market share, and innovations in energy storage are addressing intermittency issues. Policy frameworks like carbon pricing and international agreements provide pathways for coordinated action. Individual actions, when multiplied across millions of people, can also drive meaningful change.",
  "The human brain is an incredibly complex organ consisting of approximately 86 billion neurons, each connected to thousands of others, forming trillions of synapses. This intricate network is responsible for everything from basic life functions to the highest forms of consciousness and creativity. Recent advances in neuroscience have revealed remarkable insights about neuroplasticity—the brain's ability to reorganize itself by forming new neural connections throughout life. This discovery has profound implications for learning, rehabilitation after injury, and mental health treatment. Researchers have also made significant progress in understanding memory formation, sleep's role in cognitive function, and the neural basis of emotions. Technologies like functional magnetic resonance imaging (fMRI) and optogenetics continue to push the boundaries of what we know about brain function. Yet, much remains unknown, making neuroscience one of the most exciting frontiers in modern science. The coming decades promise to unlock even more secrets about how our brains work.",
]

interface ScoredSentence {
  text: string
  score: number
  index: number
}

function extractiveSummarize(text: string, ratio: number, extractKeyPoints: boolean): { summary: string; keyPoints: string[]; stats: { originalWords: number; summaryWords: number; reduction: number; topKeywords: string[] } } {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text]
  if (sentences.length === 0) return { summary: text, keyPoints: [], stats: { originalWords: text.split(/\s+/).length, summaryWords: 0, reduction: 0, topKeywords: [] } }

  const words = text.toLowerCase().replace(/[^\w\s]/g, "").split(/\s+/).filter(Boolean)
  const wordFreq: Record<string, number> = {}
  words.forEach(w => { wordFreq[w] = (wordFreq[w] || 0) + 1 })
  const maxFreq = Math.max(...Object.values(wordFreq), 1)

  const titleWords = text.split(/\s+/).slice(0, 8).map(w => w.toLowerCase().replace(/[^\w]/g, ""))
  const sentenceEnd = sentences.length

  const scored: ScoredSentence[] = sentences.map((s, i) => {
    const sWords = s.toLowerCase().replace(/[^\w\s]/g, "").split(/\s+/).filter(Boolean)
    const sWordSet = new Set(sWords)
    let score = 0

    const avgFreq = sWords.reduce((sum, w) => sum + (wordFreq[w] || 0), 0) / Math.max(sWords.length, 1)
    score += avgFreq / maxFreq * 0.4

    const posScore = 1 - (i / Math.max(sentenceEnd - 1, 1))
    score += posScore * 0.3

    const titleMatch = sWords.filter(w => titleWords.includes(w)).length / Math.max(sWords.length, 1)
    score += titleMatch * 0.2

    if (sWords.length > 8) score += 0.1
    if (s.includes("However") || s.includes("Therefore") || s.includes("In conclusion") || s.includes("Finally")) score += 0.1

    return { text: s.trim(), score, index: i }
  })

  scored.sort((a, b) => b.score - a.score)
  const numSentences = Math.max(1, Math.round(sentenceEnd * ratio))
  const topSentences = scored.slice(0, numSentences).sort((a, b) => a.index - b.index)
  const summary = topSentences.map(s => s.text).join(" ")

  const sortedKeywords = Object.entries(wordFreq)
    .filter(([w]) => w.length > 3)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([w]) => w)

  let keyPoints: string[] = []
  if (extractKeyPoints) {
    keyPoints = topSentences.slice(0, 4).map((s, i) => {
      const clean = s.text.replace(/^[^a-zA-Z]+/, "").trim()
      return `${i + 1}. ${clean}`
    })
  }

  const originalWords = words.length
  const summaryWords = summary.split(/\s+/).length
  const reduction = originalWords > 0 ? Math.round((1 - summaryWords / originalWords) * 100) : 0

  return { summary, keyPoints, stats: { originalWords, summaryWords, reduction, topKeywords: sortedKeywords } }
}

export function AiSummarizer() {
  const [text, setText] = React.useState("")
  const [level, setLevel] = React.useState<(typeof SUMMARY_LEVELS)[number]["value"]>("medium")
  const [extractKeyPoints, setExtractKeyPoints] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  const [result, setResult] = React.useState<{ summary: string; keyPoints: string[]; stats: { originalWords: number; summaryWords: number; reduction: number; topKeywords: string[] } } | null>(null)
  const [copied, setCopied] = React.useState(false)

  const levelConfig = SUMMARY_LEVELS.find(l => l.value === level)!

  const handleSummarize = React.useCallback(async () => {
    if (!text.trim()) {
      toast.error("Please enter text to summarize")
      return
    }

    setLoading(true)
    setProgress(0)

    const res = extractiveSummarize(text, levelConfig.ratio, extractKeyPoints)
    setProgress(100)
    setResult(res)
    setLoading(false)
    toast.success(`Summary generated — ${res.stats.reduction}% reduction`)
  }, [text, levelConfig.ratio, extractKeyPoints])

  const fillSample = React.useCallback(() => {
    setText(SAMPLE_TEXTS[Math.floor(Math.random() * SAMPLE_TEXTS.length)])
  }, [])

  const handleCopy = React.useCallback(async () => {
    if (!result) return
    const content = result.keyPoints.length > 0
      ? `Summary:\n${result.summary}\n\nKey Points:\n${result.keyPoints.join("\n")}`
      : result.summary
    try {
      await navigator.clipboard.writeText(content)
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
          <FileText className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">AI Summarizer</h1>
          <p className="text-sm text-muted-foreground">Extractive summarization with sentence scoring</p>
        </div>
      </motion.div>

      <Card className="space-y-6 p-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">Text to Summarize</label>
            <button
              onClick={fillSample}
              className="text-xs text-primary hover:underline"
            >
              Use sample text
            </button>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste or type the text you want to summarize..."
            rows={8}
            className="w-full resize-y rounded-2xl border border-border bg-background p-4 text-sm text-foreground placeholder-muted-foreground shadow-sm transition-all focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
          />
          <p className="text-xs text-muted-foreground">{text.trim() ? text.split(/\s+/).length : 0} words · {text.match(/[^.!?]+[.!?]+/g)?.length || 0} sentences</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Summary Length</label>
          <div className="grid grid-cols-3 gap-3">
            {SUMMARY_LEVELS.map((l) => (
              <button
                key={l.value}
                onClick={() => setLevel(l.value)}
                className={cn(
                  "rounded-xl border p-3 text-left transition-all",
                  level === l.value
                    ? "border-primary/50 bg-primary/5 text-primary shadow-sm"
                    : "border-border text-foreground hover:border-primary/30"
                )}
              >
                <div className="text-sm font-medium">{l.label}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">{l.desc}</div>
                <div className="mt-1 text-[10px] text-muted-foreground/60">~{Math.round(l.ratio * 100)}% of original</div>
              </button>
            ))}
          </div>
        </div>

        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border p-3 transition-colors hover:border-primary/30">
          <input
            type="checkbox"
            checked={extractKeyPoints}
            onChange={(e) => setExtractKeyPoints(e.target.checked)}
            className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
          />
          <div className="flex items-center gap-2">
            <ListChecks className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Extract key points</span>
          </div>
        </label>

        <Button
          onClick={handleSummarize}
          loading={loading}
          fullWidth
          size="lg"
          icon={<Sparkles className="h-5 w-5" />}
        >
          Summarize
        </Button>

        {loading && (
          <ProgressBar value={progress} variant="gradient" showPercentage label="Analyzing text..." />
        )}
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
                <div className="flex items-center gap-2">
                  <TextQuote className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">Summary</span>
                </div>
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
                  {result.summary}
                </div>
              </div>
            </div>

            {result.keyPoints.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
              >
                <div className="flex items-center gap-2 border-b border-border px-5 py-3">
                  <ListChecks className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">Key Points</span>
                </div>
                <div className="divide-y divide-border">
                  {result.keyPoints.map((point, i) => (
                    <div key={i} className="p-3 px-5">
                      <p className="text-sm text-foreground/80">{point}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap items-center justify-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm"
            >
              <div className="flex items-center gap-2">
                <ChartBarBig className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  Original: <strong className="text-foreground">{result.stats.originalWords}</strong> words
                </span>
              </div>
              <div className="flex items-center gap-2">
                <TextQuote className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  Summary: <strong className="text-foreground">{result.stats.summaryWords}</strong> words
                </span>
              </div>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-emerald-500" />
                <span className="text-xs text-muted-foreground">
                  Reduced by: <strong className="text-emerald-500">{result.stats.reduction}%</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-muted text-[8px] font-medium text-muted-foreground">KW</span>
                <span className="text-xs text-muted-foreground">
                  Keywords: <strong className="text-foreground">{result.stats.topKeywords.slice(0, 4).join(", ")}</strong>
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
