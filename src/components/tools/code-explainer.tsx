"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProgressBar } from "@/components/ui/progress-bar"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils/cn"
import {
  Code2,
  Copy,
  Check,
  Sparkles,
  ChevronRight,
  BarChart3,
  Lightbulb,
  Gauge,
} from "lucide-react"

const LANGUAGES = [
  "JavaScript", "Python", "TypeScript", "React", "Java", "C++", "Go", "Rust", "SQL", "Ruby",
] as const

function estimateComplexity(code: string): { time: string; space: string; score: number } {
  const hasLoops = (code.match(/\b(for|while)\s*\(/g) || []).length
  const hasNestedLoops = (code.match(/\b(for|while)\s*\([^}]*\b(for|while)\s*\(/g) || []).length
  const hasRecursion = code.includes("function") && code.includes("function")
  const hasSort = code.toLowerCase().includes("sort")
  const hasMap = code.includes(".map")
  const hasFilter = code.includes(".filter")
  const hasReduce = code.includes(".reduce")
  const hasBinarySearch = code.toLowerCase().includes("binary") || code.includes("mid =")

  if (hasNestedLoops > 0) return { time: "O(n²)", space: "O(1)", score: 3 }
  if (hasSort || hasBinarySearch) return { time: "O(n log n)", space: "O(n)", score: 2 }
  if (hasLoops > 0 || hasMap || hasFilter || hasReduce) return { time: "O(n)", space: "O(n)", score: 1 }
  return { time: "O(1)", space: "O(1)", score: 0 }
}

function generateSuggestions(code: string): string[] {
  const suggestions: string[] = []
  if (!code.includes("try") && (code.includes("throw") || code.includes("error"))) {
    suggestions.push("Add try/catch blocks for better error handling")
  }
  if (!code.includes("//") && !code.includes("/*")) {
    suggestions.push("Add comments to explain complex logic")
  }
  if (code.includes("var ")) {
    suggestions.push("Replace 'var' with 'const' or 'let' for better scoping")
  }
  if (!code.includes("types") && !code.includes("interface") && (code.includes("function") || code.includes("class"))) {
    suggestions.push("Consider adding TypeScript types/interfaces for better type safety")
  }
  if ((code.match(/\bif\b/g) || []).length > 3) {
    suggestions.push("Consider using a switch statement or object lookup for multiple conditions")
  }
  if (code.includes("console.log")) {
    suggestions.push("Remove console.log statements in production code")
  }
  if ((code.match(/\bconst\b/g) || []).length > 0 && (code.match(/\blet\b/g) || []).length === 0) {
    suggestions.push("Good use of const! Ensure all immutable references use const")
  }
  if (code.includes("== ") || code.includes("==")) {
    suggestions.push("Use === instead of == for strict equality checks")
  }
  suggestions.push("Extract repeated logic into reusable functions")
  suggestions.push("Add input validation for function parameters")
  suggestions.push("Consider adding unit tests for edge cases")
  return suggestions
}

function generateExplanation(code: string, language: string): { lines: { code: string; explanation: string; lineNumber: number }[]; overview: string; complexity: { time: string; space: string; score: number }; suggestions: string[] } {
  const keywordExplanations: Record<string, string> = {
    import: "This import statement brings in external modules or dependencies, making their exported functionality available in the current scope.",
    export: "Export makes this module's functionality available to other files that import it, establishing the public API of this module.",
    function: "Declares a reusable block of code that can be called with arguments to perform a specific task.",
    const: "Declares a block-scoped constant whose value cannot be reassigned after initialization.",
    let: "Declares a block-scoped variable that can be reassigned. Unlike var, it has temporal dead zone behavior.",
    var: "Declares a function-scoped variable that is hoisted. Prefer const and let in modern code.",
    if: "Starts a conditional block that executes the enclosed code only when the specified condition evaluates to true.",
    else: "Provides an alternative code block that executes when the preceding if condition evaluates to false.",
    "for": "Creates a loop that executes a block of code a specified number of times.",
    while: "Creates a loop that continues executing as long as the specified condition remains true.",
    return: "Exits the current function and optionally returns a value to the caller.",
    class: "Defines a blueprint for creating objects with shared properties and methods.",
    interface: "Defines a contract for object shapes in TypeScript, specifying required properties and types.",
    type: "Creates a type alias in TypeScript, allowing complex type definitions to be reused.",
    async: "Marks a function as asynchronous, enabling the use of await within it.",
    await: "Pauses execution of an async function until the awaited Promise settles.",
    try: "Begins a block of code that may throw an error. Used with catch for error handling.",
    catch: "Defines a block that executes when an error is thrown in the associated try block.",
    throw: "Explicitly raises an exception, which can be caught by an enclosing try/catch block.",
    "new": "Creates an instance of a constructor function or class.",
    "this": "Refers to the current execution context. Its value depends on how the function is called.",
  }

  const codeLines = code.split("\n")
  const explanations: { code: string; explanation: string; lineNumber: number }[] = []
  let inMultiLineComment = false

  for (let i = 0; i < codeLines.length; i++) {
    const line = codeLines[i]

    if (line.trim().startsWith("/*")) { inMultiLineComment = true }
    if (inMultiLineComment) {
      explanations.push({ code: line, explanation: "Multi-line comment block for documentation.", lineNumber: i + 1 })
      if (line.includes("*/")) inMultiLineComment = false
      continue
    }
    if (line.trim().startsWith("//")) {
      explanations.push({ code: line, explanation: `Comment: ${line.trim().slice(2).trim()}`, lineNumber: i + 1 })
      continue
    }
    if (line.trim() === "" || line.trim() === "```") continue

    let explanation = "This line executes as part of the program flow."
    for (const [keyword, kwExplanation] of Object.entries(keywordExplanations)) {
      if (line.match(new RegExp(`\\b${keyword}\\b`))) { explanation = kwExplanation; break }
    }
    if (line.includes("=>")) explanation = "Arrow function expression with lexical 'this' binding."
    if (line.match(/\.\w+\(/)) explanation = "Method call: invoking a function belonging to an object."
    if (line.match(/\[\s*\]/)) explanation = "Array literal: creates a new array using bracket notation."
    if (line.match(/{\s*}/)) explanation = "Object literal or code block using curly braces."
    if (line.includes("=") && !line.includes("==") && !line.includes("===") && !line.includes("=>")) explanation = "Assignment operator."
    if (line.includes("===") || line.includes("==")) explanation = "Comparison operator."
    if (line.includes("Promise") || line.includes(".then(") || line.includes(".catch(")) explanation = "Promise handling for async operations."
    if (line.includes("<") && line.includes(">") && !line.includes("=")) explanation = "JSX/TSX element for declarative UI."

    explanations.push({ code: line, explanation, lineNumber: i + 1 })
  }

  const overview = `This ${language} code demonstrates key programming concepts including variable declarations, control flow, function definitions, and data manipulation. The code follows standard ${language} conventions.`
  const complexity = estimateComplexity(code)
  const suggestions = generateSuggestions(code)

  return { lines: explanations, overview, complexity, suggestions }
}

export function CodeExplainer() {
  const [code, setCode] = React.useState("")
  const [language, setLanguage] = React.useState<(typeof LANGUAGES)[number]>("JavaScript")
  const [loading, setLoading] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  const [explanation, setExplanation] = React.useState<{ lines: { code: string; explanation: string; lineNumber: number }[]; overview: string; complexity: { time: string; space: string; score: number }; suggestions: string[] } | null>(null)
  const [copied, setCopied] = React.useState(false)

  const handleExplain = React.useCallback(async () => {
    if (!code.trim()) {
      toast.error("Please enter code to explain")
      return
    }

    setLoading(true)
    setProgress(0)

    const result = generateExplanation(code, language)
    setProgress(100)
    setExplanation(result)
    setLoading(false)
    toast.success(`Explained ${result.lines.length} lines`)
  }, [code, language])

  const handleCopy = React.useCallback(async () => {
    if (!explanation) return
    const text = `## Code Overview\n\n${explanation.overview}\n\n## Complexity\n- Time: ${explanation.complexity.time}\n- Space: ${explanation.complexity.space}\n\n## Line-by-Line\n\n${explanation.lines.map(l => `Line ${l.lineNumber}: ${l.code.trim()}\n${l.explanation}\n`).join("\n")}`
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast.success("Copied to clipboard")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Failed to copy")
    }
  }, [explanation])

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-violet-500/20 shadow-sm">
          <Code2 className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Code Explainer</h1>
          <p className="text-sm text-muted-foreground">Line-by-line explanation with complexity analysis</p>
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
            placeholder="Paste the code you want explained..."
            rows={8}
            className="w-full resize-y rounded-2xl border border-border bg-background p-4 font-mono text-sm text-foreground placeholder-muted-foreground shadow-sm transition-all focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
          />
        </div>

        <Button
          onClick={handleExplain}
          loading={loading}
          fullWidth
          size="lg"
          icon={<Sparkles className="h-5 w-5" />}
        >
          Explain Code
        </Button>

        {loading && (
          <ProgressBar value={progress} variant="gradient" showPercentage label="Analyzing code..." />
        )}
      </Card>

      <AnimatePresence>
        {explanation && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              <div className="flex items-center justify-between border-b border-border px-5 py-3">
                <span className="text-sm font-medium text-foreground">Overview</span>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCopy}
                  className="flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                >
                  {copied ? (<><Check className="h-3.5 w-3.5 text-emerald-500" /> Copied</>) : (<><Copy className="h-3.5 w-3.5" /> Copy</>)}
                </motion.button>
              </div>
              <div className="p-5">
                <p className="text-sm text-foreground leading-relaxed">{explanation.overview}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
              >
                <div className="flex items-center gap-2 border-b border-border px-5 py-3">
                  <Gauge className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">Complexity</span>
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-muted-foreground">Time Complexity</span>
                    <span className="text-sm font-mono font-bold text-primary">{explanation.complexity.time}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Space Complexity</span>
                    <span className="text-sm font-mono font-bold text-primary">{explanation.complexity.space}</span>
                  </div>
                  <div className="mt-3 flex gap-1">
                    {[0, 1, 2].map((level) => (
                      <div key={level} className={cn("h-2 flex-1 rounded-full", level <= explanation.complexity.score ? "bg-primary" : "bg-muted")} />
                    ))}
                  </div>
                  <p className="mt-1 text-[10px] text-muted-foreground">Complexity level: {explanation.complexity.score === 0 ? "Low" : explanation.complexity.score === 1 ? "Medium" : "High"}</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
              >
                <div className="flex items-center gap-2 border-b border-border px-5 py-3">
                  <Lightbulb className="h-4 w-4 text-amber-500" />
                  <span className="text-sm font-medium text-foreground">Suggestions</span>
                </div>
                <div className="divide-y divide-border">
                  {explanation.suggestions.slice(0, 4).map((s, i) => (
                    <div key={i} className="flex items-start gap-2 p-3 px-5">
                      <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                      <span className="text-xs text-foreground/80">{s}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              <div className="border-b border-border px-5 py-3">
                <span className="text-sm font-medium text-foreground">Line-by-Line ({explanation.lines.length} lines)</span>
              </div>
              <div className="divide-y divide-border">
                {explanation.lines.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.01 }}
                    className="group"
                  >
                    <details className="group">
                      <summary className="flex cursor-pointer items-center gap-3 px-5 py-2.5 transition-colors hover:bg-accent/50">
                        <span className="flex h-5 w-5 items-center justify-center rounded bg-muted text-[10px] font-medium text-muted-foreground">
                          {item.lineNumber}
                        </span>
                        <code className="flex-1 font-mono text-xs text-foreground truncate">
                          {item.code.trim()}
                        </code>
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground transition-transform group-open:rotate-90" />
                      </summary>
                      <div className="border-t border-border bg-muted/20 px-5 py-3">
                        <p className="text-sm text-foreground/80 leading-relaxed">{item.explanation}</p>
                      </div>
                    </details>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
