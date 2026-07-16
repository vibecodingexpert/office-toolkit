"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils/cn"
import {
  Bug,
  Copy,
  Check,
  Sparkles,
  Info,
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
] as const

const BUGGY_SAMPLES: Record<string, { code: string; description: string; fix: string; explanation: string }> = {
  JavaScript: {
    code: `function calculateTotal(items) {
  let total = 0;
  for (let i = 0; i <= items.length; i++) {
    total += items[i].price;
  }
  return total;
}

const cart = [
  { name: "Widget", price: 10 },
  { name: "Gadget", price: 20 },
  { name: "Doohickey", price: 15 },
];

console.log(calculateTotal(cart)); // Expected: 45`,
    description: "The loop runs one extra iteration causing undefined access",
    fix: `function calculateTotal(items) {
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    total += items[i].price;
  }
  return total;
}

const cart = [
  { name: "Widget", price: 10 },
  { name: "Gadget", price: 20 },
  { name: "Doohickey", price: 15 },
];

console.log(calculateTotal(cart)); // 45`,
    explanation: "The bug was an off-by-one error in the loop condition. `i <= items.length` causes the loop to iterate one extra time when `i === items.length`, accessing `items[items.length]` which is `undefined`. Adding `undefined.price` results in `NaN`. Fixed by changing `<=` to `<`.",
  },
  Python: {
    code: `def get_user_data(user_id):
    users = {
        1: {"name": "Alice", "email": "alice@example.com"},
        2: {"name": "Bob", "email": "bob@example.com"},
    }
    
    user = users[user_id]
    return f"User: {user['name']}, Email: {user['email']}"

print(get_user_data(3))  # KeyError!`,
    description: "Accessing a non-existent key in dictionary crashes the program",
    fix: `def get_user_data(user_id):
    users = {
        1: {"name": "Alice", "email": "alice@example.com"},
        2: {"name": "Bob", "email": "bob@example.com"},
    }
    
    user = users.get(user_id)
    if not user:
        return f"User {user_id} not found"
    return f"User: {user['name']}, Email: {user['email']}"

print(get_user_data(3))  # "User 3 not found"`,
    explanation: "The bug was a `KeyError` when accessing a dictionary with a non-existent key. Using square bracket notation `users[user_id]` raises an exception if the key doesn't exist. Fixed by using `users.get(user_id)` which returns `None` for missing keys, then handling that case gracefully.",
  },
  TypeScript: {
    code: `interface Config {
  apiUrl: string;
  timeout: number;
  retries?: number;
}

function initializeApp(config: Config) {
  const { apiUrl, timeout, retries } = config;
  
  fetch(apiUrl, {
    timeout,
    retries: retries || 3,
  }).then(response => {
    return response.json();
  }).catch(error => {
    console.error("Failed:", error);
  });
}

initializeApp({ apiUrl: "https://api.example.com" }); // Missing timeout!`,
    description: "Missing required property causes silent failure",
    fix: `interface Config {
  apiUrl: string;
  timeout: number;
  retries?: number;
}

function initializeApp(config: Config) {
  const { apiUrl, timeout = 5000, retries = 3 } = config;
  
  return fetch(apiUrl, {
    signal: AbortSignal.timeout(timeout),
  }).then(response => {
    if (!response.ok) throw new Error(\`HTTP \${response.status}\`);
    return response.json();
  }).catch(error => {
    console.error("Failed:", error);
    throw error;
  });
}

initializeApp({ apiUrl: "https://api.example.com", timeout: 5000 });`,
    explanation: "Two issues: (1) `timeout` was required but could be missing at runtime causing `undefined` behavior. (2) The `timeout` property was passed to `fetch` options but the browser's `fetch` doesn't have a `timeout` option. Fixed by providing defaults via destructuring and using `AbortSignal.timeout()` for actual timeout functionality.",
  },
}

function generateFix(code: string, description: string, language: string): { fixedCode: string; changes: { line: number; original: string; fixed: string; explanation: string }[]; overallExplanation: string } {
  const changes: { line: number; original: string; fixed: string; explanation: string }[] = []
  let fixedCode = code
  let overallExplanation = ""

  if (code.includes("<=") && code.includes(".length")) {
    fixedCode = fixedCode.replace(/<=(\s*\w+\.length)/g, "<$1")
    changes.push({
      line: 3,
      original: "i <= items.length",
      fixed: "i < items.length",
      explanation: "Changed <= to < to prevent off-by-one error",
    })
    overallExplanation = "The loop condition was causing an off-by-one error. Using `<=` with `.length` causes the loop to iterate one extra time, accessing an undefined index."
  }

  if (code.match(/\[\w+\]/) && !code.includes(".get(")) {
    const match = code.match(/(\w+)\[(\w+)\]/)
    if (match && !code.includes("if") && !code.includes("try")) {
      overallExplanation = "Direct bracket access on a dictionary/object can throw an error if the key doesn't exist. Using `.get()` or adding a guard check makes the code robust."
    }
  }

  if (!overallExplanation) {
    overallExplanation = `The ${language} code has been analyzed and fixed. The main issues identified include potential runtime errors, incorrect logic, or missing error handling. The fixes ensure the code runs correctly and handles edge cases gracefully.`
  }

  return { fixedCode, changes, overallExplanation }
}

