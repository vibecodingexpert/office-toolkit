"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils/cn"
import { Download, Image, Palette, Type, Layout } from "lucide-react"

const FONTS = [
  { value: "Inter, sans-serif", label: "Inter" },
  { value: "Georgia, serif", label: "Georgia" },
  { value: "'Courier New', monospace", label: "Courier" },
  { value: "'Segoe UI', sans-serif", label: "Segoe UI" },
  { value: "'Trebuchet MS', sans-serif", label: "Trebuchet" },
]

const LAYOUTS = [
  { id: "horizontal", name: "Horizontal", desc: "Wide format" },
  { id: "vertical", name: "Vertical", desc: "Tall format" },
  { id: "minimal", name: "Minimal", desc: "Clean design" },
]

const COLORS = [
  "#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#ec4899",
  "#06b6d4", "#84cc16", "#f97316", "#6366f1", "#14b8a6", "#78716c",
]

export function BusinessCardMaker() {
  const [info, setInfo] = React.useState({ name: "", title: "", company: "", email: "", phone: "", website: "", address: "" })
  const [logo, setLogo] = React.useState<string | null>(null)
  const [color, setColor] = React.useState("#3b82f6")
  const [font, setFont] = React.useState("Inter, sans-serif")
  const [layout, setLayout] = React.useState("horizontal")

  const handleLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) { const r = new FileReader(); r.onload = (ev) => setLogo(ev.target?.result as string); r.readAsDataURL(file) }
  }

  const handleDownload = () => {
    if (!info.name) { toast.error("Please enter a name"); return }
    const card = document.getElementById("business-card-preview")
    if (!card) return
    import("html-to-image").then(({ toPng }) => {
      toPng(card, { quality: 1, pixelRatio: 2 }).then((dataUrl) => {
        const a = document.createElement("a")
        a.href = dataUrl
        a.download = `${info.name.replace(/\s+/g, "-")}-business-card.png`
        a.click()
      }).catch(() => toast.error("Failed to download"))
    })
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div className="flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-500/10"><Layout className="h-6 w-6 text-yellow-500" /></div><div><h1 className="text-2xl font-bold text-foreground">Business Card Maker</h1><p className="text-sm text-muted-foreground">Design business cards</p></div></div>
        <Button variant="pro" size="sm" onClick={handleDownload}><Download className="h-4 w-4" /> Download PNG</Button>
      </motion.div>

      <Card padding="lg">
        <div className="mb-6 flex items-center gap-4">
          {logo && <img src={logo} alt="" className="h-14 w-14 rounded-lg object-cover" />}
          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border px-4 py-2 text-sm text-muted-foreground hover:border-primary/50"><Image className="h-4 w-4" /> Upload Logo<input type="file" accept="image/*" onChange={handleLogo} className="hidden" /></label>
          {logo && <Button variant="ghost" size="sm" onClick={() => setLogo(null)}>Remove</Button>}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Name" value={info.name} onChange={(e) => setInfo({ ...info, name: e.target.value })} />
          <Input label="Title" value={info.title} onChange={(e) => setInfo({ ...info, title: e.target.value })} />
          <Input label="Company" value={info.company} onChange={(e) => setInfo({ ...info, company: e.target.value })} />
          <Input label="Email" type="email" value={info.email} onChange={(e) => setInfo({ ...info, email: e.target.value })} />
          <Input label="Phone" value={info.phone} onChange={(e) => setInfo({ ...info, phone: e.target.value })} />
          <Input label="Website" value={info.website} onChange={(e) => setInfo({ ...info, website: e.target.value })} />
          <Input label="Address" value={info.address} onChange={(e) => setInfo({ ...info, address: e.target.value })} wrapperClassName="sm:col-span-2" />
        </div>
      </Card>

      <Card padding="lg">
        <h3 className="mb-4 font-semibold text-foreground">Theme & Style</h3>
        <div className="space-y-4">
          <div><label className="text-sm font-medium text-foreground">Color Theme</label><div className="mt-2 flex flex-wrap gap-2">{COLORS.map((c) => (<button key={c} onClick={() => setColor(c)} className={cn("h-8 w-8 rounded-full border-2 transition-all", color === c ? "border-foreground scale-110" : "border-transparent")} style={{ backgroundColor: c }} />))}</div></div>
          <div><label className="text-sm font-medium text-foreground">Font</label><select value={font} onChange={(e) => setFont(e.target.value)} className="mt-1 flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">{FONTS.map((f) => <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>{f.label}</option>)}</select></div>
          <div><label className="text-sm font-medium text-foreground">Layout</label><div className="mt-2 flex flex-wrap gap-2">{LAYOUTS.map((l) => (<button key={l.id} onClick={() => setLayout(l.id)} className={cn("rounded-lg border px-4 py-2 text-sm transition-colors", layout === l.id ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/50")}><div className="font-medium">{l.name}</div><div className="text-xs opacity-70">{l.desc}</div></button>))}</div></div>
        </div>
      </Card>

      <Card padding="none" className="overflow-hidden">
        <div className="border-b border-border bg-muted/30 px-5 py-3"><span className="text-sm font-medium text-foreground">Preview</span></div>
        <div className="flex items-center justify-center p-8 bg-gray-100 dark:bg-gray-900">
          <div id="business-card-preview" className={cn("overflow-hidden rounded-xl shadow-xl transition-all", layout === "horizontal" ? "w-[450px]" : layout === "vertical" ? "w-[300px]" : "w-[400px]")}
            style={{ fontFamily: font, backgroundColor: color === "#fff" ? "#ffffff" : "#ffffff" }}>
            <div className={cn("p-6", layout === "vertical" ? "flex flex-col items-center text-center" : "flex items-start gap-5")}>
              {logo && <img src={logo} alt="" className={cn("object-contain", layout === "vertical" ? "mb-3 h-16 w-16 rounded-full" : "h-20 w-20 rounded-xl")} />}
              <div className={cn("flex-1", layout === "vertical" && "text-center")}>
                {info.name && <h3 className="text-lg font-bold" style={{ color }}>{info.name}</h3>}
                {info.title && <p className="text-sm" style={{ color: "#64748b" }}>{info.title}</p>}
                {info.company && <p className="text-xs font-medium" style={{ color }}>{info.company}</p>}
                <div className={cn("mt-3 space-y-1", layout === "minimal" && "mt-4")}>
                  {info.email && <p className="text-xs" style={{ color: "#94a3b8" }}>{info.email}</p>}
                  {info.phone && <p className="text-xs" style={{ color: "#94a3b8" }}>{info.phone}</p>}
                  {info.website && <p className="text-xs" style={{ color }}>{info.website}</p>}
                  {info.address && <p className="text-xs" style={{ color: "#94a3b8" }}>{info.address}</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
