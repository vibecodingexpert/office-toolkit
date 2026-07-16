"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/toast"
import { Copy, Check, Replace, Wand2, RotateCcw } from "lucide-react"

export function RegexTester() {
  const [testString, setTestString] = React.useState("")
  const [pattern, setPattern] = React.useState("")
  const [flags, setFlags] = React.useState({ g: true, i: false, m: false })
  const [matches, setMatches] = React.useState<RegExpExecArray[]>([])
  const [matchCount, setMatchCount] = React.useState(0)
  const [error, setError] = React.useState<string | null>(null)
  const [replaceText, setReplaceText] = React.useState("")
  const [replaceResult, setReplaceResult] = React.useState("")
  const [showReplace, setShowReplace] = React.useState(false)
  const [copied, setCopied] = React.useState(false)

  const runTest = React.useCallback(() => {
    if (!pattern) {
      setMatches([])
      setMatchCount(0)
      setError(null)
      return
    }
    try {
      const flagStr = `${flags.g ? "g" : ""}${flags.i ? "i" : ""}${flags.m ? "m" : ""}`
      const regex = new RegExp(pattern, flagStr)
      const found: RegExpExecArray[] = []
      let match: RegExpExecArray | null
      if (flags.g) {
        while ((match = regex.exec(testString)) !== null) {
          found.push(match)
          if (match.index === regex.lastIndex) regex.lastIndex++
        }
      } else {
        match = regex.exec(testString)
        if (match) found.push(match)
      }
      setMatches(found)
      setMatchCount(found.length)
      setError(null)

      if (replaceText && testString) {
        const replaceRegex = new RegExp(pattern, flagStr)
        setReplaceResult(testString.replace(replaceRegex, replaceText))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid regex")
      setMatches([])
      setMatchCount(0)
    }
  }, [testString, pattern, flags, replaceText])

  React.useEffect(() => {
    runTest()
  }, [runTest])

  const handleReplace = React.useCallback(() => {
    if (!pattern || !testString) {
      toast.error("Please enter a pattern and test string")
      return
    }
    try {
      const flagStr = `${flags.g ? "g" : ""}${flags.i ? "i" : ""}${flags.m ? "m" : ""}`
      const regex = new RegExp(pattern, flagStr)
      const result = testString.replace(regex, replaceText)
      setReplaceResult(result)
      toast.success(`Replaced ${matchCount} match(es)`)
    } catch {
      toast.error("Invalid regex pattern")
    }
  }, [testString, pattern, flags, replaceText, matchCount])

  const handleCopyReplace = React.useCallback(async () => {
    if (!replaceResult) return
    try {
      await navigator.clipboard.writeText(replaceResult)
      setCopied(true)
      toast.success("Copied to clipboard")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Failed to copy")
    }
  }, [replaceResult])

  const highlightMatches = (text: string) => {
    if (!pattern || matches.length === 0) {
      return <span>{text}</span>
    }
    try {
      const flagStr = `${flags.g ? "g" : ""}${flags.i ? "i" : ""}${flags.m ? "m" : ""}`
      const regex = new RegExp(`(${pattern})`, flagStr)
      const parts = text.split(regex)
      return parts.map((part, i) => {
        if (regex.test(part)) {
          regex.lastIndex = 0
          return (
            <span key={i} className="bg-yellow-300/40 dark:bg-yellow-500/30 rounded px-0.5 font-medium">
              {part}
            </span>
          )
        }
        return <span key={i}>{part}</span>
      })
    } catch {
      return <span>{text}</span>
    }
  }

  return (
    <Card className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Wand2 className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Regex Tester</h2>
          <p className="text-sm text-muted-foreground">
            Test and debug regular expressions in real-time
          </p>
        </div>
      </div>

      <Input
        label="Regex Pattern"
        value={pattern}
        onChange={(e) => setPattern(e.target.value)}
        placeholder="Enter regex pattern (e.g., \d+)..."
        icon={<Wand2 className="h-4 w-4" />}
      />

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Flags</label>
        <div className="flex gap-3">
          {(["g", "i", "m"] as const).map((flag) => (
            <label
              key={flag}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={flags[flag]}
                onChange={(e) =>
                  setFlags((prev) => ({ ...prev, [flag]: e.target.checked }))
                }
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
              />
              <span className="text-sm text-muted-foreground">
                {flag === "g" ? "Global" : flag === "i" ? "Case Insensitive" : "Multiline"}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">Test String</label>
          {pattern && (
            <span className="text-xs text-muted-foreground">
              {matchCount} match{matchCount !== 1 ? "es" : ""} found
            </span>
          )}
        </div>
        <textarea
          value={testString}
          onChange={(e) => setTestString(e.target.value)}
          placeholder="Enter test string..."
          rows={5}
          className="w-full resize-y rounded-xl border border-border bg-background p-4 text-sm text-foreground placeholder-muted-foreground shadow-sm transition-all focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
        />
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
        >
          {error}
        </motion.div>
      )}

      {pattern && testString && !error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <label className="text-sm font-medium text-foreground">Match Preview</label>
          <div className="rounded-xl border border-border bg-muted/30 p-4 text-sm whitespace-pre-wrap break-all">
            {highlightMatches(testString)}
          </div>
          {matches.length > 0 && (
            <div className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground">Details:</span>
              {matches.slice(0, 10).map((m, i) => (
                <div key={i} className="text-xs text-muted-foreground font-mono">
                  Match {i + 1}: "{m[0]}" at index {m.index}
                </div>
              ))}
              {matches.length > 10 && (
                <div className="text-xs text-muted-foreground">
                  ...and {matches.length - 10} more
                </div>
              )}
            </div>
          )}
        </motion.div>
      )}

      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowReplace(!showReplace)}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            showReplace
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
          }`}
        >
          <Replace className="h-4 w-4" />
          Replace
        </button>
      </div>

      {showReplace && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3 rounded-xl border border-border bg-muted/20 p-4"
        >
          <Input
            label="Replace With"
            value={replaceText}
            onChange={(e) => setReplaceText(e.target.value)}
            placeholder="Replacement text..."
          />
          <div className="flex gap-3">
            <Button size="sm" onClick={handleReplace} icon={<Replace className="h-4 w-4" />}>
              Apply Replace
            </Button>
          </div>
          {replaceResult && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Replace Result</span>
                <button
                  onClick={handleCopyReplace}
                  className="flex h-7 items-center gap-1 rounded-md px-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                >
                  {copied ? (
                    <Check className="h-3 w-3 text-emerald-500" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                  Copy
                </button>
              </div>
              <div className="rounded-xl border border-border bg-background p-4 text-sm whitespace-pre-wrap break-all">
                {replaceResult}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </Card>
  )
}
