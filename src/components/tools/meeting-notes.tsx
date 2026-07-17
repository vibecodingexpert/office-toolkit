"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProgressBar } from "@/components/ui/progress-bar"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils/cn"
import {
  ClipboardList,
  Copy,
  Check,
  Sparkles,
  Clock,
  Users,
  ListChecks,
  Hash,
  Download,
} from "lucide-react"

const MEETING_TYPES = [
  { id: "standup", label: "Daily Standup", icon: "☀️" },
  { id: "sprint", label: "Sprint Planning", icon: "📋" },
  { id: "retro", label: "Retrospective", icon: "🔄" },
  { id: "one-on-one", label: "1:1 Meeting", icon: "👤" },
  { id: "client", label: "Client Meeting", icon: "🤝" },
  { id: "all-hands", label: "All-Hands", icon: "📢" },
  { id: "brainstorm", label: "Brainstorming", icon: "💡" },
  { id: "review", label: "Project Review", icon: "📊" },
] as const

const TONES = ["Professional", "Casual", "Detailed", "Concise"] as const

function generateNotes(data: {
  type: string
  title: string
  date: string
  duration: string
  attendees: string
  agenda: string
  discussion: string
  decisions: string
  tone: string
}): string {
  const timestamp = new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  })

  const toneIntros: Record<string, string> = {
    Professional: `Meeting conducted professionally with all agenda items addressed.`,
    Casual: `Great team sync - everyone shared updates and we made solid progress.`,
    Detailed: `Comprehensive meeting covering all agenda items in depth with detailed discussion notes.`,
    Concise: `Focused meeting. All key points addressed efficiently.`,
  }

  const typeHeaders: Record<string, string> = {
    standup: "## Standup Updates\n\n### ✅ Done\n- [Completed tasks]\n\n### 🔄 In Progress\n- [Ongoing work]\n\n### 🚧 Blockers\n- [Blockers]",
    retro: "## Retrospective Notes\n\n### 👍 What Went Well\n- [Positive points]\n\n### 🔧 What to Improve\n- [Improvement areas]\n\n### 🎯 Action Items\n- [Action items]",
    "one-on-one": "## 1:1 Discussion\n\n### 📝 Personal Updates\n- [Updates]\n\n### 🎯 Goals & Progress\n- [Goals]\n\n### 💬 Feedback\n- [Feedback]",
    client: "## Client Meeting Notes\n\n### 🎯 Meeting Objectives\n- [Objectives]\n\n### 💡 Key Discussion Points\n- [Points]\n\n### ✅ Next Steps\n- [Next steps]",
    "all-hands": "## All-Hands Summary\n\n### 🏆 Company Updates\n- [Updates]\n\n### 📊 Department Highlights\n- [Highlights]\n\n### ❓ Q&A Summary\n- [Questions and answers]",
    brainstorm: "## Brainstorming Session\n\n### 💡 Ideas Generated\n- [Idea 1]\n- [Idea 2]\n- [Idea 3]\n\n### 👍 Top Rated Ideas\n- [Top ideas]\n\n### 🎯 Next Steps\n- [Next steps]",
    review: "## Project Review\n\n### ✅ Completed Milestones\n- [Milestones]\n\n### 📈 Metrics & KPIs\n- [Metrics]\n\n### 🔮 Road Ahead\n- [Upcoming]",
  }

  const agendaLines = data.agenda ? data.agenda.split("\n").filter(Boolean).map(a => `- ${a}`).join("\n") : "- [Agenda item 1]\n- [Agenda item 2]\n- [Agenda item 3]"
  const discussionLines = data.discussion ? data.discussion.split("\n").filter(Boolean).map(d => `- ${d}`).join("\n") : "- [Discussion point 1]\n- [Discussion point 2]"
  const decisionsLines = data.decisions ? data.decisions.split("\n").filter(Boolean).map(d => `- ${d}`).join("\n") : "- [Decision 1]"

  return `# ${data.title || "Meeting Notes"}

**Date:** ${data.date || timestamp}
**Duration:** ${data.duration || "60 min"}
**Attendees:** ${data.attendees || "[Attendees]"}
**Type:** ${MEETING_TYPES.find(m => m.id === data.type)?.label || "Meeting"}
**Tone:** ${data.tone}

---

## Overview

${toneIntros[data.tone] || toneIntros.Professional}

## Agenda

${agendaLines}

## Discussion Notes

${discussionLines}

## Decisions Made

${decisionsLines}

${typeHeaders[data.type] || ""}

## Action Items

| Action Item | Owner | Due Date |
|-------------|-------|----------|
| [Task 1] | [Owner] | [Date] |
| [Task 2] | [Owner] | [Date] |
| [Task 3] | [Owner] | [Date] |

---

*Notes generated on ${new Date().toLocaleString()}*
`
}

