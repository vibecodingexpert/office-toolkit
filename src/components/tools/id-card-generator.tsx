"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils/cn"
import { Download, Image, Trash2 } from "lucide-react"
import jsPDF from "jspdf"

const PRESETS = [
  { id: "corporate", name: "Corporate", bg: "#0f172a", accent: "#14b8a6", text: "#f8fafc", border: true },
  { id: "school", name: "School", bg: "#1e3a5f", accent: "#fbbf24", text: "#ffffff", border: true },
  { id: "hospital", name: "Hospital", bg: "#dcfce7", accent: "#16a34a", text: "#1e293b", border: true },
  { id: "event", name: "Event", bg: "#881337", accent: "#fda4af", text: "#fff1f2", border: false },
  { id: "gym", name: "Gym/Fitness", bg: "#1c1917", accent: "#a3e635", text: "#fafaf9", border: true },
]

export function IdCardGenerator() {
  const [info, setInfo] = React.useState({ name: "", id: "", department: "", position: "", company: "", email: "", phone: "", emergency: "", bloodType: "", address: "" })
  const [photo, setPhoto] = React.useState("")
  const [signature, setSignature] = React.useState("")
  const [preset, setPreset] = React.useState(PRESETS[0])
  const [showBack, setShowBack] = React.useState(false)
  const [barcode, setBarcode] = React.useState("")

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) { const r = new FileReader(); r.onload = (ev) => setPhoto(ev.target?.result as string); r.readAsDataURL(file) }
  }
  const handleSignature = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) { const r = new FileReader(); r.onload = (ev) => setSignature(ev.target?.result as string); r.readAsDataURL(file) }
  }

  const cardFront = () => (
    <div className="relative overflow-hidden rounded-2xl p-6 text-center shadow-lg" style={{ background: `linear-gradient(135deg, ${preset.bg}, ${preset.bg}dd)`, color: preset.text, minHeight: 340, width: 300 }}>
      {preset.border && <div className="absolute inset-0 rounded-2xl border-2" style={{ borderColor: preset.accent }} />}
      <div className="relative z-10 flex flex-col items-center gap-3">
        <div className="text-xs font-bold uppercase tracking-widest" style={{ color: preset.accent }}>{info.company || "COMPANY"}</div>
        <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4" style={{ borderColor: preset.accent }}>
          {photo ? <img src={photo} alt="" className="h-full w-full object-cover" /> : <div className="text-3xl font-bold" style={{ color: preset.accent }}>{info.name ? info.name.charAt(0).toUpperCase() : "?"}</div>}
        </div>
        <div><h3 className="text-lg font-bold">{info.name || "Employee Name"}</h3><p className="text-sm opacity-80">{info.position || "Position"}</p></div>
        <div className="text-xs" style={{ color: preset.accent }}>ID: {info.id || "000-000"}</div>
        <div className="mt-2 space-y-1 text-xs opacity-75"><p>{info.email}</p><p>{info.phone}</p><p>{info.department}</p></div>
        {signature && <img src={signature} alt="" className="mt-2 h-8" />}
      </div>
    </div>
  )

  const cardBack = () => (
    <div className="relative overflow-hidden rounded-2xl p-6 shadow-lg" style={{ background: preset.bg, color: preset.text, minHeight: 340, width: 300 }}>
      {preset.border && <div className="absolute inset-0 rounded-2xl border-2" style={{ borderColor: preset.accent }} />}
      <div className="relative z-10 space-y-3 text-sm">
        <h4 className="text-center text-xs font-bold uppercase tracking-widest" style={{ color: preset.accent }}>Emergency Info</h4>
        <div className="space-y-2 border-t pt-2" style={{ borderColor: preset.accent + "40" }}>
          {info.bloodType && <div className="flex justify-between"><span className="opacity-70">Blood Type:</span><span className="font-semibold">{info.bloodType}</span></div>}
          {info.emergency && <div className="flex justify-between"><span className="opacity-70">Emergency:</span><span className="font-semibold">{info.emergency}</span></div>}
          {info.address && <div><span className="opacity-70">Address:</span><p className="mt-1 text-xs">{info.address}</p></div>}
        </div>
        {barcode && <div className="mt-4 text-center"><img src={barcode} alt="" className="mx-auto h-14" /></div>}
        <div className="mt-4 text-center text-xs opacity-50">This card is property of {info.company || "the organization"}. If found, please return.</div>
      </div>
    </div>
  )

  const handleDownload = () => {
    if (!info.name) { toast.error("Please enter a name"); return }
    const doc = new jsPDF({ unit: "mm", format: [90, 130] })
    doc.setFillColor(preset.bg)
    doc.rect(0, 0, 90, 130, "F")
    doc.setFont("helvetica", "bold")
    doc.setFontSize(8)
    doc.setTextColor(preset.accent)
    doc.text((info.company || "COMPANY").toUpperCase(), 45, 12, { align: "center" })

    if (photo) {
      try { doc.addImage(photo, "JPEG", 30, 18, 30, 30, undefined, "FAST") } catch { doc.setFontSize(20); doc.setTextColor(preset.accent); doc.text(info.name.charAt(0).toUpperCase(), 45, 35, { align: "center" }) }
    } else { doc.setFontSize(20); doc.setTextColor(preset.accent); doc.text(info.name.charAt(0).toUpperCase(), 45, 35, { align: "center" }) }

    doc.setFont("helvetica", "bold")
    doc.setFontSize(10)
    doc.setTextColor(preset.text)
    doc.text(info.name || "Employee Name", 45, 58, { align: "center" })
    doc.setFont("helvetica", "normal")
    doc.setFontSize(7)
    doc.setTextColor(preset.accent)
    doc.text(info.position || "Position", 45, 64, { align: "center" })
    doc.setFontSize(6)
    doc.setTextColor(preset.text)
    doc.text(`ID: ${info.id || "000-000"}`, 45, 70, { align: "center" })
    doc.text(info.email || "", 45, 76, { align: "center" })
    doc.text(info.phone || "", 45, 81, { align: "center" })
    doc.text(info.department || "", 45, 86, { align: "center" })
    if (signature) { try { doc.addImage(signature, "PNG", 30, 90, 30, 10, undefined, "FAST") } catch {} }

    doc.addPage([90, 130])
    doc.setFillColor(preset.bg)
    doc.rect(0, 0, 90, 130, "F")
    doc.setFont("helvetica", "bold")
    doc.setFontSize(8)
    doc.setTextColor(preset.accent)
    doc.text("EMERGENCY INFO", 45, 12, { align: "center" })
    doc.setTextColor(preset.text)
    doc.setFontSize(7)
    let y = 22
    if (info.bloodType) { doc.text(`Blood Type: ${info.bloodType}`, 10, y); y += 6 }
    if (info.emergency) { doc.text(`Emergency: ${info.emergency}`, 10, y); y += 6 }
    doc.save(`id-card-${info.name.replace(/\s+/g, "_")}.pdf`)
    toast.success("ID card downloaded as PDF")
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div className="flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500/10"><Download className="h-6 w-6 text-teal-500" /></div><div><h1 className="text-2xl font-bold text-foreground">ID Card Generator</h1><p className="text-sm text-muted-foreground">Custom ID cards with front/back design</p></div></div>
        <Button variant="primary" size="sm" onClick={handleDownload}><Download className="h-4 w-4" /> Download PDF</Button>
      </motion.div>
      <div className="flex flex-wrap gap-2">{PRESETS.map((p) => (<button key={p.id} onClick={() => setPreset(p)} className={cn("flex items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-colors", preset.id === p.id ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/50")}><div className="h-4 w-4 rounded" style={{ backgroundColor: p.accent }} />{p.name}</button>))}</div>

      <div className="flex justify-center gap-4">
        <button onClick={() => setShowBack(false)} className={cn("rounded-lg border px-6 py-2 text-sm transition-colors", !showBack ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground")}>Front</button>
        <button onClick={() => setShowBack(true)} className={cn("rounded-lg border px-6 py-2 text-sm transition-colors", showBack ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground")}>Back</button>
      </div>

      <div className="flex justify-center">{showBack ? cardBack() : cardFront()}</div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card><h3 className="mb-4 font-semibold text-foreground">Employee Info</h3><div className="grid gap-3 sm:grid-cols-2"><Input label="Full Name" value={info.name} onChange={(e) => setInfo({ ...info, name: e.target.value })} /><Input label="Employee ID" value={info.id} onChange={(e) => setInfo({ ...info, id: e.target.value })} /><Input label="Department" value={info.department} onChange={(e) => setInfo({ ...info, department: e.target.value })} /><Input label="Position" value={info.position} onChange={(e) => setInfo({ ...info, position: e.target.value })} /><Input label="Company" value={info.company} onChange={(e) => setInfo({ ...info, company: e.target.value })} /><Input label="Email" type="email" value={info.email} onChange={(e) => setInfo({ ...info, email: e.target.value })} /><Input label="Phone" value={info.phone} onChange={(e) => setInfo({ ...info, phone: e.target.value })} /><Input label="Address" value={info.address} onChange={(e) => setInfo({ ...info, address: e.target.value })} /></div></Card>
        <div className="space-y-4">
          <Card><h3 className="mb-4 font-semibold text-foreground">Photos</h3><div className="mb-3 flex items-center gap-4">{photo && <img src={photo} alt="" className="h-16 w-16 rounded-full object-cover" />}<label className="cursor-pointer rounded-lg border border-dashed border-border px-4 py-2 text-sm text-muted-foreground hover:border-primary/50"><Image className="mr-1 inline h-4 w-4" />Upload Photo<input type="file" accept="image/*" onChange={handlePhoto} className="hidden" /></label>{photo && <Button variant="ghost" size="sm" onClick={() => setPhoto("")}><Trash2 className="h-4 w-4" /></Button>}</div><div className="flex items-center gap-4">{signature && <img src={signature} alt="" className="h-10" />}<label className="cursor-pointer rounded-lg border border-dashed border-border px-4 py-2 text-sm text-muted-foreground hover:border-primary/50"><Image className="mr-1 inline h-4 w-4" />Upload Signature<input type="file" accept="image/*" onChange={handleSignature} className="hidden" /></label>{signature && <Button variant="ghost" size="sm" onClick={() => setSignature("")}><Trash2 className="h-4 w-4" /></Button>}</div></Card>
          <Card><h3 className="mb-4 font-semibold text-foreground">Back Side Details</h3><Input label="Blood Type" value={info.bloodType} onChange={(e) => setInfo({ ...info, bloodType: e.target.value })} placeholder="e.g. O+" /><div className="mt-2"><Input label="Emergency Contact" value={info.emergency} onChange={(e) => setInfo({ ...info, emergency: e.target.value })} placeholder="Name: Phone" /></div></Card>
        </div>
      </div>
    </div>
  )
}
