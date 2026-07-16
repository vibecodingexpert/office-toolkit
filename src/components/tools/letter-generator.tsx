"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/toast"
import { Download, Eye, EyeOff } from "lucide-react"
import jsPDF from "jspdf"

const LETTER_TYPES = [
  { id: "formal", name: "Formal Letter" },
  { id: "complaint", name: "Complaint" },
  { id: "inquiry", name: "Inquiry" },
  { id: "resignation", name: "Resignation" },
]

const TEMPLATES: Record<string, string> = {
  formal: "Dear [Recipient],\n\nI am writing to formally [state purpose]. [Provide relevant details and context here.]\n\nI look forward to your response at your earliest convenience.\n\nSincerely,\n[Sender Name]",
  complaint: "Dear [Recipient],\n\nI am writing to bring to your attention an issue regarding [subject]. On [date], I [describe the issue].\n\nI request that you look into this matter and take appropriate action.\n\nThank you for your attention to this matter.\n\nSincerely,\n[Sender Name]",
  inquiry: "Dear [Recipient],\n\nI hope this message finds you well. I am writing to inquire about [topic/opportunity].\n\nSpecifically, I would like to know:\n- [Question 1]\n- [Question 2]\n- [Question 3]\n\nThank you for your time, and I look forward to hearing from you.\n\nBest regards,\n[Sender Name]",
  resignation: "Dear [Recipient],\n\nPlease accept this letter as formal notification that I am resigning from my position as [Position] at [Company]. My last day will be [Date].\n\nI want to thank you for the opportunities for growth and development during my tenure.\n\nI will ensure a smooth handover of my responsibilities before my departure.\n\nSincerely,\n[Sender Name]",
}

