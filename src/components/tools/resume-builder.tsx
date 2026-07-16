"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils/cn"
import { Download, Plus, Trash2, Image, Eye, EyeOff } from "lucide-react"

interface Experience { id: string; company: string; role: string; startDate: string; endDate: string; description: string }
interface Education { id: string; school: string; degree: string; startDate: string; endDate: string }
interface Certificate { id: string; name: string; issuer: string; date: string }

const TEMPLATES = [
  { id: "modern", name: "Modern", color: "bg-gradient-to-r from-blue-500 to-violet-500" },
  { id: "classic", name: "Classic", color: "bg-gray-900 dark:bg-gray-100" },
  { id: "minimal", name: "Minimal", color: "bg-emerald-500" },
]

export function ResumeBuilder() {
  const [personal, setPersonal] = React.useState({ name: "", email: "", phone: "", location: "", photo: "" })
  const [summary, setSummary] = React.useState("")
  const [experience, setExperience] = React.useState<Experience[]>([])
  const [education, setEducation] = React.useState<Education[]>([])
  const [skills, setSkills] = React.useState<string[]>([])
  const [skillInput, setSkillInput] = React.useState("")
  const [languages, setLanguages] = React.useState<string[]>([])
  const [langInput, setLangInput] = React.useState("")
  const [certifications, setCertifications] = React.useState<Certificate[]>([])
  const [template, setTemplate] = React.useState("modern")
  const [showPreview, setShowPreview] = React.useState(false)

  const addSkill = () => { if (skillInput.trim() && !skills.includes(skillInput.trim())) { setSkills([...skills, skillInput.trim()]); setSkillInput("") } }
  const removeSkill = (s: string) => setSkills(skills.filter((sk) => sk !== s))
  const addLang = () => { if (langInput.trim() && !languages.includes(langInput.trim())) { setLanguages([...languages, langInput.trim()]); setLangInput("") } }
  const removeLang = (l: string) => setLanguages(languages.filter((lg) => lg !== l))

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) { const r = new FileReader(); r.onload = (ev) => setPersonal({ ...personal, photo: ev.target?.result as string }); r.readAsDataURL(file) }
  }

  const handleDownload = () => {
    if (!personal.name) { toast.error("Please enter your name"); return }
    const w = window.open("", "_blank")
    if (!w) { toast.error("Please allow pop-ups"); return }
    const tpl = template
    const isDark = tpl === "modern"
    const accentColor = tpl === "modern" ? "#3b82f6" : tpl === "classic" ? "#1e293b" : "#10b981"
    w.document.write(`
      <html><head><title>Resume - ${personal.name}</title>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; color: #1a1a2e; background: ${tpl === "minimal" ? "#fafafa" : "#fff"}; }
        .header { display: flex; align-items: center; gap: 20px; margin-bottom: 20px; padding-bottom: 20px; border-bottom: 3px solid ${accentColor}; }
        .header-text h1 { font-size: 32px; margin: 0; color: ${accentColor}; }
        .section-title { font-size: 16px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: ${accentColor}; margin-top: 25px; margin-bottom: 10px; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; }
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .skill-tag { display: inline-block; background: ${accentColor}15; color: ${accentColor}; padding: 3px 10px; border-radius: 12px; font-size: 13px; margin: 2px; }
        .exp-item, .edu-item { margin-bottom: 12px; }
        .exp-item h3, .edu-item h3 { margin: 0; font-size: 16px; }
        .exp-item .meta, .edu-item .meta { font-size: 13px; color: #64748b; }
        @media print { body { padding: 0; } }
      </style></head><body>
        <div class="header">${personal.photo ? `<img src="${personal.photo}" style="width:80px;height:80px;border-radius:50%;object-fit:cover;border:3px solid ${accentColor}">` : ""}<div class="header-text"><h1>${personal.name}</h1><p>${personal.email} | ${personal.phone} | ${personal.location}</p></div></div>
        ${summary ? `<div class="section-title">Professional Summary</div><p style="font-size:14px;color:#475569">${summary}</p>` : ""}
        ${experience.length > 0 ? `<div class="section-title">Experience</div>${experience.map(e => `<div class="exp-item"><h3>${e.role} at ${e.company}</h3><div class="meta">${e.startDate} - ${e.endDate || "Present"}</div><p style="font-size:14px">${e.description}</p></div>`).join("")}</div>` : ""}
        ${education.length > 0 ? `<div class="section-title">Education</div>${education.map(e => `<div class="edu-item"><h3>${e.degree}</h3><div class="meta">${e.school} | ${e.startDate} - ${e.endDate || "Present"}</div></div>`).join("")}` : ""}
        ${skills.length > 0 ? `<div class="section-title">Skills</div><div>${skills.map(s => `<span class="skill-tag">${s}</span>`).join("")}</div>` : ""}
        ${languages.length > 0 ? `<div class="section-title">Languages</div><div>${languages.map(l => `<span class="skill-tag">${l}</span>`).join("")}</div>` : ""}
        ${certifications.length > 0 ? `<div class="section-title">Certifications</div>${certifications.map(c => `<div class="exp-item"><h3>${c.name}</h3><div class="meta">${c.issuer} | ${c.date}</div></div>`).join("")}` : ""}
      </body></html>
    `)
    w.document.close()
    setTimeout(() => w.print(), 500)
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10"><Download className="h-6 w-6 text-blue-500" /></div>
          <div><h1 className="text-2xl font-bold text-foreground">Resume Builder</h1><p className="text-sm text-muted-foreground">Build professional resumes</p></div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant={showPreview ? "primary" : "outline"} size="sm" onClick={() => setShowPreview(!showPreview)}>{showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}{showPreview ? "Edit" : "Preview"}</Button>
          <Button variant="primary" size="sm" onClick={handleDownload}><Download className="h-4 w-4" /> Download</Button>
        </div>
      </motion.div>

      <div className="flex flex-wrap gap-2">{TEMPLATES.map((t) => (<button key={t.id} onClick={() => setTemplate(t.id)} className={cn("flex items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-colors", template === t.id ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/50")}><div className={cn("h-3 w-3 rounded-full", t.color)} />{t.name}</button>))}</div>

      <AnimatePresence mode="wait">
        {showPreview ? (
          <motion.div key="preview" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className="overflow-hidden p-0">
              <div className={cn("bg-white p-8 dark:bg-gray-950", template === "minimal" && "bg-gray-50 dark:bg-gray-900")}>
                <div className={cn("flex items-start gap-6 border-b pb-6", template === "modern" ? "border-blue-200 dark:border-blue-800" : template === "classic" ? "border-gray-300 dark:border-gray-700" : "border-emerald-200 dark:border-emerald-800")}>
                  {personal.photo && <img src={personal.photo} alt="" className="h-24 w-24 rounded-full border-4 object-cover" style={{ borderColor: template === "modern" ? "#3b82f6" : template === "classic" ? "#1e293b" : "#10b981" }} />}
                  <div><h1 className="text-3xl font-bold" style={{ color: template === "modern" ? "#3b82f6" : template === "classic" ? "#1e293b" : "#10b981" }}>{personal.name || "Your Name"}</h1><p className="text-sm text-muted-foreground">{personal.email}{personal.phone && ` | ${personal.phone}`}{personal.location && ` | ${personal.location}`}</p></div>
                </div>
                {summary && <div className="mt-4"><h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: template === "modern" ? "#3b82f6" : template === "classic" ? "#1e293b" : "#10b981" }}>Summary</h3><p className="mt-1 text-sm text-muted-foreground">{summary}</p></div>}
                {experience.length > 0 && <div className="mt-6"><h3 className="text-sm font-bold uppercase tracking-wider border-b pb-1" style={{ color: template === "modern" ? "#3b82f6" : template === "classic" ? "#1e293b" : "#10b981" }}>Experience</h3>{experience.map(e => <div key={e.id} className="mt-3"><h4 className="font-semibold">{e.role} <span className="font-normal text-muted-foreground">at {e.company}</span></h4><p className="text-xs text-muted-foreground">{e.startDate} - {e.endDate || "Present"}</p><p className="mt-1 text-sm">{e.description}</p></div>)}</div>}
                {education.length > 0 && <div className="mt-6"><h3 className="text-sm font-bold uppercase tracking-wider border-b pb-1" style={{ color: template === "modern" ? "#3b82f6" : template === "classic" ? "#1e293b" : "#10b981" }}>Education</h3>{education.map(e => <div key={e.id} className="mt-3"><h4 className="font-semibold">{e.degree}</h4><p className="text-xs text-muted-foreground">{e.school} | {e.startDate} - {e.endDate || "Present"}</p></div>)}</div>}
                <div className="mt-6 grid grid-cols-2 gap-6">
                  {skills.length > 0 && <div><h3 className="text-sm font-bold uppercase tracking-wider border-b pb-1" style={{ color: template === "modern" ? "#3b82f6" : template === "classic" ? "#1e293b" : "#10b981" }}>Skills</h3><div className="mt-2 flex flex-wrap gap-1.5">{skills.map(s => <span key={s} className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-foreground">{s}</span>)}</div></div>}
                  {languages.length > 0 && <div><h3 className="text-sm font-bold uppercase tracking-wider border-b pb-1" style={{ color: template === "modern" ? "#3b82f6" : template === "classic" ? "#1e293b" : "#10b981" }}>Languages</h3><div className="mt-2 flex flex-wrap gap-1.5">{languages.map(l => <span key={l} className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-foreground">{l}</span>)}</div></div>}
                </div>
                {certifications.length > 0 && <div className="mt-6"><h3 className="text-sm font-bold uppercase tracking-wider border-b pb-1" style={{ color: template === "modern" ? "#3b82f6" : template === "classic" ? "#1e293b" : "#10b981" }}>Certifications</h3>{certifications.map(c => <div key={c.id} className="mt-2"><h4 className="text-sm font-semibold">{c.name}</h4><p className="text-xs text-muted-foreground">{c.issuer} | {c.date}</p></div>)}</div>}
              </div>
            </Card>
          </motion.div>
        ) : (
          <motion.div key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <Card><h3 className="mb-4 font-semibold text-foreground">Personal Information</h3><div className="mb-4 flex items-center gap-4">{personal.photo && <img src={personal.photo} alt="" className="h-20 w-20 rounded-full object-cover" />}<label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border px-4 py-2 text-sm text-muted-foreground hover:border-primary/50"><Image className="h-4 w-4" /> Upload Photo<input type="file" accept="image/*" onChange={handlePhoto} className="hidden" /></label>{personal.photo && <Button variant="ghost" size="sm" onClick={() => setPersonal({ ...personal, photo: "" })}>Remove</Button>}</div><div className="grid gap-4 sm:grid-cols-2"><Input label="Full Name" value={personal.name} onChange={(e) => setPersonal({ ...personal, name: e.target.value })} /><Input label="Email" type="email" value={personal.email} onChange={(e) => setPersonal({ ...personal, email: e.target.value })} /><Input label="Phone" value={personal.phone} onChange={(e) => setPersonal({ ...personal, phone: e.target.value })} /><Input label="Location" value={personal.location} onChange={(e) => setPersonal({ ...personal, location: e.target.value })} /></div></Card>
            <Card><h3 className="mb-4 font-semibold text-foreground">Professional Summary</h3><textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={4} className="w-full resize-y rounded-lg border border-input bg-background p-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2" placeholder="Brief professional summary..." /></Card>
            <Card><div className="mb-4 flex items-center justify-between"><h3 className="font-semibold text-foreground">Work Experience</h3><Button variant="outline" size="sm" onClick={() => setExperience([...experience, { id: crypto.randomUUID(), company: "", role: "", startDate: "", endDate: "", description: "" }])}><Plus className="mr-1 h-4 w-4" />Add</Button></div>{experience.map((exp, idx) => <div key={exp.id} className="mb-4 rounded-lg border border-border p-4"><div className="mb-2 flex items-center justify-between"><span className="text-sm font-medium text-muted-foreground">Experience #{idx + 1}</span><motion.button whileHover={{ scale: 1.1 }} onClick={() => setExperience(experience.filter((e) => e.id !== exp.id))} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></motion.button></div><div className="grid gap-3 sm:grid-cols-2"><Input label="Company" value={exp.company} onChange={(e) => setExperience(experience.map((ex) => ex.id === exp.id ? { ...ex, company: e.target.value } : ex))} /><Input label="Role" value={exp.role} onChange={(e) => setExperience(experience.map((ex) => ex.id === exp.id ? { ...ex, role: e.target.value } : ex))} /><Input label="Start Date" type="date" value={exp.startDate} onChange={(e) => setExperience(experience.map((ex) => ex.id === exp.id ? { ...ex, startDate: e.target.value } : ex))} /><Input label="End Date" type="date" value={exp.endDate} onChange={(e) => setExperience(experience.map((ex) => ex.id === exp.id ? { ...ex, endDate: e.target.value } : ex))} /></div><div className="mt-3 space-y-2"><label className="text-sm font-medium text-foreground">Description</label><textarea value={exp.description} onChange={(e) => setExperience(experience.map((ex) => ex.id === exp.id ? { ...ex, description: e.target.value } : ex))} rows={3} className="w-full resize-y rounded-lg border border-input bg-background p-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary/30" /></div></div>)}</Card>
            <Card><div className="mb-4 flex items-center justify-between"><h3 className="font-semibold text-foreground">Education</h3><Button variant="outline" size="sm" onClick={() => setEducation([...education, { id: crypto.randomUUID(), school: "", degree: "", startDate: "", endDate: "" }])}><Plus className="mr-1 h-4 w-4" />Add</Button></div>{education.map((edu, idx) => <div key={edu.id} className="mb-4 rounded-lg border border-border p-4"><div className="mb-2 flex items-center justify-between"><span className="text-sm font-medium text-muted-foreground">Education #{idx + 1}</span><motion.button whileHover={{ scale: 1.1 }} onClick={() => setEducation(education.filter((e) => e.id !== edu.id))} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></motion.button></div><div className="grid gap-3 sm:grid-cols-2"><Input label="School" value={edu.school} onChange={(e) => setEducation(education.map((ex) => ex.id === edu.id ? { ...ex, school: e.target.value } : ex))} /><Input label="Degree" value={edu.degree} onChange={(e) => setEducation(education.map((ex) => ex.id === edu.id ? { ...ex, degree: e.target.value } : ex))} /><Input label="Start Date" type="date" value={edu.startDate} onChange={(e) => setEducation(education.map((ex) => ex.id === edu.id ? { ...ex, startDate: e.target.value } : ex))} /><Input label="End Date" type="date" value={edu.endDate} onChange={(e) => setEducation(education.map((ex) => ex.id === edu.id ? { ...ex, endDate: e.target.value } : ex))} /></div></div>)}</Card>
            <Card><h3 className="mb-4 font-semibold text-foreground">Skills</h3><div className="flex flex-wrap gap-2 mb-3">{skills.map((s) => <span key={s} className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">{s}<button onClick={() => removeSkill(s)} className="hover:text-destructive">&times;</button></span>)}</div><div className="flex gap-2"><Input value={skillInput} onChange={(e) => setSkillInput(e.target.value)} placeholder="Type a skill and press Add" onKeyDown={(e) => e.key === "Enter" && addSkill()} /><Button variant="outline" size="sm" onClick={addSkill}>Add</Button></div></Card>
            <Card><h3 className="mb-4 font-semibold text-foreground">Languages</h3><div className="flex flex-wrap gap-2 mb-3">{languages.map((l) => <span key={l} className="flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-sm text-foreground">{l}<button onClick={() => removeLang(l)} className="hover:text-destructive">&times;</button></span>)}</div><div className="flex gap-2"><Input value={langInput} onChange={(e) => setLangInput(e.target.value)} placeholder="Type a language" onKeyDown={(e) => e.key === "Enter" && addLang()} /><Button variant="outline" size="sm" onClick={addLang}>Add</Button></div></Card>
            <Card><div className="mb-4 flex items-center justify-between"><h3 className="font-semibold text-foreground">Certifications</h3><Button variant="outline" size="sm" onClick={() => setCertifications([...certifications, { id: crypto.randomUUID(), name: "", issuer: "", date: "" }])}><Plus className="mr-1 h-4 w-4" />Add</Button></div>{certifications.map((cert, idx) => <div key={cert.id} className="mb-4 rounded-lg border border-border p-4"><div className="mb-2 flex items-center justify-between"><span className="text-sm font-medium text-muted-foreground">Certification #{idx + 1}</span><motion.button whileHover={{ scale: 1.1 }} onClick={() => setCertifications(certifications.filter((c) => c.id !== cert.id))} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></motion.button></div><div className="grid gap-3 sm:grid-cols-2"><Input label="Name" value={cert.name} onChange={(e) => setCertifications(certifications.map((c) => c.id === cert.id ? { ...c, name: e.target.value } : c))} /><Input label="Issuer" value={cert.issuer} onChange={(e) => setCertifications(certifications.map((c) => c.id === cert.id ? { ...c, issuer: e.target.value } : c))} /><Input label="Date" type="date" value={cert.date} onChange={(e) => setCertifications(certifications.map((c) => c.id === cert.id ? { ...c, date: e.target.value } : c))} /></div></div>)}</Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
