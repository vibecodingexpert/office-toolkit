"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { cn } from "@/lib/utils/cn"
import { ChevronLeft, ChevronRight, Plus, Trash2, Calendar as CalendarIcon } from "lucide-react"
import type { Tool } from "@/types"

interface CalendarEvent { id: string; date: string; title: string; time: string; color: string }

const COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#ec4899", "#06b6d4"]

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export function Calendar({ tool }: { tool: Tool }) {
  const todayDate = new Date()
  const [currentMonth, setCurrentMonth] = React.useState(todayDate.getMonth())
  const [currentYear, setCurrentYear] = React.useState(todayDate.getFullYear())
  const [selectedDate, setSelectedDate] = React.useState(todayDate.toISOString().split("T")[0])
  const [events, setEvents] = React.useState<CalendarEvent[]>([])
  const [showAdd, setShowAdd] = React.useState(false)
  const [eventTitle, setEventTitle] = React.useState("")
  const [eventTime, setEventTime] = React.useState("09:00")
  const [eventColor, setEventColor] = React.useState(COLORS[0])

  React.useEffect(() => {
    try {
      const saved = localStorage.getItem("otp-calendar-events")
      if (saved) setEvents(JSON.parse(saved))
    } catch {}
  }, [])

  React.useEffect(() => {
    localStorage.setItem("otp-calendar-events", JSON.stringify(events))
  }, [events])

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const firstDay = new Date(currentYear, currentMonth, 1).getDay()

  const goToday = () => {
    setCurrentMonth(todayDate.getMonth())
    setCurrentYear(todayDate.getFullYear())
    setSelectedDate(todayDate.toISOString().split("T")[0])
  }

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear((y) => y - 1) }
    else setCurrentMonth((m) => m - 1)
  }

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear((y) => y + 1) }
    else setCurrentMonth((m) => m + 1)
  }

  const addEvent = () => {
    if (!eventTitle.trim()) { toast.error("Please enter an event title"); return }
    const newEvent: CalendarEvent = {
      id: crypto.randomUUID?.() || Date.now().toString(),
      date: selectedDate,
      title: eventTitle.trim(),
      time: eventTime,
      color: eventColor,
    }
    setEvents((prev) => [...prev, newEvent])
    setEventTitle(""); setShowAdd(false)
    toast.success("Event added")
  }

  const deleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id))
    toast.success("Event deleted")
  }

  const dayEvents = events.filter((e) => e.date === selectedDate)

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="flex items-center gap-4">
          <CalendarIcon className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Calendar</h1>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <Card className="p-4 sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={prevMonth}><ChevronLeft className="h-4 w-4" /></Button>
                <Button variant="outline" size="sm" onClick={nextMonth}><ChevronRight className="h-4 w-4" /></Button>
              </div>
              <h2 className="text-lg font-semibold">{MONTHS[currentMonth]} {currentYear}</h2>
              <Button variant="outline" size="sm" onClick={goToday}>Today</Button>
            </div>

            <div className="grid grid-cols-7 gap-px">
              {DAYS.map((d) => (
                <div key={d} className="p-2 text-center text-xs font-medium text-muted-foreground">{d}</div>
              ))}
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} className="min-h-[80px] border border-border/50 bg-muted/20" />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1
                const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
                const isToday = dateStr === todayDate.toISOString().split("T")[0]
                const isSelected = dateStr === selectedDate
                const dayEvents = events.filter((e) => e.date === dateStr)
                return (
                  <div
                    key={dateStr}
                    onClick={() => setSelectedDate(dateStr)}
                    className={cn(
                      "min-h-[80px] cursor-pointer border-r border-b border-border p-1.5 transition-colors hover:bg-accent/50",
                      isSelected && "bg-accent ring-2 ring-inset ring-primary",
                      isToday && "font-bold"
                    )}
                  >
                    <span className={cn(
                      "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs",
                      isToday && "bg-primary text-primary-foreground"
                    )}>{day}</span>
                    <div className="mt-1 space-y-0.5">
                      {dayEvents.slice(0, 3).map((e) => (
                        <div key={e.id} className="h-1.5 w-full rounded-full" style={{ backgroundColor: e.color }} />
                      ))}
                      {dayEvents.length > 3 && <span className="text-[10px] text-muted-foreground">+{dayEvents.length - 3} more</span>}
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>

          <div className="space-y-4">
            <Card className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold text-foreground">
                  {new Date(selectedDate).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                </h3>
                <Button variant="outline" size="sm" onClick={() => setShowAdd(true)}>
                  <Plus className="mr-1 h-3 w-3" /> Add
                </Button>
              </div>

              <AnimatePresence mode="wait">
                {dayEvents.length === 0 ? (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-8 text-center text-sm text-muted-foreground">
                    No events for this day
                  </motion.p>
                ) : (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                    {dayEvents.map((e) => (
                      <div key={e.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                        <div className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: e.color }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{e.title}</p>
                          <p className="text-xs text-muted-foreground">{e.time}</p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => deleteEvent(e.id)}>
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>

            <AnimatePresence>
              {showAdd && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                  <Card className="space-y-3 p-4">
                    <h4 className="text-sm font-semibold text-foreground">New Event</h4>
                    <Input value={eventTitle} onChange={(e) => setEventTitle(e.target.value)} placeholder="Event title" onKeyDown={(e) => e.key === "Enter" && addEvent()} />
                    <Input type="time" value={eventTime} onChange={(e) => setEventTime(e.target.value)} />
                    <div className="flex gap-1.5">
                      {COLORS.map((c) => (
                        <button key={c} onClick={() => setEventColor(c)}
                          className={cn("h-6 w-6 rounded-full transition-transform", eventColor === c && "scale-125 ring-2 ring-offset-2 ring-offset-card ring-primary")}
                          style={{ backgroundColor: c }} />
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="primary" size="sm" onClick={addEvent}>Add Event</Button>
                      <Button variant="ghost" size="sm" onClick={() => setShowAdd(false)}>Cancel</Button>
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
