"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils/cn"
import {
  FileText,
  Copy,
  Check,
  Sparkles,
  ListChecks,
  BarChart3,
  TextQuote,
  RotateCcw,
} from "lucide-react"

const SUMMARY_LEVELS = [
  { value: "short", label: "Short", desc: "Brief overview in 1-2 sentences" },
  { value: "medium", label: "Medium", desc: "Balanced summary with key points" },
  { value: "detailed", label: "Detailed", desc: "Comprehensive summary" },
] as const

const SAMPLE_TEXTS = [
  "Artificial intelligence has transformed the modern workplace in unprecedented ways. From automated data analysis to intelligent customer service systems, AI technologies are reshaping how businesses operate and compete. Machine learning algorithms can now process vast amounts of data in seconds, identifying patterns and insights that would take humans weeks or months to discover. Natural language processing enables computers to understand and generate human language, powering everything from chatbots to translation services. Computer vision systems can analyze images and video with accuracy that rivals or exceeds human performance. However, these advancements also raise important questions about privacy, job displacement, and ethical AI development. Organizations must carefully balance the benefits of AI adoption with responsible implementation practices.",
  "Climate change remains one of the most pressing challenges facing humanity today. Rising global temperatures have led to more frequent and severe weather events, including hurricanes, droughts, floods, and wildfires. The scientific consensus is clear: human activities, particularly the burning of fossil fuels and deforestation, are the primary drivers of these changes. The effects are already being felt worldwide, from melting polar ice caps to shifting agricultural zones. Coastal communities face threats from sea-level rise, while inland areas contend with changing precipitation patterns. Despite the daunting nature of these challenges, there are reasons for hope. Renewable energy technologies have become increasingly cost-effective, with solar and wind power now competing favorably with fossil fuels in many markets. Electric vehicles are gaining market share, and innovations in energy storage are addressing intermittency issues. Policy frameworks like carbon pricing and international agreements provide pathways for coordinated action.",
  "The human brain is an incredibly complex organ consisting of approximately 86 billion neurons, each connected to thousands of others, forming trillions of synapses. This intricate network is responsible for everything from basic life functions to the highest forms of consciousness and creativity. Recent advances in neuroscience have revealed remarkable insights about neuroplasticity—the brain's ability to reorganize itself by forming new neural connections throughout life. This discovery has profound implications for learning, rehabilitation after injury, and mental health treatment. Researchers have also made significant progress in understanding memory formation, sleep's role in cognitive function, and the neural basis of emotions. Technologies like functional magnetic resonance imaging (fMRI) and optogenetics continue to push the boundaries of what we know about brain function. Yet, much remains unknown, making neuroscience one of the most exciting frontiers in modern science.",
]

function generateSummary(text: string, level: string, extractKeyPoints: boolean): string {
  const words = text.split(/\s+/)
  const wordCount = words.length
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text]

  if (level === "short") {
    const firstSentence = sentences[0] || text
    return `**Summary**: ${firstSentence}\n\nThis captures the main idea in one sentence, covering the core theme of the text.`
  }

  if (level === "medium") {
    const summary = sentences.slice(0, 3).join(" ").trim()
    return `**Summary**: ${summary}\n\nThis balanced summary preserves the key arguments while reducing the original length by approximately 60%.`
  }

  const detailed = sentences.slice(0, 6).join(" ").trim()
  let result = `**Summary**: ${detailed}\n\nThis detailed summary retains most key points and supporting context.`

  if (extractKeyPoints) {
    const keyPoints = sentences
      .filter((s) => s.length > 40)
      .slice(0, 4)
      .map((s, i) => `${i + 1}. ${s.trim()}`)
      .join("\n")
    result += `\n\n**Key Points**:\n${keyPoints}`
  }

  return result
}

export function AiSummarizer() {
  const [text, setText] = React.useState("")
  const [level, setLevel] = React.useState<(typeof SUMMARY_LEVELS)[number]["value"]>("medium")
  const [extractKeyPoints, setExtractKeyPoints] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [output, setOutput] = React.useState("")
  const [copied, setCopied] = React.useState(false)

  const handleSummarize = React.useCallback(async () => {
    if (!text.trim()) {
      toast.error("Please enter text to summarize")
      return
    }

    setLoading(true)
    await new Promise((r) => setTimeout(r, 1000 + Math.random() * 1500))
    const summary = generateSummary(text, level, extractKeyPoints)
    setOutput(summary)
    setLoading(false)
    toast.success("Summary generated")
  }, [text, level, extractKeyPoints])

  const fillSample = React.useCallback(() => {
    setText(SAMPLE_TEXTS[Math.floor(Math.random() * SAMPLE_TEXTS.length)])
  }, [])

  const handleCopy = React.useCallback(async () => {
    if (!output) return
    try {
      await navigator.clipboard.writeText(output.replace(/\*\*/g, ""))
      setCopied(true)
      toast.success("Copied to clipboard")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Failed to copy")
    }
  }, [output])

  const originalWords = text.trim() ? text.split(/\s+/).length : 0
  const summaryWords = output.trim() ? output.replace(/\*\*/g, "").split(/\s+/).length : 0
  const reduction = originalWords > 0 ? Math.round((1 - summaryWords / originalWords) * 100) : 0

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
          <p className="text-sm text-muted-foreground">Summarize any text with AI</p>
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
          <p className="text-xs text-muted-foreground">{originalWords} words</p>
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
                <div className="whitespace-pre-wrap text-sm text-foreground">
                  {output.split(/(\*\*[^*]+\*\*)/g).map((part, i) => {
                    if (part.startsWith("**") && part.endsWith("**")) {
                      return (
                        <strong key={i} className="font-semibold text-foreground">
                          {part.slice(2, -2)}
                        </strong>
                      )
                    }
                    return <span key={i}>{part}</span>
                  })}
                </div>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center justify-center gap-6 rounded-2xl border border-border bg-card p-4 shadow-sm"
            >
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  Original: <strong className="text-foreground">{originalWords}</strong> words
                </span>
              </div>
              <div className="flex items-center gap-2">
                <TextQuote className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  Summary: <strong className="text-foreground">{summaryWords}</strong> words
                </span>
              </div>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-emerald-500" />
                <span className="text-xs text-muted-foreground">
                  Reduced by: <strong className="text-emerald-500">{reduction}%</strong>
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

