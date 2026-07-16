"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils/cn"
import { Download, FilePen, Eye, EyeOff } from "lucide-react"

const LETTER_TYPES = [
  { id: "formal", name: "Formal Letter" },
  { id: "business", name: "Business Letter" },
  { id: "resignation", name: "Resignation Letter" },
  { id: "recommendation", name: "Recommendation Letter" },
  { id: "complaint", name: "Complaint Letter" },
  { id: "apology", name: "Apology Letter" },
  { id: "inquiry", name: "Inquiry Letter" },
  { id: "cover", name: "Cover Letter" },
]

export function LetterGenerator() {
  const [letterType, setLetterType] = React.useState("formal")
  const [sender, setSender] = React.useState({ name: "", address: "", email: "", phone: "" })
  const [recipient, setRecipient] = React.useState({ name: "", title: "", company: "", address: "" })
  const [date, setDate] = React.useState(new Date().toISOString().split("T")[0])
  const [subject, setSubject] = React.useState("")
  const [body, setBody] = React.useState("")
  const [signature, setSignature] = React.useState("")
  const [showPreview, setShowPreview] = React.useState(false)

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })

  const handleDownload = () => {
    if (!sender.name || !recipient.name) { toast.error("Please fill required fields"); return }
    const w = window.open("", "_blank")
    if (!w) { toast.error("Please allow pop-ups"); return }
    w.document.write(`
      <html><head><title>${letterType.charAt(0).toUpperCase() + letterType.slice(1)} Letter</title>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; padding: 60px; max-width: 700px; margin: 0 auto; color: #1a1a2e; font-size: 14px; line-height: 1.6; }
        .sender { margin-bottom: 30px; }
        .recipient { margin-bottom: 20px; }
        .subject { font-weight: 600; margin-bottom: 20px; }
        .body-text { white-space: pre-wrap; }
        .signature { margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 15px; }
        @media print { body { padding: 40px; } }
      </style></head><body>
        <div class="sender"><strong>${sender.name}</strong><br>${sender.address.replace(/\n/g, "<br>")}<br>${sender.email} | ${sender.phone}</div>
        <p>${formatDate(date)}</p>
        <div class="recipient"><strong>${recipient.name}</strong><br>${recipient.title}<br>${recipient.company}<br>${recipient.address.replace(/\n/g, "<br>")}</div>
        ${subject ? `<div class="subject">Re: ${subject}</div>` : ""}
        <p>Dear ${recipient.name.split(" ")[0] || "Sir/Madam"},</p>
        <div class="body-text">${body.replace(/\n/g, "<br>")}</div>
        <p>Sincerely,</p>
        <div class="signature"><strong>${signature || sender.name}</strong></div>
      </body></html>
    `)
    w.document.close()
    setTimeout(() => w.print(), 500)
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div className="flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-500/10"><FilePen className="h-6 w-6 text-slate-500" /></div><div><h1 className="text-2xl font-bold text-foreground">Letter Generator</h1><p className="text-sm text-muted-foreground">Write formal letters</p></div></div>
        <div className="flex items-center gap-2"><Button variant={showPreview ? "primary" : "outline"} size="sm" onClick={() => setShowPreview(!showPreview)}>{showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</Button><Button variant="primary" size="sm" onClick={handleDownload}><Download className="h-4 w-4" /> Download</Button></div>
      </motion.div>

      <div className="flex flex-wrap gap-2">{LETTER_TYPES.map((lt) => (<button key={lt.id} onClick={() => setLetterType(lt.id)} className={cn("rounded-lg border px-3 py-1.5 text-sm transition-colors", letterType === lt.id ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/50")}>{lt.name}</button>))}</div>

      <AnimatePresence mode="wait">
        {showPreview ? (
          <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card className="overflow-hidden p-0">
              <div className="bg-white p-10 dark:bg-gray-950 text-sm leading-relaxed">
                <div className="mb-8"><strong className="text-foreground">{sender.name || "Your Name"}</strong><br /><span className="text-muted-foreground">{sender.address}<br />{sender.email} | {sender.phone}</span></div>
                <p className="text-muted-foreground">{formatDate(date)}</p>
                <div className="mt-4 mb-6"><strong className="text-foreground">{recipient.name || "Recipient"}</strong><br /><span className="text-muted-foreground">{recipient.title}<br />{recipient.company}<br />{recipient.address}</span></div>
                {subject && <p className="mb-4 font-semibold text-foreground">Re: {subject}</p>}
                <p className="text-muted-foreground">Dear {recipient.name.split(" ")[0] || "Sir/Madam"},</p>
                <div className="mt-4 whitespace-pre-wrap text-muted-foreground">{body}</div>
                <p className="mt-8 text-muted-foreground">Sincerely,</p>
                <div className="mt-2 font-semibold text-foreground">{signature || sender.name || "Your Name"}</div>
              </div>
            </Card>
          </motion.div>
        ) : (
          <motion.div key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <Card><h3 className="mb-4 font-semibold text-foreground">Sender</h3><div className="grid gap-4 sm:grid-cols-2"><Input label="Name" value={sender.name} onChange={(e) => setSender({ ...sender, name: e.target.value })} /><Input label="Email" type="email" value={sender.email} onChange={(e) => setSender({ ...sender, email: e.target.value })} /><Input label="Phone" value={sender.phone} onChange={(e) => setSender({ ...sender, phone: e.target.value })} /><Input label="Address" value={sender.address} onChange={(e) => setSender({ ...sender, address: e.target.value })} /></div></Card>
            <Card><h3 className="mb-4 font-semibold text-foreground">Recipient</h3><div className="grid gap-4 sm:grid-cols-2"><Input label="Name" value={recipient.name} onChange={(e) => setRecipient({ ...recipient, name: e.target.value })} /><Input label="Title" value={recipient.title} onChange={(e) => setRecipient({ ...recipient, title: e.target.value })} /><Input label="Company" value={recipient.company} onChange={(e) => setRecipient({ ...recipient, company: e.target.value })} /><Input label="Address" value={recipient.address} onChange={(e) => setRecipient({ ...recipient, address: e.target.value })} /></div></Card>
            <Card><h3 className="mb-4 font-semibold text-foreground">Letter Details</h3><div className="grid gap-4 sm:grid-cols-2"><Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} /><Input label="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} /></div></Card>
            <Card><h3 className="mb-4 font-semibold text-foreground">Body</h3><textarea value={body} onChange={(e) => setBody(e.target.value)} rows={10} className="w-full resize-y rounded-lg border border-input bg-background p-4 text-sm leading-relaxed placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2" placeholder="Write your letter here..." /></Card>
            <Card><Input label="Signature" value={signature} onChange={(e) => setSignature(e.target.value)} placeholder="Your signed name" /></Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
