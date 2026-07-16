"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils/cn"
import { Plus, Trash2, Search, Pin, PinOff, StickyNote } from "lucide-react"

interface Note { id: string; title: string; content: string; color: string; pinned: boolean; updatedAt: number }

const COLORS = ["#fef3c7", "#dbeafe", "#e0e7ff", "#d1fae5", "#fce7f3", "#fff", "#1e293b"]

export function Notes() {
  const [notes, setNotes] = React.useState<Note[]>(() => {
    try { return JSON.parse(localStorage.getItem("app-notes") || "[]") } catch { return [] }
  })
  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const [search, setSearch] = React.useState("")

  const selected = notes.find(n => n.id === selectedId) || notes[0]

  React.useEffect(() => { localStorage.setItem("app-notes", JSON.stringify(notes)) }, [notes])
  React.useEffect(() => { if (!selectedId && notes.length > 0) setSelectedId(notes[0].id) }, [notes, selectedId])

  const addNote = () => {
    const note: Note = { id: crypto.randomUUID(), title: "Untitled Note", content: "", color: COLORS[5], pinned: false, updatedAt: Date.now() }
    setNotes([note, ...notes])
    setSelectedId(note.id)
  }

  const deleteNote = (id: string) => {
    setNotes(notes.filter(n => n.id !== id))
    if (selectedId === id) setSelectedId(notes.filter(n => n.id !== id)[0]?.id || null)
  }

  const updateNote = (id: string, field: keyof Note, value: any) => {
    setNotes(notes.map(n => n.id === id ? { ...n, [field]: value, updatedAt: Date.now() } : n))
  }

  const togglePin = (id: string) => {
    setNotes(notes.map(n => n.id === id ? { ...n, pinned: !n.pinned, updatedAt: Date.now() } : n))
  }

  const filteredNotes = notes
    .filter(n => n.title.toLowerCase().includes(search.toLowerCase()) || n.content.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
      return b.updatedAt - a.updatedAt
    })

  const formatTime = (ts: number) => new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div className="flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10"><StickyNote className="h-6 w-6 text-amber-500" /></div><div><h1 className="text-2xl font-bold text-foreground">Notes</h1><p className="text-sm text-muted-foreground">Take and manage notes</p></div></div>
        <Button variant="primary" size="sm" onClick={addNote}><Plus className="mr-1 h-4 w-4" />New Note</Button>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-[280px,1fr]">
        <div className="space-y-3">
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search notes..." icon={<Search className="h-4 w-4" />} />
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {filteredNotes.map(note => (
              <div key={note.id} onClick={() => setSelectedId(note.id)} className={cn("group cursor-pointer rounded-lg border p-3 transition-colors", selectedId === note.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50")} style={{ backgroundColor: note.color === "#fff" ? undefined : note.color === "#1e293b" ? "#1e293b" : note.color }}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm font-medium truncate", note.color === "#1e293b" ? "text-white" : "text-foreground")}>{note.title}</p>
                    <p className={cn("text-xs truncate mt-0.5", note.color === "#1e293b" ? "text-gray-400" : "text-muted-foreground")}>{note.content || "Empty note"}</p>
                  </div>
                  <div className="flex shrink-0 gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => { e.stopPropagation(); togglePin(note.id) }} className={cn("h-6 w-6 rounded text-muted-foreground hover:text-foreground", note.pinned && "text-primary")}><Pin className={cn("h-3.5 w-3.5", note.pinned && "fill-current")} /></button>
                    <button onClick={(e) => { e.stopPropagation(); deleteNote(note.id) }} className="h-6 w-6 rounded text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
                <p className={cn("text-[10px] mt-1", note.color === "#1e293b" ? "text-gray-500" : "text-muted-foreground")}>{formatTime(note.updatedAt)}</p>
              </div>
            ))}
          </div>
        </div>

        <Card className="overflow-hidden">
          {selected ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-border p-4">
                <div className="flex-1"><input value={selected.title} onChange={(e) => updateNote(selected.id, "title", e.target.value)} className="w-full bg-transparent text-lg font-semibold text-foreground outline-none" placeholder="Note title" /></div>
                <div className="flex items-center gap-1">
                  {COLORS.map(c => (<button key={c} onClick={() => updateNote(selected.id, "color", c)} className={cn("h-5 w-5 rounded-full border-2 transition-all", selected.color === c ? "border-foreground scale-110" : "border-transparent")} style={{ backgroundColor: c, border: c === "#fff" ? "2px solid #e2e8f0" : undefined }} />))}
                </div>
              </div>
              <div className="p-4">
                <textarea value={selected.content} onChange={(e) => updateNote(selected.id, "content", e.target.value)} className="w-full min-h-[400px] resize-y bg-transparent text-sm text-foreground outline-none leading-relaxed" placeholder="Start writing..." />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center text-sm text-muted-foreground"><StickyNote className="mb-3 h-10 w-10 opacity-50" /><p>Create a note to get started</p></div>
          )}
        </Card>
      </div>
    </div>
  )
}
