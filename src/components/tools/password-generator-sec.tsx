"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils/cn"
import {
  KeyRound,
  Copy,
  Check,
  RefreshCw,
  Eye,
  EyeOff,
  Shield,
  ChevronDown,
  ChevronUp,
} from "lucide-react"

function generatePassword(
  length: number,
  options: {
    uppercase: boolean
    lowercase: boolean
    numbers: boolean
    symbols: boolean
    excludeAmbiguous: boolean
    noRepeat: boolean
  }
): string {
  let chars = ""
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  const lowercase = "abcdefghijklmnopqrstuvwxyz"
  const numbers = "0123456789"
  const symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?~"

  if (options.uppercase) chars += options.excludeAmbiguous ? uppercase.replace(/[0O1lI]/g, "") : uppercase
  if (options.lowercase) chars += options.excludeAmbiguous ? lowercase.replace(/[0O1lI]/g, "") : lowercase
  if (options.numbers) chars += options.excludeAmbiguous ? numbers.replace(/[0O1lI]/g, "") : numbers
  if (options.symbols) chars += options.excludeAmbiguous ? symbols.replace(/[!$]/g, "") : symbols

  if (!chars) return ""

  let password = ""
  const used = new Set<string>()
  let attempts = 0

  while (password.length < length && attempts < 1000) {
    const array = new Uint32Array(1)
    crypto.getRandomValues(array)
    const char = chars[array[0] % chars.length]
    if (options.noRepeat && used.has(char)) {
      attempts++
      continue
    }
    password += char
    used.add(char)
    attempts = 0
  }

  return password
}

function getStrength(password: string): { score: number; label: string; color: string } {
  let pool = 0
  if (/[a-z]/.test(password)) pool += 26
  if (/[A-Z]/.test(password)) pool += 26
  if (/[0-9]/.test(password)) pool += 10
  if (/[^a-zA-Z0-9]/.test(password)) pool += 33
  const entropy = pool > 0 ? Math.round(password.length * Math.log2(pool)) : 0
  const score = Math.min(100, Math.round((entropy / 128) * 100))
  if (score < 25) return { score, label: "Weak", color: "bg-destructive" }
  if (score < 50) return { score, label: "Fair", color: "bg-orange-500" }
  if (score < 75) return { score, label: "Strong", color: "bg-amber-500" }
  return { score, label: "Very Strong", color: "bg-emerald-500" }
}

