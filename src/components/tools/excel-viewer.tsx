"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils/cn"
import { Upload, Table, Download, Search, ArrowUpDown } from "lucide-react"

export function ExcelViewer() {
  const [data, setData] = React.useState<string[][]>([])
  const [headers, setHeaders] = React.useState<string[]>([])
  const [search, setSearch] = React.useState("")
  const [sortCol, setSortCol] = React.useState(-1)
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("asc")
  const [fileName, setFileName] = React.useState("")

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      const lines = text.split(/\r?\n/).filter(l => l.trim())
      if (lines.length === 0) { toast.error("Empty file"); return }
      const parsed = lines.map(l => {
        const row: string[] = []
        let current = ""
        let inQuote = false
        for (let i = 0; i < l.length; i++) {
          if (l[i] === '"') { inQuote = !inQuote; continue }
          if (l[i] === "," && !inQuote) { row.push(current.trim()); current = ""; continue }
          current += l[i]
        }
        row.push(current.trim())
        return row
      })
      setHeaders(parsed[0])
      setData(parsed.slice(1))
      toast.success(`Loaded ${parsed.length - 1} rows`)
    }
    reader.readAsText(file)
  }

  const filteredData = React.useMemo(() => {
    let rows = data
    if (search) {
      const q = search.toLowerCase()
      rows = rows.filter(r => r.some(c => c.toLowerCase().includes(q)))
    }
    if (sortCol >= 0) {
      rows = [...rows].sort((a, b) => {
        const va = (a[sortCol] || "").toLowerCase()
        const vb = (b[sortCol] || "").toLowerCase()
        const numA = parseFloat(va), numB = parseFloat(vb)
        if (!isNaN(numA) && !isNaN(numB)) return sortDir === "asc" ? numA - numB : numB - numA
        return sortDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va)
      })
    }
    return rows
  }, [data, search, sortCol, sortDir])

  const handleSort = (col: number) => {
    if (sortCol === col) { setSortDir(d => d === "asc" ? "desc" : "asc") }
    else { setSortCol(col); setSortDir("asc") }
  }

  const exportCSV = () => {
    if (data.length === 0) { toast.error("No data to export"); return }
    const csv = [headers.join(","), ...data.map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(","))].join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "exported.csv"; a.click()
    toast.success("Exported as CSV")
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div className="flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10"><Table className="h-6 w-6 text-emerald-500" /></div><div><h1 className="text-2xl font-bold text-foreground">Excel Viewer</h1><p className="text-sm text-muted-foreground">View Excel spreadsheets online</p></div></div>
        <div className="flex items-center gap-2">
          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border px-4 py-2 text-sm text-muted-foreground hover:border-primary/50"><Upload className="h-4 w-4" /> Upload CSV<input type="file" accept=".csv,.xlsx" onChange={handleFile} className="hidden" /></label>
          {data.length > 0 && <Button variant="outline" size="sm" onClick={exportCSV}><Download className="mr-1 h-4 w-4" />Export CSV</Button>}
        </div>
      </motion.div>

      {data.length > 0 && (
        <div className="flex items-center gap-4">
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search data..." icon={<Search className="h-4 w-4" />} wrapperClassName="flex-1" />
          <span className="text-sm text-muted-foreground">{filteredData.length} rows</span>
        </div>
      )}

      <Card padding="none" className="overflow-hidden">
        <div className="border-b border-border bg-muted/30 px-5 py-3 flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">{fileName || "No file loaded"}</span>
          {data.length > 0 && <span className="text-xs text-muted-foreground">{headers.length} cols × {data.length} rows</span>}
        </div>
        {data.length > 0 ? (
          <div className="overflow-auto max-h-[600px]">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50">{headers.map((h, i) => (<th key={i} className="sticky top-0 bg-muted/95 cursor-pointer px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground border-r border-border" onClick={() => handleSort(i)}><div className="flex items-center gap-1"><span>{h}</span><ArrowUpDown className={cn("h-3 w-3", sortCol === i && "text-primary")} /></div></th>))}</tr>
              </thead>
              <tbody>{filteredData.map((row, ri) => (<tr key={ri} className={cn("border-t border-border hover:bg-muted/30", ri % 2 === 0 && "bg-muted/10")}>{row.map((cell, ci) => (<td key={ci} className="px-4 py-2.5 text-foreground border-r border-border/50 max-w-[300px] truncate">{cell}</td>))}</tr>))}</tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-16 text-center"><Table className="h-10 w-10 text-muted-foreground/50" /><p className="text-sm text-muted-foreground">Upload a CSV or Excel file to view</p></div>
        )}
      </Card>
    </div>
  )
}
