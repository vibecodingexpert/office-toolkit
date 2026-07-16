"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { toast } from "@/components/ui/toast"
import { Copy, Check, Database, RotateCcw, ListIndentIncrease } from "lucide-react"

const SQL_KEYWORDS = [
  "SELECT", "FROM", "WHERE", "INSERT", "INTO", "VALUES", "UPDATE", "SET",
  "DELETE", "CREATE", "TABLE", "ALTER", "DROP", "INDEX", "VIEW", "JOIN",
  "LEFT", "RIGHT", "INNER", "OUTER", "CROSS", "ON", "AND", "OR", "NOT",
  "IN", "IS", "NULL", "AS", "LIKE", "BETWEEN", "EXISTS", "UNION", "ALL",
  "DISTINCT", "COUNT", "SUM", "AVG", "MIN", "MAX", "GROUP", "BY", "ORDER",
  "HAVING", "LIMIT", "OFFSET", "CASE", "WHEN", "THEN", "ELSE", "END",
  "ASC", "DESC", "WITH", "RECURSIVE", "PRIMARY", "KEY", "FOREIGN", "REFERENCES",
  "CONSTRAINT", "DEFAULT", "CHECK", "UNIQUE", "CASCADE", "IF", "ELSE",
  "BEGIN", "COMMIT", "ROLLBACK", "TRANSACTION", "GRANT", "REVOKE",
]

function formatSql(sql: string): string {
  let depth = 0
  const lines = sql
    .replace(/\s+/g, " ")
    .replace(/\s*([,()])\s*/g, "$1 ")
    .replace(/\s*;\s*/g, "; ")
    .trim()
    .split(/(\b(?:SELECT|FROM|WHERE|INSERT|INTO|VALUES|UPDATE|SET|DELETE|CREATE|ALTER|DROP|JOIN|LEFT|RIGHT|INNER|OUTER|CROSS|ON|AND|OR|GROUP|BY|ORDER|HAVING|LIMIT|OFFSET|UNION|CASE|WHEN|THEN|ELSE|END|BEGIN|COMMIT|ROLLBACK)\b)/gi)
    .filter(Boolean)

  const formatted: string[] = []
  for (let i = 0; i < lines.length; i++) {
    const token = lines[i].trim()
    const upper = token.toUpperCase()

    if (["SELECT", "INSERT", "UPDATE", "DELETE", "CREATE", "ALTER", "DROP"].includes(upper)) {
      if (formatted.length > 0) formatted.push("")
      formatted.push(token)
    } else if (["FROM", "WHERE", "SET", "VALUES", "JOIN", "LEFT", "RIGHT", "INNER", "OUTER", "CROSS", "ON", "AND", "OR", "GROUP", "ORDER", "HAVING", "LIMIT", "OFFSET", "UNION"].includes(upper)) {
      formatted.push(`  ${token}`)
    } else if (upper === "BY" || upper === "THEN" || upper === "ELSE") {
      formatted[formatted.length - 1] += ` ${token}`
    } else if (upper === "WHEN" || upper === "CASE") {
      formatted.push(`  ${token}`)
    } else {
      if (formatted.length > 0) {
        formatted[formatted.length - 1] += ` ${token}`
      } else {
        formatted.push(token)
      }
    }
  }

  return formatted.join("\n")
}

function highlightSql(text: string): React.ReactNode {
  const keywordPattern = new RegExp(
    `\\b(${SQL_KEYWORDS.join("|")})\\b`,
    "gi"
  )
  const stringPattern = /('[^']*')/g
  const numberPattern = /\b(\d+(?:\.\d+)?)\b/g
  const commentPattern = /(--.*$|\/\*[\s\S]*?\*\/)/gm

  const parts: { value: string; color: string }[] = []
  let remaining = text

  const tokenize = (str: string) => {
    const tokens: { value: string; color: string }[] = []
    let lastIdx = 0

    const combined = new RegExp(
      `(${SQL_KEYWORDS.join("|")})|('[^']*')|(--[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/)|\\b(\\d+(?:\\.\\d+)?)\\b`,
      "gi"
    )

    str.replace(combined, (match, keyword, strLit, comment, num, offset) => {
      if (offset > lastIdx) {
        tokens.push({ value: str.slice(lastIdx, offset), color: "text-foreground" })
      }
      if (keyword) {
        tokens.push({ value: match, color: "text-blue-600 dark:text-blue-400 font-semibold" })
      } else if (strLit) {
        tokens.push({ value: match, color: "text-emerald-600 dark:text-emerald-400" })
      } else if (comment) {
        tokens.push({ value: match, color: "text-muted-foreground italic" })
      } else if (num) {
        tokens.push({ value: match, color: "text-amber-600 dark:text-amber-400" })
      }
      lastIdx = offset + match.length
      return match
    })

    if (lastIdx < str.length) {
      tokens.push({ value: str.slice(lastIdx), color: "text-foreground" })
    }
    return tokens
  }

  const toks = tokenize(text)
  return toks.map((t, i) => (
    <span key={i} className={t.color}>
      {t.value}
    </span>
  ))
}

export function SqlFormatter() {
  const [input, setInput] = React.useState("")
  const [output, setOutput] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [copied, setCopied] = React.useState(false)

  const handleFormat = React.useCallback(() => {
    if (!input.trim()) {
      toast.error("Please enter SQL to format")
      return
    }
    setLoading(true)
    setTimeout(() => {
      try {
        const formatted = formatSql(input)
        setOutput(formatted)
        setLoading(false)
      } catch {
        toast.error("Failed to format SQL")
        setLoading(false)
      }
    }, 200)
  }, [input])

  const handleCopy = React.useCallback(async () => {
    if (!output) return
    try {
      await navigator.clipboard.writeText(output)
      setCopied(true)
      toast.success("Copied to clipboard")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Failed to copy")
    }
  }, [output])

  const handleClear = React.useCallback(() => {
    setInput("")
    setOutput("")
  }, [])

  return (
    <Card className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Database className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">SQL Formatter</h2>
          <p className="text-sm text-muted-foreground">
            Format and beautify SQL queries with syntax highlighting
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">SQL Input</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste your SQL query here..."
          rows={6}
          className="w-full resize-y rounded-xl border border-border bg-background p-4 text-sm text-foreground placeholder-muted-foreground shadow-sm font-mono transition-all focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <Button
          onClick={handleFormat}
          loading={loading}
          icon={<ListIndentIncrease className="h-4 w-4" />}
        >
          Format SQL
        </Button>
        {input && (
          <Button variant="ghost" onClick={handleClear} icon={<RotateCcw className="h-4 w-4" />}>
            Clear
          </Button>
        )}
      </div>

      {output && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">Formatted SQL</label>
            <button
              onClick={handleCopy}
              className="flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  Copy
                </>
              )}
            </button>
          </div>
          <div className="rounded-xl border border-border bg-muted/30 p-4 overflow-auto max-h-96">
            <pre className="whitespace-pre-wrap text-sm font-mono leading-relaxed">
              {highlightSql(output)}
            </pre>
          </div>
        </motion.div>
      )}
    </Card>
  )
}
