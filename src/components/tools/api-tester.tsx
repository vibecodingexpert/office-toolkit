"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/toast"
import { Globe, Send, Plus, Trash2, RotateCcw, Clock, Copy, Check } from "lucide-react"

interface Header {
  key: string
  value: string
}

interface RequestEntry {
  id: string
  method: string
  url: string
  status: number
  time: string
  duration: number
}

const METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH"] as const

const METHOD_COLORS: Record<string, string> = {
  GET: "text-emerald-600 dark:text-emerald-400",
  POST: "text-blue-600 dark:text-blue-400",
  PUT: "text-amber-600 dark:text-amber-400",
  DELETE: "text-red-600 dark:text-red-400",
  PATCH: "text-violet-600 dark:text-violet-400",
}

const METHOD_BG: Record<string, string> = {
  GET: "bg-emerald-500/10",
  POST: "bg-blue-500/10",
  PUT: "bg-amber-500/10",
  DELETE: "bg-red-500/10",
  PATCH: "bg-violet-500/10",
}

async function makeRequest(method: string, url: string, headers: Header[], body: string): Promise<{ status: number; statusText: string; headers: Record<string, string>; data: string; duration: number }> {
  const start = performance.now()
  const h: Record<string, string> = {}
  for (const header of headers) {
    if (header.key.trim()) h[header.key.trim()] = header.value.trim()
  }
  const options: RequestInit = { method, headers: h }
  if (body.trim() && ["POST", "PUT", "PATCH"].includes(method)) {
    options.body = body
  }
  const res = await fetch(url, options)
  const duration = Math.round(performance.now() - start)
  const resHeaders: Record<string, string> = {}
  res.headers.forEach((v, k) => { resHeaders[k] = v })
  const data = await res.text()
  return { status: res.status, statusText: res.statusText, headers: resHeaders, data, duration }
}

