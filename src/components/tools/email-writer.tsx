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
  Mail,
  Copy,
  Check,
  Sparkles,
  RefreshCw,
  User,
  Briefcase,
  Building2,
  Lightbulb,
} from "lucide-react"

const TONES = [
  { value: "formal", label: "Formal", desc: "Professional and structured" },
  { value: "semi-formal", label: "Semi-Formal", desc: "Balanced professional" },
  { value: "casual", label: "Casual", desc: "Relaxed and friendly" },
  { value: "warm", label: "Warm", desc: "Friendly and approachable" },
] as const

const EMAIL_TYPES = [
  "Introduction",
  "Follow-up",
  "Thank You",
  "Meeting Request",
  "Proposal",
  "Feedback",
  "Apology",
  "Congratulations",
  "Recommendation",
  "Status Update",
  "Cold Email",
  "Professional",
] as const

const SUBJECT_TEMPLATES: Record<string, (topic: string) => string> = {
  Introduction: (t) => `Introduction: ${t} — Let's Connect`,
  "Follow-up": (t) => `Following Up: ${t}`,
  "Thank You": (t) => `Thank You: ${t}`,
  "Meeting Request": (t) => `Meeting Request: Discuss ${t}`,
  Proposal: (t) => `Proposal: ${t} — A New Opportunity`,
  Feedback: (t) => `Feedback on ${t}`,
  Apology: (t) => `Apology Regarding ${t}`,
  Congratulations: (t) => `Congratulations on ${t}!`,
  Recommendation: (t) => `Recommendation: ${t}`,
  "Status Update": (t) => `Status Update: ${t}`,
  "Cold Email": (t) => `Quick question about ${t}`,
  Professional: (t) => `Professional Inquiry: ${t}`,
}

