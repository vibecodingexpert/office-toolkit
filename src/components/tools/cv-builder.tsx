"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils/cn"
import { Download, Plus, Trash2, Image, Eye, EyeOff } from "lucide-react"
import jsPDF from "jspdf"

interface Experience { id: string; company: string; role: string; startDate: string; endDate: string; description: string }
interface Education { id: string; school: string; degree: string; startDate: string; endDate: string }
interface Publication { id: string; title: string; publisher: string; date: string; url: string }
interface Project { id: string; name: string; description: string; tech: string; url: string }
interface Volunteer { id: string; organization: string; role: string; startDate: string; endDate: string; description: string }
interface Reference { id: string; name: string; title: string; email: string; phone: string }
interface Certificate { id: string; name: string; issuer: string; date: string }

const TEMPLATES = [
  { id: "modern", name: "Modern", color: "bg-gradient-to-r from-teal-500 to-cyan-500" },
  { id: "classic", name: "Classic", color: "bg-gray-900 dark:bg-gray-100" },
  { id: "minimal", name: "Minimal", color: "bg-teal-500" },
]

export function CvBuilder() {
  const [personal, setPersonal] = React.useState({ name: "", email: "", phone: "", location: "", photo: "", title: "" })
  const [summary, setSummary] = React.useState("")
  const [experience, setExperience] = React.useState<Experience[]>([])
  const [education, setEducation] = React.useState<Education[]>([])
  const [skills, setSkills] = React.useState<string[]>([])
  const [skillInput, setSkillInput] = React.useState("")
  const [languages, setLanguages] = React.useState<string[]>([])
  const [langInput, setLangInput] = React.useState("")
  const [certifications, setCertifications] = React.useState<Certificate[]>([])
  const [publications, setPublications] = React.useState<Publication[]>([])
  const [projects, setProjects] = React.useState<Project[]>([])
  const [volunteer, setVolunteer] = React.useState<Volunteer[]>([])
  const [references, setReferences] = React.useState<Reference[]>([])
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

  const handleDownload = async () => {
    if (!personal.name) { toast.error("Please enter your name"); return }
    const doc = new jsPDF({ unit: "mm", format: "a4" })
    const m = 20
    let y = m

    doc.setFont("helvetica", "bold")
    doc.setFontSize(22)
    doc.setTextColor(26, 26, 46)
    doc.text(personal.name, m, y + 8)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(9)
    doc.setTextColor(100, 116, 139)
    doc.text([personal.title, personal.email, personal.phone, personal.location].filter(Boolean).join(" | "), m, y + 15)
    y += 25

    const section = (title: string, cb: () => void) => {
      if (y > 270) { doc.addPage(); y = m }
      doc.setDrawColor("#14b8a6")
      doc.setFont("helvetica", "bold")
      doc.setFontSize(10)
      doc.setTextColor("#14b8a6")
      doc.text(title.toUpperCase(), m, y)
      doc.line(m, y + 1, 190, y + 1)
      y += 6
      cb()
    }

    if (summary) { section("Professional Summary", () => { doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(71, 85, 105); const lines = doc.splitTextToSize(summary, 170); doc.text(lines, m, y); y += lines.length * 4 + 4 }) }
    if (experience.length > 0) { section("Experience", () => { for (const e of experience) { if (y > 260) { doc.addPage(); y = m }; doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(26, 26, 46); doc.text(`${e.role} at ${e.company}`, m, y); doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(100, 116, 139); doc.text(`${e.startDate} - ${e.endDate || "Present"}`, 190, y, { align: "right" }); y += 5; if (e.description) { doc.setFontSize(9); doc.setTextColor(71, 85, 105); const dl = doc.splitTextToSize(e.description, 170); doc.text(dl, m, y); y += dl.length * 4 + 2 } } }) }
    if (education.length > 0) { section("Education", () => { for (const e of education) { if (y > 260) { doc.addPage(); y = m }; doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(26, 26, 46); doc.text(e.degree, m, y); doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(100, 116, 139); doc.text(`${e.school} | ${e.startDate} - ${e.endDate || "Present"}`, 190, y, { align: "right" }); y += 6 } }) }
    if (projects.length > 0) { section("Projects", () => { for (const p of projects) { if (y > 260) { doc.addPage(); y = m }; doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(26, 26, 46); doc.text(p.name, m, y); doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(100, 116, 139); if (p.tech) doc.text(p.tech, 190, y, { align: "right" }); y += 5; if (p.description) { doc.setFontSize(9); doc.setTextColor(71, 85, 105); const dl = doc.splitTextToSize(p.description, 170); doc.text(dl, m, y); y += dl.length * 4 + 2 } } }) }
    if (publications.length > 0) { section("Publications", () => { for (const p of publications) { if (y > 260) { doc.addPage(); y = m }; doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(26, 26, 46); doc.text(p.title, m, y); doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(100, 116, 139); doc.text(`${p.publisher} | ${p.date}`, 190, y, { align: "right" }); y += 6 } }) }
    if (volunteer.length > 0) { section("Volunteer Work", () => { for (const v of volunteer) { if (y > 260) { doc.addPage(); y = m }; doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(26, 26, 46); doc.text(`${v.role} at ${v.organization}`, m, y); doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(100, 116, 139); doc.text(`${v.startDate} - ${v.endDate || "Present"}`, 190, y, { align: "right" }); y += 5; if (v.description) { doc.setFontSize(9); doc.setTextColor(71, 85, 105); const dl = doc.splitTextToSize(v.description, 170); doc.text(dl, m, y); y += dl.length * 4 + 2 } } }) }
    if (skills.length > 0) { section("Skills", () => { doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(71, 85, 105); doc.text(skills.join("  \u2022  "), m, y); y += 5 }) }
    if (languages.length > 0) { section("Languages", () => { doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(71, 85, 105); doc.text(languages.join("  \u2022  "), m, y); y += 5 }) }
    if (certifications.length > 0) { section("Certifications", () => { for (const c of certifications) { if (y > 260) { doc.addPage(); y = m }; doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(26, 26, 46); doc.text(c.name, m, y); doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(100, 116, 139); doc.text(`${c.issuer} | ${c.date}`, 190, y, { align: "right" }); y += 5 } }) }
    if (references.length > 0) { section("References", () => { for (const r of references) { if (y > 260) { doc.addPage(); y = m }; doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(26, 26, 46); doc.text(r.name, m, y); doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(100, 116, 139); doc.text(`${r.title} | ${r.email} | ${r.phone}`, 190, y, { align: "right" }); y += 5 } }) }

    doc.save(`cv-${personal.name.replace(/\s+/g, "_")}.pdf`)
    toast.success("CV downloaded as PDF")
  }

  const addToArr = <T,>(arr: T[], empty: T) => [...arr, empty]
  const upd = <T extends { id: string }, K extends keyof T>(arr: T[], id: string, field: K, val: T[K]) => arr.map((x) => x.id === id ? { ...x, [field]: val } : x)

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div className="flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500/10"><Download className="h-6 w-6 text-teal-500" /></div><div><h1 className="text-2xl font-bold text-foreground">CV Builder</h1><p className="text-sm text-muted-foreground">Comprehensive CV with PDF export</p></div></div>
        <div className="flex items-center gap-2"><Button variant={showPreview ? "primary" : "outline"} size="sm" onClick={() => setShowPreview(!showPreview)}>{showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</Button><Button variant="primary" size="sm" onClick={handleDownload}><Download className="h-4 w-4" /> Download PDF</Button></div>
      </motion.div>
      <div className="flex flex-wrap gap-2">{TEMPLATES.map((t) => (<button key={t.id} onClick={() => setTemplate(t.id)} className={cn("flex items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-colors", template === t.id ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/50")}><div className={cn("h-3 w-3 rounded-full", t.color)} />{t.name}</button>))}</div>

      <AnimatePresence mode="wait">
        {showPreview ? (
          <motion.div key="preview" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className="overflow-hidden p-0">
              <div className={cn("bg-white p-8 dark:bg-gray-950", template === "minimal" && "bg-gray-50 dark:bg-gray-900")}>
                <div className={cn("flex items-start gap-6 border-b pb-6", template === "modern" ? "border-teal-200" : template === "classic" ? "border-gray-300" : "border-teal-200 dark:border-teal-800")}>
                  {personal.photo && <img src={personal.photo} alt="" className="h-24 w-24 rounded-full border-4 object-cover" style={{ borderColor: "#14b8a6" }} />}
                  <div><h1 className="text-3xl font-bold text-teal-600 dark:text-teal-400">{personal.name || "Your Name"}</h1><p className="text-sm text-muted-foreground">{personal.title && <span>{personal.title} | </span>}{personal.email}{personal.phone && ` | ${personal.phone}`}{personal.location && ` | ${personal.location}`}</p></div>
                </div>
                {summary && <div className="mt-4"><h3 className="text-sm font-bold uppercase tracking-wider text-teal-600">Summary</h3><p className="mt-1 text-sm text-muted-foreground">{summary}</p></div>}
                {experience.length > 0 && <div className="mt-6"><h3 className="text-sm font-bold uppercase tracking-wider border-b pb-1 text-teal-600">Experience</h3>{experience.map(e => <div key={e.id} className="mt-3"><h4 className="font-semibold">{e.role} <span className="font-normal text-muted-foreground">at {e.company}</span></h4><p className="text-xs text-muted-foreground">{e.startDate} - {e.endDate || "Present"}</p><p className="mt-1 text-sm">{e.description}</p></div>)}</div>}
                {education.length > 0 && <div className="mt-6"><h3 className="text-sm font-bold uppercase tracking-wider border-b pb-1 text-teal-600">Education</h3>{education.map(e => <div key={e.id} className="mt-3"><h4 className="font-semibold">{e.degree}</h4><p className="text-xs text-muted-foreground">{e.school} | {e.startDate} - {e.endDate || "Present"}</p></div>)}</div>}
                {projects.length > 0 && <div className="mt-6"><h3 className="text-sm font-bold uppercase tracking-wider border-b pb-1 text-teal-600">Projects</h3>{projects.map(p => <div key={p.id} className="mt-3"><h4 className="font-semibold">{p.name}</h4><p className="text-xs text-muted-foreground">{p.tech}</p><p className="mt-1 text-sm">{p.description}</p></div>)}</div>}
                {publications.length > 0 && <div className="mt-6"><h3 className="text-sm font-bold uppercase tracking-wider border-b pb-1 text-teal-600">Publications</h3>{publications.map(p => <div key={p.id} className="mt-3"><h4 className="font-semibold">{p.title}</h4><p className="text-xs text-muted-foreground">{p.publisher} | {p.date}</p></div>)}</div>}
                {volunteer.length > 0 && <div className="mt-6"><h3 className="text-sm font-bold uppercase tracking-wider border-b pb-1 text-teal-600">Volunteer Work</h3>{volunteer.map(v => <div key={v.id} className="mt-3"><h4 className="font-semibold">{v.role} <span className="font-normal text-muted-foreground">at {v.organization}</span></h4><p className="text-xs text-muted-foreground">{v.startDate} - {v.endDate || "Present"}</p><p className="mt-1 text-sm">{v.description}</p></div>)}</div>}
                <div className="mt-6 grid grid-cols-2 gap-6">
                  {skills.length > 0 && <div><h3 className="text-sm font-bold uppercase tracking-wider border-b pb-1 text-teal-600">Skills</h3><div className="mt-2 flex flex-wrap gap-1.5">{skills.map(s => <span key={s} className="rounded-full bg-muted px-3 py-1 text-xs font-medium">{s}</span>)}</div></div>}
                  {languages.length > 0 && <div><h3 className="text-sm font-bold uppercase tracking-wider border-b pb-1 text-teal-600">Languages</h3><div className="mt-2 flex flex-wrap gap-1.5">{languages.map(l => <span key={l} className="rounded-full bg-muted px-3 py-1 text-xs font-medium">{l}</span>)}</div></div>}
                </div>
                {certifications.length > 0 && <div className="mt-6"><h3 className="text-sm font-bold uppercase tracking-wider border-b pb-1 text-teal-600">Certifications</h3>{certifications.map(c => <div key={c.id} className="mt-2"><h4 className="text-sm font-semibold">{c.name}</h4><p className="text-xs text-muted-foreground">{c.issuer} | {c.date}</p></div>)}</div>}
                {references.length > 0 && <div className="mt-6"><h3 className="text-sm font-bold uppercase tracking-wider border-b pb-1 text-teal-600">References</h3>{references.map(r => <div key={r.id} className="mt-2"><h4 className="text-sm font-semibold">{r.name}</h4><p className="text-xs text-muted-foreground">{r.title} | {r.email} | {r.phone}</p></div>)}</div>}
              </div>
            </Card>
          </motion.div>
        ) : (
          <motion.div key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <Card><h3 className="mb-4 font-semibold text-foreground">Personal Information</h3>
              <div className="mb-4 flex items-center gap-4">{personal.photo && <img src={personal.photo} alt="" className="h-20 w-20 rounded-full object-cover" />}<label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border px-4 py-2 text-sm text-muted-foreground hover:border-primary/50"><Image className="h-4 w-4" /> Upload Photo<input type="file" accept="image/*" onChange={handlePhoto} className="hidden" /></label>{personal.photo && <Button variant="ghost" size="sm" onClick={() => setPersonal({ ...personal, photo: "" })}>Remove</Button>}</div>
              <div className="grid gap-4 sm:grid-cols-2"><Input label="Full Name" value={personal.name} onChange={(e) => setPersonal({ ...personal, name: e.target.value })} /><Input label="Professional Title" value={personal.title} onChange={(e) => setPersonal({ ...personal, title: e.target.value })} /><Input label="Email" type="email" value={personal.email} onChange={(e) => setPersonal({ ...personal, email: e.target.value })} /><Input label="Phone" value={personal.phone} onChange={(e) => setPersonal({ ...personal, phone: e.target.value })} /><Input label="Location" value={personal.location} onChange={(e) => setPersonal({ ...personal, location: e.target.value })} /></div></Card>
            <Card><h3 className="mb-4 font-semibold text-foreground">Professional Summary</h3><textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={4} className="w-full resize-y rounded-lg border border-input bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2" /></Card>
            <Card><div className="mb-4 flex items-center justify-between"><h3 className="font-semibold text-foreground">Experience</h3><Button variant="outline" size="sm" onClick={() => setExperience(addToArr(experience, { id: crypto.randomUUID(), company: "", role: "", startDate: "", endDate: "", description: "" }))}><Plus className="mr-1 h-4 w-4" />Add</Button></div>{experience.map((exp, i) => <div key={exp.id} className="mb-4 rounded-lg border border-border p-4"><div className="mb-2 flex items-center justify-between"><span className="text-sm font-medium text-muted-foreground">#{i + 1}</span><motion.button whileHover={{ scale: 1.1 }} onClick={() => setExperience(experience.filter((e) => e.id !== exp.id))} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></motion.button></div><div className="grid gap-3 sm:grid-cols-2"><Input label="Company" value={exp.company} onChange={(e) => setExperience(upd(experience, exp.id, "company", e.target.value))} /><Input label="Role" value={exp.role} onChange={(e) => setExperience(upd(experience, exp.id, "role", e.target.value))} /><Input label="Start" type="date" value={exp.startDate} onChange={(e) => setExperience(upd(experience, exp.id, "startDate", e.target.value))} /><Input label="End" type="date" value={exp.endDate} onChange={(e) => setExperience(upd(experience, exp.id, "endDate", e.target.value))} /></div><div className="mt-3"><label className="text-sm font-medium text-foreground">Description</label><textarea value={exp.description} onChange={(e) => setExperience(upd(experience, exp.id, "description", e.target.value))} rows={2} className="mt-1 w-full resize-y rounded-lg border border-input bg-background p-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary/30" /></div></div>)}</Card>
            <Card><div className="mb-4 flex items-center justify-between"><h3 className="font-semibold text-foreground">Education</h3><Button variant="outline" size="sm" onClick={() => setEducation(addToArr(education, { id: crypto.randomUUID(), school: "", degree: "", startDate: "", endDate: "" }))}><Plus className="mr-1 h-4 w-4" />Add</Button></div>{education.map((edu, i) => <div key={edu.id} className="mb-4 rounded-lg border border-border p-4"><div className="mb-2 flex items-center justify-between"><span className="text-sm font-medium text-muted-foreground">#{i + 1}</span><motion.button whileHover={{ scale: 1.1 }} onClick={() => setEducation(education.filter((e) => e.id !== edu.id))} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></motion.button></div><div className="grid gap-3 sm:grid-cols-2"><Input label="School" value={edu.school} onChange={(e) => setEducation(upd(education, edu.id, "school", e.target.value))} /><Input label="Degree" value={edu.degree} onChange={(e) => setEducation(upd(education, edu.id, "degree", e.target.value))} /><Input label="Start" type="date" value={edu.startDate} onChange={(e) => setEducation(upd(education, edu.id, "startDate", e.target.value))} /><Input label="End" type="date" value={edu.endDate} onChange={(e) => setEducation(upd(education, edu.id, "endDate", e.target.value))} /></div></div>)}</Card>
            <Card><div className="mb-4 flex items-center justify-between"><h3 className="font-semibold text-foreground">Projects</h3><Button variant="outline" size="sm" onClick={() => setProjects(addToArr(projects, { id: crypto.randomUUID(), name: "", description: "", tech: "", url: "" }))}><Plus className="mr-1 h-4 w-4" />Add</Button></div>{projects.map((p, i) => <div key={p.id} className="mb-4 rounded-lg border border-border p-4"><div className="mb-2 flex items-center justify-between"><span className="text-sm font-medium text-muted-foreground">#{i + 1}</span><motion.button whileHover={{ scale: 1.1 }} onClick={() => setProjects(projects.filter((x) => x.id !== p.id))} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></motion.button></div><div className="grid gap-3 sm:grid-cols-2"><Input label="Project Name" value={p.name} onChange={(e) => setProjects(upd(projects, p.id, "name", e.target.value))} /><Input label="Technologies" value={p.tech} onChange={(e) => setProjects(upd(projects, p.id, "tech", e.target.value))} /><Input label="URL" value={p.url} onChange={(e) => setProjects(upd(projects, p.id, "url", e.target.value))} /></div><div className="mt-3"><label className="text-sm font-medium text-foreground">Description</label><textarea value={p.description} onChange={(e) => setProjects(upd(projects, p.id, "description", e.target.value))} rows={2} className="mt-1 w-full resize-y rounded-lg border border-input bg-background p-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary/30" /></div></div>)}</Card>
            <Card><div className="mb-4 flex items-center justify-between"><h3 className="font-semibold text-foreground">Publications</h3><Button variant="outline" size="sm" onClick={() => setPublications(addToArr(publications, { id: crypto.randomUUID(), title: "", publisher: "", date: "", url: "" }))}><Plus className="mr-1 h-4 w-4" />Add</Button></div>{publications.map((pub, i) => <div key={pub.id} className="mb-4 rounded-lg border border-border p-4"><div className="mb-2 flex items-center justify-between"><span className="text-sm font-medium text-muted-foreground">#{i + 1}</span><motion.button whileHover={{ scale: 1.1 }} onClick={() => setPublications(publications.filter((x) => x.id !== pub.id))} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></motion.button></div><div className="grid gap-3 sm:grid-cols-2"><Input label="Title" value={pub.title} onChange={(e) => setPublications(upd(publications, pub.id, "title", e.target.value))} /><Input label="Publisher" value={pub.publisher} onChange={(e) => setPublications(upd(publications, pub.id, "publisher", e.target.value))} /><Input label="Date" type="date" value={pub.date} onChange={(e) => setPublications(upd(publications, pub.id, "date", e.target.value))} /><Input label="URL" value={pub.url} onChange={(e) => setPublications(upd(publications, pub.id, "url", e.target.value))} /></div></div>)}</Card>
            <Card><div className="mb-4 flex items-center justify-between"><h3 className="font-semibold text-foreground">Volunteer Work</h3><Button variant="outline" size="sm" onClick={() => setVolunteer(addToArr(volunteer, { id: crypto.randomUUID(), organization: "", role: "", startDate: "", endDate: "", description: "" }))}><Plus className="mr-1 h-4 w-4" />Add</Button></div>{volunteer.map((v, i) => <div key={v.id} className="mb-4 rounded-lg border border-border p-4"><div className="mb-2 flex items-center justify-between"><span className="text-sm font-medium text-muted-foreground">#{i + 1}</span><motion.button whileHover={{ scale: 1.1 }} onClick={() => setVolunteer(volunteer.filter((x) => x.id !== v.id))} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></motion.button></div><div className="grid gap-3 sm:grid-cols-2"><Input label="Organization" value={v.organization} onChange={(e) => setVolunteer(upd(volunteer, v.id, "organization", e.target.value))} /><Input label="Role" value={v.role} onChange={(e) => setVolunteer(upd(volunteer, v.id, "role", e.target.value))} /><Input label="Start" type="date" value={v.startDate} onChange={(e) => setVolunteer(upd(volunteer, v.id, "startDate", e.target.value))} /><Input label="End" type="date" value={v.endDate} onChange={(e) => setVolunteer(upd(volunteer, v.id, "endDate", e.target.value))} /></div><div className="mt-3"><label className="text-sm font-medium text-foreground">Description</label><textarea value={v.description} onChange={(e) => setVolunteer(upd(volunteer, v.id, "description", e.target.value))} rows={2} className="mt-1 w-full resize-y rounded-lg border border-input bg-background p-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary/30" /></div></div>)}</Card>
            <Card><h3 className="mb-4 font-semibold text-foreground">Skills</h3><div className="flex flex-wrap gap-2 mb-3">{skills.map((s) => <span key={s} className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">{s}<button onClick={() => removeSkill(s)} className="hover:text-destructive">&times;</button></span>)}</div><div className="flex gap-2"><Input value={skillInput} onChange={(e) => setSkillInput(e.target.value)} placeholder="Type a skill" onKeyDown={(e) => e.key === "Enter" && addSkill()} /><Button variant="outline" size="sm" onClick={addSkill}>Add</Button></div></Card>
            <Card><h3 className="mb-4 font-semibold text-foreground">Languages</h3><div className="flex flex-wrap gap-2 mb-3">{languages.map((l) => <span key={l} className="flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-sm">{l}<button onClick={() => removeLang(l)} className="hover:text-destructive">&times;</button></span>)}</div><div className="flex gap-2"><Input value={langInput} onChange={(e) => setLangInput(e.target.value)} placeholder="Type a language" onKeyDown={(e) => e.key === "Enter" && addLang()} /><Button variant="outline" size="sm" onClick={addLang}>Add</Button></div></Card>
            <Card><div className="mb-4 flex items-center justify-between"><h3 className="font-semibold text-foreground">Certifications</h3><Button variant="outline" size="sm" onClick={() => setCertifications(addToArr(certifications, { id: crypto.randomUUID(), name: "", issuer: "", date: "" }))}><Plus className="mr-1 h-4 w-4" />Add</Button></div>{certifications.map((c, i) => <div key={c.id} className="mb-4 rounded-lg border border-border p-4"><div className="mb-2 flex items-center justify-between"><span className="text-sm font-medium text-muted-foreground">#{i + 1}</span><motion.button whileHover={{ scale: 1.1 }} onClick={() => setCertifications(certifications.filter((x) => x.id !== c.id))} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></motion.button></div><div className="grid gap-3 sm:grid-cols-2"><Input label="Name" value={c.name} onChange={(e) => setCertifications(upd(certifications, c.id, "name", e.target.value))} /><Input label="Issuer" value={c.issuer} onChange={(e) => setCertifications(upd(certifications, c.id, "issuer", e.target.value))} /><Input label="Date" type="date" value={c.date} onChange={(e) => setCertifications(upd(certifications, c.id, "date", e.target.value))} /></div></div>)}</Card>
            <Card><div className="mb-4 flex items-center justify-between"><h3 className="font-semibold text-foreground">References</h3><Button variant="outline" size="sm" onClick={() => setReferences(addToArr(references, { id: crypto.randomUUID(), name: "", title: "", email: "", phone: "" }))}><Plus className="mr-1 h-4 w-4" />Add</Button></div>{references.map((r, i) => <div key={r.id} className="mb-4 rounded-lg border border-border p-4"><div className="mb-2 flex items-center justify-between"><span className="text-sm font-medium text-muted-foreground">#{i + 1}</span><motion.button whileHover={{ scale: 1.1 }} onClick={() => setReferences(references.filter((x) => x.id !== r.id))} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></motion.button></div><div className="grid gap-3 sm:grid-cols-2"><Input label="Name" value={r.name} onChange={(e) => setReferences(upd(references, r.id, "name", e.target.value))} /><Input label="Title" value={r.title} onChange={(e) => setReferences(upd(references, r.id, "title", e.target.value))} /><Input label="Email" type="email" value={r.email} onChange={(e) => setReferences(upd(references, r.id, "email", e.target.value))} /><Input label="Phone" value={r.phone} onChange={(e) => setReferences(upd(references, r.id, "phone", e.target.value))} /></div></div>)}</Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
