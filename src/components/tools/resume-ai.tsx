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
  Briefcase,
  GraduationCap,
  Target,
  Star,
  Download,
} from "lucide-react"

const INDUSTRIES = [
  "Technology", "Finance", "Healthcare", "Marketing", "Education",
  "Consulting", "Sales", "Design", "Manufacturing", "Legal",
] as const

const EXPERIENCE_LEVELS = ["Entry", "Mid-Level", "Senior", "Lead", "Executive"] as const

const RESUME_STYLES = [
  { id: "modern", label: "Modern" },
  { id: "classic", label: "Classic" },
  { id: "creative", label: "Creative" },
  { id: "minimal", label: "Minimal" },
] as const

const ACTION_VERBS = [
  "Achieved", "Developed", "Implemented", "Led", "Optimized", "Designed",
  "Launched", "Managed", "Delivered", "Drove", "Established", "Generated",
  "Improved", "Increased", "Initiated", "Integrated", "Introduced", "Negotiated",
  "Orchestrated", "Pioneered", "Produced", "Reduced", "Reorganized", "Spearheaded",
  "Streamlined", "Strengthened", "Transformed", "Upgraded",
] as const

const SKILL_CATEGORIES = {
  "Technical": ["JavaScript", "Python", "React", "Node.js", "SQL", "AWS", "Docker", "Git", "TypeScript", "REST APIs", "GraphQL", "CI/CD"],
  "Soft": ["Leadership", "Communication", "Problem Solving", "Team Collaboration", "Project Management", "Critical Thinking", "Adaptability", "Time Management"],
  "Domain": ["Agile/Scrum", "Data Analysis", "Product Strategy", "User Research", "A/B Testing", "KPI Tracking", "Budget Management", "Stakeholder Management"],
}

const INDUSTRY_KEYWORDS: Record<string, string[]> = {
  Technology: ["Agile", "SDLC", "API", "Microservices", "Cloud", "DevOps", "CI/CD", "Full Stack"],
  Finance: ["ROI", "P&L", "Compliance", "Risk Management", "Financial Modeling", "Audit", "GAAP"],
  Healthcare: ["HIPAA", "Patient Care", "Clinical", "EMR/EHR", "Regulatory", "Compliance"],
  Marketing: ["ROI", "KPI", "SEO/SEM", "Content Strategy", "Brand Management", "Campaign", "Analytics"],
  Education: ["Curriculum", "Assessment", "Pedagogy", "Student Engagement", "Accreditation"],
  Consulting: ["Strategy", "Stakeholder", "Deliverables", "Business Development", "Process Improvement"],
  Sales: ["Revenue", "CRM", "Pipeline", "Forecasting", "Territory", "Quota", "Negotiation"],
  Design: ["Figma", "Design System", "User Research", "Prototyping", "UI/UX", "Brand Identity"],
  Manufacturing: ["Lean", "Six Sigma", "Supply Chain", "Inventory", "Quality Assurance", "ERP"],
  Legal: ["Compliance", "Litigation", "Contracts", "Intellectual Property", "Corporate Law"],
}

function generateResume(data: { name: string; title: string; industry: string; level: string; style: string; skills: string[]; experience: { company: string; role: string; years: string; description: string }[]; education: string }) {
  const keywords = INDUSTRY_KEYWORDS[data.industry] || []
  const randomVerb1 = ACTION_VERBS[Math.floor(Math.random() * ACTION_VERBS.length)]
  const randomVerb2 = ACTION_VERBS[Math.floor(Math.random() * ACTION_VERBS.length)]
  const randomVerb3 = ACTION_VERBS[Math.floor(Math.random() * ACTION_VERBS.length)]

  const styleMap: Record<string, string> = {
    modern: "Clean, visually organized layout with clear section spacing and a professional color accent.",
    classic: "Traditional reverse-chronological format with serif fonts and conservative styling.",
    creative: "Bold layout with unique section organization, iconography, and a standout design.",
    minimal: "Ultra-clean, whitespace-heavy layout with minimal text and maximum readability.",
  }

  const expBullets = [
    `${randomVerb1} key initiatives resulting in measurable business impact across ${data.industry.toLowerCase()} operations.`,
    `${randomVerb2} cross-functional teams to deliver strategic projects on time and within budget.`,
    `${randomVerb3} processes and systems, improving efficiency by 25% while maintaining quality standards.`,
  ]

  const skillsText = data.skills.length > 0
    ? data.skills.map(s => `• ${s}`).join("\n")
    : `• ${keywords.slice(0, 4).join("\n• ")}`

  return `# ${data.name}
## ${data.title}

---

**Industry:** ${data.industry}
**Level:** ${data.level}
**Style:** ${styleMap[data.style] || styleMap.modern}

---

## Professional Summary

${data.level === "Entry" ? "Motivated and detail-oriented professional seeking to leverage skills in " + data.industry.toLowerCase() + ". " : ""}
${data.level === "Executive" ? "Visionary executive with proven track record of driving growth and innovation in " + data.industry.toLowerCase() + ". " : ""}
Results-driven ${data.level.toLowerCase()} professional with expertise in ${keywords.slice(0, 3).join(", ") || "various domains"}.
Proven ability to deliver impact through strategic thinking, collaboration, and execution excellence.

---

## Skills

${skillsText}

---

## Professional Experience

${data.experience.length > 0
  ? data.experience.map(e =>
`### ${e.role} | ${e.company}
*${e.years}*

- ${e.description || expBullets[0]}
- ${expBullets[1]}
- ${expBullets[2]}
`).join("\n")
  : `### ${data.title} | [Company Name]
*[Start Date] - Present*

- ${expBullets[0]}
- ${expBullets[1]}
- ${expBullets[2]}
`}

---

## Education

${data.education || "[Degree] - [Institution], [Year]"}

---

## Additional Highlights

- ${ACTION_VERBS[Math.floor(Math.random() * ACTION_VERBS.length)]} cross-departmental collaboration to align goals
- Proven track record of ${keywords[0]?.toLowerCase() || "success"} and continuous improvement
- Strong communication and stakeholder management skills
- Committed to professional growth and staying current with industry trends
`
}

