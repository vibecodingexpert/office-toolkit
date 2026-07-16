"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils/cn"
import { Download, Image, IdCard, Palette } from "lucide-react"

const COLORS = [
  { id: "blue", name: "Blue", primary: "#3b82f6", secondary: "#dbeafe" },
  { id: "purple", name: "Purple", primary: "#8b5cf6", secondary: "#ede9fe" },
  { id: "green", name: "Green", primary: "#10b981", secondary: "#d1fae5" },
  { id: "red", name: "Red", primary: "#ef4444", secondary: "#fee2e2" },
  { id: "amber", name: "Amber", primary: "#f59e0b", secondary: "#fef3c7" },
  { id: "dark", name: "Dark", primary: "#1e293b", secondary: "#e2e8f0" },
]

export function IdCardGenerator() {
  const [company, setCompany] = React.useState({ name: "", address: "" })
  const [employee, setEmployee] = React.useState({ name: "", id: "", department: "" })
  const [photo, setPhoto] = React.useState<string | null>(null)
  const [theme, setTheme] = React.useState("blue")

  const selectedTheme = COLORS.find((c) => c.id === theme) || COLORS[0]

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) { const r = new FileReader(); r.onload = (ev) => setPhoto(ev.target?.result as string); r.readAsDataURL(file) }
  }

  const handleDownload = async () => {
    if (!employee.name) { toast.error("Please enter employee name"); return }
    const el = document.getElementById("id-card-preview")
    if (!el) return
    try {
      const { toPng } = await import("html-to-image")
      const dataUrl = await toPng(el, { quality: 1, pixelRatio: 2 })
      const a = document.createElement("a"); a.href = dataUrl; a.download = `${employee.name.replace(/\s+/g, "-")}-id-card.png`; a.click()
    } catch { toast.error("Failed to download") }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div className="flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/10"><IdCard className="h-6 w-6 text-orange-500" /></div><div><h1 className="text-2xl font-bold text-foreground">ID Card Generator</h1><p className="text-sm text-muted-foreground">Generate ID cards</p></div></div>
        <Button variant="pro" size="sm" onClick={handleDownload}><Download className="h-4 w-4" /> Download</Button>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Card><h3 className="mb-4 font-semibold text-foreground">Company</h3><div className="space-y-4"><Input label="Company Name" value={company.name} onChange={(e) => setCompany({ ...company, name: e.target.value })} /><Input label="Address" value={company.address} onChange={(e) => setCompany({ ...company, address: e.target.value })} /></div></Card>
          <Card><h3 className="mb-4 font-semibold text-foreground">Employee</h3>
            <div className="mb-4 flex items-center gap-4">{photo && <img src={photo} alt="" className="h-16 w-16 rounded-lg object-cover" />}<label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border px-4 py-2 text-sm text-muted-foreground hover:border-primary/50"><Image className="h-4 w-4" /> Photo<input type="file" accept="image/*" onChange={handlePhoto} className="hidden" /></label></div>
            <div className="space-y-4"><Input label="Employee Name" value={employee.name} onChange={(e) => setEmployee({ ...employee, name: e.target.value })} /><Input label="ID Number" value={employee.id} onChange={(e) => setEmployee({ ...employee, id: e.target.value })} /><Input label="Department" value={employee.department} onChange={(e) => setEmployee({ ...employee, department: e.target.value })} /></div>
          </Card>
          <Card><h3 className="mb-4 font-semibold text-foreground">Card Theme</h3><div className="flex flex-wrap gap-2">{COLORS.map((c) => (<button key={c.id} onClick={() => setTheme(c.id)} className={cn("h-10 rounded-lg border-2 px-4 text-sm font-medium transition-all", theme === c.id ? "border-foreground" : "border-transparent")} style={{ backgroundColor: c.secondary, color: c.primary }}>{c.name}</button>))}</div></Card>
        </div>

        <Card padding="none" className="overflow-hidden">
          <div className="border-b border-border bg-muted/30 px-5 py-3"><span className="text-sm font-medium text-foreground">Preview</span></div>
          <div className="flex items-center justify-center bg-gray-100 p-8 dark:bg-gray-900">
            <div id="id-card-preview" className="w-[340px] overflow-hidden rounded-2xl shadow-xl" style={{ fontFamily: "'Segoe UI', Arial, sans-serif" }}>
              <div className="p-6 text-center" style={{ backgroundColor: selectedTheme.secondary }}>
                {photo && <img src={photo} alt="" className="mx-auto mb-3 h-24 w-24 rounded-full border-4 object-cover" style={{ borderColor: selectedTheme.primary }} />}
                <h3 className="text-xl font-bold" style={{ color: selectedTheme.primary }}>{employee.name || "Employee Name"}</h3>
                <p className="text-sm" style={{ color: "#64748b" }}>{employee.department || "Department"}</p>
                <div className="mx-auto mt-4 w-16 h-0.5" style={{ backgroundColor: selectedTheme.primary }} />
              </div>
              <div className="bg-white p-6 text-center dark:bg-gray-950">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{company.name || "Company Name"}</p>
                <p className="mt-1 text-xs text-muted-foreground">{company.address}</p>
                <p className="mt-3 text-xs font-mono" style={{ color: selectedTheme.primary }}>ID: {employee.id || "0000"}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
