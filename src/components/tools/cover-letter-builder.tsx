"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/toast"
import { Download, Eye, EyeOff } from "lucide-react"
import jsPDF from "jspdf"

const TEMPLATES = [
  { id: "standard", name: "Standard", color: "bg-teal-500" },
  { id: "modern", name: "Modern", color: "bg-gradient-to-r from-teal-500 to-cyan-500" },
  { id: "classic", name: "Classic", color: "bg-gray-900 dark:bg-gray-100" },
]

const PLACEHOLDER = `Dear Hiring Manager,

I am writing to express my strong interest in the [Position] role at [Company]. With my background in [Field] and proven track record of [Achievement], I am confident that my skills and experience align perfectly with the requirements of this position.

Throughout my career, I have developed expertise in [Skill 1], [Skill 2], and [Skill 3], which I believe will enable me to make an immediate impact at [Company]. In my most recent role at [Previous Company], I successfully [Key Accomplishment].

I am particularly drawn to [Company] because of [Reason for Interest]. I am excited about the opportunity to contribute to your team and would welcome the chance to discuss how my experience can benefit your organization.

Thank you for considering my application. I look forward to the opportunity to speak with you soon.

Sincerely,
[Your Name]`

export function CoverLetterBuilder() {
  const [sender, setSender] = React.useState({ name: "", email: "", phone: "", address: "" })
  const [recipient, setRecipient] = React.useState({ name: "", company: "", address: "", position: "" })
  const [body, setBody] = React.useState("")
  const [date, setDate] = React.useState(new Date().toISOString().split("T")[0])
  const [template, setTemplate] = React.useState("standard")
  const [showPreview, setShowPreview] = React.useState(false)

  const handleDownload = () => {
    if (!sender.name) { toast.error("Please enter your name"); return }
    if (!recipient.name) { toast.error("Please enter recipient name"); return }
    if (!body) { toast.error("Please write a cover letter body"); return }

    const doc = new jsPDF({ unit: "mm", format: "a4" })
    const m = 25
    let y = m

    if (template === "modern") {
      doc.setFillColor("#14b8a6")
      doc.rect(0, 0, 210, 12, "F")
      doc.setTextColor(255, 255, 255)
      doc.setFont("helvetica", "bold")
      doc.setFontSize(10)
      doc.text("COVER LETTER", 105, 8, { align: "center" })
    }

    doc.setFont("helvetica", "bold")
    doc.setFontSize(12)
    doc.setTextColor(26, 26, 46)
    doc.text(sender.name, m, y + 8)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(9)
    doc.setTextColor(100, 116, 139)
    const senderLines = [sender.email, sender.phone, sender.address].filter(Boolean)
    senderLines.forEach((l, i) => doc.text(l, m, y + 15 + i * 4))
    y += senderLines.length * 4 + 20

    doc.setFontSize(9)
    doc.setTextColor(100, 116, 139)
    doc.text(date, m, y)
    y += 8

    doc.setFont("helvetica", "normal")
    doc.setFontSize(9)
    doc.setTextColor(71, 85, 105)
    doc.text(recipient.name, m, y); y += 4
    if (recipient.position) { doc.text(recipient.position, m, y); y += 4 }
    doc.text(recipient.company, m, y); y += 4
    doc.text(recipient.address, m, y); y += 8

    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    doc.setTextColor(26, 26, 46)
    const processedBody = body
      .replace(/\[Position\]/g, recipient.position || "the position")
      .replace(/\[Company\]/g, recipient.company || "your company")
      .replace(/\[Your Name\]/g, sender.name)
    const lines = doc.splitTextToSize(processedBody, 160)
    doc.text(lines, m, y)
    y += lines.length * 5 + 10

    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    doc.setTextColor(26, 26, 46)
    doc.text("Sincerely,", m, y); y += 8
    doc.setFont("helvetica", "bold")
    doc.text(sender.name, m, y)

    if (template === "modern") {
      doc.setFillColor("#14b8a6")
      doc.rect(0, 295, 210, 2, "F")
    } else if (template === "classic") {
      doc.setDrawColor(26, 26, 46)
      doc.setLineWidth(1)
      doc.line(m, 12, 190, 12)
      doc.line(m, 285, 190, 285)
    }

    doc.save(`cover-letter-${sender.name.replace(/\s+/g, "_")}.pdf`)
    toast.success("Cover letter downloaded as PDF")
  }

  const previewContent = body
    .replace(/\[Position\]/g, recipient.position || "the position")
    .replace(/\[Company\]/g, recipient.company || "your company")
    .replace(/\[Your Name\]/g, sender.name)

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-foreground">Cover Letter Builder</h1><p className="text-sm text-muted-foreground">Professional cover letters with real PDF export</p></div>
        <div className="flex items-center gap-2">
          <Button variant={showPreview ? "primary" : "outline"} size="sm" onClick={() => setShowPreview(!showPreview)}>{showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</Button>
          <Button variant="primary" size="sm" onClick={handleDownload}><Download className="h-4 w-4" /> Download PDF</Button>
        </div>
      </motion.div>
      <div className="flex flex-wrap gap-2">{TEMPLATES.map((t) => (<button key={t.id} onClick={() => setTemplate(t.id)} className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-colors ${template === t.id ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/50"}`}><div className={`h-3 w-3 rounded-full ${t.color}`} />{t.name}</button>))}</div>

      <AnimatePresence mode="wait">
        {showPreview ? (
          <motion.div key="preview" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className="overflow-hidden p-0">
              <div className="bg-white p-8 dark:bg-gray-950">
                <div className="border-b border-teal-200 pb-4 dark:border-teal-800"><h1 className="text-xl font-bold text-foreground">{sender.name || "Your Name"}</h1><p className="text-sm text-muted-foreground">{[sender.email, sender.phone, sender.address].filter(Boolean).join(" | ") || "Contact info"}</p></div>
                <p className="mt-4 text-sm text-muted-foreground">{date || new Date().toLocaleDateString()}</p>
                <div className="mt-6 text-sm text-foreground"><p>{recipient.name || "Recipient"}</p>{recipient.position && <p>{recipient.position}</p>}<p>{recipient.company || "Company"}</p><p>{recipient.address}</p></div>
                <div className="mt-6 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{previewContent || "Your letter content will appear here..."}</div>
              </div>
            </Card>
          </motion.div>
        ) : (
          <motion.div key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <Card><h3 className="mb-4 font-semibold text-foreground">Sender Information</h3><div className="grid gap-4 sm:grid-cols-2"><Input label="Your Name" value={sender.name} onChange={(e) => setSender({ ...sender, name: e.target.value })} /><Input label="Email" type="email" value={sender.email} onChange={(e) => setSender({ ...sender, email: e.target.value })} /><Input label="Phone" value={sender.phone} onChange={(e) => setSender({ ...sender, phone: e.target.value })} /><Input label="Address" value={sender.address} onChange={(e) => setSender({ ...sender, address: e.target.value })} /></div></Card>
            <Card><h3 className="mb-4 font-semibold text-foreground">Recipient Information</h3><div className="grid gap-4 sm:grid-cols-2"><Input label="Hiring Manager / Name" value={recipient.name} onChange={(e) => setRecipient({ ...recipient, name: e.target.value })} /><Input label="Position" value={recipient.position} onChange={(e) => setRecipient({ ...recipient, position: e.target.value })} /><Input label="Company" value={recipient.company} onChange={(e) => setRecipient({ ...recipient, company: e.target.value })} /><Input label="Company Address" value={recipient.address} onChange={(e) => setRecipient({ ...recipient, address: e.target.value })} /></div></Card>
            <Card><div className="flex items-center justify-between mb-2"><h3 className="font-semibold text-foreground">Letter Body</h3><span className="text-xs text-muted-foreground">Use [Position], [Company], [Your Name] as placeholders</span></div><textarea value={body} onChange={(e) => setBody(e.target.value)} rows={16} className="w-full resize-y rounded-lg border border-input bg-background p-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2" placeholder={PLACEHOLDER} /></Card>
            <Card><Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} /></Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
