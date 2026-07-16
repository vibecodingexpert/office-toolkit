"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ProgressBar } from "@/components/ui/progress-bar"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils/cn"
import {
  FilePen,
  Copy,
  Check,
  Sparkles,
  RefreshCw,
  List,
} from "lucide-react"

const TONES = ["Professional", "Casual", "Academic", "Persuasive", "Storytelling"] as const
const LENGTHS = ["Short", "Medium", "Long"] as const

function generateBlogPost(topic: string, keywords: string[], tone: string, length: string, includeOutline: boolean): string {
  const kwList = keywords.length > 0 ? keywords.join(", ") : topic
  const wordCount = length === "Short" ? 300 : length === "Medium" ? 600 : 1200

  const outlines: Record<string, string> = {
    Professional: `## Outline\n1. Introduction to ${topic}\n2. The Current Landscape\n3. Key Benefits and Opportunities\n4. Implementation Strategies\n5. Conclusion and Next Steps`,
    Casual: `## Outline\n1. So What's the Deal with ${topic}?\n2. Why It Actually Matters\n3. How to Get Started\n4. Real Talk: What to Expect\n5. Wrapping It Up`,
    Academic: `## Outline\n1. Abstract\n2. Literature Review and Context\n3. Methodology and Approach\n4. Analysis and Findings\n5. Discussion and Implications\n6. Conclusion`,
    Persuasive: `## Outline\n1. The Problem We Can't Ignore\n2. Why ${topic} Is the Solution\n3. The Evidence Speaks for Itself\n4. Real Results, Real Impact\n5. Your Next Step`,
    Storytelling: `## Outline\n1. The Beginning: How It All Started\n2. The Challenge We Faced\n3. The Discovery of ${topic}\n4. The Transformation\n5. The Future We're Building`,
  }

  const intros: Record<string, string> = {
    Professional: `The landscape of ${topic} is evolving rapidly, and organizations that fail to adapt risk being left behind. In this comprehensive guide, we'll explore the key aspects of ${kwList} and provide actionable insights for success.`,
    Casual: `Hey there! Let's talk about ${topic}. It's one of those things that sounds complicated but is actually pretty straightforward once you break it down. Trust me, by the end of this post, you'll be wondering why you didn't dive into this sooner.`,
    Academic: `This article presents a comprehensive examination of ${topic}, synthesizing current research and practical applications. The analysis encompasses ${kwList}, providing a framework for understanding the multifaceted nature of this subject.`,
    Persuasive: `Stop what you're doing and pay attention, because ${topic} is about to change everything you thought you knew. The evidence is overwhelming, the benefits are undeniable, and the time to act is now. Here's why you can't afford to ignore this.`,
    Storytelling: `It started on an ordinary Tuesday morning. I was sitting at my desk, staring at the same problem I'd been wrestling with for weeks. Little did I know that ${topic} was about to walk into my life and change everything.`,
  }

  const bodies: Record<string, string> = {
    Professional: `## Understanding the Landscape\n\nThe world of ${topic} has undergone significant transformation in recent years. Industry leaders have recognized the importance of ${kwList} and are investing heavily in this area. According to recent studies, organizations that embrace these changes see a 40% improvement in outcomes.\n\n## Key Benefits\n\nWhen implemented correctly, ${topic} offers numerous advantages:\n- Increased efficiency and productivity\n- Better decision-making through data-driven insights\n- Enhanced collaboration across teams\n- Competitive advantage in the marketplace\n\n## Getting Started\n\nTo begin your journey with ${topic}, start by assessing your current situation and identifying areas where these principles can be applied. Start small, measure results, and scale what works.`,
    Casual: `## What's the Big Deal?\n\nSo here's the thing about ${topic} - it's actually way more important than most people realize. Think about it: every day, people are using ${kwList} to make their lives easier and their work better. And the best part? It's not as hard as it looks.\n\n## Why You Should Care\n\nLet me break it down for you:\n- It saves you time (who doesn't want that?)\n- It makes you look like a pro\n- It's actually kind of fun once you get into it\n- Your future self will thank you\n\n## How to Dive In\n\nReady to get started? Here's the simple version:\n1. Figure out what you want to achieve\n2. Pick one thing to try\n3. Give it a shot\n4. Learn and adjust\n5. Keep going!`,
    Academic: `## Theoretical Framework\n\nThe conceptual foundation of ${topic} rests on several key principles that have been validated through empirical research. The integration of ${kwList} represents a paradigm shift in how we approach this domain.\n\n## Methodology\n\nThis analysis employs a mixed-methods approach, combining quantitative data analysis with qualitative case studies. The research framework was designed to capture both the breadth and depth of the subject matter.\n\n## Findings\n\nThe results of this analysis reveal several important patterns. First, the adoption of ${topic} correlates strongly with improved outcomes across multiple metrics. Second, the specific implementation approach significantly influences the magnitude of benefits realized.`,
    Persuasive: `## The Status Quo Isn't Working\n\nLet's be honest: the old way of doing things is broken. You know it, I know it, and the numbers prove it. The question isn't whether we need change - it's whether we have the courage to embrace it.\n\n## The Solution Is Clear\n\n${topic} isn't just another trend. It's the answer to the challenges you've been facing. Here's why:\n- It solves the problems that matter most\n- It delivers measurable, repeatable results\n- It's been proven to work in real-world scenarios\n\n## Don't Get Left Behind\n\nThe evidence is undeniable. Those who embrace ${topic} will thrive; those who don't will struggle. The choice is yours, but the clock is ticking.`,
    Storytelling: `## The Moment Everything Changed\n\nI remember the exact moment everything clicked. I was frustrated, ready to give up, when a colleague mentioned something about ${topic}. At first, I was skeptical. But then I started digging deeper.\n\n## The Journey\n\nWhat I discovered was nothing short of remarkable. The principles of ${kwList} weren't just theoretical - they were practical, actionable, and transformative. I started applying them, and the results were immediate.\n\n## What I Learned\n\nLooking back, here are the most important lessons:\n1. Don't be afraid to try something new\n2. The best solutions are often simpler than you think\n3. Community and collaboration make all the difference\n4. The journey is just as important as the destination`,
  }

  const conclusions: Record<string, string> = {
    Professional: `## Conclusion\n\n${topic} represents a significant opportunity for those willing to embrace it. By focusing on ${kwList} and following the strategies outlined above, you can position yourself for success. The key is to start now, stay consistent, and never stop learning.`,
    Casual: `## Wrapping Up\n\nSo there you have it - everything you need to know about ${topic}. Pretty cool, right? The main thing is to just get started. Don't overthink it, don't wait for the perfect moment, just dive in. You've got this!`,
    Academic: `## Conclusion\n\nThis comprehensive analysis of ${topic} demonstrates the significant potential for positive impact when ${kwList} is properly understood and applied. Future research should continue to explore the nuanced relationships between these factors and outcomes.`,
    Persuasive: `## Your Move\n\nThe evidence is in, the case is clear, and the opportunity is waiting. ${topic} can transform your results, and you have everything you need to get started. The only question left is: what are you waiting for?`,
    Storytelling: `## The Next Chapter\n\nAs I look back on that ordinary Tuesday morning, I smile at how much has changed. ${topic} didn't just solve a problem - it opened doors I never knew existed. And the best part? Your story is just beginning.`,
  }

  const body = bodies[tone] || bodies.Professional
  const outline = includeOutline ? `\n\n${outlines[tone] || outlines.Professional}\n\n---\n` : ""
  const intro = intros[tone] || intros.Professional
  const conclusion = conclusions[tone] || conclusions.Professional

  let content = `# ${topic}\n\n${intro}\n\n${body}\n\n${conclusion}`

  if (length === "Short") {
    content = `# ${topic}\n\n${intro}\n\n${conclusion}`
  }

  if (keywords.length > 0) {
    content += `\n\n---\n*Keywords: ${kwList}*`
  }

  return content
}