export function MeetingNotes() {
  const [type, setType] = React.useState<string>("standup")
  const [title, setTitle] = React.useState("")
  const [date, setDate] = React.useState(new Date().toISOString().split("T")[0])
  const [duration, setDuration] = React.useState("30 min")
  const [attendees, setAttendees] = React.useState("")
  const [agenda, setAgenda] = React.useState("")
  const [discussion, setDiscussion] = React.useState("")
  const [decisions, setDecisions] = React.useState("")
  const [tone, setTone] = React.useState<(typeof TONES)[number]>("Professional")
  const [loading, setLoading] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  const [notes, setNotes] = React.useState("")
  const [copied, setCopied] = React.useState(false)

  const handleGenerate = React.useCallback(async () => {
    if (!title.trim()) {
      toast.error("Please enter a meeting title")
      return
    }

    setLoading(true); setProgress(0)

    setNotes(generateNotes({ type, title, date, duration, attendees, agenda, discussion, decisions, tone }))
    setProgress(100)
    setLoading(false)
    toast.success("Meeting notes generated")
  }, [type, title, date, duration, attendees, agenda, discussion, decisions, tone])

  const handleCopy = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(notes)
      setCopied(true); toast.success("Copied")
      setTimeout(() => setCopied(false), 2000)
    } catch { toast.error("Failed to copy") }
  }, [notes])

  const handleDownload = React.useCallback(() => {
    const blob = new Blob([notes], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url; a.download = "meeting_notes.md"
    document.body.appendChild(a); a.click()
    document.body.removeChild(a); URL.revokeObjectURL(url)
    toast.success("Downloaded")
  }, [notes])

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-violet-500/20 shadow-sm">
          <ClipboardList className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Meeting Notes</h1>
          <p className="text-sm text-muted-foreground">Generate structured meeting notes</p>
        </div>
      </motion.div>

      <Card className="space-y-6 p-6">
        <div className="flex flex-wrap gap-2">
          {MEETING_TYPES.map(mt => (
            <button key={mt.id} onClick={() => setType(mt.id)} className={cn("rounded-xl border px-3 py-1.5 text-xs font-medium transition-all", type === mt.id ? "border-primary/50 bg-primary/5 text-primary shadow-sm" : "border-border text-foreground hover:border-primary/30")}>{mt.icon} {mt.label}</button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Meeting Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Sprint Planning - Week 12" className="w-full rounded-2xl border border-border bg-background p-3 text-sm outline-none focus:border-primary/50" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full rounded-2xl border border-border bg-background p-3 text-sm outline-none focus:border-primary/50" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Duration</label>
            <select value={duration} onChange={e => setDuration(e.target.value)} className="w-full rounded-2xl border border-border bg-background p-3 text-sm outline-none focus:border-primary/50">
              {["15 min", "30 min", "45 min", "60 min", "90 min", "2 hours"].map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Tone</label>
            <div className="flex gap-2">
              {TONES.map(t => (
                <button key={t} onClick={() => setTone(t)} className={cn("flex-1 rounded-xl border px-3 py-2 text-xs font-medium transition-all", tone === t ? "border-primary/50 bg-primary/5 text-primary shadow-sm" : "border-border text-foreground hover:border-primary/30")}>{t}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Attendees</label>
          <input value={attendees} onChange={e => setAttendees(e.target.value)} placeholder="John, Sarah, Mike (comma separated)" className="w-full rounded-2xl border border-border bg-background p-3 text-sm outline-none focus:border-primary/50" />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Agenda</label>
          <textarea value={agenda} onChange={e => setAgenda(e.target.value)} rows={3} placeholder="One item per line..." className="w-full resize-y rounded-2xl border border-border bg-background p-3 text-sm outline-none focus:border-primary/50" />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Discussion Notes</label>
          <textarea value={discussion} onChange={e => setDiscussion(e.target.value)} rows={4} placeholder="Key points discussed..." className="w-full resize-y rounded-2xl border border-border bg-background p-3 text-sm outline-none focus:border-primary/50" />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Decisions Made</label>
          <textarea value={decisions} onChange={e => setDecisions(e.target.value)} rows={3} placeholder="One decision per line..." className="w-full resize-y rounded-2xl border border-border bg-background p-3 text-sm outline-none focus:border-primary/50" />
        </div>

        <Button onClick={handleGenerate} loading={loading} fullWidth size="lg" icon={<Sparkles className="h-5 w-5" />}>Generate Notes</Button>
        {loading && <ProgressBar value={progress} variant="gradient" showPercentage label="Organizing notes..." />}
      </Card>

      <AnimatePresence>
        {notes && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <span className="text-sm font-medium text-foreground">Meeting Notes</span>
              <div className="flex items-center gap-2">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleDownload} className="flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"><Download className="h-3.5 w-3.5" /> Download</motion.button>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleCopy} className="flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">{copied ? (<><Check className="h-3.5 w-3.5 text-emerald-500" /> Copied</>) : (<><Copy className="h-3.5 w-3.5" /> Copy</>)}</motion.button>
              </div>
            </div>
            <pre className="p-5 text-sm leading-relaxed whitespace-pre-wrap font-sans text-foreground">{notes}</pre>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
