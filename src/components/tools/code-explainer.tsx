"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils/cn"
import {
  Code2,
  Copy,
  Check,
  Sparkles,
  ChevronDown,
  ChevronRight,
} from "lucide-react"

const LANGUAGES = [
  "JavaScript",
  "Python",
  "TypeScript",
  "React",
  "Java",
  "C++",
  "Go",
  "Rust",
  "SQL",
  "Ruby",
] as const

function generateExplanation(code: string, language: string): { lines: { code: string; explanation: string; lineNumber: number }[]; overview: string } {
  const lines = code.split("\n").filter(l => l.trim())
  const explanations: { code: string; explanation: string; lineNumber: number }[] = []

  const keywordExplanations: Record<string, string> = {
    import: "This import statement brings in external modules or dependencies, making their exported functionality available in the current scope.",
    export: "Export makes this module's functionality available to other files that import it, establishing the public API of this module.",
    function: "Declares a reusable block of code that can be called with arguments to perform a specific task. Functions are first-class citizens in JavaScript.",
    const: "Declares a block-scoped constant whose value cannot be reassigned after initialization. The variable is available only within the enclosing block.",
    let: "Declares a block-scoped variable that can be reassigned. Unlike var, it is not hoisted to the function scope and has temporal dead zone behavior.",
    var: "Declares a function-scoped variable that is hoisted to the top of its enclosing function scope. Generally, const and let are preferred in modern JavaScript.",
    if: "Starts a conditional block that executes the enclosed code only when the specified condition evaluates to true.",
    else: "Provides an alternative code block that executes when the preceding if condition evaluates to false.",
    "for": "Creates a loop that executes a block of code a specified number of times, with initialization, condition, and increment/decrement expressions.",
    while: "Creates a loop that continues executing as long as the specified condition remains true. The condition is evaluated before each iteration.",
    return: "Exits the current function and optionally returns a value to the caller. If no value is specified, undefined is returned.",
    class: "Defines a blueprint for creating objects with shared properties and methods. Classes support inheritance through the extends keyword.",
    interface: "Defines a contract for object shapes in TypeScript, specifying required properties and their types. Interfaces are purely a compile-time construct.",
    type: "Creates a type alias in TypeScript, allowing complex type definitions to be given a name and reused throughout the codebase.",
    async: "Marks a function as asynchronous, enabling the use of await within it. Async functions always return a Promise, regardless of their return value.",
    await: "Pauses execution of an async function until the awaited Promise settles (resolves or rejects), then resumes with the resolved value.",
    try: "Begins a block of code that may throw an error. Used in conjunction with catch to implement error handling.",
    catch: "Defines a block that executes when an error is thrown in the associated try block, receiving the error object for handling.",
    throw: "Explicitly raises an exception, which can be caught by an enclosing try/catch block. Can throw any value, typically an Error object.",
    "new": "Creates an instance of a constructor function or class, allocating memory and initializing the object's properties.",
    "this": "Refers to the current execution context. Its value depends on how the function is called: method invocation, function invocation, or arrow function.",
    "true": "Boolean literal representing the logical true value. In JavaScript, truthy values coerce to true in boolean contexts.",
    "false": "Boolean literal representing the logical false value. Falsy values include false, 0, '', null, undefined, and NaN.",
    "null": "Represents the intentional absence of any object value. Unlike undefined, null is typically assigned explicitly.",
    undefined: "Represents a variable that has been declared but not assigned a value. Also the default return value of functions without explicit returns.",
  }

  const codeLines = code.split("\n")
  let inMultiLineComment = false

  for (let i = 0; i < codeLines.length; i++) {
    const line = codeLines[i]

    if (line.trim().startsWith("/*")) {
      inMultiLineComment = true
    }

    if (inMultiLineComment) {
      explanations.push({
        code: line,
        explanation: "This is a multi-line comment block, used for documentation or temporarily disabling code sections.",
        lineNumber: i + 1,
      })
      if (line.includes("*/")) {
        inMultiLineComment = false
      }
      continue
    }

    if (line.trim().startsWith("//")) {
      const comment = line.trim().slice(2).trim()
      explanations.push({
        code: line,
        explanation: `Inline comment: ${comment}. Comments are ignored during execution and serve as documentation for developers.`,
        lineNumber: i + 1,
      })
      continue
    }

    if (line.trim() === "" || line.trim() === "```") {
      continue
    }

    if (line.trim().startsWith("#")) {
      if (line.trim().startsWith("##")) {
        explanations.push({
          code: line,
          explanation: "Markdown heading level 2 - used to structure documentation with subsections.",
          lineNumber: i + 1,
        })
      } else {
        explanations.push({
          code: line,
          explanation: "Markdown heading level 1 - represents the main title or primary section heading in documentation.",
          lineNumber: i + 1,
        })
      }
      continue
    }

    let explanation = "This line executes as part of the program flow. It contributes to the overall logic and functionality of the code."

    for (const [keyword, kwExplanation] of Object.entries(keywordExplanations)) {
      if (line.match(new RegExp(`\\b${keyword}\\b`))) {
        explanation = kwExplanation
        break
      }
    }

    if (line.includes("=>") || line.includes("=>")) {
      explanation = "Arrow function expression: a concise syntax for writing functions. It has a lexical 'this' binding, meaning it inherits 'this' from the enclosing scope."
    }

    if (line.match(/\.\w+\(/)) {
      explanation = "Method call: invoking a function that belongs to an object. The dot operator accesses properties and methods of an object."
    }

    if (line.match(/\[\s*\]/)) {
      explanation = "Array literal: creates a new array using bracket notation. Arrays are ordered, zero-indexed collections that can hold mixed types."
    }

    if (line.match(/{\s*}/)) {
      explanation = "Object literal or code block: curly braces define either an object with key-value pairs or a block of statements for control flow."
    }

    if (line.includes("=") && !line.includes("==") && !line.includes("===") && !line.includes("=>")) {
      explanation = "Assignment operator: assigns the value on the right side to the variable or property on the left side."
    }

    if (line.includes("===") || line.includes("==")) {
      explanation = "Comparison operator: compares two values. Triple equals (===) checks both value and type (strict equality), while double equals (==) performs type coercion."
    }

    if (line.includes("Promise") || line.includes(".then(") || line.includes(".catch(")) {
      explanation = "Promise handling: Promises represent asynchronous operations. .then() handles resolution, .catch() handles rejection, enabling cleaner async code."
    }

    if (line.includes("<") && line.includes(">") && !line.includes("=")) {
      explanation = "JSX/TSX element: React's syntax extension that looks like HTML but compiles to JavaScript function calls. Defines UI components declaratively."
    }

    explanations.push({
      code: line,
      explanation,
      lineNumber: i + 1,
    })
  }

  return {
    lines: explanations,
    overview: `This ${language} code defines a program that processes data through a series of operations. The code demonstrates key programming concepts including variable declarations, control flow, function definitions, and data manipulation. It follows standard ${language} conventions and patterns for readability and maintainability.`,
  }
}

export function CodeExplainer() {
  const [code, setCode] = React.useState("")
  const [language, setLanguage] = React.useState<(typeof LANGUAGES)[number]>("JavaScript")
  const [loading, setLoading] = React.useState(false)
  const [explanation, setExplanation] = React.useState<{ lines: { code: string; explanation: string; lineNumber: number }[]; overview: string } | null>(null)
  const [copied, setCopied] = React.useState(false)

  const handleExplain = React.useCallback(async () => {
    if (!code.trim()) {
      toast.error("Please enter code to explain")
      return
    }

    setLoading(true)
    await new Promise((r) => setTimeout(r, 1200 + Math.random() * 1500))
    const result = generateExplanation(code, language)
    setExplanation(result)
    setLoading(false)
    toast.success(`Explained ${result.lines.length} lines`)
  }, [code, language])

  const handleCopy = React.useCallback(async () => {
    if (!explanation) return
    const text = `## Code Overview\n\n${explanation.overview}\n\n## Line-by-Line Explanation\n\n${explanation.lines.map(l => `Line ${l.lineNumber}: ${l.code.trim()}\n${l.explanation}\n`).join("\n")}`
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
          <p className="text-sm text-muted-foreground">Understand code with AI explanations</p>
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
                  {copied ? (
                    <><Check className="h-3.5 w-3.5 text-emerald-500" /> Copied</>
                  ) : (
                    <><Copy className="h-3.5 w-3.5" /> Copy</>
                  )}
                </motion.button>
              </div>
              <div className="p-5">
                <p className="text-sm text-foreground leading-relaxed">{explanation.overview}</p>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              <div className="border-b border-border px-5 py-3">
                <span className="text-sm font-medium text-foreground">
                  Line-by-Line Explanation ({explanation.lines.length} lines)
                </span>
              </div>
              <div className="divide-y divide-border">
                {explanation.lines.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
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
                        <p className="text-sm text-foreground/80 leading-relaxed">
                          {item.explanation}
                        </p>
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
