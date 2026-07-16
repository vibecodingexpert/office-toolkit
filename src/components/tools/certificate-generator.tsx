"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils/cn"
import { Download, Award, Palette } from "lucide-react"

const TEMPLATES = [
  { id: "elegant", name: "Elegant", border: "border-8 border-amber-500/30", bg: "bg-gradient-to-br from-amber-50 to-white", accent: "#d97706" },
  { id: "modern", name: "Modern", border: "border-8 border-blue-500/30", bg: "bg-gradient-to-br from-blue-50 to-white", accent: "#3b82f6" },
  { id: "classic", name: "Classic", border: "border-8 border-gray-800/30 dark:border-gray-200/30", bg: "bg-white dark:bg-gray-950", accent: "#1e293b" },
  { id: "premium", name: "Premium", border: "border-8 border-violet-500/30", bg: "bg-gradient-to-br from-violet-50 to-white", accent: "#8b5cf6" },
]

export function CertificateGenerator() {
  const [title, setTitle] = React.useState("Certificate of Completion")
  const [recipient, setRecipient] = React.useState("")
  const [course, setCourse] = React.useState("")
  const [date, setDate] = React.useState(new Date().toISOString().split("T")[0])
  const [description, setDescription] = React.useState("")
  const [template, setTemplate] = React.useState("elegant")
  const [issuer, setIssuer] = React.useState("")

  const selectedTemplate = TEMPLATES.find((t) => t.id === template) || TEMPLATES[0]

  const handleDownload = () => {
    if (!recipient) { toast.error("Please enter recipient name"); return }
    const w = window.open("", "_blank")
    if (!w) { toast.error("Please allow pop-ups"); return }
    w.document.write(`
      <html><head><title>Certificate - ${recipient}</title>
      <style>
        @page { size: landscape; margin: 0; }
        body { margin: 0; padding: 0; display: flex; align-items: center; justify-content: center; min-height: 100vh; font-family: 'Segoe UI', Georgia, serif; }
        .certificate { width: 900px; height: 650px; border: 12px solid ${selectedTemplate.accent}40; background: ${template === "classic" ? "#fff" : `linear-gradient(135deg, ${template === "elegant" ? "#fffbeb" : template === "modern" ? "#eff6ff" : "#f5f3ff"}, #fff)`}; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px; text-align: center; box-sizing: border-box; position: relative; }
        .certificate::before { content: ''; position: absolute; top: 20px; left: 20px; right: 20px; bottom: 20px; border: 2px solid ${selectedTemplate.accent}30; pointer-events: none; }
        h1 { font-size: 42px; color: ${selectedTemplate.accent}; margin: 0; text-transform: uppercase; letter-spacing: 4px; font-weight: 800; }
        .subtitle { font-size: 16px; color: #64748b; margin-top: 10px; text-transform: uppercase; letter-spacing: 3px; }
        .recipient { font-size: 48px; font-weight: 700; color: #1a1a2e; margin: 25px 0; font-family: Georgia, serif; }
        .course-text { font-size: 18px; color: #475569; margin: 10px 0; }
        .desc { font-size: 14px; color: #64748b; max-width: 600px; line-height: 1.6; margin: 15px 0; }
        .footer { margin-top: 40px; display: flex; justify-content: space-between; width: 80%; }
        .footer div { text-align: center; }
        .footer .line { width: 200px; height: 2px; background: ${selectedTemplate.accent}; margin-bottom: 5px; }
        .footer span { font-size: 12px; color: #64748b; }
        .date-text { font-size: 14px; color: #64748b; margin-top: 20px; }
        @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
      </style></head><body>
        <div class="certificate">
          <div class="subtitle">This is to certify that</div>
          <div class="recipient">${recipient}</div>
          <div class="course-text">has successfully completed</div>
          <h1 style="font-size:28px;margin:15px 0">${course || "the course"}</h1>
          ${description ? `<div class="desc">${description}</div>` : ""}
          <div class="date-text">Date: ${new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</div>
          <div class="footer"><div><div class="line"></div><span>${issuer || "Instructor"}</span></div><div><div class="line"></div><span>Date</span></div></div>
        </div>
      </body></html>
    `)
    w.document.close()
    setTimeout(() => w.print(), 500)
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div className="flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10"><Award className="h-6 w-6 text-amber-500" /></div><div><h1 className="text-2xl font-bold text-foreground">Certificate Generator</h1><p className="text-sm text-muted-foreground">Create certificates</p></div></div>
        <Button variant="pro" size="sm" onClick={handleDownload}><Download className="h-4 w-4" /> Download PDF</Button>
      </motion.div>

      <div className="flex flex-wrap gap-2">{TEMPLATES.map((t) => (<button key={t.id} onClick={() => setTemplate(t.id)} className={cn("rounded-lg border px-4 py-2 text-sm transition-colors", template === t.id ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground")}><div className="flex items-center gap-2"><Palette className="h-4 w-4" />{t.name}</div></button>))}</div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Card><h3 className="mb-4 font-semibold text-foreground">Certificate Details</h3><div className="space-y-4"><Input label="Certificate Title" value={title} onChange={(e) => setTitle(e.target.value)} /><Input label="Recipient Name" value={recipient} onChange={(e) => setRecipient(e.target.value)} /><Input label="Course / Event Name" value={course} onChange={(e) => setCourse(e.target.value)} /><Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} /><Input label="Issuer / Instructor" value={issuer} onChange={(e) => setIssuer(e.target.value)} /><div className="space-y-2"><label className="text-sm font-medium text-foreground">Description</label><textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full resize-y rounded-lg border border-input bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2" placeholder="Optional description..." /></div></div></Card>
        </div>

        <Card padding="none" className="overflow-hidden">
          <div className="border-b border-border bg-muted/30 px-5 py-3"><span className="text-sm font-medium text-foreground">Preview</span></div>
          <div className="flex items-center justify-center bg-gray-100 p-6 dark:bg-gray-900" style={{ minHeight: 400 }}>
            <div className={cn("w-full max-w-lg overflow-hidden rounded-xl p-8 text-center", selectedTemplate.border, selectedTemplate.bg)}>
              <p className="text-xs font-semibold uppercase tracking-[3px] text-muted-foreground">This is to certify that</p>
              <p className="mt-4 text-3xl font-bold" style={{ color: selectedTemplate.accent, fontFamily: "Georgia, serif" }}>{recipient || "Recipient Name"}</p>
              <p className="mt-4 text-sm text-muted-foreground">has successfully completed</p>
              <p className="mt-2 text-xl font-bold text-foreground">{course || "Course Name"}</p>
              {description && <p className="mt-4 text-xs text-muted-foreground">{description}</p>}
              <p className="mt-6 text-xs text-muted-foreground">{new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
              <div className="mt-8 flex justify-center gap-16 text-xs text-muted-foreground">
                <div><div className="mx-auto mb-1 h-px w-32" style={{ backgroundColor: selectedTemplate.accent }} />{issuer || "Instructor"}</div>
                <div><div className="mx-auto mb-1 h-px w-32" style={{ backgroundColor: selectedTemplate.accent }} />Date</div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
