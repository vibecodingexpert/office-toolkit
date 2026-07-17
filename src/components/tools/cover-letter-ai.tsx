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
  Building2,
  User,
  Target,
  Download,
} from "lucide-react"

const INDUSTRIES = [
  "Technology", "Finance", "Healthcare", "Marketing", "Education",
  "Consulting", "Sales", "Design", "Legal", "Non-Profit",
] as const

const TONES = ["Professional", "Enthusiastic", "Confident", "Warm", "Formal"] as const

const HIGHLIGHT_TEMPLATES = {
  leadership: "Led cross-functional teams to deliver [PROJECT] resulting in [METRIC] improvement.",
  technical: "Developed and deployed [TECHNOLOGY] solutions that improved [METRIC] by [PERCENTAGE]%.",
  communication: "Communicated complex [TOPIC] to [AUDIENCE], resulting in successful [OUTCOME].",
  problemSolving: "Identified and resolved [PROBLEM] through systematic analysis, saving [RESOURCE].",
  innovation: "Pioneered [INITIATIVE] that transformed [AREA] and generated [RESULT].",
  collaboration: "Partnered with [TEAM/DEPARTMENT] to execute [PROJECT] achieving [GOAL].",
}

function generateCoverLetter(data: {
  yourName: string
  companyName: string
  position: string
  industry: string
  tone: string
  highlights: string[]
  recipientName: string
  additionalNotes: string
}): string {
  const greeting = data.recipientName ? `Dear ${data.recipientName},` : "Dear Hiring Manager,"
  const companyLower = data.companyName || "[Company Name]"
  const positionLower = data.position || "[Position]"

  const toneOpenings: Record<string, string> = {
    Professional: `I am writing to express my strong interest in the ${positionLower} position at ${companyLower}. With my background in ${data.industry.toLowerCase()} and proven track record of delivering results, I am confident that my skills align well with the requirements of this role.`,
    Enthusiastic: `I was thrilled to discover the ${positionLower} opening at ${companyLower}! As a long-time admirer of your innovative work in ${data.industry.toLowerCase()}, I would be honored to bring my expertise and passion to your team.`,
    Confident: `Your search for a ${positionLower} ends with me. My extensive experience in ${data.industry.toLowerCase()} and history of exceeding expectations make me the ideal candidate to drive results at ${companyLower}.`,
    Warm: `I was delighted to learn about the ${positionLower} opportunity at ${companyLower}. Your company's reputation for excellence in ${data.industry.toLowerCase()} resonates deeply with my own professional values and aspirations.`,
    Formal: `I hereby submit my application for the ${positionLower} position at ${companyLower}. My professional qualifications and experience in ${data.industry.toLowerCase()} are detailed herein for your consideration.`,
  }

  const highlightBullets = data.highlights.length > 0
    ? data.highlights.map((h) => `• ${h}`).join("\n")
    : `• ${HIGHLIGHT_TEMPLATES.leadership.replace("[PROJECT]", "key initiatives").replace("[METRIC]", "significant growth")}\n• ${HIGHLIGHT_TEMPLATES.technical.replace("[TECHNOLOGY]", "innovative").replace("[METRIC]", "efficiency").replace("[PERCENTAGE]", "30")}\n• ${HIGHLIGHT_TEMPLATES.collaboration.replace("[TEAM/DEPARTMENT]", "multiple departments").replace("[PROJECT]", "complex deliverables").replace("[GOAL]", "organizational targets")}`

  const toneClosings: Record<string, string> = {
    Professional: `Thank you for considering my application. I look forward to the opportunity to discuss how my experience and skills can contribute to the continued success of ${companyLower}.`,
    Enthusiastic: `I can't wait to bring my energy and expertise to ${companyLower}! Thank you for your time and consideration.`,
    Confident: `I am eager to demonstrate exactly why I am the right choice for this role. Thank you for your time and consideration.`,
    Warm: `I would be thrilled to join the ${companyLower} team and contribute to your mission. Thank you for your thoughtful consideration.`,
    Formal: `I appreciate your time in reviewing my application and look forward to your response at your earliest convenience.`,
  }

  return `${greeting}

${toneOpenings[data.tone] || toneOpenings.Professional}

Throughout my career, I have developed a strong skill set that directly aligns with the ${positionLower} position:

${highlightBullets}

${data.additionalNotes ? `\n${data.additionalNotes}\n` : ""}I am particularly drawn to ${companyLower} because of your commitment to excellence and innovation in ${data.industry.toLowerCase()}. I am confident that my proactive approach, strong work ethic, and collaborative mindset would make me a valuable addition to your team.

${toneClosings[data.tone] || toneClosings.Professional}

Best regards,
${data.yourName || "[Your Name]"}
[Phone Number]
[Email Address]
[LinkedIn Profile]
`
}