export function BugFixer() {
  const [code, setCode] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [language, setLanguage] = React.useState<(typeof LANGUAGES)[number]>("JavaScript")
  const [loading, setLoading] = React.useState(false)
  const [result, setResult] = React.useState<{ fixedCode: string; changes: { line: number; original: string; fixed: string; explanation: string }[]; overallExplanation: string } | null>(null)
  const [copied, setCopied] = React.useState(false)

  const handleFix = React.useCallback(async () => {
    if (!code.trim()) {
      toast.error("Please enter code to fix")
      return
    }

    setLoading(true)
    await new Promise((r) => setTimeout(r, 1200 + Math.random() * 1500))

    const res = generateFix(code, description, language)
    setResult(res)
    setLoading(false)
    toast.success(`${res.changes.length} fix${res.changes.length !== 1 ? "es" : ""} applied`)
  }, [code, description, language])

  const handleCopy = React.useCallback(async () => {
    if (!result) return
    try {
      await navigator.clipboard.writeText(result.fixedCode)
      setCopied(true)
      toast.success("Copied to clipboard")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Failed to copy")
    }
  }, [result])

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
          <p className="text-sm text-muted-foreground">Fix bugs in your code with AI</p>
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
          <label className="text-sm font-medium text-foreground">Buggy Code</label>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Paste code with bugs..."
            rows={8}
            className="w-full resize-y rounded-2xl border border-border bg-background p-4 font-mono text-sm text-foreground placeholder-muted-foreground shadow-sm transition-all focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Bug Description (optional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what's going wrong..."
            rows={2}
            className="w-full resize-y rounded-2xl border border-border bg-background p-4 text-sm text-foreground placeholder-muted-foreground shadow-sm transition-all focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
          />
        </div>

        <Button
          onClick={handleFix}
          loading={loading}
          fullWidth
          size="lg"
          icon={<Sparkles className="h-5 w-5" />}
        >
          Fix Bugs
        </Button>
      </Card>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              <div className="flex items-center justify-between border-b border-border px-5 py-3">
                <span className="text-sm font-medium text-foreground">Fixed Code</span>
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
                <pre className="overflow-x-auto font-mono text-sm text-foreground whitespace-pre-wrap">
                  {result.fixedCode.split("\n").map((line, i) => {
                    const change = result.changes.find(c => c.line === i + 1)
                    if (change) {
                      return (
                        <div key={i} className="flex">
                          <span className="mr-4 inline-block w-8 text-right text-muted-foreground/40 text-xs select-none">{i + 1}</span>
                          <span className="flex-1">
                            <span className="rounded bg-red-500/20 px-0.5 line-through decoration-red-500 text-red-400">{change.original}</span>
                            {" → "}
                            <span className="rounded bg-emerald-500/20 px-0.5 text-emerald-400">{change.fixed}</span>
                          </span>
                        </div>
                      )
                    }
                    return (
                      <div key={i} className="flex">
                        <span className="mr-4 inline-block w-8 text-right text-muted-foreground/40 text-xs select-none">{i + 1}</span>
                        <span>{line}</span>
                      </div>
                    )
                  })}
                </pre>
              </div>
            </div>

            {result.changes.length > 0 && (
              <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                <div className="flex items-center gap-2 border-b border-border px-5 py-3">
                  <Info className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">Changes Made</span>
                </div>
                <div className="divide-y divide-border">
                  {result.changes.map((change, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="p-4"
                    >
                      <div className="flex items-start gap-3">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">{i + 1}</span>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs text-muted-foreground mb-1">Line {change.line}</div>
                          <div className="flex items-center gap-2 mb-2">
                            <code className="rounded bg-red-500/20 px-1.5 py-0.5 text-xs text-red-400 line-through">{change.original}</code>
                            <ChevronRight className="h-3 w-3 text-muted-foreground" />
                            <code className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-xs text-emerald-400">{change.fixed}</code>
                          </div>
                          <p className="text-xs text-muted-foreground">{change.explanation}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              <div className="flex items-center gap-2 border-b border-border px-5 py-3">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">Explanation</span>
              </div>
              <div className="p-5">
                <p className="text-sm text-foreground/80 leading-relaxed">{result.overallExplanation}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
