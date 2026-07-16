"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils/cn"
import { Copy, Check, Image, Link, Mail, Phone, Globe, Camera } from "lucide-react"

const COLORS = [
  "#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#06b6d4",
]

const LAYOUTS = [
  { id: "simple", name: "Simple" },
  { id: "banner", name: "Banner" },
  { id: "modern", name: "Modern" },
]

export function EmailSignature() {
  const [info, setInfo] = React.useState({ name: "", title: "", company: "", email: "", phone: "" })
  const [photo, setPhoto] = React.useState<string | null>(null)
  const [social, setSocial] = React.useState({ linkedin: "", twitter: "", github: "" })
  const [color, setColor] = React.useState("#3b82f6")
  const [layout, setLayout] = React.useState("simple")
  const [copied, setCopied] = React.useState(false)

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) { const r = new FileReader(); r.onload = (ev) => setPhoto(ev.target?.result as string); r.readAsDataURL(file) }
  }

  const generateHtml = () => {
    const isDark = false
    return `
<table cellpadding="0" cellspacing="0" border="0" style="font-family:'Segoe UI',Arial,sans-serif;font-size:14px;color:${isDark ? "#e2e8f0" : "#334155"}">
  <tr>
    ${layout === "modern" && photo ? `<td style="padding-right:15px;vertical-align:middle"><img src="${photo}" style="width:60px;height:60px;border-radius:50%;object-fit:cover"></td>` : ""}
    <td style="vertical-align:middle">
      <div style="font-size:16px;font-weight:600;color:${color}">${info.name || "Your Name"}</div>
      <div style="font-size:13px;color:${isDark ? "#94a3b8" : "#64748b"}">${info.title || ""}${info.company ? " at " + info.company : ""}</div>
      ${layout === "banner" ? `<div style="height:2px;width:40px;background:${color};margin:8px 0"></div>` : ""}
      <table cellpadding="0" cellspacing="0" border="0" style="margin-top:${layout === "simple" ? "4" : "8"}px">
        <tr>
          ${info.email ? `<td style="padding-right:12px"><a href="mailto:${info.email}" style="color:${color};text-decoration:none;font-size:13px">${info.email}</a></td>` : ""}
          ${info.phone ? `<td><span style="color:${isDark ? "#94a3b8" : "#64748b"};font-size:13px">${info.phone}</span></td>` : ""}
        </tr>
      </table>
      ${social.linkedin || social.twitter || social.github ? `
      <div style="margin-top:8px">
        ${social.linkedin ? `<a href="${social.linkedin}" style="display:inline-block;margin-right:8px;text-decoration:none"><span style="color:${color};font-size:12px">LinkedIn</span></a>` : ""}
        ${social.twitter ? `<a href="${social.twitter}" style="display:inline-block;margin-right:8px;text-decoration:none"><span style="color:${color};font-size:12px">Twitter</span></a>` : ""}
        ${social.github ? `<a href="${social.github}" style="display:inline-block;text-decoration:none"><span style="color:${color};font-size:12px">GitHub</span></a>` : ""}
      </div>` : ""}
    </td>
    ${layout !== "modern" && photo ? `<td style="padding-left:15px;vertical-align:middle"><img src="${photo}" style="width:${layout === "banner" ? "70" : "50"}px;height:${layout === "banner" ? "70" : "50"}px;border-radius:${layout === "banner" ? "8" : "50"}%;object-fit:cover"></td>` : ""}
  </tr>
</table>`
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generateHtml())
      setCopied(true)
      toast.success("HTML signature copied!")
      setTimeout(() => setCopied(false), 2000)
    } catch { toast.error("Failed to copy") }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div className="flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/10"><Mail className="h-6 w-6 text-sky-500" /></div><div><h1 className="text-2xl font-bold text-foreground">Email Signature Generator</h1><p className="text-sm text-muted-foreground">Create email signatures</p></div></div>
        <Button variant="pro" size="sm" onClick={handleCopy}>{copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}{copied ? "Copied!" : "Copy HTML"}</Button>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Card><h3 className="mb-4 font-semibold text-foreground">Your Info</h3>
            <div className="mb-4 flex items-center gap-4">{photo && <img src={photo} alt="" className="h-16 w-16 rounded-full object-cover" />}<label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border px-4 py-2 text-sm text-muted-foreground hover:border-primary/50"><Camera className="h-4 w-4" /> Upload Photo<input type="file" accept="image/*" onChange={handlePhoto} className="hidden" /></label>{photo && <Button variant="ghost" size="sm" onClick={() => setPhoto(null)}>Remove</Button>}</div>
            <div className="grid gap-4"><Input label="Name" value={info.name} onChange={(e) => setInfo({ ...info, name: e.target.value })} /><Input label="Title" value={info.title} onChange={(e) => setInfo({ ...info, title: e.target.value })} /><Input label="Company" value={info.company} onChange={(e) => setInfo({ ...info, company: e.target.value })} /><Input label="Email" type="email" value={info.email} onChange={(e) => setInfo({ ...info, email: e.target.value })} icon={<Mail className="h-4 w-4" />} /><Input label="Phone" value={info.phone} onChange={(e) => setInfo({ ...info, phone: e.target.value })} icon={<Phone className="h-4 w-4" />} /></div>
          </Card>
          <Card><h3 className="mb-4 font-semibold text-foreground">Social Links</h3><div className="space-y-4"><Input label="LinkedIn URL" value={social.linkedin} onChange={(e) => setSocial({ ...social, linkedin: e.target.value })} icon={<Link className="h-4 w-4" />} /><Input label="Twitter URL" value={social.twitter} onChange={(e) => setSocial({ ...social, twitter: e.target.value })} icon={<Link className="h-4 w-4" />} /><Input label="GitHub URL" value={social.github} onChange={(e) => setSocial({ ...social, github: e.target.value })} icon={<Link className="h-4 w-4" />} /></div></Card>
        </div>

        <div className="space-y-6">
          <Card><h3 className="mb-4 font-semibold text-foreground">Style</h3>
            <div className="space-y-4">
              <div><label className="text-sm font-medium text-foreground">Color Theme</label><div className="mt-2 flex flex-wrap gap-2">{COLORS.map((c) => (<button key={c} onClick={() => setColor(c)} className={cn("h-8 w-8 rounded-full border-2 transition-all", color === c ? "border-foreground scale-110" : "border-transparent")} style={{ backgroundColor: c }} />))}</div></div>
              <div><label className="text-sm font-medium text-foreground">Layout</label><div className="mt-2 flex gap-2">{LAYOUTS.map((l) => (<button key={l.id} onClick={() => setLayout(l.id)} className={cn("rounded-lg border px-4 py-2 text-sm transition-colors", layout === l.id ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/50")}>{l.name}</button>))}</div></div>
            </div>
          </Card>

          <Card padding="none" className="overflow-hidden">
            <div className="border-b border-border bg-muted/30 px-5 py-3"><span className="text-sm font-medium text-foreground">Preview</span></div>
            <div className="bg-white p-6 dark:bg-gray-950" dangerouslySetInnerHTML={{ __html: generateHtml() }} />
          </Card>
        </div>
      </div>
    </div>
  )
}