const TEMPLATE_LIBRARY: Record<string, (greeting: string, closing: string, name: string, role: string, topic: string) => { subject: string; body: string }> = {
  Introduction: (greeting, closing, name, role, topic) => ({
    subject: `Introduction: ${topic}`,
    body: `${greeting} ${name},

I hope this message finds you well. I am writing to introduce myself regarding ${topic}.

With my background as ${role || "a professional in this field"}, I believe there could be valuable opportunities for us to collaborate. I have been following your work with great interest.

I would welcome the opportunity to connect and explore how we might work together. Please let me know if you have any availability.

${closing},
[Your Name]`,
  }),
  "Follow-up": (greeting, closing, name, role, topic) => ({
    subject: `Following up: ${topic}`,
    body: `${greeting} ${name},

I hope you're doing well. I'm following up on our previous conversation regarding ${topic}.

I wanted to check if you've had a chance to consider the points we discussed. I remain enthusiastic about the potential opportunities here and would be happy to provide any additional information.

Please feel free to reach out if you have any questions.

${closing},
[Your Name]`,
  }),
  "Thank You": (greeting, closing, name, role, topic) => ({
    subject: `Thank You: ${topic}`,
    body: `${greeting} ${name},

I wanted to express my sincere gratitude for your support regarding ${topic}.

Your guidance and expertise as ${role || "a valued colleague"} have been invaluable. I truly appreciate the time and effort you've invested.

I look forward to continuing our work together.

${closing},
[Your Name]`,
  }),
  "Meeting Request": (greeting, closing, name, role, topic) => ({
    subject: `Meeting Request: ${topic}`,
    body: `${greeting} ${name},

I would like to request a meeting to discuss ${topic}.

Given your expertise as ${role || "a key stakeholder"}, your input would be extremely valuable.

Would you be available for a 30-minute meeting next week? Please let me know what times work best.

${closing},
[Your Name]`,
  }),
  Proposal: (greeting, closing, name, role, topic) => ({
    subject: `Proposal: ${topic}`,
    body: `${greeting} ${name},

I am pleased to present this proposal regarding ${topic}. As ${role || "a professional in this area"}, I have carefully considered the requirements and challenges involved.

**Key Highlights:**
- Comprehensive approach addressing all critical areas
- Cost-effective solution with measurable outcomes
- Implementation timeline designed for minimal disruption

I am confident this proposal provides a strong foundation for achieving our shared objectives.

${closing},
[Your Name]`,
  }),
  Feedback: (greeting, closing, name, role, topic) => ({
    subject: `Feedback: ${topic}`,
    body: `${greeting} ${name},

I wanted to share some thoughtful feedback regarding ${topic}. As ${role || "a team member"}, I believe open communication is essential for growth.

**What's working well:**
- The approach has been thorough and well-organized
- Outcomes have exceeded initial expectations

**Areas for consideration:**
- Opportunities to streamline certain processes
- Additional collaboration could enhance results

I hope this feedback is received in the spirit of continuous improvement.

${closing},
[Your Name]`,
  }),
  Apology: (greeting, closing, name, role, topic) => ({
    subject: `Apology Regarding ${topic}`,
    body: `${greeting} ${name},

I am writing to sincerely apologize for the situation regarding ${topic}. As ${role || "the responsible party"}, I take full responsibility.

I understand the impact this has had and want to assure you that steps are being taken to address the matter.

I value our relationship and hope we can move forward. Please let me know if there is anything else I can do.

${closing},
[Your Name]`,
  }),
  Congratulations: (greeting, closing, name, role, topic) => ({
    subject: `Congratulations on ${topic}!`,
    body: `${greeting} ${name},

I was delighted to hear about ${topic}. This is a remarkable achievement, and you should be incredibly proud.

Your dedication and expertise as ${role || "a professional"} have clearly paid off. This recognition is well-deserved.

Wishing you continued success in all your future endeavors!

${closing},
[Your Name]`,
  }),
  Recommendation: (greeting, closing, name, role, topic) => ({
    subject: `Recommendation: ${topic}`,
    body: `${greeting} ${name},

I am writing to share a recommendation regarding ${topic}. Based on my experience as ${role || "a professional in this field"}, I believe this could be highly beneficial.

**Why I recommend this:**
- Proven track record of success
- Strong alignment with our objectives
- Excellent potential for positive impact

I would be happy to discuss this recommendation in more detail.

${closing},
[Your Name]`,
  }),
  "Status Update": (greeting, closing, name, role, topic) => ({
    subject: `Status Update: ${topic}`,
    body: `${greeting} ${name},

I'm writing to provide a status update on ${topic}. I wanted to ensure you're fully informed of our progress.

**Current Status:**
- Project is on track and progressing well
- Key milestones have been achieved

**Next Steps:**
- Complete remaining deliverables
- Conduct final review and quality check
- Prepare handover documentation

I will continue to keep you updated as we move forward.

${closing},
[Your Name]`,
  }),
  "Cold Email": (greeting, closing, name, role, topic) => ({
    subject: `Quick question about ${topic}`,
    body: `${greeting} ${name},

I hope you don't mind me reaching out. My name is [Your Name] and I've been following your work in ${topic} with great interest.

I'm reaching out because I believe there could be a valuable opportunity for us to collaborate. I'd love to share some ideas that could be mutually beneficial.

Would you be open to a brief 15-minute call next week to explore this further?

${closing},
[Your Name]`,
  }),
  Professional: (greeting, closing, name, role, topic) => ({
    subject: `Professional Inquiry: ${topic}`,
    body: `${greeting} ${name},

I hope this message finds you well. I am writing to discuss ${topic} and explore potential opportunities for collaboration.

As ${role || "a professional in this industry"}, I have developed significant expertise in this area and believe there could be meaningful synergies between our work.

I would welcome the opportunity to discuss this further and explore how we might create value together.

${closing},
[Your Name]`,
  }),
}

function generateEmail(
  topic: string,
  recipientName: string,
  recipientRole: string,
  tone: string,
  type: string
): { subject: string; body: string; subjectLine: string } {
  const toneData: Record<string, { greeting: string; closings: string[] }> = {
    formal: { greeting: "Dear", closings: ["Best regards", "Sincerely", "Yours faithfully", "With gratitude"] },
    "semi-formal": { greeting: "Dear", closings: ["Best regards", "Kind regards", "Warmly", "All the best"] },
    casual: { greeting: "Hi", closings: ["Best", "Cheers", "Talk soon", "Thanks"] },
    warm: { greeting: "Hello", closings: ["Warmly", "With appreciation", "All the best", "Take care"] },
  }

  const data = toneData[tone] || toneData.formal
  const greeting = `${data.greeting}`
  const closing = data.closings[Math.floor(Math.random() * data.closings.length)]

  const template = TEMPLATE_LIBRARY[type]
  if (template) {
    const result = template(greeting, closing, recipientName, recipientRole, topic)
    return { ...result, subjectLine: result.subject }
  }

  const subjectFn = SUBJECT_TEMPLATES[type] || ((t: string) => t)
  return {
    subject: subjectFn(topic),
    subjectLine: subjectFn(topic),
    body: `${greeting} ${recipientName},

I am writing to discuss ${topic}. With your role as ${recipientRole || "a professional in this field"}, I believe this is something that could be of mutual interest.

I look forward to hearing your thoughts and finding ways to collaborate effectively.

${closing},
[Your Name]`,
  }
}

