"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils/cn"
import { Globe, ArrowLeftRight, Clock } from "lucide-react"

const TIMEZONES = [
  { value: "America/New_York", label: "New York (EST)", offset: -5 },
  { value: "America/Chicago", label: "Chicago (CST)", offset: -6 },
  { value: "America/Denver", label: "Denver (MST)", offset: -7 },
  { value: "America/Los_Angeles", label: "Los Angeles (PST)", offset: -8 },
  { value: "America/Anchorage", label: "Anchorage (AKST)", offset: -9 },
  { value: "Pacific/Honolulu", label: "Honolulu (HST)", offset: -10 },
  { value: "Europe/London", label: "London (GMT)", offset: 0 },
  { value: "Europe/Paris", label: "Paris (CET)", offset: 1 },
  { value: "Europe/Berlin", label: "Berlin (CET)", offset: 1 },
  { value: "Europe/Moscow", label: "Moscow (MSK)", offset: 3 },
  { value: "Europe/Istanbul", label: "Istanbul (TRT)", offset: 3 },
  { value: "Asia/Dubai", label: "Dubai (GST)", offset: 4 },
  { value: "Asia/Karachi", label: "Karachi (PKT)", offset: 5 },
  { value: "Asia/Kolkata", label: "India (IST)", offset: 5.5 },
  { value: "Asia/Dhaka", label: "Dhaka (BST)", offset: 6 },
  { value: "Asia/Bangkok", label: "Bangkok (ICT)", offset: 7 },
  { value: "Asia/Singapore", label: "Singapore (SGT)", offset: 8 },
  { value: "Asia/Shanghai", label: "Beijing (CST)", offset: 8 },
  { value: "Asia/Tokyo", label: "Tokyo (JST)", offset: 9 },
  { value: "Asia/Seoul", label: "Seoul (KST)", offset: 9 },
  { value: "Australia/Sydney", label: "Sydney (AEDT)", offset: 11 },
  { value: "Pacific/Auckland", label: "Auckland (NZDT)", offset: 13 },
]

function getTimeInOffset(offset: number): Date {
  const now = new Date()
  const utc = now.getTime() + now.getTimezoneOffset() * 60000
  return new Date(utc + offset * 3600000)
}

export function TimezoneConverter() {
  const [source, setSource] = React.useState("America/New_York")
  const [target, setTarget] = React.useState("Europe/London")
  const [dateInput, setDateInput] = React.useState("")
  const [timeInput, setTimeInput] = React.useState("")

  const srcTz = TIMEZONES.find(t => t.value === source)!
  const tgtTz = TIMEZONES.find(t => t.value === target)!

  const srcNow = getTimeInOffset(srcTz.offset)
  const tgtNow = getTimeInOffset(tgtTz.offset)

  let converted: Date | null = null
  if (dateInput && timeInput) {
    const [h, m] = timeInput.split(":").map(Number)
    const d = new Date(dateInput + "T00:00:00")
    d.setHours(h || 0, m || 0)
    const utc = d.getTime() - srcTz.offset * 3600000
    converted = new Date(utc + tgtTz.offset * 3600000)
  }

  const swap = () => { setSource(target); setTarget(source) }

  const worldClocks = [
    { label: "London", offset: 0, flag: "🇬🇧" },
    { label: "New York", offset: -5, flag: "🇺🇸" },
    { label: "Dubai", offset: 4, flag: "🇦🇪" },
    { label: "Tokyo", offset: 9, flag: "🇯🇵" },
    { label: "Sydney", offset: 11, flag: "🇦🇺" },
  ]

  return (
    <div className="mx-auto max-w-md space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10"><Globe className="h-6 w-6 text-blue-500" /></div>
        <div><h1 className="text-2xl font-bold text-foreground">Timezone Converter</h1><p className="text-sm text-muted-foreground">Convert time across timezones</p></div>
      </motion.div>

      <Card className="space-y-4">
        <div className="grid grid-cols-[1fr,auto,1fr] items-end gap-3">
          <div className="space-y-2"><label className="text-sm font-medium text-foreground">Source</label><select value={source} onChange={(e) => setSource(e.target.value)} className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">{TIMEZONES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}</select></div>
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={swap} className="mt-6 flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground hover:bg-accent"><ArrowLeftRight className="h-4 w-4" /></motion.button>
          <div className="space-y-2"><label className="text-sm font-medium text-foreground">Target</label><select value={target} onChange={(e) => setTarget(e.target.value)} className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">{TIMEZONES.filter(t => t.value !== source).map(t => <option key={t.value} value={t.value}>{t.label}</option>)}</select></div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-border bg-muted/30 p-3 text-center">
            <p className="text-xs text-muted-foreground">{srcTz.label}</p>
            <p className="text-xl font-bold text-foreground tabular-nums">{srcNow.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</p>
            <p className="text-xs text-muted-foreground">{srcNow.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
          </div>
          <div className="rounded-lg border border-border bg-muted/30 p-3 text-center">
            <p className="text-xs text-muted-foreground">{tgtTz.label}</p>
            <p className="text-xl font-bold text-foreground tabular-nums">{tgtNow.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</p>
            <p className="text-xs text-muted-foreground">{tgtNow.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
          </div>
        </div>

        <div className="border-t border-border pt-4">
          <p className="text-sm font-medium text-foreground mb-3">Convert Specific Date/Time</p>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Date" type="date" value={dateInput} onChange={(e) => setDateInput(e.target.value)} />
            <Input label="Time" type="time" value={timeInput} onChange={(e) => setTimeInput(e.target.value)} />
          </div>
          {converted && <div className="mt-3 rounded-lg border border-border bg-muted/30 p-3 text-center">
            <p className="text-xs text-muted-foreground">Converted Time ({tgtTz.label})</p>
            <p className="text-xl font-bold text-foreground tabular-nums">{converted.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</p>
            <p className="text-xs text-muted-foreground">{converted.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
          </div>}
        </div>

        <div className="border-t border-border pt-4">
          <p className="text-sm font-medium text-foreground mb-3 flex items-center gap-1.5"><Clock className="h-4 w-4" />World Clock</p>
          <div className="grid grid-cols-5 gap-2">{worldClocks.map(wc => {
            const t = getTimeInOffset(wc.offset)
            return (<div key={wc.label} className="rounded-lg border border-border p-2 text-center"><p className="text-xs text-muted-foreground">{wc.flag}</p><p className="text-xs font-bold text-foreground tabular-nums">{t.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</p><p className="text-[10px] text-muted-foreground">{wc.label}</p></div>)
          })}</div>
        </div>
      </Card>
    </div>
  )
}
