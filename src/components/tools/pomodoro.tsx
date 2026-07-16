"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils/cn"
import { toast } from "sonner"
import { Play, Pause, RotateCcw, Timer, Coffee, Bell } from "lucide-react"

export function Pomodoro() {
  const [workTime, setWorkTime] = React.useState(25)
  const [breakTime, setBreakTime] = React.useState(5)
  const [timeLeft, setTimeLeft] = React.useState(workTime * 60)
  const [isRunning, setIsRunning] = React.useState(false)
  const [mode, setMode] = React.useState<"work" | "break">("work")
  const [sessions, setSessions] = React.useState(0)

  React.useEffect(() => {
    setTimeLeft(mode === "work" ? workTime * 60 : breakTime * 60)
  }, [workTime, breakTime, mode])

  React.useEffect(() => {
    if (!isRunning) return
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false)
          if (mode === "work") {
            setSessions(s => s + 1)
            setMode("break")
            try { new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACAgICAf39/fn5+fX19fHx8fHt7e3p6enp5eXl4eHh4d3d3d3Z2dnV1dXV0dHRzc3NzdHR0dXV1dXZ2dnd3d3h4eHh5eXl6enp7e3t7fHx8fX19fn5+f39/gICAgA==").play() } catch {}
            toast.success("Work session complete! Take a break.")
          } else {
            setMode("work")
            try { new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACAgICAf39/fn5+fX19fHx8fHt7e3p6enp5eXl4eHh4d3d3d3Z2dnV1dXV0dHRzc3NzdHR0dXV1dXZ2dnd3d3h4eHh5eXl6enp7e3t7fHx8fX19fn5+f39/gICAgA==").play() } catch {}
            toast.success("Break over! Time to focus.")
          }
          return mode === "work" ? workTime * 60 : breakTime * 60
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [isRunning, mode, workTime, breakTime])

  const toggleTimer = () => setIsRunning(!isRunning)
  const resetTimer = () => { setIsRunning(false); setTimeLeft(mode === "work" ? workTime * 60 : breakTime * 60) }

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const total = mode === "work" ? workTime * 60 : breakTime * 60
  const progress = ((total - timeLeft) / total) * 100
  const circumference = 2 * Math.PI * 90
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <div className="mx-auto max-w-md space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10"><Timer className="h-6 w-6 text-red-500" /></div>
        <div><h1 className="text-2xl font-bold text-foreground">Pomodoro Timer</h1><p className="text-sm text-muted-foreground">Focus with Pomodoro technique</p></div>
      </motion.div>

      <Card className="text-center">
        <div className="relative mx-auto mb-6 flex h-[220px] w-[220px] items-center justify-center">
          <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="90" fill="none" stroke="currentColor" className="text-muted/30" strokeWidth="6" />
            <circle cx="100" cy="100" r="90" fill="none" stroke="currentColor" className={cn("transition-all duration-1000", mode === "work" ? "text-primary" : "text-emerald-500")} strokeWidth="6" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" />
          </svg>
          <div className="relative text-center">
            <div className="text-5xl font-bold tabular-nums text-foreground tracking-wider">{String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}</div>
            <div className="mt-2 flex items-center justify-center gap-2">
              <span className={cn("text-sm font-medium", mode === "work" ? "text-primary" : "text-emerald-500")}>{mode === "work" ? "Focus" : "Break"}</span>
              {mode === "work" ? <Bell className="h-4 w-4 text-primary" /> : <Coffee className="h-4 w-4 text-emerald-500" />}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 mb-6">
          <Button variant={isRunning ? "destructive" : "primary"} size="lg" onClick={toggleTimer} className="w-32">
            {isRunning ? <Pause className="mr-1.5 h-5 w-5" /> : <Play className="mr-1.5 h-5 w-5" />}
            {isRunning ? "Pause" : "Start"}
          </Button>
          <Button variant="outline" size="lg" onClick={resetTimer}><RotateCcw className="h-5 w-5" /></Button>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg bg-muted/30 p-3"><p className="text-xs text-muted-foreground">Work Time</p><div className="flex items-center justify-center gap-1 mt-1">
            <button onClick={() => setWorkTime(Math.max(1, workTime - 1))} className="h-6 w-6 rounded bg-muted text-xs hover:bg-accent">-</button>
            <span className="w-8 text-center text-sm font-bold tabular-nums text-foreground">{workTime}</span>
            <button onClick={() => setWorkTime(Math.min(60, workTime + 1))} className="h-6 w-6 rounded bg-muted text-xs hover:bg-accent">+</button>
          </div></div>
          <div className="rounded-lg bg-muted/30 p-3"><p className="text-xs text-muted-foreground">Break Time</p><div className="flex items-center justify-center gap-1 mt-1">
            <button onClick={() => setBreakTime(Math.max(1, breakTime - 1))} className="h-6 w-6 rounded bg-muted text-xs hover:bg-accent">-</button>
            <span className="w-8 text-center text-sm font-bold tabular-nums text-foreground">{breakTime}</span>
            <button onClick={() => setBreakTime(Math.min(30, breakTime + 1))} className="h-6 w-6 rounded bg-muted text-xs hover:bg-accent">+</button>
          </div></div>
          <div className="rounded-lg bg-muted/30 p-3"><p className="text-xs text-muted-foreground">Sessions</p><p className="mt-1 text-2xl font-bold text-foreground">{sessions}</p></div>
        </div>
      </Card>
    </div>
  )
}


