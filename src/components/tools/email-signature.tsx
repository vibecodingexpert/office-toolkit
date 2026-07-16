"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/toast"
import { Copy, Image, Trash2, Download } from "lucide-react"

const TEMPLATES = [
  {
    id: "professional",
    name: "Professional",
    style: { headerBorder: "#14b8a6", text: "#1e293b", muted: "#64748b", accent: "#14b8a6", divider: "#e2e8f0", bg: "#ffffff", layout: "horizontal" },
  },
  {
    id: "modern",
    name: "Modern",
    style: { headerBorder: "#8b5cf6", text: "#1e293b", muted: "#64748b", accent: "#8b5cf6", divider: "#e2e8f0", bg: "#f8fafc", layout: "horizontal" },
  },
  {
    id: "compact",
    name: "Compact",
    style: { headerBorder: "#14b8a6", text: "#334155", muted: "#94a3b8", accent: "#14b8a6", divider: "#cbd5e1", bg: "#ffffff", layout: "vertical" },
  },
  {
    id: "dark",
    name: "Dark",
    style: { headerBorder: "#14b8a6", text: "#f1f5f9", muted: "#94a3b8", accent: "#14b8a6", divider: "#334155", bg: "#0f172a", layout: "horizontal" },
  },
]

export function EmailSignature() {
  const [info, setInfo] = React.useState({ name: "", title: "", company: "", email: "", phone: "", mobile: "", website: "", address: "", socialLinkedin: "", socialTwitter: "" })
  const [photo, setPhoto] = React.useState("")
  const [template, setTemplate] = React.useState(TEMPLATES[0])
  const [banner, setBanner] = React.useState("")
  const [showSocial, setShowSocial] = React.useState(true)

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) { const r = new FileReader(); r.onload = (ev) => setPhoto(ev.target?.result as string); r.readAsDataURL(file) }
  }

  const handleBanner = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) { const r = new FileReader(); r.onload = (ev) => setBanner(ev.target?.result as string); r.readAsDataURL(file) }
  }

  const generateHTML = () => {
    const s = template.style
    const isHorizontal = s.layout === "horizontal"
    const socialLinks = [info.socialLinkedin ? `<a href="${info.socialLinkedin}" style="text-decoration:none;margin:0 3px;"><img src="https://cdn-icons-png.flaticon.com/16/174/174857.png" alt="LinkedIn" width="16" height="16" style="vertical-align:middle" /></a>` : "", info.socialTwitter ? `<a href="${info.socialTwitter}" style="text-decoration:none;margin:0 3px;"><img src="https://cdn-icons-png.flaticon.com/16/733/733579.png" alt="Twitter" width="16" height="16" style="vertical-align:middle" /></a>` : ""].filter(Boolean).join("")

    return `
<table cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:${s.text};background:${s.bg};border-radius:8px;max-width:500px">
  ${banner ? `<tr><td colspan="2" style="padding:0"><img src="${banner}" alt="" style="width:100%;height:auto;border-radius:8px 8px 0 0;display:block" /></td></tr>` : ""}
  <tr><td style="border-left:3px solid ${s.headerBorder};padding:12px 16px" ${isHorizontal ? 'colspan="2"' : ""}>
    <table cellpadding="0" cellspacing="0" border="0">
      <tr>
        ${photo ? `<td style="padding-right:12px;vertical-align:middle"><img src="${photo}" alt="" width="60" height="60" style="border-radius:50%;object-fit:cover;border:2px solid ${s.accent}" /></td>` : ""}
        <td style="vertical-align:middle">
          <div style="font-size:15px;font-weight:bold;color:${s.text}">${info.name || "Your Name"}</div>
          <div style="font-size:12px;color:${s.accent}">${info.title || "Job Title"}</div>
          <div style="font-size:12px;color:${s.muted}">${info.company || "Company"}</div>
        </td>
      </tr>
    </table>
  </td></tr>
  <tr><td style="padding:4px 16px 12px;font-size:12px;color:${s.muted}" ${isHorizontal ? 'colspan="2"' : ""}>
    ${info.email ? `<div style="padding:2px 0"><span style="color:${s.muted}">\u2709 </span><a href="mailto:${info.email}" style="color:${s.muted};text-decoration:none">${info.email}</a></div>` : ""}
    ${info.phone ? `<div style="padding:2px 0"><span style="color:${s.muted}">\u260E </span>${info.phone}</div>` : ""}
    ${info.mobile ? `<div style="padding:2px 0"><span style="color:${s.muted}">\u260E </span>${info.mobile}</div>` : ""}
    ${info.website ? `<div style="padding:2px 0"><span style="color:${s.muted}">\u2192 </span><a href="${info.website}" style="color:${s.muted};text-decoration:none">${info.website}</a></div>` : ""}
    ${info.address ? `<div style="padding:2px 0"><span style="color:${s.muted}">\u2302 </span>${info.address}</div>` : ""}
    ${showSocial && socialLinks ? `<div style="padding:4px 0">${socialLinks}</div>` : ""}
  </td></tr>
  ${isHorizontal ? "" : `<tr><td style="padding:0 16px 12px;font-size:12px;color:${s.muted}" colspan="2">${info.email ? `<div><a href="mailto:${info.email}" style="color:${s.muted};text-decoration:none">${info.email}</a></div>` : ""}${info.phone ? `<div>${info.phone}</div>` : ""}${info.website ? `<div><a href="${info.website}" style="color:${s.muted};text-decoration:none">${info.website}</a></div>` : ""}</td></tr>`}
  <tr><td style="border-top:1px solid ${s.divider};padding:6px 16px;font-size:10px;color:${s.muted}" colspan="2"><em>${info.company ? `Confidentiality Notice: This email and any attachments are confidential and intended solely for the use of the individual or entity to whom they are addressed.` : ""}</em></td></tr>
</table>`.trim()
  }

  const copyHTML = () => {
    navigator.clipboard.writeText(generateHTML())
    toast.success("Signature HTML copied to clipboard")
  }

  const copyText = () => {
    const text = `${info.name || "Your Name"}\n${info.title || "Job Title"}\n${info.company || "Company"}\n${info.email ? `Email: ${info.email}` : ""}\n${info.phone ? `Phone: ${info.phone}` : ""}`
    navigator.clipboard.writeText(text)
    toast.success("Plain text copied")
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div className="flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500/10"><Copy className="h-6 w-6 text-teal-500" /></div><div><h1 className="text-2xl font-bold text-foreground">Email Signature Generator</h1><p className="text-sm text-muted-foreground">Create HTML email signatures with one-click copy</p></div></div>
        <div className="flex items-center gap-2">
          <Button variant="primary" size="sm" onClick={copyHTML}><Copy className="h-4 w-4" /> Copy HTML</Button>
          <Button variant="outline" size="sm" onClick={copyText}>Copy Text</Button>
          <Button variant="outline" size="sm" onClick={() => { const b = new Blob([generateHTML()], { type: "text/html" }); const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = "email-signature.html"; a.click(); toast.success("Signature downloaded") }}><Download className="h-4 w-4" /></Button>
        </div>
      </motion.div>

      <div className="flex flex-wrap gap-2">{TEMPLATES.map((t) => (<button key={t.id} onClick={() => setTemplate(t)} className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-colors ${template.id === t.id ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/50"}`}><div className="h-4 w-4 rounded" style={{ backgroundColor: t.style.accent }} />{t.name}</button>))}</div>

      <Card>
        <h3 className="mb-2 font-semibold text-foreground">Preview</h3>
        <div className="overflow-auto rounded-lg border border-border p-2" style={{ background: template.style.bg }} dangerouslySetInnerHTML={{ __html: generateHTML() }} />
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card><h3 className="mb-4 font-semibold text-foreground">Personal Info</h3><div className="grid gap-3"><Input label="Full Name" value={info.name} onChange={(e) => setInfo({ ...info, name: e.target.value })} /><Input label="Job Title" value={info.title} onChange={(e) => setInfo({ ...info, title: e.target.value })} /><Input label="Company" value={info.company} onChange={(e) => setInfo({ ...info, company: e.target.value })} /><Input label="Email" type="email" value={info.email} onChange={(e) => setInfo({ ...info, email: e.target.value })} /><Input label="Phone" value={info.phone} onChange={(e) => setInfo({ ...info, phone: e.target.value })} /><Input label="Mobile" value={info.mobile} onChange={(e) => setInfo({ ...info, mobile: e.target.value })} /><Input label="Website" value={info.website} onChange={(e) => setInfo({ ...info, website: e.target.value })} /><Input label="Address" value={info.address} onChange={(e) => setInfo({ ...info, address: e.target.value })} /></div></Card>
        <div className="space-y-4">
          <Card><h3 className="mb-4 font-semibold text-foreground">Photo & Branding</h3><div className="flex items-center gap-4">{photo && <img src={photo} alt="" className="h-16 w-16 rounded-full object-cover" />}<label className="cursor-pointer rounded-lg border border-dashed border-border px-4 py-2 text-sm text-muted-foreground hover:border-primary/50"><Image className="mr-1 inline h-4 w-4" />Upload Photo<input type="file" accept="image/*" onChange={handlePhoto} className="hidden" /></label>{photo && <Button variant="ghost" size="sm" onClick={() => setPhoto("")}><Trash2 className="h-4 w-4" /></Button>}</div><div className="mt-3"><label className="text-sm font-medium text-foreground">Banner Image</label><input type="file" accept="image/*" onChange={handleBanner} className="mt-1 block text-sm" />{banner && <Button variant="ghost" size="sm" onClick={() => setBanner("")}><Trash2 className="h-4 w-4" /> Remove</Button>}</div></Card>
          <Card><h3 className="mb-4 font-semibold text-foreground">Social Links</h3><label className="flex items-center gap-2 mb-2"><input type="checkbox" checked={showSocial} onChange={(e) => setShowSocial(e.target.checked)} className="rounded" /><span className="text-sm text-foreground">Show social icons</span></label><Input label="LinkedIn URL" value={info.socialLinkedin} onChange={(e) => setInfo({ ...info, socialLinkedin: e.target.value })} placeholder="https://linkedin.com/in/..." /><div className="mt-2"><Input label="Twitter URL" value={info.socialTwitter} onChange={(e) => setInfo({ ...info, socialTwitter: e.target.value })} placeholder="https://twitter.com/..." /></div></Card>
        </div>
      </div>
    </div>
  )
}