export function LetterGenerator() {
  const [sender, setSender] = React.useState({ name: "", address: "", email: "", phone: "" })
  const [recipient, setRecipient] = React.useState({ name: "", title: "", company: "", address: "" })
  const [letterType, setLetterType] = React.useState("formal")
  const [subject, setSubject] = React.useState("")
  const [body, setBody] = React.useState(TEMPLATES.formal)
  const [date, setDate] = React.useState(new Date().toISOString().split("T")[0])
  const [showPreview, setShowPreview] = React.useState(true)

  React.useEffect(() => {
    setBody(TEMPLATES[letterType] || TEMPLATES.formal)
  }, [letterType])

  const processedBody = body
    .replace(/\[Sender Name\]/g, sender.name)
    .replace(/\[Recipient\]/g, recipient.name)
    .replace(/\[Company\]/g, recipient.company)
    .replace(/\[Position\]/g, recipient.title)
    .replace(/\[Date\]/g, date)

  const handleDownload = () => {
    if (!sender.name) { toast.error("Please enter your name"); return }
    if (!body) { toast.error("Please write letter content"); return }
    const doc = new jsPDF({ unit: "mm", format: "a4" })
    const m = 25
    let y = m

    doc.setFont("helvetica", "bold")
    doc.setFontSize(11)
    doc.setTextColor(26, 26, 46)
    doc.text(sender.name, m, y); y += 5
    doc.setFont("helvetica", "normal")
    doc.setFontSize(9)
    doc.setTextColor(100, 116, 139)
    const senderLines = [sender.address, sender.email, sender.phone].filter(Boolean)
    senderLines.forEach((l) => { doc.text(l, m, y); y += 4 })
    y += 4

    doc.text(date, m, y); y += 8

    if (recipient.name) {
      doc.setFont("helvetica", "normal")
      doc.setFontSize(9)
      doc.setTextColor(71, 85, 105)
      doc.text(recipient.name, m, y); y += 4
      if (recipient.title) { doc.text(recipient.title, m, y); y += 4 }
      if (recipient.company) { doc.text(recipient.company, m, y); y += 4 }
      if (recipient.address) { doc.text(recipient.address, m, y); y += 4 }
      y += 4
    }

    if (subject) {
      doc.setFont("helvetica", "bold")
      doc.setFontSize(11)
      doc.setTextColor(26, 26, 46)
      doc.text(`Re: ${subject}`, m, y); y += 8
    }

    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    doc.setTextColor(26, 26, 46)
    const lines = doc.splitTextToSize(processedBody, 160)
    doc.text(lines, m, y)

    const stampY = 250
    doc.setFont("helvetica", "normal")
    doc.setFontSize(8)
    doc.setTextColor(148, 163, 184)
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 290, { align: "center" })

    doc.save(`letter-${subject ? subject.replace(/\s+/g, "_") : "letter"}.pdf`)
    toast.success("Letter downloaded as PDF")
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div className="flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500/10"><Download className="h-6 w-6 text-teal-500" /></div><div><h1 className="text-2xl font-bold text-foreground">Letter Generator</h1><p className="text-sm text-muted-foreground">Professional formal letters with PDF export</p></div></div>
        <div className="flex items-center gap-2"><Button variant={showPreview ? "primary" : "outline"} size="sm" onClick={() => setShowPreview(!showPreview)}>{showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</Button><Button variant="primary" size="sm" onClick={handleDownload}><Download className="h-4 w-4" /> Download PDF</Button></div>
      </motion.div>
      <div className="flex flex-wrap gap-2">{LETTER_TYPES.map((lt) => (<button key={lt.id} onClick={() => setLetterType(lt.id)} className={`rounded-lg border px-4 py-2 text-sm transition-colors ${letterType === lt.id ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/50"}`}>{lt.name}</button>))}</div>

      <AnimatePresence mode="wait">
        {showPreview ? (
          <motion.div key="preview" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className="overflow-hidden p-0">
              <div className="bg-white p-8 dark:bg-gray-950">
                <div className="border-b border-teal-200 pb-3 dark:border-teal-800"><h2 className="text-lg font-bold text-foreground">{sender.name || "Your Name"}</h2><p className="text-xs text-muted-foreground">{[sender.address, sender.email, sender.phone].filter(Boolean).join(" | ")}</p></div>
                <p className="mt-3 text-sm text-muted-foreground">{new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
                {recipient.name && <div className="mt-4 text-sm text-foreground"><p>{recipient.name}</p>{recipient.title && <p>{recipient.title}</p>}{recipient.company && <p>{recipient.company}</p>}<p>{recipient.address}</p></div>}
                {subject && <h3 className="mt-4 text-base font-bold text-foreground">Re: {subject}</h3>}
                <div className="mt-6 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{processedBody || "Your letter content will appear here..."}</div>
              </div>
            </Card>
          </motion.div>
        ) : (
          <motion.div key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-6">
              <Card><h3 className="mb-4 font-semibold text-foreground">Sender</h3><Input label="Your Name" value={sender.name} onChange={(e) => setSender({ ...sender, name: e.target.value })} /><div className="mt-3"><Input label="Address" value={sender.address} onChange={(e) => setSender({ ...sender, address: e.target.value })} /></div><div className="mt-3 grid grid-cols-2 gap-3"><Input label="Email" type="email" value={sender.email} onChange={(e) => setSender({ ...sender, email: e.target.value })} /><Input label="Phone" value={sender.phone} onChange={(e) => setSender({ ...sender, phone: e.target.value })} /></div></Card>
              <Card><h3 className="mb-4 font-semibold text-foreground">Recipient</h3><Input label="Recipient Name" value={recipient.name} onChange={(e) => setRecipient({ ...recipient, name: e.target.value })} /><div className="mt-3"><Input label="Title / Position" value={recipient.title} onChange={(e) => setRecipient({ ...recipient, title: e.target.value })} /></div><div className="mt-3"><Input label="Company" value={recipient.company} onChange={(e) => setRecipient({ ...recipient, company: e.target.value })} /></div><div className="mt-3"><Input label="Address" value={recipient.address} onChange={(e) => setRecipient({ ...recipient, address: e.target.value })} /></div></Card>
            </div>
            <div className="space-y-6">
              <Card><Input label="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Inquiry Regarding Services" /></Card>
              <Card><Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} /></Card>
              <Card>
                <div className="flex items-center justify-between mb-2"><h3 className="font-semibold text-foreground">Letter Body</h3><span className="text-xs text-muted-foreground">Use [Sender Name], [Recipient], [Company], [Position], [Date] as placeholders</span></div>
                <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={20} className="w-full resize-y rounded-lg border border-input bg-background p-4 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2" />
              </Card>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
