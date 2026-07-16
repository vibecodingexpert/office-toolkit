"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { toast } from "@/components/ui/toast"
import { Copy, Check, KeyRound, RefreshCw, Eye, EyeOff } from "lucide-react"

function getStrengthColor(score: number): string {
  if (score < 25) return "bg-destructive"
  if (score < 50) return "bg-red-500"
  if (score < 75) return "bg-amber-500"
  return "bg-emerald-500"
}

function getStrengthLabel(score: number): string {
  if (score < 25) return "Weak"
  if (score < 50) return "Fair"
  if (score < 75) return "Strong"
  return "Very Strong"
}

function getStrengthTextColor(score: number): string {
  if (score < 25) return "text-destructive"
  if (score < 50) return "text-red-500"
  if (score < 75) return "text-amber-500"
  return "text-emerald-500"
}

function calculateEntropy(password: string): number {
  let pool = 0
  if (/[a-z]/.test(password)) pool += 26
  if (/[A-Z]/.test(password)) pool += 26
  if (/[0-9]/.test(password)) pool += 10
  if (/[^a-zA-Z0-9]/.test(password)) pool += 32
  return pool > 0 ? Math.round(password.length * Math.log2(pool)) : 0
}

function calculateStrength(password: string): number {
  const entropy = calculateEntropy(password)
  return Math.min(100, Math.round((entropy / 128) * 100))
}

function generatePassword(
  length: number,
  options: {
    uppercase: boolean
    lowercase: boolean
    numbers: boolean
    symbols: boolean
    excludeAmbiguous: boolean
  }
): string {
  let chars = ""
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  const lowercase = "abcdefghijklmnopqrstuvwxyz"
  const numbers = "0123456789"
  const symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?~"
  const ambiguous = "0O1lI|!5S$"

  if (options.uppercase) chars += options.excludeAmbiguous
    ? uppercase.replace(/[0O1lI]/g, "")
    : uppercase
  if (options.lowercase) chars += options.excludeAmbiguous
    ? lowercase.replace(/[0O1lI]/g, "")
    : lowercase
  if (options.numbers) chars += options.excludeAmbiguous
    ? numbers.replace(/[0O1lI]/g, "")
    : numbers
  if (options.symbols) chars += options.excludeAmbiguous
    ? symbols.replace(/[!$]/g, "")
    : symbols

  if (!chars) return ""

  let password = ""
  const array = new Uint32Array(length)
  crypto.getRandomValues(array)
  for (let i = 0; i < length; i++) {
    password += chars[array[i] % chars.length]
  }
  return password
}

export function PasswordGenerator() {
  const [length, setLength] = React.useState(16)
  const [options, setOptions] = React.useState({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
    excludeAmbiguous: false,
  })
  const [password, setPassword] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [copied, setCopied] = React.useState(false)
  const [showPassword, setShowPassword] = React.useState(false)

  const generate = React.useCallback(() => {
    setLoading(true)
    setTimeout(() => {
      const pw = generatePassword(length, options)
      if (pw) {
        setPassword(pw)
      } else {
        toast.error("Select at least one character type")
      }
      setLoading(false)
    }, 150)
  }, [length, options])

  React.useEffect(() => {
    generate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleCopy = React.useCallback(async () => {
    if (!password) return
    try {
      await navigator.clipboard.writeText(password)
      setCopied(true)
      toast.success("Copied to clipboard")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Failed to copy")
    }
  }, [password])

  const strength = React.useMemo(() => calculateStrength(password), [password])
  const entropy = React.useMemo(() => calculateEntropy(password), [password])

  const toggleOption = (key: keyof typeof options) => {
    setOptions((prev) => {
      const next = { ...prev, [key]: !prev[key] }
      const anySelected = next.uppercase || next.lowercase || next.numbers || next.symbols
      if (!anySelected) return prev
      return next
    })
  }

  return (
    <Card className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <KeyRound className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Password Generator</h2>
          <p className="text-sm text-muted-foreground">
            Generate strong, secure passwords
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-muted/30 p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            {showPassword ? (
              <code className="select-all text-sm font-mono text-foreground break-all">
                {password}
              </code>
            ) : (
              <div className="flex gap-1">
                {Array.from({ length: password.length }).map((_, i) => (
                  <span
                    key={i}
                    className="inline-block w-2 h-4 rounded-sm bg-muted-foreground/30"
                  />
                ))}
              </div>
            )}
          </div>
          <div className="flex shrink-0 gap-1">
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
            <button
              onClick={handleCopy}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              {copied ? (
                <Check className="h-4 w-4 text-emerald-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
            <button
              onClick={generate}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mt-4 space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Strength</span>
            <span className={getStrengthTextColor(strength)}>
              {getStrengthLabel(strength)} ({entropy} bits)
            </span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${strength}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className={`h-full rounded-full ${getStrengthColor(strength)}`}
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Length: {length}
        </label>
        <input
          type="range"
          min={8}
          max={64}
          value={length}
          onChange={(e) => setLength(Number(e.target.value))}
          className="w-full h-2 rounded-full bg-muted appearance-none cursor-pointer accent-primary"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>8</span>
          <span>64</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {(["uppercase", "lowercase", "numbers", "symbols"] as const).map((key) => (
          <label
            key={key}
            className="flex items-center gap-2 cursor-pointer p-3 rounded-xl border border-border hover:bg-accent/50 transition-colors"
          >
            <input
              type="checkbox"
              checked={options[key]}
              onChange={() => toggleOption(key)}
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
            />
            <span className="text-sm text-foreground capitalize">{key}</span>
          </label>
        ))}
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={options.excludeAmbiguous}
          onChange={() => toggleOption("excludeAmbiguous")}
          className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
        />
        <span className="text-sm text-foreground">
          Exclude ambiguous characters (0, O, 1, l, I, |)
        </span>
      </label>

      <div className="flex flex-wrap gap-3">
        <Button
          onClick={generate}
          loading={loading}
          icon={<RefreshCw className="h-4 w-4" />}
        >
          Regenerate
        </Button>
      </div>
    </Card>
  )
}