export function PasswordGeneratorSec() {
  const [length, setLength] = React.useState(16)
  const [options, setOptions] = React.useState({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
    excludeAmbiguous: false,
    noRepeat: false,
  })
  const [passwords, setPasswords] = React.useState<string[]>([])
  const [loading, setLoading] = React.useState(false)
  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null)
  const [showAll, setShowAll] = React.useState(false)

  const generate = React.useCallback(() => {
    setLoading(true)
    setTimeout(() => {
      const pwds: string[] = []
      for (let i = 0; i < 5; i++) {
        pwds.push(generatePassword(length, options))
      }
      setPasswords(pwds)
      setLoading(false)
    }, 200)
  }, [length, options])

  React.useEffect(() => { generate() }, [])

  const handleCopy = async (pwd: string, index: number) => {
    try {
      await navigator.clipboard.writeText(pwd)
      setCopiedIndex(index)
      setTimeout(() => setCopiedIndex(null), 2000)
    } catch {}
  }

  const copyAll = async () => {
    try {
      await navigator.clipboard.writeText(passwords.join("\n"))
    } catch {}
  }

  const toggleOption = (key: keyof typeof options) => {
    setOptions((prev) => {
      const next = { ...prev, [key]: !prev[key] }
      const anySelected = next.uppercase || next.lowercase || next.numbers || next.symbols
      if (!anySelected) return prev
      return next
    })
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10">
          <KeyRound className="h-5 w-5 text-cyan-500" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Password Generator</h2>
          <p className="text-sm text-muted-foreground">Generate multiple secure passwords</p>
        </div>
      </div>

      {/* Length slider */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Length: {length}</span>
          <span className="text-xs text-muted-foreground">{length < 12 ? "Too short" : length < 20 ? "Good" : "Very secure"}</span>
        </div>
        <input
          type="range"
          min={8}
          max={64}
          value={length}
          onChange={(e) => setLength(Number(e.target.value))}
          className="w-full h-2 rounded-full bg-muted appearance-none cursor-pointer accent-cyan-500"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>8</span>
          <span>16</span>
          <span>32</span>
          <span>64</span>
        </div>
      </div>

      {/* Options */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <span className="text-sm font-medium">Character Types</span>
        <div className="grid grid-cols-2 gap-3">
          {(["uppercase", "lowercase", "numbers", "symbols"] as const).map((key) => (
            <label
              key={key}
              className={cn(
                "flex items-center gap-3 cursor-pointer p-3 rounded-xl border transition-colors",
                options[key] ? "border-primary/30 bg-primary/5" : "border-border hover:bg-accent/50"
              )}
            >
              <input
                type="checkbox"
                checked={options[key]}
                onChange={() => toggleOption(key)}
                className="h-4 w-4 rounded border-border text-cyan-500 focus:ring-cyan-500"
              />
              <span className="text-sm text-foreground capitalize">{key}</span>
            </label>
          ))}
        </div>
        <div className="space-y-2 pt-1">
          <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-border hover:bg-accent/50 transition-colors">
            <input
              type="checkbox"
              checked={options.excludeAmbiguous}
              onChange={() => toggleOption("excludeAmbiguous")}
              className="h-4 w-4 rounded border-border text-cyan-500 focus:ring-cyan-500"
            />
            <span className="text-sm text-foreground">Exclude ambiguous characters (0, O, 1, l, I, |)</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-border hover:bg-accent/50 transition-colors">
            <input
              type="checkbox"
              checked={options.noRepeat}
              onChange={() => toggleOption("noRepeat")}
              className="h-4 w-4 rounded border-border text-cyan-500 focus:ring-cyan-500"
            />
            <span className="text-sm text-foreground">Avoid repeated characters</span>
          </label>
        </div>
      </div>

      {/* Generated passwords */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Generated Passwords</span>
          <button
            onClick={copyAll}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <Copy className="h-3.5 w-3.5" />
            Copy all
          </button>
        </div>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center py-8"
            >
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </motion.div>
          ) : (
            <motion.div
              key="passwords"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-2"
            >
              {(showAll ? passwords : passwords.slice(0, 1)).map((pwd, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3 hover:border-primary/30 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <code className="select-all text-sm font-mono text-foreground break-all">{pwd}</code>
                  </div>
                  <button
                    onClick={() => handleCopy(pwd, i)}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  >
                    {copiedIndex === i ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                  </button>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-3">
          <button
            onClick={generate}
            disabled={loading}
            className="flex items-center gap-2 h-10 px-4 rounded-lg bg-cyan-500/10 text-cyan-500 hover:bg-cyan-500/20 transition-colors text-sm font-medium disabled:opacity-50"
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            Generate
          </button>
          <button
            onClick={() => setShowAll(!showAll)}
            className="flex items-center gap-1.5 h-10 px-4 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors text-sm"
          >
            {showAll ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            {showAll ? "Show less" : "Show all 5"}
          </button>
        </div>
      </div>

      {/* Strength of first password */}
      {passwords[0] && (
        <div className="rounded-xl border border-border bg-card p-5 space-y-3">
          <span className="text-sm font-medium">Password Strength</span>
          {(() => {
            const str = getStrength(passwords[0])
            return (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{str.label}</span>
                  <span className="text-sm text-muted-foreground">{str.score}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${str.score}%` }}
                    transition={{ duration: 0.5 }}
                    className={cn("h-full rounded-full", str.color)}
                  />
                </div>
              </div>
            )
          })()}
        </div>
      )}
    </div>
  )
}
