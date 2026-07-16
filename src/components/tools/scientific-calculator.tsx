"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils/cn"
import { Calculator } from "lucide-react"

type AngleMode = "deg" | "rad"

export function ScientificCalculator() {
  const [display, setDisplay] = React.useState("0")
  const [expression, setExpression] = React.useState("")
  const [memory, setMemory] = React.useState<number>(0)
  const [angleMode, setAngleMode] = React.useState<AngleMode>("deg")
  const [currentOp, setCurrentOp] = React.useState<string | null>(null)
  const [prevValue, setPrevValue] = React.useState<number | null>(null)
  const [resetNext, setResetNext] = React.useState(false)
  const [history, setHistory] = React.useState<string[]>([])

  const inputDigit = (d: string) => {
    if (resetNext) { setDisplay(d); setResetNext(false) }
    else { setDisplay(display === "0" ? d : display + d) }
  }

  const inputDecimal = () => {
    if (resetNext) { setDisplay("0."); setResetNext(false); return }
    if (!display.includes(".")) setDisplay(display + ".")
  }

  const clear = () => { setDisplay("0"); setExpression(""); setCurrentOp(null); setPrevValue(null); setResetNext(false) }
  const clearEntry = () => { setDisplay("0") }

  const handleUnaryOp = (op: string) => {
    const val = parseFloat(display)
    let result = 0
    const toRad = (v: number) => angleMode === "deg" ? v * (Math.PI / 180) : v
    const fromRad = (v: number) => angleMode === "deg" ? v * (180 / Math.PI) : v
    switch (op) {
      case "sin": result = Math.sin(toRad(val)); break
      case "cos": result = Math.cos(toRad(val)); break
      case "tan": result = Math.tan(toRad(val)); break
      case "asin": result = fromRad(Math.asin(val)); break
      case "acos": result = fromRad(Math.acos(val)); break
      case "atan": result = fromRad(Math.atan(val)); break
      case "log": result = Math.log10(val); break
      case "ln": result = Math.log(val); break
      case "sqrt": result = Math.sqrt(val); break
      case "sq": result = val * val; break
      case "cube": result = val * val * val; break
      case "inv": result = 1 / val; break
      case "fact": { result = 1; for (let i = 2; i <= val; i++) result *= i; break }
      case "pi": result = Math.PI; break
      case "e": result = Math.E; break
    }
    setExpression(`${op}(${display})`)
    setDisplay(String(Math.round(result * 1e12) / 1e12))
    setResetNext(true)
  }

  const handleOp = (op: string) => {
    const val = parseFloat(display)
    if (prevValue !== null && currentOp && !resetNext) {
      const result = compute(prevValue, val, currentOp)
      setDisplay(String(result))
      setPrevValue(result)
    } else {
      setPrevValue(val)
    }
    setCurrentOp(op)
    setExpression(`${display} ${op}`)
    setResetNext(true)
  }

  const compute = (a: number, b: number, op: string): number => {
    switch (op) {
      case "+": return a + b
      case "−": return a - b
      case "×": return a * b
      case "÷": return b !== 0 ? a / b : 0
      case "pow": return Math.pow(a, b)
      case "root": return Math.pow(a, 1 / b)
      default: return b
    }
  }

  const equals = () => {
    if (prevValue === null || !currentOp) return
    const val = parseFloat(display)
    const result = compute(prevValue, val, currentOp)
    setExpression(`${prevValue} ${currentOp} ${val} =`)
    setDisplay(String(Math.round(result * 1e12) / 1e12))
    setHistory(h => [`${prevValue} ${currentOp} ${val} = ${result}`, ...h].slice(0, 10))
    setPrevValue(null); setCurrentOp(null); setResetNext(true)
  }

  const toggleSign = () => setDisplay(d => d.startsWith("-") ? d.slice(1) : "-" + d)

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (/\d/.test(e.key)) inputDigit(e.key)
    else if (e.key === ".") inputDecimal()
    else if (e.key === "Enter" || e.key === "=") equals()
    else if (e.key === "Escape") clear()
    else if (e.key === "Backspace") setDisplay(d => d.length > 1 ? d.slice(0, -1) : "0")
  }

  const btnClass = "h-10 text-xs font-medium rounded-lg transition-colors focus:outline-none"

  return (
    <div className="mx-auto max-w-lg space-y-6" onKeyDown={handleKeyDown}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10"><Calculator className="h-6 w-6 text-purple-500" /></div>
        <div><h1 className="text-2xl font-bold text-foreground">Scientific Calculator</h1><p className="text-sm text-muted-foreground">Advanced scientific calculator</p></div>
      </motion.div>

      <Card padding="none" className="overflow-hidden">
        <div className="bg-muted/30 px-5 py-3 text-right">
          <div className="text-xs text-muted-foreground min-h-[16px]">{expression}</div>
          <div className="text-3xl font-bold tabular-nums text-foreground tracking-tight truncate">{display}</div>
        </div>

        <div className="flex items-center gap-1 border-b border-border px-3 py-1.5">
          <button onClick={() => setAngleMode("deg")} className={cn(btnClass, "px-2", angleMode === "deg" ? "bg-primary/10 text-primary" : "text-muted-foreground")}>DEG</button>
          <button onClick={() => setAngleMode("rad")} className={cn(btnClass, "px-2", angleMode === "rad" ? "bg-primary/10 text-primary" : "text-muted-foreground")}>RAD</button>
          <span className="mx-1 h-4 w-px bg-border" />
          <button onClick={() => handleUnaryOp("pi")} className={cn(btnClass, "px-2 text-muted-foreground hover:bg-accent")}>π</button>
          <button onClick={() => handleUnaryOp("e")} className={cn(btnClass, "px-2 text-muted-foreground hover:bg-accent")}>e</button>
          <span className="ml-auto text-[10px] text-muted-foreground">M={memory}</span>
        </div>

        <div className="grid grid-cols-5 gap-px bg-border p-px">
          {[["sin", "cos", "tan", "log", "ln"],
            ["asin", "acos", "atan", "sqrt", "sq"],
            ["cube", "inv", "fact", "(", ")"],
            ["MC", "MR", "M+", "M-", "C"],
          ].map((row, ri) => row.map((btn, ci) => {
            const isMem = ["MC", "MR", "M+", "M-"].includes(btn)
            const isUnary = ["sin", "cos", "tan", "asin", "acos", "atan", "log", "ln", "sqrt", "sq", "cube", "inv", "fact", "pi", "e"].includes(btn)
            return (
              <motion.button key={`func-${ri}-${ci}`} whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if (btn === "C") { clear() }
                  else if (btn === "MC") { setMemory(0) }
                  else if (btn === "MR") { setDisplay(String(memory)); setResetNext(true) }
                  else if (btn === "M+") { setMemory(m => m + parseFloat(display)) }
                  else if (btn === "M-") { setMemory(m => m - parseFloat(display)) }
                  else if (btn === "(" || btn === ")") {}
                  else if (isUnary) { handleUnaryOp(btn) }
                }}
                className={cn(btnClass, isMem ? "bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 dark:text-amber-400" : "bg-muted/50 text-muted-foreground hover:bg-accent")}
              >{btn === "sqrt" ? "√" : btn === "sq" ? "x²" : btn === "cube" ? "x³" : btn === "inv" ? "1/x" : btn === "fact" ? "x!" : btn === "pi" ? "π" : btn}</motion.button>
            )
          }))}

          {[["7", "8", "9", "÷", "C"],
            ["4", "5", "6", "×", "("],
            ["1", "2", "3", "−", ")"],
            ["0", ".", "±", "+", "="],
          ].map((row, ri) => row.map((btn, ci) => {
            const isNum = /\d/.test(btn)
            const isOp = ["+", "−", "×", "÷"].includes(btn)
            const isEq = btn === "="
            return (
              <motion.button key={`main-${ri}-${ci}`} whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if (isNum) inputDigit(btn)
                  else if (btn === ".") inputDecimal()
                  else if (btn === "±") toggleSign()
                  else if (btn === "C") clear()
                  else if (btn === "CE") clearEntry()
                  else if (isOp) handleOp(btn)
                  else if (isEq) equals()
                  else if (btn === "(" || btn === ")") {}
                }}
                className={cn(btnClass, "h-12 text-base", isNum ? "bg-card text-foreground hover:bg-accent" : "", isOp ? "bg-primary/10 text-primary hover:bg-primary/20" : "", isEq ? "bg-violet-600 text-white hover:bg-violet-700" : "", btn === "C" ? "text-destructive hover:bg-destructive/10" : "", btn === "±" ? "text-muted-foreground hover:bg-accent" : "")}
              >{btn === "÷" ? "÷" : btn === "×" ? "×" : btn === "−" ? "−" : btn === "+" ? "+" : btn}</motion.button>
            )
          }))}
        </div>

        {history.length > 0 && <div className="border-t border-border px-4 py-2"><p className="text-[10px] text-muted-foreground mb-1">History</p><div className="space-y-0.5">{history.map((h, i) => <p key={i} className="text-[11px] text-muted-foreground font-mono">{h}</p>)}</div></div>}
      </Card>
    </div>
  )
}
