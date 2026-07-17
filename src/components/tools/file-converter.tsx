"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils/cn"
import { Button } from "@/components/ui/button"
import { FileUpload } from "@/components/ui/file-upload"
import { ProgressBar } from "@/components/ui/progress-bar"
import {
  Repeat,
  Download,
  File,
  FileText,
  FileImage,
  AlertCircle,
  CircleCheck,
  ArrowRight,
} from "lucide-react"

interface FormatCategory {
  name: string
  icon: React.ReactNode
  formats: { ext: string; name: string; mime: string }[]
}

const formatCategories: FormatCategory[] = [
  {
    name: "Documents",
    icon: <FileText className="h-4 w-4" />,
    formats: [
      { ext: "txt", name: "Plain Text", mime: "text/plain" },
      { ext: "csv", name: "CSV", mime: "text/csv" },
      { ext: "json", name: "JSON", mime: "application/json" },
      { ext: "xml", name: "XML", mime: "application/xml" },
      { ext: "html", name: "HTML", mime: "text/html" },
      { ext: "md", name: "Markdown", mime: "text/markdown" },
    ],
  },
  {
    name: "Images",
    icon: <FileImage className="h-4 w-4" />,
    formats: [
      { ext: "png", name: "PNG", mime: "image/png" },
      { ext: "jpg", name: "JPG", mime: "image/jpeg" },
      { ext: "webp", name: "WebP", mime: "image/webp" },
      { ext: "gif", name: "GIF", mime: "image/gif" },
      { ext: "bmp", name: "BMP", mime: "image/bmp" },
    ],
  },
]

function detectFormat(filename: string): { ext: string; category: FormatCategory | null } {
  const ext = filename.split(".").pop()?.toLowerCase() || ""
  for (const cat of formatCategories) {
    for (const fmt of cat.formats) {
      if (fmt.ext === ext) return { ext, category: cat }
    }
  }
  return { ext, category: null }
}

function getCategoryIcon(cat: FormatCategory | null) {
  if (!cat) return <File className="h-4 w-4" />
  return cat.icon
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
}

function escapeXml(str: string): string {
  return escapeHtml(str)
}

function parseCSV(text: string): string[][] {
  const lines = text.split(/\r?\n/).filter(l => l.trim())
  return lines.map(line => {
    const result: string[] = []
    let current = ""
    let inQuotes = false
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]
      if (inQuotes) {
        if (ch === '"') {
          if (i + 1 < line.length && line[i + 1] === '"') {
            current += '"'
            i++
          } else {
            inQuotes = false
          }
        } else {
          current += ch
        }
      } else {
        if (ch === '"') {
          inQuotes = true
        } else if (ch === ",") {
          result.push(current)
          current = ""
        } else {
          current += ch
        }
      }
    }
    result.push(current)
    return result
  })
}

function formatCSV(rows: string[][]): string {
  return rows.map(row =>
    row.map(cell => {
      if (cell.includes(",") || cell.includes('"') || cell.includes("\n")) {
        return `"${cell.replace(/"/g, '""')}"`
      }
      return cell
    }).join(",")
  ).join("\n")
}

