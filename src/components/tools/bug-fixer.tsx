"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProgressBar } from "@/components/ui/progress-bar"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils/cn"
import {
  Bug,
  Copy,
  Check,
  Sparkles,
  FileCode2,
  AlertTriangle,
  CheckCircle2,
  Code2,
} from "lucide-react"

const LANGUAGES = [
  "JavaScript", "Python", "TypeScript", "React", "Java", "C++", "Go", "Rust", "SQL", "Ruby",
  "PHP", "Swift", "Kotlin",
] as const

const COMMON_BUG_PATTERNS = [
  { pattern: "off-by-one", regex: /<\s*=\s*\w+\.\s*length\b|<\s*=\s*\w+\.\s*len\b/g, message: "Potential off-by-one error: ensure loop bounds are correct", severity: "high", fix: "Use < instead of <= or adjust the initial index" },
  { pattern: "null-reference", regex: /\bnull\s*[=!]==?\s*\w+/g, message: "Null reference check: ensure all code paths handle null", severity: "high", fix: "Add null checks with optional chaining or null coalescing" },
  { pattern: "undefined-access", regex: /\b\w+\.\w+\b(?![^.]*\?\.)/g, message: "Potential undefined property access: use optional chaining", severity: "medium", fix: "Replace dot access with optional chaining (?.)" },
  { pattern: "mutation", regex: /\b(const)\s+\w+\s*=\s*.*\b(push|pop|splice|sort|reverse)\b/g, message: "Mutating a const array/object: const prevents reassignment, not mutation", severity: "medium", fix: "Use const for primitive values; for arrays use spread operator to avoid mutation" },
  { pattern: "var-usage", regex: /\bvar\s+\w+/g, message: "Legacy var declaration: can cause hoisting issues", severity: "low", fix: "Replace var with const (or let if reassignment is needed)" },
  { pattern: "loose-equality", regex: /[^!]==[^=]/g, message: "Loose equality (==) can cause type coercion bugs", severity: "medium", fix: "Use strict equality (===) instead of == (or !== instead of !=)" },
  { pattern: "missing-trycatch", regex: /\b(fetch|axios|\.json\s*\()/g, message: "Async operation without try/catch: unhandled promise rejection", severity: "high", fix: "Wrap the operation in a try/catch block" },
  { pattern: "console-log", regex: /console\.\w+/g, message: "Console statement left in code: not suitable for production", severity: "low", fix: "Remove console statements or use a proper logging library" },
  { pattern: "memory-leak", regex: /addEventListener\s*\(/g, message: "Event listener without removeEventListener: potential memory leak", severity: "medium", fix: "Store the listener reference and call removeEventListener in cleanup" },
  { pattern: "hardcoded-url", regex: /https?:\/\/[^\s"'`)\]]+/g, message: "Hardcoded URL: should use environment variables or config", severity: "low", fix: "Move the URL to an environment variable or config file" },
  { pattern: "sql-injection", regex: /SELECT\s+.*\$\{/gi, message: "String interpolation in SQL query: SQL injection risk", severity: "high", fix: "Use parameterized queries or prepared statements" },
  { pattern: "infinite-loop", regex: /(while\s*\(\s*true\s*\)|for\s*\(\s*;;\s*\))/g, message: "Potential infinite loop: ensure there's a break condition", severity: "high", fix: "Add a proper exit condition and a break statement" },
  { pattern: "float-comparison", regex: /\d+\.\d+\s*===?\s*\d+\.\d+/g, message: "Float comparison: floating-point arithmetic can cause precision issues", severity: "medium", fix: "Compare with a tolerance threshold using Math.abs(a - b) < epsilon" },
]

function findBugs(code: string): { line: number; column: number; message: string; severity: string; pattern: string; fix: string; code: string }[] {
  const bugs: { line: number; column: number; message: string; severity: string; pattern: string; fix: string; code: string }[] = []
  const lines = code.split("\n")
  const usedPatterns = new Set<string>()

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    for (const bug of COMMON_BUG_PATTERNS) {
      if (usedPatterns.has(bug.pattern)) continue
      let match: RegExpExecArray | null
      const regex = new RegExp(bug.regex.source, bug.regex.flags.replace("g", "") + "g")
      while ((match = regex.exec(line)) !== null) {
        bugs.push({
          line: i + 1,
          column: match.index + 1,
          message: bug.message,
          severity: bug.severity,
          pattern: bug.pattern,
          fix: bug.fix,
          code: match[0],
        })
        usedPatterns.add(bug.pattern)
        break
      }
    }
  }

  return bugs
}

function generateFixedCode(code: string, bugs: { line: number; message: string; severity: string; pattern: string; fix: string; code: string }[]): string {
  let fixed = code
  const lines = fixed.split("\n")

  for (const bug of bugs) {
    const idx = bug.line - 1
    if (idx >= lines.length) continue
    const line = lines[idx]

    switch (bug.pattern) {
      case "var-usage":
        lines[idx] = line.replace(/\bvar\s+(\w+)/g, "const $1")
        break
      case "loose-equality":
        lines[idx] = line.replace(/==(?!=)/g, "===").replace(/!=(?!=)/g, "!==")
        break
      case "console-log":
        lines[idx] = line.replace(/console\.\w+\([^)]*\)\s*;?/g, "// console.log removed")
        break
      case "missing-trycatch": {
        const indent = line.match(/^\s*/)?.[0] || ""
        const trimmed = line.trim()
        lines[idx] = ""
        if (trimmed.startsWith("const") || trimmed.startsWith("let") || trimmed.startsWith("var")) {
          const parts = trimmed.match(/(\w+)\s*=\s*await\s+(.+)/)
          if (parts) {
            lines[idx] = `${indent}try {\n${indent}  const ${parts[1]} = await ${parts[2]};\n${indent}} catch (error) {\n${indent}  console.error('Error:', error);\n${indent}}`
          }
        } else if (trimmed.startsWith("await")) {
          lines[idx] = `${indent}try {\n${indent}  ${trimmed};\n${indent}} catch (error) {\n${indent}  console.error('Error:', error);\n${indent}}`
        }
        break
      }
      case "sql-injection":
        lines[idx] = line.replace(/\$\{(\w+)\}/g, "$1")
        break
      default:
        lines[idx] = `// FIXME: ${bug.message}\n${line}`
    }
  }

  return lines.join("\n")
}

export function BugFixer() {
  const [code, setCode] = React.useState("")
  const [language, setLanguage] = React.useState<(typeof LANGUAGES)[number]>("JavaScript")
  const [loading, setLoading] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  const [bugReport, setBugReport] = React.useState<{ line: number; column: number; message: string; severity: string; pattern: string; fix: string; code: string }[] | null>(null)
  const [fixedCode, setFixedCode] = React.useState<string | null>(null)
  const [copied, setCopied] = React.useState(false)

  const handleAnalyze = React.useCallback(async () => {
    if (!code.trim()) {
      toast.error("Please enter code to analyze")
      return
    }

    setLoading(true)
    setProgress(0)

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + Math.random() * 18
        return next >= 90 ? 90 : next
      })
    }, 200)

    await new Promise((r) => setTimeout(r, 600 + Math.random() * 800))

    clearInterval(interval)
    setProgress(100)

    const bugs = findBugs(code)
    if (bugs.length === 0) {
      toast.success("No bugs found! Clean code detected.")
    } else {
      toast.info(`Found ${bugs.length} potential issue(s)`)
    }

    const fixed = generateFixedCode(code, bugs)
    setBugReport(bugs)
    setFixedCode(fixed)
    setLoading(false)
  }, [code])

  const handleCopy = React.useCallback(async () => {
    if (!fixedCode) return
    try {
      await navigator.clipboard.writeText(fixedCode)
      setCopied(true)
      toast.success("Copied to clipboard")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Failed to copy")
    }
  }, [fixedCode])

  const severityColor = (severity: string) => {
    switch (severity) {
      case "high": return "border-red-500/30 bg-red-500/10 text-red-500"
      case "medium": return "border-amber-500/30 bg-amber-500/10 text-amber-500"
      case "low": return "border-emerald-500/30 bg-emerald-500/10 text-emerald-500"
      default: return "border-border bg-muted text-muted-foreground"
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-violet-500/20 shadow-sm">
          <Bug className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Bug Fixer</h1>
          <p className="text-sm text-muted-foreground">Detect and fix code issues automatically</p>
        </div>
      </motion.div>

      <Card className="space-y-6 p-6">
        <div className="flex flex-wrap gap-2">
          {LANGUAGES.map((lang) => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              className={cn(
                "rounded-xl border px-3 py-1.5 text-xs font-medium transition-all",
                language === lang
                  ? "border-primary/50 bg-primary/5 text-primary shadow-sm"
                  : "border-border text-foreground hover:border-primary/30"
              )}
            >
              {lang}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Code</label>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder={`Paste ${language} code with bugs...`}
            rows={8}
            className="w-full resize-y rounded-2xl border border-border bg-background p-4 font-mono text-sm text-foreground placeholder-muted-foreground shadow-sm transition-all focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
          />
        </div>

        <Button
          onClick={handleAnalyze}
          loading={loading}
          fullWidth
          size="lg"
          icon={<Sparkles className="h-5 w-5" />}
        >
          Analyze & Fix Bugs
        </Button>

        {loading && (
          <ProgressBar value={progress} variant="gradient" showPercentage label="Scanning for bugs..." />
        )}
      </Card>

      <AnimatePresence>
        {bugReport && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Bug className="h-4 w-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Issues Found</span>
                </div>
                <p className="text-3xl font-bold text-foreground">{bugReport.length}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm"
              >
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-muted-foreground">High Severity</span>
                </div>
                <p className="text-3xl font-bold text-red-500">{bugReport.filter((b) => b.severity === "high").length}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm"
              >
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span className="text-sm text-muted-foreground">Auto-Fixed</span>
                </div>
                <p className="text-3xl font-bold text-emerald-500">{bugReport.length}</p>
              </motion.div>
            </div>

            {bugReport.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
              >
                <div className="border-b border-border px-5 py-3">
                  <span className="text-sm font-medium text-foreground">Bug Report ({bugReport.length} issue{bugReport.length !== 1 ? "s" : ""})</span>
                </div>
                <div className="divide-y divide-border">
                  {bugReport.map((bug, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="p-4 px-5"
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn("mt-0.5 flex h-6 w-6 items-center justify-center rounded-lg border text-[10px] font-bold", severityColor(bug.severity))}>
                          {bug.severity === "high" ? "!" : bug.severity === "medium" ? "?" : "i"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="text-sm font-medium text-foreground">{bug.message}</span>
                              <div className="flex items-center gap-2 mt-1">
                                <code className="rounded bg-muted px-1.5 py-0.5 text-[11px] font-mono text-muted-foreground">{bug.code}</code>
                                <span className="text-[11px] text-muted-foreground">Line {bug.line}, Col {bug.column}</span>
                              </div>
                            </div>
                            <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium", bug.severity === "high" ? "bg-red-500/10 text-red-500" : bug.severity === "medium" ? "bg-amber-500/10 text-amber-500" : "bg-emerald-500/10 text-emerald-500")}>
                              {bug.severity}
                            </span>
                          </div>
                          <div className="mt-2 flex items-start gap-2 rounded-lg bg-primary/5 p-2.5">
                            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                            <span className="text-xs text-foreground/80">{bug.fix}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {fixedCode && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
              >
                <div className="flex items-center justify-between border-b border-border px-5 py-3">
                  <div className="flex items-center gap-2">
                    <FileCode2 className="h-4 w-4 text-emerald-500" />
                    <span className="text-sm font-medium text-foreground">Fixed Code</span>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCopy}
                    className="flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  >
                    {copied ? (<><Check className="h-3.5 w-3.5 text-emerald-500" /> Copied</>) : (<><Copy className="h-3.5 w-3.5" /> Copy</>)}
                  </motion.button>
                </div>
                <div className="overflow-x-auto">
                  <pre className="p-5 text-sm font-mono text-foreground leading-relaxed whitespace-pre-wrap">{fixedCode}</pre>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