export function EmailWriter() {
  const [topic, setTopic] = React.useState("")
  const [recipientName, setRecipientName] = React.useState("")
  const [recipientRole, setRecipientRole] = React.useState("")
  const [tone, setTone] = React.useState<(typeof TONES)[number]["value"]>("formal")
  const [emailType, setEmailType] = React.useState<(typeof EMAIL_TYPES)[number]>("Professional")
  const [loading, setLoading] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  const [email, setEmail] = React.useState<{ subject: string; body: string; subjectLine: string } | null>(null)
  const [copied, setCopied] = React.useState(false)

  const handleGenerate = React.useCallback(async () => {
    if (!topic.trim()) {
      toast.error("Please enter a topic")
      return
    }
    if (!recipientName.trim()) {
      toast.error("Please enter recipient name")
      return
    }

    setLoading(true)
    setProgress(0)

    const result = generateEmail(topic, recipientName, recipientRole || "colleague", tone, emailType)
    setProgress(100)
    setEmail(result)
    setLoading(false)
    toast.success("Email generated")
  }, [topic, recipientName, recipientRole, tone, emailType])

  const handleCopy = React.useCallback(async () => {
    if (!email) return
    const content = `Subject: ${email.subject}\n\n${email.body}`
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      toast.success("Copied to clipboard")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Failed to copy")
    }
  }, [email])

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-violet-500/20 shadow-sm">
          <Mail className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Email Writer</h1>
          <p className="text-sm text-muted-foreground">Write professional emails with AI — 12 email types</p>
        </div>
      </motion.div>

      <Card className="space-y-6 p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Input
            label="Topic/Purpose"
            placeholder="What's the email about?"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
          <Input
            label="Recipient Name"
            placeholder="e.g. John Smith"
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
            icon={<User className="h-4 w-4" />}
          />
          <Input
            label="Recipient Role"
            placeholder="e.g. Project Manager"
            value={recipientRole}
            onChange={(e) => setRecipientRole(e.target.value)}
            icon={<Briefcase className="h-4 w-4" />}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Tone</label>
          <div className="flex gap-3">
            {TONES.map((t) => (
              <button
                key={t.value}
                onClick={() => setTone(t.value)}
                className={cn(
                  "flex-1 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all",
                  tone === t.value
                    ? "border-primary/50 bg-primary/5 text-primary shadow-sm"
                    : "border-border text-foreground hover:border-primary/30"
                )}
              >
                {t.label}
                <div className="mt-0.5 text-xs font-normal text-muted-foreground">{t.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Email Type</label>
          <div className="flex flex-wrap gap-2">
            {EMAIL_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => setEmailType(type)}
                className={cn(
                  "rounded-xl border px-3 py-1.5 text-xs font-medium transition-all",
                  emailType === type
                    ? "border-primary/50 bg-primary/5 text-primary shadow-sm"
                    : "border-border text-foreground hover:border-primary/30"
                )}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <Button
          onClick={handleGenerate}
          loading={loading}
          fullWidth
          size="lg"
          icon={<Sparkles className="h-5 w-5" />}
        >
          Generate Email
        </Button>

        {loading && (
          <ProgressBar value={progress} variant="gradient" showPercentage label="Writing email..." />
        )}
      </Card>

      <AnimatePresence>
        {email && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <Mail className="h-4 w-4 text-primary shrink-0" />
                <div className="min-w-0">
                  <span className="text-sm font-medium text-foreground block truncate">{email.subject}</span>
                  <span className="text-[10px] text-muted-foreground">{emailType} · {tone}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
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
            <div className="border-b border-border bg-muted/20 px-5 py-2">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
                <span className="text-xs text-muted-foreground">Subject line suggestion</span>
                <span className="text-sm text-foreground font-medium">{email.subjectLine}</span>
              </div>
            </div>
            <div className="p-5">
              <div className="whitespace-pre-wrap text-sm text-foreground leading-relaxed">
                {email.body.split(/(\*\*[^*]+\*\*)/g).map((part, i) => {
                  if (part.startsWith("**") && part.endsWith("**")) {
                    return <strong key={i} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>
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
