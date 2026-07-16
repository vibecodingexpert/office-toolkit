"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { Copy, Check, Clock, RotateCcw } from "lucide-react"

interface CronParts {
  minute: string
  hour: string
  dayOfMonth: string
  month: string
  dayOfWeek: string
}

const PRESETS: { name: string; expression: string; cron: CronParts }[] = [
  { name: "Every Minute", expression: "* * * * *", cron: { minute: "*", hour: "*", dayOfMonth: "*", month: "*", dayOfWeek: "*" } },
  { name: "Every 5 Minutes", expression: "*/5 * * * *", cron: { minute: "*/5", hour: "*", dayOfMonth: "*", month: "*", dayOfWeek: "*" } },
  { name: "Every Hour", expression: "0 * * * *", cron: { minute: "0", hour: "*", dayOfMonth: "*", month: "*", dayOfWeek: "*" } },
  { name: "Daily at Midnight", expression: "0 0 * * *", cron: { minute: "0", hour: "0", dayOfMonth: "*", month: "*", dayOfWeek: "*" } },
  { name: "Weekly (Mon)", expression: "0 0 * * 1", cron: { minute: "0", hour: "0", dayOfMonth: "*", month: "*", dayOfWeek: "1" } },
  { name: "Monthly", expression: "0 0 1 * *", cron: { minute: "0", hour: "0", dayOfMonth: "1", month: "*", dayOfWeek: "*" } },
  { name: "Weekdays 9am", expression: "0 9 * * 1-5", cron: { minute: "0", hour: "9", dayOfMonth: "*", month: "*", dayOfWeek: "1-5" } },
  { name: "Every 30 Mins", expression: "*/30 * * * *", cron: { minute: "*/30", hour: "*", dayOfMonth: "*", month: "*", dayOfWeek: "*" } },
]

const MINUTE_OPTIONS = ["*", "*/5", "*/10", "*/15", "*/30", "0", "15", "30", "45"]
const HOUR_OPTIONS = ["*", "*/2", "*/6", "*/12", "0", "6", "9", "12", "18"]
const DAY_OPTIONS = ["*", "1", "15", "28", "L"]
const MONTH_OPTIONS = ["*", "1", "3", "6", "9", "12"]
const WEEKDAY_OPTIONS = ["*", "0", "1", "2", "3", "4", "5", "6", "1-5"]

const WEEKDAY_NAMES: Record<string, string> = { "0": "Sunday", "1": "Monday", "2": "Tuesday", "3": "Wednesday", "4": "Thursday", "5": "Friday", "6": "Saturday", "*": "Every" }

function describeCron(cron: CronParts): string {
  const parts: string[] = []
  if (cron.minute === "*" && cron.hour === "*" && cron.dayOfMonth === "*" && cron.month === "*" && cron.dayOfWeek === "*") return "Every minute"
  if (cron.minute.startsWith("*/")) parts.push(`Every ${cron.minute.slice(2)} minutes`)
  else if (cron.minute !== "*") parts.push(`At minute ${cron.minute}`)
  if (cron.hour.startsWith("*/")) parts.push(`every ${cron.hour.slice(2)} hours`)
  else if (cron.hour !== "*") parts.push(`past hour ${cron.hour}`)
  if (cron.dayOfMonth !== "*") parts.push(`on day ${cron.dayOfMonth}`)
  if (cron.month !== "*") parts.push(`in month ${cron.month}`)
  if (cron.dayOfWeek !== "*") parts.push(`on ${cron.dayOfWeek === "1-5" ? "weekdays" : WEEKDAY_NAMES[cron.dayOfWeek] || cron.dayOfWeek}`)
  return parts.length > 0 ? parts.join(", ") : "Unknown schedule"
}

