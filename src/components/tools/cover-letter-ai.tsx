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
  FileEdit,
  Copy,
  Check,
  Sparkles,
  RefreshCw,
  User,
  Building2,
  Briefcase,
} from "lucide-react"

function generateCoverLetter(
  name: string,
  company: string,
  position: string,
  skills: string,
): string {
  const skillList = skills.split(",").map(s => s.trim()).filter(Boolean)
  const skillExamples = skillList.length > 0
    ? skillList.slice(0, 4).join(", ")
    : "relevant skills and experiences"

  const templates = [
    `Dear Hiring Manager,

I am writing to express my strong interest in the ${position} position at ${company}. With my background in ${skillExamples}, I am confident that I would be a valuable addition to your team.

Throughout my career, I have developed a passion for delivering results and driving innovation. ${skillList.length > 0 ? `My expertise in ${skillList.slice(0, 3).join(", ")} has enabled me to consistently exceed expectations and deliver measurable impact.` : ""}

What particularly excites me about ${company} is your reputation for excellence and innovation in the industry. I have been following your work and am impressed by the impact you've made. I am eager to bring my skills and enthusiasm to your organization.

I would welcome the opportunity to discuss how my background and skills align with the needs of your team. Thank you for considering my application.

Best regards,
${name}`,

    `Dear Hiring Team,

I was thrilled to learn about the ${position} opening at ${company}. As a professional with strong experience in ${skillExamples}, I believe I am well-positioned to contribute to your team's success.

My professional journey has been driven by a commitment to excellence and continuous growth. ${skillList.length > 0 ? `I have honed my abilities in ${skillList.slice(0, 3).join(", ")}, allowing me to tackle complex challenges and deliver outstanding results.` : ""}

${company} stands out to me as an organization that values innovation and quality. I share these values and am excited about the opportunity to contribute to your continued success. My background in ${skillExamples} would allow me to hit the ground running and make an immediate impact.

I look forward to the possibility of discussing this role further and demonstrating how I can add value to ${company}.

Sincerely,
${name}`,

    `Dear Hiring Manager,

I am writing to apply for the ${position} position at ${company}. With extensive experience in ${skillExamples}, I am confident that I possess the skills and drive necessary to excel in this role.

My career has been characterized by a focus on achieving tangible results. ${skillList.length > 0 ? `Through my work in ${skillList.slice(0, 3).join(", ")}, I have developed a track record of success that I am eager to bring to ${company}.` : ""}

I have long admired ${company}'s commitment to innovation and excellence. I believe my proactive approach and dedication to quality align perfectly with your organization's values and goals. I am excited about the opportunity to contribute to your team.

Thank you for your time and consideration. I look forward to hearing from you.

Best regards,
${name}`,
  ]

  return templates[Math.floor(Math.random() * templates.length)]
}

export function CoverLetterAi() {
  const [name, setName] = React.useState("")
  const [company, setCompany] = React.useState("")
  const [position, setPosition] = React.useState("")
  const [skills, setSkills] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  const [output, setOutput] = React.useState("")
  const [copied, setCopied] = React.useState(false)

  const handleGenerate = React.useCallback(async () => {
    if (!name.trim() || !company.trim() || !position.trim()) {
      toast.error("Please fill in your name, company, and position")
      return
    }

    setLoading(true)
    setProgress(0)
    setOutput("")

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + Math.random() * 20
        return next >= 90 ? 90 : next
      })
    }, 300)

    await new Promise((r) => setTimeout(r, 1200 + Math.random() * 1500))

    clearInterval(interval)
    setProgress(100)

    const letter = generateCoverLetter(name, company, position, skills)
    setOutput(letter)
    setLoading(false)
    toast.success("Cover letter generated")
  }, [name, company, position, skills])

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
          <FileEdit className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Cover Letter AI</h1>
          <p className="text-sm text-muted-foreground">Write cover letters with AI</p>
        </div>
      </motion.div>

      <Card className="space-y-6 p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Input
            label="Your Name"
            placeholder="e.g. John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            icon={<User className="h-4 w-4" />}
          />
          <Input
            label="Company Name"
            placeholder="e.g. Acme Corp"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            icon={<Building2 className="h-4 w-4" />}
          />
          <Input
            label="Position"
            placeholder="e.g. Software Engineer"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            icon={<Briefcase className="h-4 w-4" />}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Skills & Experience (optional)</label>
          <textarea
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            placeholder="List your relevant skills and experience (comma separated)..."
            rows={3}
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
          Generate Cover Letter
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
              <span className="text-sm font-medium text-foreground">Cover Letter</span>
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
                {output}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
