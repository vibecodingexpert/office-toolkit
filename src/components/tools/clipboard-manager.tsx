"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils/cn"
import {
  Clipboard,
  Copy,
  Check,
  Trash2,
  Clock,
  Save,
  ClipboardList,
  Trash,
} from "lucide-react"

interface ClipboardItem {
  id: string
  content: string
  timestamp: number
}

const MAX_ITEMS = 50
const STORAGE_KEY = "clipboard-manager"

function loadHistory(): ClipboardItem[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function saveHistory(items: ClipboardItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export function ClipboardManager() {
  const [text, setText] = React.useState("")
  const [history, setHistory] = React.useState<ClipboardItem[]>([])
  const [copiedId, setCopiedId] = React.useState<string | null>(null)

  React.useEffect(() => {
    setHistory(loadHistory())
  }, [])

  React.useEffect(() => {
    saveHistory(history)
  }, [history])

  const saveToHistory = () => {
    if (!text.trim()) return
    const newItem: ClipboardItem = {
      id: crypto.randomUUID(),
      content: text.trim(),
      timestamp: Date.now(),
    }
    setHistory((prev) => [newItem, ...prev].slice(0, MAX_ITEMS))
    setText("")
  }

  const copyFromHistory = async (item: ClipboardItem) => {
    try {
      await navigator.clipboard.writeText(item.content)
      setCopiedId(item.id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch {}
  }

  const deleteItem = (id: string) => {
    setHistory((prev) => prev.filter((i) => i.id !== id))
  }

  const clearAll = () => {
    setHistory([])
    localStorage.removeItem(STORAGE_KEY)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
          <Clipboard className="h-5 w-5 text-amber-500" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Clipboard Manager</h2>
          <p className="text-sm text-muted-foreground">Save and manage clipboard history</p>
        </div>
      </div>

      {/* Input */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-3">
        <span className="text-sm font-medium">Current Clipboard</span>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type or paste content here..."
          rows={4}
          className="w-full resize-y rounded-xl border border-input bg-background p-4 text-sm text-foreground placeholder-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all"
        />
        <button
          onClick={saveToHistory}
          disabled={!text.trim()}
          className="flex items-center justify-center gap-2 w-full h-10 rounded-lg bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 transition-colors text-sm font-medium disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          Save to History
        </button>
      </div>

      {/* History */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">History ({history.length}/{MAX_ITEMS})</span>
          </div>
          {history.length > 0 && (
            <button
              onClick={clearAll}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
            >
              <Trash className="h-3.5 w-3.5" />
              Clear all
            </button>
          )}
        </div>

        <div className="space-y-1 max-h-96 overflow-y-auto">
          <AnimatePresence>
            {history.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="group flex items-start gap-3 p-3 rounded-xl border border-border hover:border-primary/30 hover:bg-accent/30 transition-all cursor-pointer"
                onClick={() => copyFromHistory(item)}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground break-all line-clamp-3">
                    {item.content}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {new Date(item.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => { e.stopPropagation(); copyFromHistory(item) }}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  >
                    {copiedId === item.id ? (
                      <Check className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteItem(item.id) }}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {history.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <Clipboard className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No clipboard history yet</p>
            <p className="text-xs text-muted-foreground">
              Save your first clipboard entry above
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
