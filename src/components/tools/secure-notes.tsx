"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils/cn"
import {
  StickyNote,
  Plus,
  Trash2,
  Lock,
  Unlock,
  Search,
  Clock,
  Eye,
  EyeOff,
  FileText,
} from "lucide-react"

interface SecureNote {
  id: string
  title: string
  content: string
  locked: boolean
  password: string
  createdAt: number
  updatedAt: number
}

const STORAGE_KEY = "secure-notes"
const AUTO_LOCK_MS = 5 * 60 * 1000

function loadNotes(): SecureNote[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function saveNotes(notes: SecureNote[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes))
}

export function SecureNotes() {
  const [notes, setNotes] = React.useState<SecureNote[]>([])
  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const [title, setTitle] = React.useState("")
  const [content, setContent] = React.useState("")
  const [search, setSearch] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [lockedView, setLockedView] = React.useState(true)
  const [unlockPw, setUnlockPw] = React.useState("")
  const [unlockError, setUnlockError] = React.useState("")
  const [lastActivity, setLastActivity] = React.useState(Date.now())

  React.useEffect(() => {
    setNotes(loadNotes())
  }, [])

  React.useEffect(() => {
    saveNotes(notes)
  }, [notes])

  // Auto-lock
  React.useEffect(() => {
    const interval = setInterval(() => {
      if (Date.now() - lastActivity > AUTO_LOCK_MS) {
        setNotes((prev) =>
          prev.map((n) => (n.locked ? n : { ...n, locked: true }))
        )
      }
    }, 10000)
    return () => clearInterval(interval)
  }, [lastActivity])

  const selected = notes.find((n) => n.id === selectedId)

  const createNote = () => {
    const id = crypto.randomUUID()
    const newNote: SecureNote = {
      id,
      title: "Untitled Note",
      content: "",
      locked: !!password,
      password: password || "",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    setNotes((prev) => [newNote, ...prev])
    setSelectedId(id)
    setTitle("Untitled Note")
    setContent("")
    setLockedView(!!password)
    setPassword("")
  }

  const updateNote = (id: string, updates: Partial<SecureNote>) => {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, ...updates, updatedAt: Date.now() } : n
      )
    )
    setLastActivity(Date.now())
  }

  const deleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id))
    if (selectedId === id) {
      setSelectedId(null)
      setTitle("")
      setContent("")
    }
  }

  const toggleLock = (id: string) => {
    const note = notes.find((n) => n.id === id)
    if (!note) return

    if (note.locked) {
      setUnlockPw("")
      setUnlockError("")
      setLockedView(true)
    } else {
      updateNote(id, { locked: true })
    }
  }

  const handleUnlock = (id: string) => {
    const note = notes.find((n) => n.id === id)
    if (!note) return

    if (unlockPw === note.password) {
      updateNote(id, { locked: false })
      setLockedView(false)
      setUnlockError("")
      setUnlockPw("")
    } else {
      setUnlockError("Wrong password")
    }
  }

  const selectNote = (id: string) => {
    const note = notes.find((n) => n.id === id)
    if (!note) return
    setSelectedId(id)
    setTitle(note.title)
    setContent(note.content)
    if (note.locked) {
      setLockedView(true)
      setUnlockPw("")
      setUnlockError("")
    } else {
      setLockedView(false)
    }
    setLastActivity(Date.now())
  }

  const filteredNotes = notes.filter((n) =>
    n.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10">
          <StickyNote className="h-5 w-5 text-cyan-500" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Secure Notes</h2>
          <p className="text-sm text-muted-foreground">Password-protected notes with auto-lock</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Sidebar */}
        <div className="md:col-span-1 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notes..."
              className="w-full h-10 rounded-lg border border-input bg-background pl-9 pr-3 text-sm text-foreground placeholder-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <button
            onClick={() => {
              const pw = prompt("Set a password for this note (leave blank for no password):")
              if (pw !== null) {
                setPassword(pw || "")
                createNote()
              }
            }}
            className="flex items-center justify-center gap-2 w-full h-10 rounded-lg bg-cyan-500/10 text-cyan-500 hover:bg-cyan-500/20 transition-colors text-sm font-medium"
          >
            <Plus className="h-4 w-4" />
            New Note
          </button>

          <div className="space-y-1 max-h-[500px] overflow-y-auto">
            <AnimatePresence>
              {filteredNotes.map((note) => (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  onClick={() => selectNote(note.id)}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all",
                    selectedId === note.id
                      ? "border-cyan-500/30 bg-cyan-500/5"
                      : "border-border hover:bg-accent/50"
                  )}
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                    {note.locked ? (
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <FileText className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {note.locked ? "🔒 Locked note" : note.title || "Untitled"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(note.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {filteredNotes.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">
                {search ? "No notes found" : "No notes yet"}
              </p>
            )}
          </div>
        </div>

        {/* Editor */}
        <div className="md:col-span-2">
          <AnimatePresence mode="wait">
            {selected ? (
              <motion.div
                key={selected.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-xl border border-border bg-card p-5 space-y-4 min-h-[400px]"
              >
                {selected.locked && lockedView ? (
                  <div className="flex flex-col items-center justify-center gap-4 py-12">
                    <Lock className="h-12 w-12 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">This note is password protected</p>
                    <div className="w-full max-w-xs space-y-3">
                      <input
                        type="password"
                        value={unlockPw}
                        onChange={(e) => setUnlockPw(e.target.value)}
                        placeholder="Enter note password"
                        className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        onKeyDown={(e) => e.key === "Enter" && handleUnlock(selected.id)}
                      />
                      {unlockError && (
                        <p className="text-sm text-destructive text-center">{unlockError}</p>
                      )}
                      <button
                        onClick={() => handleUnlock(selected.id)}
                        className="w-full h-10 rounded-lg bg-cyan-500/10 text-cyan-500 hover:bg-cyan-500/20 transition-colors text-sm font-medium"
                      >
                        <Unlock className="h-4 w-4 inline mr-2" />
                        Unlock
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between gap-3">
                      <input
                        value={title}
                        onChange={(e) => {
                          setTitle(e.target.value)
                          updateNote(selected.id, { title: e.target.value })
                        }}
                        placeholder="Note title..."
                        className="flex-1 h-10 bg-transparent text-lg font-semibold text-foreground border-none outline-none placeholder-muted-foreground"
                      />
                      <div className="flex gap-1 shrink-0">
                        <button
                          onClick={() => toggleLock(selected.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                        >
                          <Lock className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteNote(selected.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <textarea
                      value={content}
                      onChange={(e) => {
                        setContent(e.target.value)
                        updateNote(selected.id, { content: e.target.value })
                      }}
                      placeholder="Start writing..."
                      rows={14}
                      className="w-full resize-y rounded-xl border border-border bg-background p-4 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all"
                    />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Updated {new Date(selected.updatedAt).toLocaleString()}
                      </span>
                      <span>{content.length} characters</span>
                    </div>
                  </>
                )}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-muted/20 px-6 py-16 text-center"
              >
                <StickyNote className="h-10 w-10 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Select a note or create a new one</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
