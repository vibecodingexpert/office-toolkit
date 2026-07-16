"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils/cn"
import {
  Shield,
  Eye,
  EyeOff,
  CircleCheck,
  XCircle,
  TriangleAlert,
  Info,
  Copy,
  Check,
  RefreshCw,
  Lightbulb,
} from "lucide-react"

const COMMON_PASSWORDS = new Set([
  "password", "123456", "12345678", "123456789", "qwerty", "abc123",
  "monkey", "letmein", "dragon", "111111", "baseball", "iloveyou",
  "trustno1", "sunshine", "master", "welcome", "shadow", "ashley",
  "football", "jesus", "michael", "ninja", "mustang", "password1",
])

const commonPatterns = [
  /^12345/,
  /^qwerty/i,
  /^abcde/i,
  /^password/i,
  /^admin/i,
  /(.)\1{2,}/,
  /1234|2345|3456|4567|5678|6789/,
  /qwer|wert|erty|rtyu|tyui|yuio|uiop/i,
]

function getEntropy(password: string): number {
  let pool = 0
  if (/[a-z]/.test(password)) pool += 26
  if (/[A-Z]/.test(password)) pool += 26
  if (/[0-9]/.test(password)) pool += 10
  if (/[^a-zA-Z0-9]/.test(password)) pool += 33
  return pool > 0 ? Math.round(password.length * Math.log2(pool)) : 0
}

function getStrength(password: string): { score: number; label: string; color: string; textColor: string } {
  const entropy = getEntropy(password)
  const score = Math.min(100, Math.round((entropy / 128) * 100))
  if (score < 20) return { score, label: "Weak", color: "bg-destructive", textColor: "text-destructive" }
  if (score < 40) return { score, label: "Fair", color: "bg-orange-500", textColor: "text-orange-500" }
  if (score < 60) return { score, label: "Good", color: "bg-amber-500", textColor: "text-amber-500" }
  if (score < 80) return { score, label: "Strong", color: "bg-emerald-500", textColor: "text-emerald-500" }
  return { score, label: "Very Strong", color: "bg-emerald-400", textColor: "text-emerald-400" }
}

function estimateCrackTime(entropy: number): string {
  const guessesPerSecond = 1e10
  const combinations = Math.pow(2, entropy)
  const seconds = combinations / guessesPerSecond
  if (seconds < 1) return "Instantly"
  if (seconds < 60) return `${Math.round(seconds)} seconds`
  if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`
  if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`
  if (seconds < 31536000) return `${Math.round(seconds / 86400)} days`
  if (seconds < 315360000) return `${Math.round(seconds / 31536000)} years`
  return "Centuries"
}

function getChecklistItems(password: string) {
  return [
    { key: "length", label: "At least 8 characters", pass: password.length >= 8 },
    { key: "uppercase", label: "Uppercase letter (A-Z)", pass: /[A-Z]/.test(password) },
    { key: "lowercase", label: "Lowercase letter (a-z)", pass: /[a-z]/.test(password) },
    { key: "numbers", label: "Number (0-9)", pass: /[0-9]/.test(password) },
    { key: "symbols", label: "Symbol (!@#$%^&*)", pass: /[^a-zA-Z0-9]/.test(password) },
    { key: "patterns", label: "No sequential patterns", pass: !commonPatterns.some(p => p.test(password)) },
  ]
}

function getTips(password: string): string[] {
  const tips: string[] = []
  if (password.length < 12) tips.push("Use at least 12 characters for stronger security")
  if (!/[A-Z]/.test(password)) tips.push("Add uppercase letters to increase strength")
  if (!/[a-z]/.test(password)) tips.push("Add lowercase letters to increase strength")
  if (!/[0-9]/.test(password)) tips.push("Add numbers to increase strength")
  if (!/[^a-zA-Z0-9]/.test(password)) tips.push("Include symbols like !@#$%^&* for extra security")
  if (commonPatterns.some(p => p.test(password))) tips.push("Avoid sequential patterns like '12345' or 'qwerty'")
  if (password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password) && /[^a-zA-Z0-9]/.test(password)) {
    tips.push("Consider using a passphrase - multiple random words")
  }
  return tips
}

export function PasswordChecker() {
  const [password, setPassword] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)
  const [copied, setCopied] = React.useState(false)

  const strength = React.useMemo(() => getStrength(password), [password])
  const entropy = React.useMemo(() => getEntropy(password), [password])
  const crackTime = React.useMemo(() => estimateCrackTime(entropy), [entropy])
  const checklist = React.useMemo(() => getChecklistItems(password), [password])
  const tips = React.useMemo(() => getTips(password), [password])
  const passCount = checklist.filter(c => c.pass).length
  const isCommon = COMMON_PASSWORDS.has(password.toLowerCase())

  const handleCopy = async () => {
    if (!password) return
    try {
      await navigator.clipboard.writeText(password)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10">
          <Shield className="h-5 w-5 text-cyan-500" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Password Checker</h2>
          <p className="text-sm text-muted-foreground">
            Analyze password strength and get improvement tips
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter a password to analyze..."
            className="w-full h-12 rounded-lg border border-input bg-background px-4 pr-24 text-sm text-foreground placeholder-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all font-mono"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
            <button
              onClick={handleCopy}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {password && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Strength bar */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Strength</span>
                <span className={cn("text-sm font-semibold", strength.textColor)}>
                  {strength.label}
                </span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${strength.score}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className={cn("h-full rounded-full transition-all", strength.color)}
                />
              </div>
              <div className="grid grid-cols-5 gap-1">
                {["Weak", "Fair", "Good", "Strong", "Very Strong"].map((label, i) => {
                  const thresholds = [20, 40, 60, 80, 100]
                  const active = strength.score >= (i === 0 ? 0 : thresholds[i - 1])
                  return (
                    <div key={label} className="flex flex-col items-center gap-1">
                      <div className={cn("h-1.5 w-full rounded-full transition-colors", active ? strength.color : "bg-muted")} />
                      <span className={cn("text-[10px] text-muted-foreground", active && strength.textColor)}>
                        {label}
                      </span>
                    </div>
                  )
                })}
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="rounded-lg bg-muted/50 p-3">
                  <span className="text-xs text-muted-foreground">Entropy</span>
                  <p className="text-lg font-semibold text-foreground">{entropy} <span className="text-sm font-normal text-muted-foreground">bits</span></p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3">
                  <span className="text-xs text-muted-foreground">Crack Time</span>
                  <p className="text-lg font-semibold text-foreground">{crackTime}</p>
                </div>
              </div>

              {isCommon && (
                <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                  <TriangleAlert className="h-4 w-4 shrink-0" />
                  This is a commonly used password. It is easily guessable.
                </div>
              )}
            </div>

            {/* Checklist */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Requirements</span>
                <span className="text-sm text-muted-foreground">{passCount}/{checklist.length}</span>
              </div>
              <div className="space-y-2">
                {checklist.map((item) => (
                  <div key={item.key} className="flex items-center gap-3">
                    {item.pass ? (
                      <CircleCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                    ) : (
                      <XCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                    )}
                    <span className={cn("text-sm", item.pass ? "text-foreground" : "text-muted-foreground")}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tips */}
            {tips.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-amber-500" />
                  <span className="text-sm font-medium">Tips to improve</span>
                </div>
                <ul className="space-y-2">
                  {tips.map((tip, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <Info className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
                      {tip}
                    </motion.li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {!password && (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-12 text-center">
          <Shield className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Type a password above to check its strength</p>
        </div>
      )}
    </div>
  )
}
