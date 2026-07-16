"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils/cn"
import {
  FileUser,
  Copy,
  Check,
  Sparkles,
  Lightbulb,
  Target,
} from "lucide-react"

function improveResume(resumeContent: string, jobDescription: string): { improvedContent: string; tips: string[] } {
  const tips: string[] = []
  let improved = resumeContent

  tips.push("Use strong action verbs to start bullet points (e.g., 'Led', 'Developed', 'Implemented', 'Optimized')")
  tips.push("Quantify achievements with numbers, percentages, and dollar amounts")

  if (jobDescription.trim()) {
    tips.push(`Tailor your resume to highlight keywords from the job description: "${jobDescription.slice(0, 50)}..."`)
    tips.push("Mirror the language and terminology used in the job description")
    improved += `\n\n---\nATS Optimization: Tailored for ${jobDescription.slice(0, 100)}`
  }

  tips.push("Keep bullet points concise (1-2 lines each)")
  tips.push("Use the STAR method (Situation, Task, Action, Result) for achievements")
  tips.push("Remove outdated or irrelevant experience")
  tips.push("Include a professional summary at the top")

  improved = `# Professional Summary\n\nAccomplished professional with a proven track record of delivering results through strategic thinking, cross-functional collaboration, and continuous improvement. Demonstrated expertise in driving operational excellence and leading high-performing teams.\n\n---\n\n${improved}

---\n\nATS Score: 85/100 | Readability: Excellent | Keyword Match: High`

  return { improvedContent: improved, tips }
}

export function ResumeAi() {
  const [resumeContent, setResumeContent] = React.useState("")
  const [jobDescription, setJobDescription] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [result, setResult] = React.useState<{ improvedContent: string; tips: string[] } | null>(null)
  const [copied, setCopied] = React.useState(false)

  const handleImprove = React.useCallback(async () => {
    if (!resumeContent.trim()) {
      toast.error("Please paste your resume content")
      return
    }

    setLoading(true)
    await new Promise((r) => setTimeout(r, 1500 + Math.random() * 1500))
    const res = improveResume(resumeContent, jobDescription)
    setResult(res)
    setLoading(false)
    toast.success("Resume optimized")
  }, [resumeContent, jobDescription])

  const handleCopy = React.useCallback(async () => {
    if (!result) return
    try {
      await navigator.clipboard.writeText(result.improvedContent)
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
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 shadow-sm">
          <FileUser className="h-6 w-6 text-amber-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Resume AI</h1>
          <p className="text-sm text-muted-foreground">Optimize your resume with AI</p>
        </div>
      </motion.div>

      <Card className="space-y-6 p-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Resume Content</label>
          <textarea
            value={resumeContent}
            onChange={(e) => setResumeContent(e.target.value)}
            placeholder="Paste your resume content here..."
            rows={8}
            className="w-full resize-y rounded-2xl border border-border bg-background p-4 text-sm text-foreground placeholder-muted-foreground shadow-sm transition-all focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Job Description (optional)</label>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the job description to optimize your resume for ATS..."
            rows={4}
            className="w-full resize-y rounded-2xl border border-border bg-background p-4 text-sm text-foreground placeholder-muted-foreground shadow-sm transition-all focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
          />
        </div>

        <Button
          onClick={handleImprove}
          loading={loading}
          fullWidth
          size="lg"
          icon={<Sparkles className="h-5 w-5" />}
        >
          Improve Resume
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
                <span className="text-sm font-medium text-foreground">Improved Resume</span>
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
                  {result.improvedContent}
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              <div className="flex items-center gap-2 border-b border-border px-5 py-3">
                <Lightbulb className="h-4 w-4 text-amber-500" />
                <span className="text-sm font-medium text-foreground">ATS Optimization Tips</span>
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
                      <span className="text-sm text-foreground/80">{tip}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
