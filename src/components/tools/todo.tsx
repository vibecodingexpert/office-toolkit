"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils/cn"
import { CheckSquare, Plus, Trash2, Circle, CheckCircle2, ListTodo } from "lucide-react"

interface TodoItem { id: string; text: string; completed: boolean; createdAt: number }

export function Todo() {
  const [todos, setTodos] = React.useState<TodoItem[]>(() => {
    try { return JSON.parse(localStorage.getItem("todos") || "[]") } catch { return [] }
  })
  const [input, setInput] = React.useState("")
  const [filter, setFilter] = React.useState<"all" | "active" | "completed">("all")

  React.useEffect(() => { localStorage.setItem("todos", JSON.stringify(todos)) }, [todos])

  const addTodo = () => {
    if (!input.trim()) return
    setTodos([...todos, { id: crypto.randomUUID(), text: input.trim(), completed: false, createdAt: Date.now() }])
    setInput("")
  }

  const toggleTodo = (id: string) => setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t))
  const deleteTodo = (id: string) => setTodos(todos.filter(t => t.id !== id))
  const clearCompleted = () => setTodos(todos.filter(t => !t.completed))

  const filtered = todos.filter(t => {
    if (filter === "active") return !t.completed
    if (filter === "completed") return t.completed
    return true
  })

  const activeCount = todos.filter(t => !t.completed).length

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10"><ListTodo className="h-6 w-6 text-emerald-500" /></div>
        <div><h1 className="text-2xl font-bold text-foreground">Todo List</h1><p className="text-sm text-muted-foreground">Simple todo list manager</p></div>
      </motion.div>

      <Card>
        <div className="flex gap-2">
          <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Add a new todo..." onKeyDown={(e) => e.key === "Enter" && addTodo()} className="flex-1" />
          <Button variant="primary" onClick={addTodo} disabled={!input.trim()}><Plus className="h-4 w-4" /></Button>
        </div>
      </Card>

      <div className="flex items-center justify-between">
        <div className="flex gap-1 rounded-lg border border-border p-1">
          {(["all", "active", "completed"] as const).map(f => (<button key={f} onClick={() => setFilter(f)} className={cn("rounded-md px-3 py-1.5 text-xs font-medium transition-colors capitalize", filter === f ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>{f}</button>))}
        </div>
        <span className="text-sm text-muted-foreground">{activeCount} item{activeCount !== 1 ? "s" : ""} left</span>
      </div>

      <Card padding="none" className="overflow-hidden">
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-sm text-muted-foreground"><CheckSquare className="mb-3 h-8 w-8 opacity-50" /><p>Nothing here yet</p></div>
          ) : (
            <div className="divide-y divide-border">
              {filtered.map(todo => (
                <motion.div key={todo.id} layout initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="flex items-center gap-3 px-4 py-3 group hover:bg-accent/30 transition-colors">
                  <button onClick={() => toggleTodo(todo.id)} className="shrink-0 text-muted-foreground hover:text-primary transition-colors">
                    {todo.completed ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : <Circle className="h-5 w-5" />}
                  </button>
                  <span className={cn("flex-1 text-sm transition-all", todo.completed && "line-through text-muted-foreground")}>{todo.text}</span>
                  <motion.button whileHover={{ scale: 1.1 }} onClick={() => deleteTodo(todo.id)} className="shrink-0 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all">
                    <Trash2 className="h-4 w-4" />
                  </motion.button>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </Card>

      {todos.some(t => t.completed) && (
        <div className="flex justify-center">
          <Button variant="ghost" size="sm" onClick={clearCompleted}>Clear completed</Button>
        </div>
      )}
    </div>
  )
}