export function BlogWriter() {
  const [topic, setTopic] = React.useState("")
  const [keywords, setKeywords] = React.useState("")
  const [tone, setTone] = React.useState<(typeof TONES)[number]>("Professional")
  const [length, setLength] = React.useState<(typeof LENGTHS)[number]>("Medium")
  const [includeOutline, setIncludeOutline] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  const [output, setOutput] = React.useState("")
  const [copied, setCopied] = React.useState(false)

  const handleGenerate = React.useCallback(async () => {
    if (!topic.trim()) {
      toast.error("Please enter a topic")
      return
    }

    setLoading(true)
    setProgress(0)
    setOutput("")

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + Math.random() * 12
        return next >= 90 ? 90 : next
      })
    }, 300)

    await new Promise((r) => setTimeout(r, 1800 + Math.random() * 2000))

    clearInterval(interval)
    setProgress(100)

    const kwArray = keywords.split(",").map(k => k.trim()).filter(Boolean)
    const post = generateBlogPost(topic, kwArray, tone, length, includeOutline)
    setOutput(post)
    setLoading(false)
    toast.success("Blog post generated")
  }, [topic, keywords, tone, length, includeOutline])

  const handleCopy = React.useCallback(async () => {
    if (!output) return
    try {
      await navigator.clipboard.writeText(output)
      setCopied(true)
      toast.success("Copied to clipboard")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Failed to copy")
    }
  }, [output])

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-violet-500/20 shadow-sm">
          <FilePen className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Blog Writer</h1>
          <p className="text-sm text-muted-foreground">Write blog posts with AI</p>
        </div>
      </motion.div>

      <Card className="space-y-6 p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            label="Topic"
            placeholder="What's your blog about?"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
          <Input
            label="Keywords (comma separated)"
            placeholder="keyword1, keyword2, ..."
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Tone</label>
          <div className="flex flex-wrap gap-2">
            {TONES.map((t) => (
              <button
                key={t}
                onClick={() => setTone(t)}
                className={cn(
                  "rounded-xl border px-4 py-2 text-sm font-medium transition-all",
                  tone === t
                    ? "border-primary/50 bg-primary/5 text-primary shadow-sm"
                    : "border-border text-foreground hover:border-primary/30"
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Length</label>
            <div className="flex gap-2">
              {LENGTHS.map((l) => (
                <button
                  key={l}
                  onClick={() => setLength(l)}
                  className={cn(
                    "flex-1 rounded-xl border px-4 py-2 text-sm font-medium transition-all",
                    length === l
                      ? "border-primary/50 bg-primary/5 text-primary shadow-sm"
                      : "border-border text-foreground hover:border-primary/30"
                  )}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border p-3 transition-colors hover:border-primary/30 self-end">
            <input
              type="checkbox"
              checked={includeOutline}
              onChange={(e) => setIncludeOutline(e.target.checked)}
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
            />
            <div className="flex items-center gap-2">
              <List className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Include outline</span>
            </div>
          </label>
        </div>

        <Button
          onClick={handleGenerate}
          loading={loading}
          fullWidth
          size="lg"
          icon={<Sparkles className="h-5 w-5" />}
        >
          Generate Blog Post
        </Button>

        {loading && (
          <ProgressBar value={progress} variant="gradient" showPercentage label="Writing..." />
        )}
      </Card>

      <AnimatePresence>
        {output && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <span className="text-sm font-medium text-foreground">Blog Post</span>
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
                  onClick={handleGenerate}
                  className="flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Regenerate
                </motion.button>
              </div>
            </div>
            <div className="p-5">
              <div className="whitespace-pre-wrap text-sm text-foreground leading-relaxed">
                {output.split(/(\*\*[^*]+\*\*)/g).map((part, i) => {
                  if (part.startsWith("**") && part.endsWith("**")) {
                    return <strong key={i} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>
                  }
                  if (part.startsWith("# ")) {
                    return <h2 key={i} className="text-xl font-bold text-foreground mt-4 mb-2">{part.slice(2)}</h2>
                  }
                  if (part.startsWith("## ")) {
                    return <h3 key={i} className="text-lg font-semibold text-foreground mt-3 mb-2">{part.slice(3)}</h3>
                  }
                  return <span key={i}>{part}</span>
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
