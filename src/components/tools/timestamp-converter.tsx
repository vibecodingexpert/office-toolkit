"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/toast"
import { Copy, Check, Clock, CalendarDays, RotateCcw } from "lucide-react"

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  })
}

function formatISO(date: Date): string {
  return date.toISOString()
}

function formatUTC(date: Date): string {
  return date.toUTCString()
}

function formatUnix(date: Date): number {
  return Math.floor(date.getTime() / 1000)
}

function formatMilliseconds(date: Date): number {
  return date.getTime()
}

function formatRelative(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const months = Math.floor(days / 30)
  const years = Math.floor(months / 12)

  if (seconds < 60) return "just now"
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`
  if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`
  if (days < 30) return `${days} day${days !== 1 ? "s" : ""} ago`
  if (months < 12) return `${months} month${months !== 1 ? "s" : ""} ago`
  return `${years} year${years !== 1 ? "s" : ""} ago`
}

function timestampToDate(timestamp: string): Date | null {
  const num = Number(timestamp)
  if (isNaN(num)) return null
  if (timestamp.length <= 10) return new Date(num * 1000)
  return new Date(num)
}

function dateToUnix(date: Date): number {
  return Math.floor(date.getTime() / 1000)
}

interface TimeField {
  label: string
  value: string
}

export function TimestampConverter() {
  const [timestampInput, setTimestampInput] = React.useState("")
  const [convertedDate, setConvertedDate] = React.useState<Date | null>(null)
  const [currentTime, setCurrentTime] = React.useState(new Date())
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [copiedField, setCopiedField] = React.useState<string | null>(null)
  const [dateInput, setDateInput] = React.useState("")
  const [timeInput, setTimeInput] = React.useState("12:00")
  const [convertedTimestamp, setConvertedTimestamp] = React.useState<string>("")

  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const handleConvert = React.useCallback(() => {
    if (!timestampInput.trim()) {
      toast.error("Please enter a timestamp")
      return
    }
    setLoading(true)
    setError(null)
    setTimeout(() => {
      const date = timestampToDate(timestampInput.trim())
      if (!date || isNaN(date.getTime())) {
        setError("Invalid timestamp")
        toast.error("Invalid timestamp")
        setLoading(false)
        return
      }
      setConvertedDate(date)
      setLoading(false)
    }, 200)
  }, [timestampInput])

  const handleDateToTimestamp = React.useCallback(() => {
    if (!dateInput) {
      toast.error("Please enter a date")
      return
    }
    const dateStr = `${dateInput}T${timeInput || "12:00"}:00`
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) {
      toast.error("Invalid date")
      return
    }
    setConvertedTimestamp(String(dateToUnix(date)))
    toast.success("Converted to timestamp")
  }, [dateInput, timeInput])

  const handleCopy = React.useCallback(async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      toast.success("Copied to clipboard")
      setTimeout(() => setCopiedField(null), 2000)
    } catch {
      toast.error("Failed to copy")
    }
  }, [])

  const currentFields: TimeField[] = React.useMemo(
    () => [
      { label: "Unix Timestamp (seconds)", value: String(formatUnix(currentTime)) },
      { label: "Milliseconds", value: String(formatMilliseconds(currentTime)) },
      { label: "Date", value: formatDate(currentTime) },
      { label: "Time", value: formatTime(currentTime) },
      { label: "ISO 8601", value: formatISO(currentTime) },
      { label: "UTC", value: formatUTC(currentTime) },
    ],
    [currentTime]
  )

  const convertedFields: TimeField[] = React.useMemo(
    () =>
      convertedDate
        ? [
            { label: "Unix Timestamp (seconds)", value: String(formatUnix(convertedDate)) },
            { label: "Milliseconds", value: String(formatMilliseconds(convertedDate)) },
            { label: "Date", value: formatDate(convertedDate) },
            { label: "Time", value: formatTime(convertedDate) },
            { label: "ISO 8601", value: formatISO(convertedDate) },
            { label: "UTC", value: formatUTC(convertedDate) },
            { label: "Relative", value: formatRelative(convertedDate.getTime()) },
          ]
        : [],
    [convertedDate]
  )

  return (
    <Card className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Clock className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Timestamp Converter</h2>
          <p className="text-sm text-muted-foreground">
            Convert between Unix timestamps and human-readable dates
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-muted/30 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="h-4 w-4 text-primary animate-pulse" />
          <span className="text-sm font-medium text-foreground">Current Time</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {currentFields.map((field) => (
            <div key={field.label} className="group flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <span className="text-xs text-muted-foreground block">{field.label}</span>
                <span className="text-sm text-foreground font-mono truncate block">
                  {field.value}
                </span>
              </div>
              <button
                onClick={() => handleCopy(field.value, field.label)}
                className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                {copiedField === field.label ? (
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">
          Unix Timestamp to Date
        </label>
        <div className="flex flex-wrap gap-3">
          <input
            value={timestampInput}
            onChange={(e) => setTimestampInput(e.target.value)}
            placeholder="Enter Unix timestamp (e.g., 1700000000)..."
            className="flex-1 min-w-[200px] h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <Button onClick={handleConvert} loading={loading} icon={<CalendarDays className="h-4 w-4" />}>
            Convert
          </Button>
        </div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
        >
          {error}
        </motion.div>
      )}

      {convertedDate && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-border bg-muted/30 p-4 space-y-3"
        >
          <span className="text-sm font-medium text-foreground">Converted Date</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {convertedFields.map((field) => (
              <div key={field.label} className="group flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <span className="text-xs text-muted-foreground block">{field.label}</span>
                  <span className="text-sm text-foreground font-mono truncate block">
                    {field.value}
                  </span>
                </div>
                <button
                  onClick={() => handleCopy(field.value, field.label)}
                  className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  {copiedField === field.label ? (
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <div className="border-t border-border pt-6 space-y-3">
        <label className="text-sm font-medium text-foreground">
          Date to Timestamp
        </label>
        <div className="flex flex-wrap gap-3">
          <input
            type="date"
            value={dateInput}
            onChange={(e) => setDateInput(e.target.value)}
            className="flex-1 min-w-[180px] h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <input
            type="time"
            value={timeInput}
            onChange={(e) => setTimeInput(e.target.value)}
            className="h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <Button
            variant="outline"
            onClick={handleDateToTimestamp}
            icon={<Clock className="h-4 w-4" />}
          >
            Convert
          </Button>
        </div>
        {convertedTimestamp && (
          <div className="group flex items-center justify-between rounded-xl border border-border bg-muted/30 p-3">
            <div>
              <span className="text-xs text-muted-foreground block">Unix Timestamp</span>
              <span className="text-sm text-foreground font-mono">{convertedTimestamp}</span>
            </div>
            <button
              onClick={() => handleCopy(convertedTimestamp, "converted-timestamp")}
              className="shrink-0"
            >
              {copiedField === "converted-timestamp" ? (
                <Check className="h-4 w-4 text-emerald-500" />
              ) : (
                <Copy className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              )}
            </button>
          </div>
        )}
      </div>
    </Card>
  )
}
