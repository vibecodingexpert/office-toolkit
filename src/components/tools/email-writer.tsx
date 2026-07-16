"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
} from "lucide-react"

const TONES = [
  { value: "formal", label: "Formal", desc: "Professional and structured" },
  { value: "casual", label: "Casual", desc: "Relaxed and friendly" },
  { value: "friendly", label: "Friendly", desc: "Warm and approachable" },
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
] as const

function generateEmail(
  topic: string,
  recipientName: string,
  recipientRole: string,
  tone: string,
  type: string
): { subject: string; body: string } {
  const toneGreetings: Record<string, string> = {
    formal: "Dear",
    casual: "Hi",
    friendly: "Hello",
  }

  const toneClosings: Record<string, string[]> = {
    formal: ["Best regards", "Sincerely", "Yours faithfully", "With gratitude"],
    casual: ["Best", "Cheers", "Talk soon", "Thanks"],
    friendly: ["Warmly", "With appreciation", "All the best", "Take care"],
  }

  const typeTemplates: Record<string, (greeting: string, closing: string) => { subject: string; body: string }> = {
    Introduction: (greeting, closing) => ({
      subject: `Introduction: ${topic}`,
      body: `${greeting} ${recipientName},

I hope this message finds you well. I am writing to introduce myself and share some information about ${topic}.

With my background as ${recipientRole}, I believe there could be valuable opportunities for us to collaborate. I have been following your work with great interest and am impressed by the impact you've made.

I would welcome the opportunity to connect and explore how we might work together. Please let me know if you have any availability in the coming weeks for a brief conversation.

${closing},
[Your Name]`,
    }),
    "Follow-up": (greeting, closing) => ({
      subject: `Following up: ${topic}`,
      body: `${greeting} ${recipientName},

I hope you're doing well. I'm writing to follow up on our previous conversation regarding ${topic}.

I wanted to check if you've had a chance to consider the points we discussed. I remain enthusiastic about the potential opportunities here and would be happy to provide any additional information that might be helpful.

Please feel free to reach out if you have any questions or would like to discuss further.

${closing},
[Your Name]`,
    }),
    "Thank You": (greeting, closing) => ({
      subject: `Thank You: ${topic}`,
      body: `${greeting} ${recipientName},

I wanted to take a moment to express my sincere gratitude for your support regarding ${topic}.

Your guidance and expertise as ${recipientRole} have been invaluable, and I truly appreciate the time and effort you've invested. It has made a significant difference, and I am grateful for your contributions.

I look forward to continuing our work together and achieving great results.

${closing},
[Your Name]`,
    }),
    "Meeting Request": (greeting, closing) => ({
      subject: `Meeting Request: ${topic}`,
      body: `${greeting} ${recipientName},

I hope this message finds you well. I would like to request a meeting to discuss ${topic}.

Given your expertise as ${recipientRole}, I believe your input would be extremely valuable. I have outlined a few key areas I'd like to cover:

1. Current status and challenges
2. Potential opportunities and solutions
3. Next steps and action items

Would you be available for a 30-minute meeting sometime next week? Please let me know what times work best for your schedule.

${closing},
[Your Name]`,
    }),
    Proposal: (greeting, closing) => ({
      subject: `Proposal: ${topic}`,
      body: `${greeting} ${recipientName},

I am pleased to present this proposal regarding ${topic}. As ${recipientRole}, I have carefully considered the requirements and challenges involved.

**Key Highlights:**
- Comprehensive approach addressing all critical areas
- Cost-effective solution with measurable outcomes
- Implementation timeline designed for minimal disruption

I am confident that this proposal provides a strong foundation for achieving our shared objectives. I would welcome the opportunity to walk through the details with you at your convenience.

${closing},
[Your Name]`,
    }),
    Feedback: (greeting, closing) => ({
      subject: `Feedback: ${topic}`,
      body: `${greeting} ${recipientName},

I wanted to share some thoughtful feedback regarding ${topic}. As ${recipientRole}, I believe open and constructive communication is essential for growth.

**What's working well:**
- The approach has been thorough and well-organized
- The outcomes have exceeded initial expectations

**Areas for consideration:**
- There may be opportunities to streamline certain processes
- Additional collaboration could enhance the results

I hope this feedback is received in the spirit of continuous improvement that it's intended.

${closing},
[Your Name]`,
    }),
    Apology: (greeting, closing) => ({
      subject: `Apology Regarding ${topic}`,
      body: `${greeting} ${recipientName},

I am writing to sincerely apologize for the recent situation regarding ${topic}. As ${recipientRole}, I take full responsibility for any inconvenience this may have caused.

I understand the impact this has had and want to assure you that steps are being taken to address the matter and prevent similar issues in the future.

I value our relationship and hope we can move forward. Please let me know if there is anything else I can do to make things right.

${closing},
[Your Name]`,
    }),
    Congratulations: (greeting, closing) => ({
      subject: `Congratulations on ${topic}`,
      body: `${greeting} ${recipientName},

I was absolutely delighted to hear about ${topic}. This is a remarkable achievement, and you should be incredibly proud of what you've accomplished.

Your dedication and expertise as ${recipientRole} have clearly paid off, and this recognition is well-deserved. It's inspiring to see someone who consistently strives for excellence.

Wishing you continued success in all your future endeavors!

${closing},
[Your Name]`,
    }),
    Recommendation: (greeting, closing) => ({
      subject: `Recommendation: ${topic}`,
      body: `${greeting} ${recipientName},

I am writing to share a recommendation regarding ${topic}. Based on my experience as ${recipientRole}, I believe this could be highly beneficial.

**Why I recommend this:**
- Proven track record of success
- Strong alignment with our objectives
- Excellent potential for positive impact

I would be happy to discuss this recommendation in more detail and answer any questions you might have.

${closing},
[Your Name]`,
    }),
    "Status Update": (greeting, closing) => ({
      subject: `Status Update: ${topic}`,
      body: `${greeting} ${recipientName},

I'm writing to provide you with a status update on ${topic}. As ${recipientRole}, I wanted to ensure you're fully informed of our progress.

**Current Status:**
- Project is on track and progressing well
- Key milestones have been achieved ahead of schedule

**Next Steps:**
- Complete remaining deliverables
- Conduct final review and quality check
- Prepare handover documentation

I will continue to keep you updated as we move forward. Please let me know if you have any questions.

${closing},
[Your Name]`,
    }),
  }

  const greeting = `${toneGreetings[tone] || "Dear"}`
  const closings = toneClosings[tone] || toneClosings.formal
  const closing = closings[Math.floor(Math.random() * closings.length)]

  const template = typeTemplates[type]
  if (template) {
    return template(greeting, closing)
  }

  return {
    subject: `${topic}`,
    body: `${greeting} ${recipientName},

I am writing to discuss ${topic}. With your role as ${recipientRole}, I believe this is something that could be of mutual interest.

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
  const [emailType, setEmailType] = React.useState<(typeof EMAIL_TYPES)[number]>("Introduction")
  const [loading, setLoading] = React.useState(false)
  const [email, setEmail] = React.useState<{ subject: string; body: string } | null>(null)
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
    await new Promise((r) => setTimeout(r, 1200 + Math.random() * 1500))
    const result = generateEmail(topic, recipientName, recipientRole || "colleague", tone, emailType)
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
          <p className="text-sm text-muted-foreground">Write professional emails with AI</p>
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
      </Card>

      <AnimatePresence>
        {email && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">{email.subject}</span>
              </div>
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
