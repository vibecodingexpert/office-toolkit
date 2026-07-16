"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils/cn"
import { Download, Eye, EyeOff, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight } from "lucide-react"

const TEMPLATES = [
  { id: "modern", name: "Modern", desc: "Clean and contemporary" },
  { id: "classic", name: "Classic", desc: "Traditional business format" },
  { id: "minimal", name: "Minimal", desc: "Simple and elegant" },
]

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
}

export function CoverLetterBuilder() {
  const [yourInfo, setYourInfo] = React.useState({ name: "", email: "", phone: "", address: "" })
  const [recipient, setRecipient] = React.useState({ name: "", title: "", company: "", address: "" })
  const [date, setDate] = React.useState(new Date().toISOString().split("T")[0])
  const [subject, setSubject] = React.useState("")
  const [body, setBody] = React.useState("")
  const [template, setTemplate] = React.useState("modern")
  const [showPreview, setShowPreview] = React.useState(false)

  const insertFormat = (tag: string) => {
    const textarea = document.querySelector("textarea") as HTMLTextAreaElement
    if (!textarea) return
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selected = body.substring(start, end)
    const wrapped = selected ? `<${tag}>${selected}</${tag}>` : `<${tag}></${tag}>`
    setBody(body.substring(0, start) + wrapped + body.substring(end))
  }

  const handleDownload = () => {
    if (!yourInfo.name || !recipient.name) { toast.error("Please fill required fields"); return }
    const w = window.open("", "_blank")
    if (!w) { toast.error("Please allow pop-ups"); return }
    const accent = template === "modern" ? "#3b82f6" : template === "classic" ? "#1e293b" : "#6b7280"
    w.document.write(`
      <html><head><title>Cover Letter - ${yourInfo.name}</title>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; padding: 60px; max-width: 700px; margin: 0 auto; color: #1a1a2e; background: ${template === "minimal" ? "#fafafa" : "#fff"}; font-size: 14px; line-height: 1.6; }
        .header { margin-bottom: 30px; }
        .header h1 { font-size: 24px; color: ${accent}; margin: 0; }
        .subject { font-weight: 600; margin-bottom: 20px; color: ${accent}; }
        .body-text { white-space: pre-wrap; }
        .signature { margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 15px; }
        @media print { body { padding: 40px; } }
      </style></head><body>
        <div class="header"><h1>${yourInfo.name}</h1><p>${yourInfo.email} | ${yourInfo.phone}<br>${yourInfo.address}</p></div>
        <p>${formatDate(new Date(date))}</p>
        <p>${recipient.name}<br>${recipient.title}<br>${recipient.company}<br>${recipient.address}</p>
        ${subject ? `<p class="subject">Re: ${subject}</p>` : ""}
        <p>Dear ${recipient.name.split(" ")[0] || "Hiring Manager"},</p>
        <div class="body-text">${body.replace(/\n/g, "<br>")}</div>
        <p>Sincerely,<br><strong>${yourInfo.name}</strong></p>
        <div class="signature"><p style="font-size:12px;color:#64748b">${yourInfo.email} | ${yourInfo.phone}</p></div>
      </body></html>
    `)
    w.document.close()
    setTimeout(() => w.print(), 500)
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div className="flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10"><Download className="h-6 w-6 text-indigo-500" /></div><div><h1 className="text-2xl font-bold text-foreground">Cover Letter Builder</h1><p className="text-sm text-muted-foreground">Write professional cover letters</p></div></div>
        <div className="flex items-center gap-2"><Button variant={showPreview ? "primary" : "outline"} size="sm" onClick={() => setShowPreview(!showPreview)}>{showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</Button><Button variant="pro" size="sm" onClick={handleDownload}><Download className="h-4 w-4" /> Download</Button></div>
      </motion.div>
      <div className="flex flex-wrap gap-2">{TEMPLATES.map((t) => (<button key={t.id} onClick={() => setTemplate(t.id)} className={cn("rounded-lg border px-4 py-2 text-sm transition-colors text-left", template === t.id ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/50")}><div className="font-medium">{t.name}</div><div className="text-xs opacity-70">{t.desc}</div></button>))}</div>

      <AnimatePresence mode="wait">
        {showPreview ? (
          <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card className="overflow-hidden p-0">
              <div className={cn("bg-white p-10 dark:bg-gray-950", template === "minimal" && "bg-gray-50 dark:bg-gray-900")}>
                <div className="border-b pb-4 mb-6" style={{ borderColor: template === "modern" ? "#3b82f6" : template === "classic" ? "#1e293b" : "#6b7280" }}>
                  <h1 className="text-2xl font-bold" style={{ color: template === "modern" ? "#3b82f6" : template === "classic" ? "#1e293b" : "#6b7280" }}>{yourInfo.name || "Your Name"}</h1>
                  <p className="text-sm text-muted-foreground">{yourInfo.email}{yourInfo.phone && ` | ${yourInfo.phone}`}<br />{yourInfo.address}</p>
                </div>
                <p className="text-sm text-muted-foreground">{formatDate(new Date(date))}</p>
                <p className="mt-4 text-sm">{recipient.name || "Recipient Name"}<br />{recipient.title}<br />{recipient.company}<br />{recipient.address}</p>
                {subject && <p className="mt-4 font-semibold" style={{ color: template === "modern" ? "#3b82f6" : template === "classic" ? "#1e293b" : "#6b7280" }}>Re: {subject}</p>}
                <p className="mt-4">Dear {recipient.name.split(" ")[0] || "Hiring Manager"},</p>
                <div className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground" dangerouslySetInnerHTML={{ __html: body.replace(/\n/g, "<br>") }} />
                <p className="mt-6">Sincerely,<br /><strong>{yourInfo.name || "Your Name"}</strong></p>
              </div>
            </Card>
          </motion.div>
        ) : (
          <motion.div key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <Card><h3 className="mb-4 font-semibold text-foreground">Your Information</h3><div className="grid gap-4 sm:grid-cols-2"><Input label="Full Name" value={yourInfo.name} onChange={(e) => setYourInfo({ ...yourInfo, name: e.target.value })} /><Input label="Email" type="email" value={yourInfo.email} onChange={(e) => setYourInfo({ ...yourInfo, email: e.target.value })} /><Input label="Phone" value={yourInfo.phone} onChange={(e) => setYourInfo({ ...yourInfo, phone: e.target.value })} /><Input label="Address" value={yourInfo.address} onChange={(e) => setYourInfo({ ...yourInfo, address: e.target.value })} /></div></Card>
            <Card><h3 className="mb-4 font-semibold text-foreground">Recipient Information</h3><div className="grid gap-4 sm:grid-cols-2"><Input label="Recipient Name" value={recipient.name} onChange={(e) => setRecipient({ ...recipient, name: e.target.value })} /><Input label="Title" value={recipient.title} onChange={(e) => setRecipient({ ...recipient, title: e.target.value })} /><Input label="Company" value={recipient.company} onChange={(e) => setRecipient({ ...recipient, company: e.target.value })} /><Input label="Address" value={recipient.address} onChange={(e) => setRecipient({ ...recipient, address: e.target.value })} /></div></Card>
            <Card><h3 className="mb-4 font-semibold text-foreground">Letter Details</h3><div className="grid gap-4 sm:grid-cols-2"><Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} /><Input label="Subject Line" value={subject} onChange={(e) => setSubject(e.target.value)} /></div></Card>
            <Card><h3 className="mb-4 font-semibold text-foreground">Body</h3>
              <div className="mb-3 flex flex-wrap items-center gap-1 rounded-lg border border-border bg-muted/30 p-1">
                {[{ icon: Bold, tag: "b", label: "Bold" }, { icon: Italic, tag: "i", label: "Italic" }, { icon: Underline, tag: "u", label: "Underline" }].map(({ icon: Icon, tag, label }) => (<button key={tag} onClick={() => insertFormat(tag)} title={label} className="flex h-8 w-8 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground"><Icon className="h-4 w-4" /></button>))}
                <span className="mx-1 h-5 w-px bg-border" />
                {[{ icon: AlignLeft, value: "left" }, { icon: AlignCenter, value: "center" }, { icon: AlignRight, value: "right" }].map(({ icon: Icon, value }) => (<button key={value} onClick={() => {}} title={`Align ${value}`} className="flex h-8 w-8 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground"><Icon className="h-4 w-4" /></button>))}
              </div>
              <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={12} className="w-full resize-y rounded-lg border border-input bg-background p-4 text-sm leading-relaxed placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2" placeholder="Write your cover letter here..." />
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
