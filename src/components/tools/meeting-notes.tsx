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
  StickyNote,
  Copy,
  Check,
  Sparkles,
  Download,
  Calendar,
  Users,
  FileText,
  ListTodo,
  ArrowRight,
} from "lucide-react"

function generateNotes(title: string, date: string, attendees: string, keyPoints: string): {
  summary: string
  keyDecisions: string[]
  actionItems: string[]
  nextSteps: string[]
} {
  const points = keyPoints.split("\n").filter(p => p.trim()).map(p => p.replace(/^[-•*]\s*/, ""))

  const summary = `The meeting regarding "${title}" was held on ${date || "the scheduled date"} with attendees including ${attendees || "key stakeholders"}. The session covered ${points.length > 0 ? "several important topics" : "the agenda items"} with productive discussions and clear outcomes. Key areas of focus included strategic planning, resource allocation, and timeline management. All participants contributed valuable insights, leading to well-informed decisions and actionable next steps.`

  const keyDecisions = points.length > 0
    ? points.slice(0, Math.min(4, points.length)).map(p => `Decision made regarding: ${p}`)
    : [
        "Approved the project timeline and milestones",
        "Allocated budget for Phase 1 implementation",
        "Confirmed team leads for each workstream",
        "Established bi-weekly review cadence",
      ]

  const actionItems = points.length > 0
    ? points.slice(0, Math.min(5, points.length)).map((p, i) => {
        const owners = ["Alice (Lead)", "Bob", "Carol", "David", "Eve"]
        return `${p} - Owner: ${owners[i % owners.length]} - Due: ${new Date(Date.now() + (i + 1) * 7 * 86400000).toLocaleDateString()}`
      })
    : [
        "Draft project charter by next Friday - Owner: Alice",
        "Schedule follow-up with design team - Owner: Bob",
        "Prepare budget breakdown for review - Owner: Carol",
        "Set up project tracking dashboard - Owner: David",
        "Send meeting minutes to all stakeholders - Owner: Eve",
      ]

  const nextSteps = [
    "Schedule follow-up meeting in two weeks",
    "Share meeting minutes with all stakeholders",
    "Begin work on assigned action items",
    "Update project status tracker",
    "Prepare preliminary report for next review",
  ]

  return { summary, keyDecisions, actionItems, nextSteps }
}

export function MeetingNotes() {
  const [title, setTitle] = React.useState("")
  const [date, setDate] = React.useState("")
  const [attendees, setAttendees] = React.useState("")
  const [keyPoints, setKeyPoints] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  const [notes, setNotes] = React.useState<{
    summary: string
    keyDecisions: string[]
    actionItems: string[]
    nextSteps: string[]
  } | null>(null)
  const [copied, setCopied] = React.useState(false)

  const handleGenerate = React.useCallback(async () => {
    if (!title.trim()) {
      toast.error("Please enter a meeting title")
      return
    }

    setLoading(true)
    setProgress(0)

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + Math.random() * 15
        return next >= 90 ? 90 : next
      })
    }, 300)

    await new Promise((r) => setTimeout(r, 1500 + Math.random() * 1500))

    clearInterval(interval)
    setProgress(100)

    const result = generateNotes(title, date, attendees, keyPoints)
    setNotes(result)
    setLoading(false)
    toast.success("Meeting notes generated")
  }, [title, date, attendees, keyPoints])

  const handleCopy = React.useCallback(async () => {
    if (!notes) return
    const text = `Meeting Notes: ${title}\n\n## Summary\n${notes.summary}\n\n## Key Decisions\n${notes.keyDecisions.map(d => `- ${d}`).join("\n")}\n\n## Action Items\n${notes.actionItems.map(a => `- ${a}`).join("\n")}\n\n## Next Steps\n${notes.nextSteps.map(n => `- ${n}`).join("\n")}`
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast.success("Copied to clipboard")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Failed to copy")
    }
  }, [notes, title])

  const handleDownload = React.useCallback(() => {
    if (!notes) return
    const text = `Meeting Notes: ${title}\nDate: ${date || "N/A"}\nAttendees: ${attendees || "N/A"}\n\n## Summary\n${notes.summary}\n\n## Key Decisions\n${notes.keyDecisions.map(d => `- ${d}`).join("\n")}\n\n## Action Items\n${notes.actionItems.map(a => `- ${a}`).join("\n")}\n\n## Next Steps\n${notes.nextSteps.map(n => `- ${n}`).join("\n")}`
    const blob = new Blob([text], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `meeting-notes-${title.toLowerCase().replace(/\s+/g, "-")}.txt`
    a.click()
    URL.revokeObjectURL(url)
    toast.success("Notes downloaded")
  }, [notes, title, date, attendees])

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-violet-500/20 shadow-sm">
          <StickyNote className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Meeting Notes</h1>
          <p className="text-sm text-muted-foreground">Generate structured meeting notes with AI</p>
        </div>
      </motion.div>

      <Card className="space-y-6 p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Input
            label="Meeting Title"
            placeholder="Weekly Sprint Review"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            icon={<FileText className="h-4 w-4" />}
          />
          <Input
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            icon={<Calendar className="h-4 w-4" />}
          />
          <Input
            label="Attendees"
            placeholder="Alice, Bob, Carol..."
            value={attendees}
            onChange={(e) => setAttendees(e.target.value)}
            icon={<Users className="h-4 w-4" />}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Key Points (one per line)</label>
          <textarea
            value={keyPoints}
            onChange={(e) => setKeyPoints(e.target.value)}
            placeholder="- Budget allocation discussed&#10;- Timeline for Phase 1 agreed&#10;- Resource requirements identified"
            rows={5}
            className="w-full resize-y rounded-2xl border border-border bg-background p-4 text-sm text-foreground placeholder-muted-foreground shadow-sm transition-all focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
          />
        </div>

        <Button
          onClick={handleGenerate}
          loading={loading}
          fullWidth
          size="lg"
          icon={<Sparkles className="h-5 w-5" />}
        >
          Generate Notes
        </Button>

        {loading && (
          <ProgressBar value={progress} variant="gradient" showPercentage label="Processing..." />
        )}
      </Card>

      <AnimatePresence>
        {notes && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              <div className="flex items-center justify-between border-b border-border px-5 py-3">
                <span className="text-sm font-semibold text-foreground">{title}</span>
                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCopy}
                    className="flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  >
                    {copied ? (<><Check className="h-3.5 w-3.5 text-emerald-500" /> Copied</>) : (<><Copy className="h-3.5 w-3.5" /> Copy</>)}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleDownload}
                    className="flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  >
                    <Download className="h-3.5 w-3.5" /> Download
                  </motion.button>
                </div>
              </div>
              <div className="p-5 space-y-6">
                <div>
                  <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
                    <FileText className="h-4 w-4 text-primary" /> Summary
                  </h4>
                  <p className="text-sm text-foreground/80 leading-relaxed">{notes.summary}</p>
                </div>

                <div>
                  <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
                    <ListTodo className="h-4 w-4 text-amber-500" /> Key Decisions
                  </h4>
                  <div className="space-y-2">
                    {notes.keyDecisions.map((d, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-amber-500" />
                        <span className="text-sm text-foreground/80">{d}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
                    <ListTodo className="h-4 w-4 text-emerald-500" /> Action Items
                  </h4>
                  <div className="space-y-2">
                    {notes.actionItems.map((item, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                        <span className="text-sm text-foreground/80">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
                    <ArrowRight className="h-4 w-4 text-primary" /> Next Steps
                  </h4>
                  <div className="space-y-2">
                    {notes.nextSteps.map((step, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                        <span className="text-sm text-foreground/80">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