export function CoverLetterAI() {
  const [yourName, setYourName] = React.useState("")
  const [companyName, setCompanyName] = React.useState("")
  const [position, setPosition] = React.useState("")
  const [recipientName, setRecipientName] = React.useState("")
  const [industry, setIndustry] = React.useState<(typeof INDUSTRIES)[number]>("Technology")
  const [tone, setTone] = React.useState<(typeof TONES)[number]>("Professional")
  const [highlights, setHighlights] = React.useState([""])
  const [additionalNotes, setAdditionalNotes] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  const [coverLetter, setCoverLetter] = React.useState("")
  const [copied, setCopied] = React.useState(false)

  const handleAddHighlight = () => setHighlights([...highlights, ""])

  const handleHighlightChange = (idx: number, val: string) => {
    const updated = [...highlights]; updated[idx] = val; setHighlights(updated)
  }

  const handleRemoveHighlight = (idx: number) => {
    if (highlights.length <= 1) return
    setHighlights(highlights.filter((_, i) => i !== idx))
  }

  const handleGenerate = React.useCallback(async () => {
    if (!yourName.trim()) {
      toast.error("Please enter your name")
      return
    }

    setLoading(true); setProgress(0)
    const result = generateCoverLetter({
      yourName, companyName, position, industry, tone,
      highlights: highlights.filter(Boolean),
      recipientName, additionalNotes,
    })
    setProgress(100)
    setCoverLetter(result)
    setLoading(false)
    toast.success("Cover letter generated")
  }, [yourName, companyName, position, industry, tone, highlights, recipientName, additionalNotes])

  const handleCopy = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(coverLetter)
      setCopied(true); toast.success("Copied to clipboard")
      setTimeout(() => setCopied(false), 2000)
    } catch { toast.error("Failed to copy") }
  }, [coverLetter])

  const handleDownload = React.useCallback(() => {
    const blob = new Blob([coverLetter], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url; a.download = "cover_letter.md"
    document.body.appendChild(a); a.click()
    document.body.removeChild(a); URL.revokeObjectURL(url)
    toast.success("Downloaded")
  }, [coverLetter])

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-violet-500/20 shadow-sm">
          <FileText className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Cover Letter AI</h1>
          <p className="text-sm text-muted-foreground">Write compelling cover letters for any job</p>
        </div>
      </motion.div>

      <Card className="space-y-6 p-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Your Name</label>
            <input value={yourName} onChange={e => setYourName(e.target.value)} placeholder="Jane Doe" className="w-full rounded-2xl border border-border bg-background p-3 text-sm outline-none focus:border-primary/50" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Recipient Name (optional)</label>
            <input value={recipientName} onChange={e => setRecipientName(e.target.value)} placeholder="Hiring Manager" className="w-full rounded-2xl border border-border bg-background p-3 text-sm outline-none focus:border-primary/50" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Company Name</label>
            <input value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Acme Corp" className="w-full rounded-2xl border border-border bg-background p-3 text-sm outline-none focus:border-primary/50" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Position</label>
            <input value={position} onChange={e => setPosition(e.target.value)} placeholder="Senior Developer" className="w-full rounded-2xl border border-border bg-background p-3 text-sm outline-none focus:border-primary/50" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Industry</label>
          <div className="flex flex-wrap gap-2">
            {INDUSTRIES.map(ind => (
              <button key={ind} onClick={() => setIndustry(ind)} className={cn("rounded-xl border px-3 py-1.5 text-xs font-medium transition-all", industry === ind ? "border-primary/50 bg-primary/5 text-primary shadow-sm" : "border-border text-foreground hover:border-primary/30")}>{ind}</button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Tone</label>
          <div className="flex flex-wrap gap-2">
            {TONES.map(t => (
              <button key={t} onClick={() => setTone(t)} className={cn("rounded-xl border px-3 py-1.5 text-xs font-medium transition-all", tone === t ? "border-primary/50 bg-primary/5 text-primary shadow-sm" : "border-border text-foreground hover:border-primary/30")}>{t}</button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">Key Highlights</label>
            <button onClick={handleAddHighlight} className="rounded-lg border border-border px-3 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors">+ Add</button>
          </div>
          {highlights.map((h, i) => (
            <div key={i} className="flex items-center gap-2">
              <input value={h} onChange={e => handleHighlightChange(i, e.target.value)} placeholder={`e.g., Led team that increased revenue by 30%`} className="flex-1 rounded-xl border border-border bg-background p-2.5 text-xs outline-none focus:border-primary/50" />
              {highlights.length > 1 && (
                <button onClick={() => handleRemoveHighlight(i)} className="shrink-0 text-xs text-red-500 hover:text-red-400">Remove</button>
              )}
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Additional Notes (optional)</label>
          <textarea value={additionalNotes} onChange={e => setAdditionalNotes(e.target.value)} rows={3} placeholder="Any specific points you want to include..." className="w-full resize-y rounded-2xl border border-border bg-background p-3 text-sm outline-none focus:border-primary/50" />
        </div>

        <Button onClick={handleGenerate} loading={loading} fullWidth size="lg" icon={<Sparkles className="h-5 w-5" />}>Generate Cover Letter</Button>
        {loading && <ProgressBar value={progress} variant="gradient" showPercentage label="Writing..." />}
      </Card>

      <AnimatePresence>
        {coverLetter && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <span className="text-sm font-medium text-foreground">Your Cover Letter</span>
              <div className="flex items-center gap-2">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleDownload} className="flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"><Download className="h-3.5 w-3.5" /> Download</motion.button>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleCopy} className="flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">{copied ? (<><Check className="h-3.5 w-3.5 text-emerald-500" /> Copied</>) : (<><Copy className="h-3.5 w-3.5" /> Copy</>)}</motion.button>
              </div>
            </div>
            <pre className="p-5 text-sm leading-relaxed whitespace-pre-wrap font-sans text-foreground">{coverLetter}</pre>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