function convertDocumentText(text: string, from: string, to: string): string {
  const lines = text.split(/\r?\n/)
  switch (`${from}->${to}`) {
    case "txt->csv":
      return lines.map(l => `"${l.replace(/"/g, '""')}"`).join("\n")
    case "txt->json":
      return JSON.stringify(lines, null, 2)
    case "txt->xml":
      return `<?xml version="1.0" encoding="UTF-8"?>\n<root>\n${lines.map(l => `  <line>${escapeXml(l)}</line>`).join("\n")}\n</root>`
    case "txt->html":
      return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Converted Text</title></head><body>\n${lines.map(l => `  <p>${escapeHtml(l)}</p>`).join("\n")}\n</body></html>`
    case "txt->md":
      return text
    case "csv->txt": {
      const rows = parseCSV(text)
      return rows.map(r => r.join("\t")).join("\n")
    }
    case "csv->json": {
      const rows = parseCSV(text)
      if (rows.length < 2) return JSON.stringify(rows.map(r => ({ value: r[0] || "" })), null, 2)
      const headers = rows[0]
      const data = rows.slice(1).map(r => {
        const obj: Record<string, string> = {}
        headers.forEach((h, i) => { obj[h] = r[i] || "" })
        return obj
      })
      return JSON.stringify(data, null, 2)
    }
    case "csv->xml": {
      const rows = parseCSV(text)
      if (rows.length < 2) return `<?xml version="1.0" encoding="UTF-8"?>\n<root>\n${rows.map((r, i) => `  <row id="${i}"><cell>${escapeXml(r[0] || "")}</cell></row>`).join("\n")}\n</root>`
      const headers = rows[0]
      return `<?xml version="1.0" encoding="UTF-8"?>\n<data>\n${rows.slice(1).map(r =>
        `  <row>\n${headers.map((h, i) => `    <${h}>${escapeXml(r[i] || "")}</${h}>`).join("\n")}\n  </row>`
      ).join("\n")}\n</data>`
    }
    case "csv->html": {
      const rows = parseCSV(text)
      if (rows.length === 0) return "<html><body><p>No data</p></body></html>"
      const header = rows[0]
      const data = rows.slice(1)
      let html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>CSV Data</title><style>table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccc;padding:8px;text-align:left}th{background:#f5f5f5}</style></head><body><table>\n  <thead><tr>${header.map(h => `<th>${escapeHtml(h)}</th>`).join("")}</tr></thead>\n  <tbody>`
      html += data.map(r => `\n    <tr>${header.map((_, i) => `<td>${escapeHtml(r[i] || "")}</td>`).join("")}</tr>`).join("")
      html += "\n  </tbody>\n</table></body></html>"
      return html
    }
    case "csv->md": {
      const rows = parseCSV(text)
      if (rows.length === 0) return ""
      const header = rows[0]
      const data = rows.slice(1)
      const sep = `| ${header.map(() => "---").join(" | ")} |`
      const hdr = `| ${header.join(" | ")} |`
      const body = data.map(r => `| ${header.map((_, i) => r[i] || "").join(" | ")} |`).join("\n")
      return `${hdr}\n${sep}\n${body}`
    }
    case "json->txt": {
      try { return JSON.stringify(JSON.parse(text), null, 2) } catch { return text }
    }
    case "json->csv": {
      try {
        const data = JSON.parse(text)
        if (!Array.isArray(data) || data.length === 0) return text
        if (typeof data[0] === "object" && data[0] !== null) {
          const headers = Object.keys(data[0])
          const rows = data.map((item: Record<string, unknown>) => headers.map(h => String(item[h] ?? "")))
          return formatCSV([headers, ...rows])
        }
        return formatCSV(data.map((item: unknown) => [String(item)]))
      } catch { return text }
    }
    case "json->xml": {
      try {
        const data = JSON.parse(text)
        return `<?xml version="1.0" encoding="UTF-8"?>\n<root>\n  <json>\n    <![CDATA[\n${JSON.stringify(data, null, 4)}\n    ]]>\n  </json>\n</root>`
      } catch { return text }
    }
    case "json->html": {
      try {
        const data = JSON.parse(text)
        return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>JSON Data</title></head><body><pre style="font-family:monospace;white-space:pre-wrap;word-break:break-word;">${escapeHtml(JSON.stringify(data, null, 2))}</pre></body></html>`
      } catch { return text }
    }
    case "json->md": {
      try {
        const data = JSON.parse(text)
        return "```json\n" + JSON.stringify(data, null, 2) + "\n```"
      } catch { return text }
    }
    case "xml->txt":
      return text.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim()
    case "xml->json": {
      const obj = { raw: text }
      return JSON.stringify(obj, null, 2)
    }
    case "xml->csv":
      return text.replace(/<[^>]*>/g, ",").replace(/,+/g, ",").replace(/^,|,$/g, "").split("\n").map(l => l.trim()).filter(Boolean).join("\n")
    case "xml->html":
      return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>XML Data</title></head><body><pre style="font-family:monospace;white-space:pre-wrap;">${escapeHtml(text)}</pre></body></html>`
    case "xml->md":
      return "```xml\n" + text + "\n```"
    case "html->txt":
      return text.replace(/<[^>]*>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/\s+/g, " ").trim()
    case "html->json": {
      const obj = { html: text }
      return JSON.stringify(obj, null, 2)
    }
    case "html->csv": {
      const stripped = text.replace(/<[^>]*>/g, "").trim()
      return stripped.split("\n").map(l => `"${l.trim().replace(/"/g, '""')}"`).filter(l => l !== '""').join("\n")
    }
    case "html->xml":
      return `<?xml version="1.0" encoding="UTF-8"?>\n<root>\n  <![CDATA[\n${text}\n  ]]>\n</root>`
    case "html->md": {
      const stripped = text.replace(/<[^>]*>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").trim()
      return stripped
    }
    case "md->txt":
      return text.replace(/[#*_~`>\[\]()!|-]/g, "").replace(/\n{3,}/g, "\n\n").trim()
    case "md->csv":
      return text.split("\n").map(l => `"${l.replace(/"/g, '""')}"`).join("\n")
    case "md->json": {
      const obj = { markdown: text }
      return JSON.stringify(obj, null, 2)
    }
    case "md->xml":
      return `<?xml version="1.0" encoding="UTF-8"?>\n<root>\n  <content>\n    <![CDATA[\n${text}\n    ]]>\n  </content>\n</root>`
    case "md->html": {
      const lines2 = text.split("\n")
      let html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Markdown</title></head><body>\n`
      for (const line of lines2) {
        if (line.startsWith("# ")) html += `  <h1>${escapeHtml(line.slice(2))}</h1>\n`
        else if (line.startsWith("## ")) html += `  <h2>${escapeHtml(line.slice(3))}</h2>\n`
        else if (line.startsWith("### ")) html += `  <h3>${escapeHtml(line.slice(4))}</h3>\n`
        else if (line.startsWith("- ") || line.startsWith("* ")) html += `  <li>${escapeHtml(line.slice(2))}</li>\n`
        else if (line.trim()) html += `  <p>${escapeHtml(line)}</p>\n`
      }
      html += "</body></html>"
      return html
    }
    default:
      return text
  }
}

async function convertImage(file: File, targetMime: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement("canvas")
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext("2d")
        if (!ctx) { reject(new Error("Could not get canvas context")); return }
        ctx.drawImage(img, 0, 0)
        canvas.toBlob((blob) => {
          if (blob) resolve(blob)
          else reject(new Error(`Unsupported image format: ${targetMime}`))
        }, targetMime)
      }
      img.onerror = () => reject(new Error("Failed to load image for conversion"))
      img.src = e.target?.result as string
    }
    reader.onerror = () => reject(new Error("Failed to read file"))
    reader.readAsDataURL(file)
  })
}

export function FileConverter() {
  const [file, setFile] = React.useState<File | null>(null)
  const [sourceExt, setSourceExt] = React.useState("")
  const [sourceCategory, setSourceCategory] = React.useState<FormatCategory | null>(null)
  const [targetFormat, setTargetFormat] = React.useState("")
  const [targetCategory, setTargetCategory] = React.useState<string>("Documents")
  const [converting, setConverting] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  const [convertedBlob, setConvertedBlob] = React.useState<Blob | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  const handleUpload = (files: File[]) => {
    const f = files[0]
    setFile(f)
    const { ext, category } = detectFormat(f.name)
    setSourceExt(ext)
    setSourceCategory(category)
    setTargetFormat("")
    setConvertedBlob(null)
    setError(null)
    if (category) {
      setTargetCategory(category.name)
      const others = category.formats.filter((fmt) => fmt.ext !== ext)
      if (others.length > 0) setTargetFormat(others[0].ext)
    }
  }

  const getTargetFormats = () => {
    if (sourceCategory) {
      return sourceCategory.formats.filter((fmt) => fmt.ext !== sourceExt)
    }
    const cat = formatCategories.find((c) => c.name === targetCategory)
    return cat ? cat.formats : []
  }

  const handleConvert = async () => {
    if (!file || !targetFormat) return
    setConverting(true)
    setProgress(0)
    setError(null)

    try {
      setProgress(30)

      const targetMime = formatCategories
        .flatMap((c) => c.formats)
        .find((f) => f.ext === targetFormat)?.mime || "application/octet-stream"

      let blob: Blob | null = null

      if (sourceCategory?.name === "Images") {
        blob = await convertImage(file, targetMime)
      } else if (sourceCategory?.name === "Documents") {
        const text = await file.text()
        const result = convertDocumentText(text, sourceExt, targetFormat)
        blob = new Blob([result], { type: targetMime })
      }

      if (!blob) throw new Error("Conversion failed: unsupported format combination")
      setProgress(100)
      setConvertedBlob(blob)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Conversion failed")
    } finally {
      setConverting(false)
    }
  }

  const handleDownload = () => {
    if (!convertedBlob || !file) return
    const name = file.name.replace(/\.[^.]+$/, "") + "." + targetFormat
    const a = document.createElement("a")
    a.href = URL.createObjectURL(convertedBlob)
    a.download = name
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const handleReset = () => {
    setFile(null)
    setConvertedBlob(null)
    setError(null)
    setProgress(0)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
          <Repeat className="h-5 w-5 text-amber-500" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">File Converter</h2>
          <p className="text-sm text-muted-foreground">Convert files between different formats</p>
        </div>
      </div>

      {!convertedBlob && (
        <>
          <FileUpload
            onUpload={handleUpload}
            maxFiles={1}
            maxSize={50 * 1024 * 1024}
          />

          <AnimatePresence>
            {file && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center gap-3">
                    {getCategoryIcon(sourceCategory)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(file.size / 1024).toFixed(1)} KB · {sourceExt.toUpperCase()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Format selector */}
                <div className="rounded-xl border border-border bg-card p-5 space-y-3">
                  <span className="text-sm font-medium">Target Format</span>
                  {!sourceCategory && (
                    <div className="flex gap-2 mb-3">
                      {formatCategories.map((cat) => (
                        <button
                          key={cat.name}
                          onClick={() => setTargetCategory(cat.name)}
                          className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors",
                            targetCategory === cat.name
                              ? "border-amber-500/30 bg-amber-500/10 text-amber-500"
                              : "border-border text-muted-foreground hover:bg-accent/50"
                          )}
                        >
                          {cat.icon}
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="grid grid-cols-3 gap-2">
                    {getTargetFormats().map((fmt) => (
                      <button
                        key={fmt.ext}
                        onClick={() => setTargetFormat(fmt.ext)}
                        className={cn(
                          "p-3 rounded-xl border text-sm font-medium transition-colors",
                          targetFormat === fmt.ext
                            ? "border-amber-500/30 bg-amber-500/10 text-amber-500"
                            : "border-border text-muted-foreground hover:bg-accent/50"
                        )}
                      >
                        .{fmt.ext}
                        <span className="block text-xs text-muted-foreground mt-0.5">{fmt.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {error}
                  </div>
                )}

                <Button
                  onClick={handleConvert}
                  disabled={!targetFormat}
                  loading={converting}
                  fullWidth
                  size="lg"
                >
                  <Repeat className="h-4 w-4" />
                  Convert to .{targetFormat || "..."}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      <AnimatePresence>
        {converting && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-xl border border-border bg-card p-5"
          >
            <ProgressBar value={progress} variant="gradient" showPercentage label="Converting..." />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {convertedBlob && !converting && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-8 text-center space-y-4"
          >
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10">
                <CircleCheck className="h-8 w-8 text-emerald-500" />
              </div>
            </div>
            <div>
              <p className="text-lg font-semibold text-foreground">Conversion Complete</p>
              <p className="text-sm text-muted-foreground mt-1">
                {file?.name} → {file?.name.replace(/\.[^.]+$/, "")}.{targetFormat}
              </p>
            </div>
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <span>Original: {((file?.size || 0) / 1024).toFixed(1)} KB</span>
              <ArrowRight className="h-4 w-4" />
              <span>Converted: {(convertedBlob.size / 1024).toFixed(1)} KB</span>
            </div>
            <div className="flex justify-center gap-3">
              <Button onClick={handleDownload} variant="primary" size="lg">
                <Download className="h-4 w-4" />
                Download .{targetFormat}
              </Button>
              <Button onClick={handleReset} variant="outline" size="lg">
                Convert Another
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