export function ResumeAI() {
  const [name, setName] = React.useState("")
  const [title, setTitle] = React.useState("")
  const [industry, setIndustry] = React.useState<(typeof INDUSTRIES)[number]>("Technology")
  const [level, setLevel] = React.useState<(typeof EXPERIENCE_LEVELS)[number]>("Mid-Level")
  const [style, setStyle] = React.useState<(typeof RESUME_STYLES)[number]["id"]>("modern")
  const [experience, setExperience] = React.useState([{ company: "", role: "", years: "", description: "" }])
  const [education, setEducation] = React.useState("")
  const [selectedSkills, setSelectedSkills] = React.useState<string[]>([])
  const [loading, setLoading] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  const [resume, setResume] = React.useState("")
  const [copied, setCopied] = React.useState(false)

  const handleAddExperience = () => {
    setExperience([...experience, { company: "", role: "", years: "", description: "" }])
  }

  const handleExperienceChange = (index: number, field: string, value: string) => {
    const updated = [...experience]
    updated[index] = { ...updated[index], [field]: value }
    setExperience(updated)
  }

  const handleRemoveExperience = (index: number) => {
    if (experience.length <= 1) return
    setExperience(experience.filter((_, i) => i !== index))
  }

  const handleSkillToggle = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    )
  }

  const handleGenerate = React.useCallback(async () => {
    if (!name.trim() || !title.trim()) {
      toast.error("Please enter your name and title")
      return
    }

    setLoading(true)
    setProgress(0)

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + Math.random() * 20
        return next >= 90 ? 90 : next
      })
    }, 200)

    await new Promise((r) => setTimeout(r, 1000 + Math.random() * 1500))

    clearInterval(interval)
    setProgress(100)

    const result = generateResume({
      name, title, industry, level, style,
      skills: selectedSkills,
      experience: experience.filter(e => e.company || e.role),
      education,
    })
    setResume(result)
    setLoading(false)
    toast.success("Resume generated")
  }, [name, title, industry, level, style, selectedSkills, experience, education])

  const handleCopy = React.useCallback(async () => {
    if (!resume) return
    try {
      await navigator.clipboard.writeText(resume)
      setCopied(true)
      toast.success("Copied to clipboard")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Failed to copy")
    }
  }, [resume])

  const handleDownload = React.useCallback(() => {
    if (!resume) return
    const blob = new Blob([resume], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${name.replace(/\s+/g, "_")}_resume.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success("Resume downloaded")
  }, [resume, name])

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
          <h1 className="text-2xl font-bold text-foreground">Resume AI</h1>
          <p className="text-sm text-muted-foreground">Craft professional resumes with AI assistance</p>
        </div>
      </motion.div>

      <Card className="space-y-6 p-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Doe"
              className="w-full rounded-2xl border border-border bg-background p-3 text-sm text-foreground placeholder-muted-foreground shadow-sm transition-all focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Professional Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Senior Software Engineer"
              className="w-full rounded-2xl border border-border bg-background p-3 text-sm text-foreground placeholder-muted-foreground shadow-sm transition-all focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Industry</label>
          <div className="flex flex-wrap gap-2">
            {INDUSTRIES.map((ind) => (
              <button
                key={ind}
                onClick={() => setIndustry(ind)}
                className={cn(
                  "rounded-xl border px-3 py-1.5 text-xs font-medium transition-all",
                  industry === ind
                    ? "border-primary/50 bg-primary/5 text-primary shadow-sm"
                    : "border-border text-foreground hover:border-primary/30"
                )}
              >
                {ind}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Experience Level</label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value as typeof EXPERIENCE_LEVELS[number])}
              className="w-full rounded-2xl border border-border bg-background p-3 text-sm text-foreground shadow-sm outline-none focus:border-primary/50"
            >
              {EXPERIENCE_LEVELS.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Style</label>
            <div className="flex gap-2">
              {RESUME_STYLES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setStyle(s.id)}
                  className={cn(
                    "flex-1 rounded-xl border px-3 py-2 text-xs font-medium transition-all",
                    style === s.id
                      ? "border-primary/50 bg-primary/5 text-primary shadow-sm"
                      : "border-border text-foreground hover:border-primary/30"
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Skills</label>
          <div className="space-y-2">
            {Object.entries(SKILL_CATEGORIES).map(([category, skills]) => (
              <div key={category}>
                <p className="mb-1.5 text-xs text-muted-foreground">{category}</p>
                <div className="flex flex-wrap gap-1.5">
                  {skills.map((skill) => (
                    <button
                      key={skill}
                      onClick={() => handleSkillToggle(skill)}
                      className={cn(
                        "rounded-xl border px-2.5 py-1 text-[11px] font-medium transition-all",
                        selectedSkills.includes(skill)
                          ? "border-primary/50 bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"
                      )}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">Experience</label>
            <button
              onClick={handleAddExperience}
              className="rounded-lg border border-border px-3 py-1 text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
            >
              + Add
            </button>
          </div>
          {experience.map((exp, i) => (
            <div key={i} className="rounded-2xl border border-border bg-muted/20 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Position {i + 1}</span>
                {experience.length > 1 && (
                  <button
                    onClick={() => handleRemoveExperience(i)}
                    className="text-xs text-red-500 hover:text-red-400 transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
              <div className="grid grid-cols-3 gap-3">
                <input
                  type="text"
                  value={exp.company}
                  onChange={(e) => handleExperienceChange(i, "company", e.target.value)}
                  placeholder="Company"
                  className="rounded-xl border border-border bg-background p-2.5 text-xs text-foreground placeholder-muted-foreground outline-none focus:border-primary/50"
                />
                <input
                  type="text"
                  value={exp.role}
                  onChange={(e) => handleExperienceChange(i, "role", e.target.value)}
                  placeholder="Role"
                  className="rounded-xl border border-border bg-background p-2.5 text-xs text-foreground placeholder-muted-foreground outline-none focus:border-primary/50"
                />
                <input
                  type="text"
                  value={exp.years}
                  onChange={(e) => handleExperienceChange(i, "years", e.target.value)}
                  placeholder="e.g., 2020-2023"
                  className="rounded-xl border border-border bg-background p-2.5 text-xs text-foreground placeholder-muted-foreground outline-none focus:border-primary/50"
                />
              </div>
              <textarea
                value={exp.description}
                onChange={(e) => handleExperienceChange(i, "description", e.target.value)}
                placeholder="Key achievements and responsibilities..."
                rows={2}
                className="w-full resize-y rounded-xl border border-border bg-background p-2.5 text-xs text-foreground placeholder-muted-foreground outline-none focus:border-primary/50"
              />
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Education</label>
          <input
            type="text"
            value={education}
            onChange={(e) => setEducation(e.target.value)}
            placeholder="B.Sc. Computer Science, University Name, 2018"
            className="w-full rounded-2xl border border-border bg-background p-3 text-sm text-foreground placeholder-muted-foreground shadow-sm transition-all focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
          />
        </div>

        <Button
          onClick={handleGenerate}
          loading={loading}
          fullWidth
          size="lg"
          icon={<Sparkles className="h-5 w-5" />}
        >
          Generate Resume
        </Button>

        {loading && (
          <ProgressBar value={progress} variant="gradient" showPercentage label="Crafting your resume..." />
        )}
      </Card>

      <AnimatePresence>
        {resume && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">Your Resume</span>
              </div>
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDownload}
                  className="flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCopy}
                  className="flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                >
                  {copied ? (<><Check className="h-3.5 w-3.5 text-emerald-500" /> Copied</>) : (<><Copy className="h-3.5 w-3.5" /> Copy</>)}
                </motion.button>
              </div>
            </div>
            <pre className="p-5 text-sm text-foreground leading-relaxed whitespace-pre-wrap font-sans">{resume}</pre>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
