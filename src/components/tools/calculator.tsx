"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils/cn"
import { Calculator as CalcIcon } from "lucide-react"

const BTNS = [
  ["C", "±", "%", "÷"],
  ["7", "8", "9", "×"],
  ["4", "5", "6", "−"],
  ["1", "2", "3", "+"],
  ["0", ".", "="],
]

export function Calculator() {
  const [display, setDisplay] = React.useState("0")
  const [history, setHistory] = React.useState("")
  const [operation, setOperation] = React.useState<string | null>(null)
  const [prevValue, setPrevValue] = React.useState<number | null>(null)
  const [resetNext, setResetNext] = React.useState(false)

  const inputDigit = (digit: string) => {
    if (resetNext) { setDisplay(digit); setResetNext(false) }
    else { setDisplay(display === "0" ? digit : display + digit) }
  }

  const inputDecimal = () => {
    if (resetNext) { setDisplay("0."); setResetNext(false); return }
    if (!display.includes(".")) setDisplay(display + ".")
  }

  const clear = () => { setDisplay("0"); setHistory(""); setOperation(null); setPrevValue(null); setResetNext(false) }
  const toggleSign = () => { setDisplay(display.startsWith("-") ? display.slice(1) : "-" + display) }
  const percent = () => { setDisplay(String(parseFloat(display) / 100)) }

  const handleOp = (op: string) => {
    const current = parseFloat(display)
    if (prevValue !== null && operation && !resetNext) {
      const result = calculate(prevValue, current, operation)
      setDisplay(String(result))
      setPrevValue(result)
    } else {
      setPrevValue(current)
    }
    setOperation(op)
    setHistory(`${display} ${op}`)
    setResetNext(true)
  }

  const calculate = (a: number, b: number, op: string): number => {
    switch (op) {
      case "+": return a + b
      case "−": return a - b
      case "×": return a * b
      case "÷": return b !== 0 ? a / b : 0
      default: return b
    }
  }

  const equals = () => {
    if (prevValue === null || !operation) return
    const current = parseFloat(display)
    const result = calculate(prevValue, current, operation)
    setHistory(`${prevValue} ${operation} ${current} =`)
    setDisplay(String(result))
    setPrevValue(null)
    setOperation(null)
    setResetNext(true)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (/\d/.test(e.key)) inputDigit(e.key)
    else if (e.key === ".") inputDecimal()
    else if (e.key === "Backspace") setDisplay(display.length > 1 ? display.slice(0, -1) : "0")
    else if (e.key === "Enter" || e.key === "=") equals()
    else if (e.key === "Escape") clear()
    else if (["+", "-", "*", "/"].includes(e.key)) {
      const map: Record<string, string> = { "+": "+", "-": "−", "*": "×", "/": "÷" }
      handleOp(map[e.key])
    }
  }

  const handleClick = (btn: string) => {
    if (btn.match(/\d/)) inputDigit(btn)
    else if (btn === ".") inputDecimal()
    else if (btn === "C") clear()
    else if (btn === "±") toggleSign()
    else if (btn === "%") percent()
    else if (["+", "−", "×", "÷"].includes(btn)) handleOp(btn)
    else if (btn === "=") equals()
  }

  return (
    <div className="mx-auto max-w-sm space-y-8" onKeyDown={handleKeyDown}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-500/10"><CalcIcon className="h-6 w-6 text-slate-500" /></div>
        <div><h1 className="text-2xl font-bold text-foreground">Calculator</h1><p className="text-sm text-muted-foreground">Basic calculator</p></div>
      </motion.div>

      <Card padding="none" className="overflow-hidden">
        <div className="bg-muted/30 px-5 py-3 text-right">
          <div className="text-xs text-muted-foreground min-h-[18px]">{history}</div>
          <div className="text-4xl font-bold tabular-nums text-foreground tracking-tight truncate">{display}</div>
        </div>
        <div className="grid grid-cols-4 gap-px bg-border">
          {BTNS.flat().map((btn, i) => {
            const isNumber = /\d/.test(btn)
            const isOp = ["+", "−", "×", "÷", "="].includes(btn)
            const isZero = btn === "0"
            return (
              <motion.button
                key={`${btn}-${i}`}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleClick(btn)}
                className={cn(
                  "h-16 text-lg font-medium transition-colors focus:outline-none",
                  isNumber || btn === "." ? "bg-card text-foreground hover:bg-accent" : "",
                  isOp ? "bg-primary text-primary-foreground hover:bg-primary/90" : "",
                  btn === "C" || btn === "±" || btn === "%" ? "bg-muted text-foreground hover:bg-accent" : "",
                  isZero ? "col-span-2" : "",
                  btn === "=" ? "bg-violet-600 hover:bg-violet-700" : ""
                )}
              >
                {btn}
              </motion.button>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