export function ApiTester() {
  const [method, setMethod] = React.useState<string>("GET")
  const [url, setUrl] = React.useState("")
  const [headers, setHeaders] = React.useState<Header[]>([{ key: "Content-Type", value: "application/json" }])
  const [body, setBody] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [response, setResponse] = React.useState<{ status: number; statusText: string; headers: Record<string, string>; data: string; duration: number } | null>(null)
  const [history, setHistory] = React.useState<RequestEntry[]>([])
  const [activeTab, setActiveTab] = React.useState<"body" | "response">("body")
  const [copied, setCopied] = React.useState(false)

  const addHeader = React.useCallback(() => {
    setHeaders((prev) => [...prev, { key: "", value: "" }])
  }, [])

  const removeHeader = React.useCallback((index: number) => {
    setHeaders((prev) => {
      if (prev.length <= 1) return prev
      return prev.filter((_, i) => i !== index)
    })
  }, [])

  const updateHeader = React.useCallback((index: number, field: "key" | "value", value: string) => {
    setHeaders((prev) => prev.map((h, i) => (i === index ? { ...h, [field]: value } : h)))
  }, [])

  const handleSend = React.useCallback(async () => {
    if (!url.trim()) {
      toast.error("Please enter a URL")
      return
    }
    setLoading(true)
    setActiveTab("response")
    try {
      const res = await makeRequest(method, url, headers, body)
      setResponse(res)
      const entry: RequestEntry = {
        id: Date.now().toString(),
        method,
        url,
        status: res.status,
        time: new Date().toLocaleTimeString(),
        duration: res.duration,
      }
      setHistory((prev) => [entry, ...prev].slice(0, 20))
    } catch (e) {
      setResponse({ status: 0, statusText: "Network Error", headers: {}, data: String(e), duration: 0 })
    }
    setLoading(false)
  }, [method, url, headers, body])

  const handleCopy = React.useCallback(async () => {
    if (!response) return
    const text = `Status: ${response.status} ${response.statusText}\n\nHeaders:\n${Object.entries(response.headers).map(([k, v]) => `${k}: ${v}`).join("\n")}\n\nBody:\n${response.data}`
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast.success("Response copied")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Failed to copy")
    }
  }, [response])

  const handleClear = React.useCallback(() => {
    setUrl("")
    setHeaders([{ key: "Content-Type", value: "application/json" }])
    setBody("")
    setResponse(null)
  }, [])

  const loadFromHistory = React.useCallback((entry: RequestEntry) => {
    setMethod(entry.method)
    setUrl(entry.url)
  }, [])

  const showBody = ["POST", "PUT", "PATCH"].includes(method)

  return (
    <Card className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Globe className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">API Tester</h2>
          <p className="text-sm text-muted-foreground">
            Test REST API endpoints with custom headers and body
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">HTTP Method</label>
        <div className="flex flex-wrap gap-2">
          {METHODS.map((m) => (
            <button
              key={m}
              onClick={() => setMethod(m)}
              className={`rounded-lg px-4 py-2 text-sm font-mono font-bold transition-colors ${
                method === m
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <Input
        label="Request URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://api.example.com/endpoint"
        icon={<Globe className="h-4 w-4" />}
      />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">Headers</label>
          <button
            onClick={addHeader}
            className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Header
          </button>
        </div>
        <div className="space-y-2">
          {headers.map((header, index) => (
            <div key={index} className="flex gap-2 items-start">
              <input
                value={header.key}
                onChange={(e) => updateHeader(index, "key", e.target.value)}
                placeholder="Header name"
                className="flex-1 h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <input
                value={header.value}
                onChange={(e) => updateHeader(index, "value", e.target.value)}
                placeholder="Value"
                className="flex-1 h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                onClick={() => removeHeader(index)}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                disabled={headers.length <= 1}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {showBody && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("body")}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                activeTab === "body" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Body
            </button>
            {response && (
              <button
                onClick={() => setActiveTab("response")}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  activeTab === "response" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Response
              </button>
            )}
          </div>
          {activeTab === "body" && (
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder='{"key": "value"}'
              rows={5}
              className="w-full resize-y rounded-xl border border-border bg-background p-4 text-sm text-foreground placeholder-muted-foreground shadow-sm font-mono transition-all focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
            />
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <Button onClick={handleSend} loading={loading} icon={<Send className="h-4 w-4" />}>
          Send Request
        </Button>
        <Button variant="ghost" onClick={handleClear} icon={<RotateCcw className="h-4 w-4" />}>
          Clear
        </Button>
      </div>

      {response && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-3">
            <div
              className={`rounded-lg px-3 py-1.5 text-sm font-mono font-bold ${
                response.status >= 200 && response.status < 300
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : response.status >= 300 && response.status < 400
                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  : "bg-red-500/10 text-red-600 dark:text-red-400"
              }`}
            >
              {response.status || "ERR"}
            </div>
            <span className="text-sm text-muted-foreground">{response.statusText}</span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {response.duration}ms
            </span>
            <button
              onClick={handleCopy}
              className="ml-auto flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-emerald-500" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Response Headers</label>
            <div className="rounded-lg border border-border bg-muted/20 p-3 max-h-40 overflow-y-auto">
              {Object.entries(response.headers).map(([k, v]) => (
                <div key={k} className="text-xs font-mono mb-1 last:mb-0">
                  <span className="text-muted-foreground">{k}:</span>{" "}
                  <span className="text-foreground">{v}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Response Body</label>
            <div className="rounded-xl border border-border bg-zinc-950 dark:bg-zinc-900 p-4 overflow-auto max-h-80">
              <pre className="whitespace-pre-wrap break-all text-sm font-mono text-green-400 leading-relaxed">
                {response.data}
              </pre>
            </div>
          </div>
        </motion.div>
      )}

      {history.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Request History</label>
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {history.map((entry) => (
              <button
                key={entry.id}
                onClick={() => loadFromHistory(entry)}
                className="w-full flex items-center gap-3 rounded-lg border border-border bg-muted/20 px-3 py-2 text-left hover:bg-accent/50 transition-colors"
              >
                <span className={`rounded px-2 py-0.5 text-[10px] font-bold font-mono ${METHOD_BG[entry.method]} ${METHOD_COLORS[entry.method]}`}>
                  {entry.method}
                </span>
                <span className={`text-xs font-mono font-bold ${
                  entry.status >= 200 && entry.status < 300
                    ? "text-emerald-500"
                    : "text-red-500"
                }`}>
                  {entry.status}
                </span>
                <span className="flex-1 truncate text-xs text-muted-foreground font-mono">
                  {entry.url}
                </span>
                <span className="text-[10px] text-muted-foreground">{entry.time}</span>
                <span className="text-[10px] text-muted-foreground">{entry.duration}ms</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}
