"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils/cn"
import { Upload, Download, Plus, Trash2, Table } from "lucide-react"

export function SpreadsheetEditor() {
  const [rows, setRows] = React.useState(5)
  const [cols, setCols] = React.useState(4)
  const [data, setData] = React.useState<string[][]>(() => Array.from({ length: 5 }, () => Array(4).fill("")))
  const [selectedCell, setSelectedCell] = React.useState<{ r: number; c: number } | null>(null)

  const updateCell = (r: number, c: number, value: string) => {
    const newData = data.map((row, ri) => row.map((cell, ci) => (ri === r && ci === c) ? value : cell))
    setData(newData)
  }

  const addRow = () => { setData([...data, Array(cols).fill("")]); setRows(rows + 1) }
  const addCol = () => { setData(data.map(r => [...r, ""])); setCols(cols + 1) }
  const removeRow = () => { if (rows > 1) { setData(data.slice(0, -1)); setRows(rows - 1) } }
  const removeCol = () => { if (cols > 1) { setData(data.map(r => r.slice(0, -1))); setCols(cols - 1) } }

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      const lines = text.split(/\r?\n/).filter(l => l.trim())
      if (lines.length === 0) return
      const parsed = lines.map(l => {
        const row: string[] = []; let cur = ""; let inQ = false
        for (let i = 0; i < l.length; i++) {
          if (l[i] === '"') { inQ = !inQ; continue }
          if (l[i] === "," && !inQ) { row.push(cur.trim()); cur = ""; continue }
          cur += l[i]
        }
        row.push(cur.trim())
        return row
      })
      setData(parsed)
      setRows(parsed.length)
      setCols(Math.max(...parsed.map(r => r.length)))
      toast.success("File loaded")
    }
    reader.readAsText(file)
  }

  const exportCSV = () => {
    const csv = data.map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "spreadsheet.csv"; a.click()
    toast.success("Exported as CSV")
  }

  const colLabels = Array.from({ length: cols }, (_, i) => String.fromCharCode(65 + i))

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div className="flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-500/10"><Table className="h-6 w-6 text-green-500" /></div><div><h1 className="text-2xl font-bold text-foreground">Spreadsheet Editor</h1><p className="text-sm text-muted-foreground">Edit spreadsheets online</p></div></div>
        <div className="flex items-center gap-2">
          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border px-4 py-2 text-sm text-muted-foreground hover:border-primary/50"><Upload className="h-4 w-4" /> Open<input type="file" accept=".csv" onChange={handleFile} className="hidden" /></label>
          <Button variant="outline" size="sm" onClick={exportCSV}><Download className="mr-1 h-4 w-4" />Export CSV</Button>
        </div>
      </motion.div>

      <Card padding="none" className="overflow-hidden">
        <div className="border-b border-border bg-muted/30 px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={addRow}><Plus className="h-3.5 w-3.5" /> Row</Button>
            <Button variant="ghost" size="sm" onClick={addCol}><Plus className="h-3.5 w-3.5" /> Col</Button>
            <Button variant="ghost" size="sm" onClick={removeRow} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /> Row</Button>
            <Button variant="ghost" size="sm" onClick={removeCol} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /> Col</Button>
          </div>
          <span className="text-xs text-muted-foreground">{rows}r × {cols}c</span>
        </div>
        <div className="overflow-auto max-h-[600px]">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr>
                <th className="sticky top-0 left-0 z-10 bg-muted/95 w-10 min-w-[40px] px-2 py-2 text-xs text-muted-foreground border-r border-b border-border" />
                {colLabels.map((l, i) => (<th key={i} className="sticky top-0 z-[5] bg-muted/95 px-3 py-2 text-xs font-semibold text-muted-foreground border-r border-b border-border min-w-[100px]">{l}</th>))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, ri) => (<tr key={ri} className={cn(ri % 2 === 0 && "bg-muted/10")}>
                <td className="sticky left-0 z-[3] bg-background px-2 py-2 text-xs text-muted-foreground border-r border-b border-border text-center w-10">{ri + 1}</td>
                {row.map((cell, ci) => (
                  <td key={ci} className={cn("border-r border-b border-border p-0", selectedCell?.r === ri && selectedCell?.c === ci && "ring-2 ring-primary ring-inset")} onClick={() => setSelectedCell({ r: ri, c: ci })}>
                    <input value={cell} onChange={(e) => updateCell(ri, ci, e.target.value)} className="w-full bg-transparent px-3 py-2 text-foreground outline-none text-sm" />
                  </td>
                ))}
                {row.length < cols && Array.from({ length: cols - row.length }).map((_, ci) => (<td key={ci + row.length} className="border-r border-b border-border bg-muted/20 p-0" />))}
              </tr>))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
