"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils/cn"
import { Download, Eye, EyeOff, Image, Palette, Trash2 } from "lucide-react"
import jsPDF from "jspdf"

const STYLES = [
  { id: "classic", name: "Classic", border: "#d4a843", text: "#1a1a2e", bg: "#fffdf5", accent: "#c49632", seal: "#d4a843" },
  { id: "modern", name: "Modern", border: "#14b8a6", text: "#0f172a", bg: "#f0fdfa", accent: "#0d9488", seal: "#14b8a6" },
  { id: "elegant", name: "Elegant", border: "#7c3aed", text: "#2e1065", bg: "#f5f3ff", accent: "#6d28d9", seal: "#7c3aed" },
  { id: "gold", name: "Gold", border: "#b8860b", text: "#1c1917", bg: "#fefce8", accent: "#a16207", seal: "#d4a843" },
]

const DECORATIONS = [
  { id: "none", name: "None" },
  { id: "border", name: "Decorative Border" },
  { id: "seal", name: "Gold Seal" },
  { id: "full", name: "Full Ornate" },
]

const REASONS = [
  "Completion of Training Program",
  "Outstanding Performance",
  "Volunteer Service Recognition",
  "Achievement of Excellence",
  "Participation Certificate",
  "Custom",
]

export function CertificateGenerator() {
  const [cert, setCert] = React.useState({ recipient: "", course: "", reason: REASONS[0], customReason: "", date: new Date().toISOString().split("T")[0], issuer: "", issuerTitle: "", description: "", signature: "", logo: "" })
  const [style, setStyle] = React.useState(STYLES[0])
  const [decoration, setDecoration] = React.useState(DECORATIONS[0])
  const [showPreview, setShowPreview] = React.useState(true)

  const handleImage = (field: "signature" | "logo") => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) { const r = new FileReader(); r.onload = (ev) => setCert({ ...cert, [field]: ev.target?.result as string }); r.readAsDataURL(file) }
  }

  const reasonText = cert.reason === "Custom" ? cert.customReason : cert.reason

  const handleDownload = () => {
    if (!cert.recipient) { toast.error("Please enter recipient name"); return }
    const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "landscape" })
    const w = 297, h = 210
    const m = 15

    if (decoration.id === "full" || decoration.id === "border") {
      doc.setDrawColor(style.border)
      doc.setLineWidth(1.5)
      doc.roundedRect(m, m, w - 2 * m, h - 2 * m, 5, 5, "S")
      if (decoration.id === "full") {
        doc.setLineWidth(0.5)
        doc.roundedRect(m + 4, m + 4, w - 2 * m - 8, h - 2 * m - 8, 3, 3, "S")
      }
    }

    if (decoration.id === "seal" || decoration.id === "full") {
      doc.setDrawColor(style.seal)
      doc.setLineWidth(0.8)
      doc.circle(w / 2, 70, 18, "S")
      doc.setFontSize(8)
      doc.setTextColor(style.seal)
      doc.setFont("helvetica", "bold")
      doc.text("SEAL", w / 2, 70, { align: "center" })
    }

    doc.setFont("helvetica", "bold")
    if (cert.logo) { try { doc.addImage(cert.logo, "PNG", w / 2 - 15, 22, 30, 15, undefined, "FAST") } catch {} }

    doc.setFontSize(30)
    doc.setTextColor(style.accent)
    doc.setFont("helvetica", "bold")
    doc.text("CERTIFICATE", w / 2, decoration.id === "full" ? 58 : 50, { align: "center" })

    doc.setFontSize(12)
    doc.setTextColor(style.text)
    doc.setFont("helvetica", "normal")
    doc.text("OF", w / 2, decoration.id === "full" ? 64 : 58, { align: "center" })

    doc.setFontSize(14)
    doc.setTextColor(style.text)
    doc.setFont("helvetica", "bold")
    doc.text(reasonText.toUpperCase(), w / 2, decoration.id === "full" ? 72 : 66, { align: "center" })

    doc.setFontSize(11)
    doc.setTextColor(style.text)
    doc.setFont("helvetica", "normal")
    doc.text("This certificate is proudly presented to", w / 2, decoration.id === "full" ? 85 : 80, { align: "center" })

    doc.setFontSize(24)
    doc.setTextColor(style.accent)
    doc.setFont("helvetica", "bold")
    doc.text(cert.recipient, w / 2, decoration.id === "full" ? 100 : 95, { align: "center" })

    if (cert.course) {
      doc.setFontSize(11)
      doc.setTextColor(style.text)
      doc.setFont("helvetica", "normal")
      doc.text(`for successfully completing "${cert.course}"`, w / 2, decoration.id === "full" ? 114 : 109, { align: "center" })
    }

    if (cert.description) {
      doc.setFontSize(10)
      doc.setTextColor(style.text)
      doc.setFont("helvetica", "normal")
      const descLines = doc.splitTextToSize(cert.description, 200)
      doc.text(descLines, w / 2, decoration.id === "full" ? 125 : 120, { align: "center" })
    }

    doc.setFontSize(9)
    doc.setTextColor(style.text)
    doc.setFont("helvetica", "normal")
    doc.text(`Date: ${new Date(cert.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`, 40, h - m - 5)

    if (cert.issuer) {
      doc.setFont("helvetica", "bold")
      doc.setFontSize(10)
      doc.setTextColor(style.text)
      doc.text(cert.issuer, w - m - 10, h - m - 20, { align: "right" })
      if (cert.signature) { try { doc.addImage(cert.signature, "PNG", w - m - 50, h - m - 40, 40, 15, undefined, "FAST") } catch {} }
      doc.setFont("helvetica", "normal")
      doc.setFontSize(8)
      doc.setTextColor(style.text)
      if (cert.issuerTitle) doc.text(cert.issuerTitle, w - m - 10, h - m - 10, { align: "right" })
    }

    doc.save(`certificate-${cert.recipient.replace(/\s+/g, "_")}.pdf`)
    toast.success("Certificate downloaded as PDF")
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div className="flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500/10"><Download className="h-6 w-6 text-teal-500" /></div><div><h1 className="text-2xl font-bold text-foreground">Certificate Generator</h1><p className="text-sm text-muted-foreground">Create professional certificates with decorative borders</p></div></div>
        <div className="flex items-center gap-2"><Button variant={showPreview ? "primary" : "outline"} size="sm" onClick={() => setShowPreview(!showPreview)}>{showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</Button><Button variant="primary" size="sm" onClick={handleDownload}><Download className="h-4 w-4" /> Download PDF</Button></div>
      </motion.div>

      <div className="flex flex-wrap gap-2">{STYLES.map((s) => (<button key={s.id} onClick={() => setStyle(s)} className={cn("flex items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-colors", style.id === s.id ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/50")}><div className="h-3 w-3 rounded-full" style={{ backgroundColor: s.accent }} />{s.name}</button>))}</div>
      <div className="flex flex-wrap gap-2">{DECORATIONS.map((d) => (<button key={d.id} onClick={() => setDecoration(d)} className={cn("rounded-lg border px-4 py-2 text-sm transition-colors", decoration.id === d.id ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/50")}>{d.name}</button>))}</div>

      <AnimatePresence mode="wait">
        {showPreview ? (
          <motion.div key="preview" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className="flex items-center justify-center overflow-hidden p-8">
              <div className="relative aspect-[1.414/1] w-full max-w-3xl rounded-lg p-8 shadow-lg" style={{ background: style.bg }}>
                {(decoration.id === "full" || decoration.id === "border") && <div className="absolute inset-4 rounded-lg border-2" style={{ borderColor: style.border }} />}
                {decoration.id === "full" && <div className="absolute inset-8 rounded-md border" style={{ borderColor: style.border + "80" }} />}
                {(decoration.id === "seal" || decoration.id === "full") && <div className="absolute left-1/2 top-1/4 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 text-xs font-bold" style={{ borderColor: style.seal, color: style.seal }}>SEAL</div>}
                <div className="relative z-10 flex h-full flex-col items-center justify-center text-center">
                  {cert.logo && <img src={cert.logo} alt="" className="mb-2 h-16 object-contain" />}
                  <h1 className="text-2xl font-bold" style={{ color: style.accent }}>CERTIFICATE</h1>
                  <p className="text-sm" style={{ color: style.text }}>OF</p>
                  <h2 className="text-lg font-bold uppercase tracking-wider" style={{ color: style.text }}>{reasonText}</h2>
                  <p className="mt-2 text-sm" style={{ color: style.text }}>This certificate is proudly presented to</p>
                  <h3 className="mt-2 text-3xl font-bold" style={{ color: style.accent }}>{cert.recipient || "Recipient Name"}</h3>
                  {cert.course && <p className="mt-2 text-sm" style={{ color: style.text }}>for successfully completing "{cert.course}"</p>}
                  {cert.description && <p className="mt-2 max-w-md text-xs" style={{ color: style.text }}>{cert.description}</p>}
                  <div className="mt-6 flex w-full justify-between px-8 text-xs" style={{ color: style.text }}>
                    <div><p>Date: {new Date(cert.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p></div>
                    {cert.issuer && <div className="text-right"><p className="font-bold">{cert.issuer}</p><p className="text-xs">{cert.issuerTitle}</p></div>}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ) : (
          <motion.div key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid gap-6 lg:grid-cols-2">
            <Card><h3 className="mb-4 font-semibold text-foreground">Certificate Details</h3><div className="grid gap-3"><Input label="Recipient Name" value={cert.recipient} onChange={(e) => setCert({ ...cert, recipient: e.target.value })} placeholder="John Doe" /><Input label="Course / Event Name" value={cert.course} onChange={(e) => setCert({ ...cert, course: e.target.value })} placeholder="e.g. Advanced Leadership Training" /><div><label className="text-sm font-medium text-foreground">Reason</label><select value={cert.reason} onChange={(e) => setCert({ ...cert, reason: e.target.value })} className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">{REASONS.map((r) => <option key={r} value={r}>{r}</option>)}</select></div>{cert.reason === "Custom" && <Input label="Custom Reason" value={cert.customReason} onChange={(e) => setCert({ ...cert, customReason: e.target.value })} />}<Input label="Date" type="date" value={cert.date} onChange={(e) => setCert({ ...cert, date: e.target.value })} /><Input label="Description (optional)" value={cert.description} onChange={(e) => setCert({ ...cert, description: e.target.value })} placeholder="A brief description of the achievement" /></div></Card>
            <div className="space-y-4">
              <Card><h3 className="mb-4 font-semibold text-foreground">Issuer Info</h3><Input label="Issuer Name" value={cert.issuer} onChange={(e) => setCert({ ...cert, issuer: e.target.value })} placeholder="e.g. Dr. Sarah Johnson" /><div className="mt-3"><Input label="Issuer Title" value={cert.issuerTitle} onChange={(e) => setCert({ ...cert, issuerTitle: e.target.value })} placeholder="e.g. Director of Training" /></div></Card>
              <Card><h3 className="mb-4 flex items-center gap-2 font-semibold text-foreground"><Image className="h-4 w-4 text-teal-500" />Images</h3><div className="mb-3"><label className="text-sm font-medium text-foreground">Logo</label>{cert.logo ? <div className="mt-1 flex items-center gap-2"><img src={cert.logo} alt="" className="h-12 object-contain" /><Button variant="ghost" size="sm" onClick={() => setCert({ ...cert, logo: "" })}><Trash2 className="h-4 w-4" /></Button></div> : <input type="file" accept="image/*" onChange={handleImage("logo")} className="mt-1 text-sm" />}</div><div><label className="text-sm font-medium text-foreground">Signature</label>{cert.signature ? <div className="mt-1 flex items-center gap-2"><img src={cert.signature} alt="" className="h-10" /><Button variant="ghost" size="sm" onClick={() => setCert({ ...cert, signature: "" })}><Trash2 className="h-4 w-4" /></Button></div> : <input type="file" accept="image/*" onChange={handleImage("signature")} className="mt-1 text-sm" />}</div></Card>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
