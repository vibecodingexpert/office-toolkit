"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils/cn"
import { Plus, Trash2, GripVertical, ChevronRight, ChevronLeft, Clock, AlertCircle } from "lucide-react"

interface Task { id: string; title: string; description: string; priority: "low" | "medium" | "high"; dueDate: string; column: "todo" | "progress" | "done" }

const COLUMNS = [
  { id: "todo" as const, label: "To Do", color: "bg-blue-500/10 border-blue-500/30 text-blue-500" },
  { id: "progress" as const, label: "In Progress", color: "bg-amber-500/10 border-amber-500/30 text-amber-500" },
  { id: "done" as const, label: "Done", color: "bg-emerald-500/10 border-emerald-500/30 text-emerald-500" },
]

const PRIORITIES = [
  { value: "low", label: "Low", color: "text-emerald-500" },
  { value: "medium", label: "Medium", color: "text-amber-500" },
  { value: "high", label: "High", color: "text-destructive" },
]

export function TaskManager() {
  const [tasks, setTasks] = React.useState<Task[]>(() => {
    try { return JSON.parse(localStorage.getItem("tasks") || "[]") } catch { return [] }
  })
  const [newTask, setNewTask] = React.useState({ title: "", description: "", priority: "medium" as Task["priority"], dueDate: "", column: "todo" as Task["column"] })
  const [editingId, setEditingId] = React.useState<string | null>(null)

  React.useEffect(() => { localStorage.setItem("tasks", JSON.stringify(tasks)) }, [tasks])

  const addTask = () => {
    if (!newTask.title.trim()) { toast.error("Enter a task title"); return }
    setTasks([...tasks, { id: crypto.randomUUID(), ...newTask }])
    setNewTask({ title: "", description: "", priority: "medium", dueDate: "", column: "todo" })
    toast.success("Task added")
  }

  const deleteTask = (id: string) => { setTasks(tasks.filter(t => t.id !== id)); toast.success("Task deleted") }
  const moveTask = (id: string, to: Task["column"]) => { setTasks(tasks.map(t => t.id === id ? { ...t, column: to } : t)) }

  const getColumnTasks = (col: Task["column"]) => tasks.filter(t => t.column === col)

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-6"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10"><Clock className="h-6 w-6 text-indigo-500" /></div><div><h1 className="text-2xl font-bold text-foreground">Task Manager</h1><p className="text-sm text-muted-foreground">Manage your tasks</p></div></div>
        <Card><div className="grid gap-4 sm:grid-cols-5">
          <div className="sm:col-span-2"><Input label="Task Title" value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} placeholder="What needs to be done?" /></div>
          <Input label="Description" value={newTask.description} onChange={(e) => setNewTask({ ...newTask, description: e.target.value })} placeholder="Brief description" />
          <div className="space-y-2"><label className="text-sm font-medium text-foreground">Priority</label><select value={newTask.priority} onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as Task["priority"] })} className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">{PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}</select></div>
          <div className="flex items-end"><Button variant="primary" size="md" fullWidth onClick={addTask}><Plus className="mr-1 h-4 w-4" />Add Task</Button></div>
        </div></Card>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-3">
        {COLUMNS.map(col => {
          const colTasks = getColumnTasks(col.id)
          return (
            <Card key={col.id} className="overflow-hidden" padding="none">
              <div className={cn("flex items-center justify-between border-b px-4 py-3", col.color.split(" ")[1])}>
                <div className="flex items-center gap-2"><div className={cn("h-2.5 w-2.5 rounded-full", col.color.split(" ")[0].replace("bg-", "bg-"))} /><span className="text-sm font-semibold">{col.label}</span></div>
                <span className="text-xs font-medium opacity-70">{colTasks.length}</span>
              </div>
              <div className="space-y-2 p-3 min-h-[200px] max-h-[500px] overflow-y-auto">
                {colTasks.map(task => (
                  <motion.div key={task.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="group rounded-lg border border-border bg-card p-3 shadow-sm">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0"><p className="text-sm font-medium text-foreground truncate">{task.title}</p>
                        {task.description && <p className="text-xs text-muted-foreground mt-0.5 truncate">{task.description}</p>}
                        <div className="flex items-center gap-2 mt-2">
                          <span className={cn("text-[10px] font-medium", PRIORITIES.find(p => p.value === task.priority)?.color)}>{task.priority}</span>
                          {task.dueDate && <span className="text-[10px] text-muted-foreground">{new Date(task.dueDate).toLocaleDateString()}</span>}
                        </div>
                      </div>
                      <div className="flex shrink-0 gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        {col.id !== "todo" && <button onClick={() => moveTask(task.id, "todo")} className="h-7 w-7 rounded text-muted-foreground hover:text-foreground hover:bg-accent"><ChevronLeft className="h-3.5 w-3.5 mx-auto" /></button>}
                        {col.id !== "done" && <button onClick={() => moveTask(task.id, "done")} className="h-7 w-7 rounded text-muted-foreground hover:text-foreground hover:bg-accent"><ChevronRight className="h-3.5 w-3.5 mx-auto" /></button>}
                        <button onClick={() => deleteTask(task.id)} className="h-7 w-7 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10"><Trash2 className="h-3.5 w-3.5 mx-auto" /></button>
                      </div>
                    </div>
                  </motion.div>
                ))}
                {colTasks.length === 0 && <div className="flex flex-col items-center justify-center py-8 text-sm text-muted-foreground"><AlertCircle className="h-6 w-6 mb-2 opacity-50" /><span>No tasks</span></div>}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
