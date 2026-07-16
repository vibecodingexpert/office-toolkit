"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils/cn"
import {
  Smartphone,
  Copy,
  Check,
  RefreshCw,
  Clock,
  History,
  Hash,
  Timer,
} from "lucide-react"

function generateOTP(length: number, numeric: boolean): string {
  const chars = numeric ? "0123456789" : "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let otp = ""
  const array = new Uint32Array(length)
  crypto.getRandomValues(array)
  for (let i = 0; i < length; i++) {
    otp += chars[array[i] % chars.length]
  }
  return otp
}

function generateTOTP(secret: string): string {
  const time = Math.floor(Date.now() / 30000)
  const hash = secret + time
  let hashVal = 0
  for (let i = 0; i < hash.length; i++) {
    hashVal = (hashVal * 31 + hash.charCodeAt(i)) % 1000000
  }
  return String(hashVal).padStart(6, "0")
}

interface OTPHistory {
  otp: string
  type: string
  timestamp: number
}

export function OTPGenerator() {
  const [otp, setOtp] = React.useState("")
  const [length, setLength] = React.useState<4 | 6 | 8>(6)
  const [numeric, setNumeric] = React.useState(true)
  const [copied, setCopied] = React.useState(false)
  const [countdown, setCountdown] = React.useState(30)
  const [autoRefresh, setAutoRefresh] = React.useState(true)
  const [history, setHistory] = React.useState<OTPHistory[]>([])
  const [totpSecret, setTotpSecret] = React.useState("")
  const [totpCode, setTotpCode] = React.useState("")
  const [mode, setMode] = React.useState<"otp" | "totp">("otp")

  const generate = React.useCallback(() => {
    const code = generateOTP(length, numeric)
    setOtp(code)
    setCountdown(30)
    setHistory((prev) => [{ otp: code, type: numeric ? "Numeric" : "Alphanumeric", timestamp: Date.now() }, ...prev].slice(0, 10))
  }, [length, numeric])

  React.useEffect(() => { generate() }, [])

  // Auto-refresh countdown
  React.useEffect(() => {
    if (!autoRefresh || mode === "totp") return
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          generate()
          return 30
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [autoRefresh, generate, mode])

  // TOTP
  React.useEffect(() => {
    if (mode !== "totp" || !totpSecret) return
    const interval = setInterval(() => {
      setTotpCode(generateTOTP(totpSecret))
    }, 1000)
    generateTOTP(totpSecret)
    setTotpCode(generateTOTP(totpSecret))
    return () => clearInterval(interval)
  }, [mode, totpSecret])

  const handleCopy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  const activeCode = mode === "otp" ? otp : totpCode

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10">
          <Smartphone className="h-5 w-5 text-cyan-500" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">OTP Generator</h2>
          <p className="text-sm text-muted-foreground">Generate one-time passwords and TOTP codes</p>
        </div>
      </div>

      {/* Mode toggle */}
      <div className="grid grid-cols-2 gap-3">
        {(["otp", "totp"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={cn(
              "flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-medium transition-colors",
              mode === m
                ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-500"
                : "border-border text-muted-foreground hover:bg-accent/50"
            )}
          >
            {m === "otp" ? <Hash className="h-4 w-4" /> : <Timer className="h-4 w-4" />}
            {m === "otp" ? "Random OTP" : "TOTP"}
          </button>
        ))}
      </div>

      {/* OTP Mode */}
      {mode === "otp" && (
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">OTP Length</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {([4, 6, 8] as const).map((n) => (
              <button
                key={n}
                onClick={() => setLength(n)}
                className={cn(
                  "p-3 rounded-xl border text-sm font-medium transition-colors",
                  length === n
                    ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-500"
                    : "border-border text-muted-foreground hover:bg-accent/50"
                )}
              >
                {n} digits
              </button>
            ))}
          </div>
          <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-border hover:bg-accent/50 transition-colors">
            <input
              type="checkbox"
              checked={numeric}
              onChange={() => setNumeric(!numeric)}
              className="h-4 w-4 rounded border-border text-cyan-500 focus:ring-cyan-500"
            />
            <span className="text-sm text-foreground">Numeric only</span>
          </label>
        </div>
      )}

      {/* TOTP Mode */}
      {mode === "totp" && (
        <div className="rounded-xl border border-border bg-card p-5 space-y-3">
          <label className="text-sm font-medium">TOTP Secret Key</label>
          <input
            value={totpSecret}
            onChange={(e) => setTotpSecret(e.target.value)}
            placeholder="Enter secret key..."
            className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring font-mono"
          />
          <p className="text-xs text-muted-foreground">TOTP uses a time-based algorithm (30s interval)</p>
        </div>
      )}

      {/* OTP Display */}
      <div className="rounded-xl border border-border bg-card p-8 text-center space-y-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCode || "empty"}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <code className="text-4xl sm:text-5xl font-mono font-bold tracking-[0.2em] text-foreground select-all">
              {activeCode || "------"}
            </code>
          </motion.div>
        </AnimatePresence>

        {mode === "otp" && (
          <div className="flex items-center justify-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className={cn("text-sm font-mono", countdown <= 5 ? "text-destructive" : "text-muted-foreground")}>
              {countdown}s
            </span>
          </div>
        )}

        <div className="flex justify-center gap-3">
          <button
            onClick={() => handleCopy(activeCode)}
            className="flex items-center gap-2 h-10 px-4 rounded-lg bg-cyan-500/10 text-cyan-500 hover:bg-cyan-500/20 transition-colors text-sm font-medium"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied" : "Copy"}
          </button>
          {mode === "otp" && (
            <>
              <button
                onClick={generate}
                className="flex items-center gap-2 h-10 px-4 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors text-sm"
              >
                <RefreshCw className="h-4 w-4" />
                Regenerate
              </button>
              <label className="flex items-center gap-2 cursor-pointer h-10 px-4 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors text-sm">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={() => setAutoRefresh(!autoRefresh)}
                  className="h-3.5 w-3.5 rounded border-border text-cyan-500"
                />
                Auto
              </label>
            </>
          )}
        </div>
      </div>

      {/* History */}
      {mode === "otp" && history.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-5 space-y-3">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Recent OTPs</span>
          </div>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {history.map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => handleCopy(item.otp)}
              >
                <code className="text-sm font-mono text-foreground">{item.otp}</code>
                <span className="text-xs text-muted-foreground">
                  {new Date(item.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