function getNextRuns(expression: string, count: number = 5): Date[] {
  const runs: Date[] = []
  let current = new Date()
  current.setSeconds(0, 0)
  const parts = expression.split(" ")
  if (parts.length !== 5) return []
  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts

  for (let i = 0; i < 10000 && runs.length < count; i++) {
    current = new Date(current.getTime() + 60000)
    const m = current.getMinutes()
    const h = current.getHours()
    const d = current.getDate()
    const mo = current.getMonth() + 1
    const dw = current.getDay()

    const matchMin = minute === "*" || minute.startsWith("*/") ? m % (parseInt(minute.slice(2)) || 1) === 0 : m === parseInt(minute)
    const matchHour = hour === "*" || hour.startsWith("*/") ? h % (parseInt(hour.slice(2)) || 1) === 0 : h === parseInt(hour)
    const matchDay = dayOfMonth === "*" || d === parseInt(dayOfMonth)
    const matchMonth = month === "*" || mo === parseInt(month)
    const matchWeekday = dayOfWeek === "*" || dayOfWeek === "1-5" ? dw >= 1 && dw <= 5 : dw === parseInt(dayOfWeek)

    if (matchMin && matchHour && matchDay && matchMonth && matchWeekday) {
      runs.push(new Date(current))
    }
  }
  return runs.slice(0, count)
}

export function CronGenerator() {
  const [cron, setCron] = React.useState<CronParts>({ minute: "*", hour: "*", dayOfMonth: "*", month: "*", dayOfWeek: "*" })
  const [copied, setCopied] = React.useState(false)

  const expression = `${cron.minute} ${cron.hour} ${cron.dayOfMonth} ${cron.month} ${cron.dayOfWeek}`
  const description = describeCron(cron)
  const nextRuns = getNextRuns(expression, 5)

  const updateCron = (field: keyof CronParts, value: string) => {
    setCron((prev) => ({ ...prev, [field]: value }))
  }

  const applyPreset = React.useCallback((preset: typeof PRESETS[0]) => {
    setCron(preset.cron)
  }, [])

  const handleCopy = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(expression)
      setCopied(true)
      toast.success("Cron expression copied")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Failed to copy")
    }
  }, [expression])

  return (
    <Card className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Clock className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Cron Generator</h2>
          <p className="text-sm text-muted-foreground">
            Generate cron expressions with a visual builder
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground">Minute</label>
          <select
            value={cron.minute}
            onChange={(e) => updateCron("minute", e.target.value)}
            className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {MINUTE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground">Hour</label>
          <select
            value={cron.hour}
            onChange={(e) => updateCron("hour", e.target.value)}
            className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {HOUR_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground">Day (Month)</label>
          <select
            value={cron.dayOfMonth}
            onChange={(e) => updateCron("dayOfMonth", e.target.value)}
            className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {DAY_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground">Month</label>
          <select
            value={cron.month}
            onChange={(e) => updateCron("month", e.target.value)}
            className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {MONTH_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground">Day (Week)</label>
          <select
            value={cron.dayOfWeek}
            onChange={(e) => updateCron("dayOfWeek", e.target.value)}
            className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {WEEKDAY_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Presets</label>
        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => applyPreset(preset)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                expression === preset.expression
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">Cron Expression</label>
          <button
            onClick={handleCopy}
            className="flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-500" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                Copy
              </>
            )}
          </button>
        </div>
        <div className="rounded-xl border border-border bg-zinc-950 dark:bg-zinc-900 p-4">
          <pre className="text-center text-lg font-mono font-bold text-green-400 tracking-wider">
            {expression}
          </pre>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-border bg-muted/30 p-4 text-center"
      >
        <div className="text-xs text-muted-foreground mb-1">Human Readable</div>
        <div className="text-sm font-medium text-foreground capitalize">{description}</div>
      </motion.div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Next 5 Run Times</label>
        <div className="space-y-1.5">
          {nextRuns.map((date, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-lg border border-border bg-muted/20 px-4 py-2"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-[10px] font-bold text-primary">
                {i + 1}
              </span>
              <span className="text-sm font-mono text-foreground">
                {date.toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "short", day: "numeric" })}
              </span>
              <span className="text-sm font-mono text-muted-foreground">
                {date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
