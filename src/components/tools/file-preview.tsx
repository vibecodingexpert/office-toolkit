"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils/cn"
import { Button } from "@/components/ui/button"
import { FileUpload } from "@/components/ui/file-upload"
import {
  File,
  FileText,
  FileImage,
  FileCode,
  Download,
  Eye,
  X,
  Image,
  Terminal,
  AlignLeft,
  FileType,
} from "lucide-react"

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(ms: number) {
  return new Date(ms).toLocaleString()
}

function getFileCategory(name: string): "image" | "text" | "code" | "pdf" | "other" {
  const ext = name.split(".").pop()?.toLowerCase() || ""
  if (["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "ico"].includes(ext)) return "image"
  if (["txt", "md", "csv", "json", "xml", "yaml", "yml", "ini", "cfg", "log", "env"].includes(ext)) return "text"
  if (["js", "ts", "jsx", "tsx", "py", "java", "rb", "go", "rs", "c", "cpp", "h", "hpp", "cs", "php", "swift", "kt", "scala", "dart", "html", "css", "scss", "less", "sql", "sh", "bash", "zsh", "ps1", "bat"].includes(ext)) return "code"
  if (ext === "pdf") return "pdf"
  return "other"
}

const CODE_COLORS: Record<string, string> = {
  keyword: "text-purple-500",
  string: "text-emerald-500",
  number: "text-amber-500",
  comment: "text-muted-foreground italic",
  function: "text-cyan-500",
  variable: "text-blue-400",
  operator: "text-orange-400",
  tag: "text-red-400",
  attr: "text-yellow-400",
}

function basicSyntaxHighlight(code: string): React.ReactNode[] {
  const lines = code.split("\n")
  return lines.map((line, i) => {
    const tokens = line.split(/(\b\w+\b|"[^"]*"|'[^']*'|`[^`]*`|\/\/.*|\/\*[\s\S]*?\*\/|\d+\.?\d*|[{}()\[\];:.,<>=!+\-*/%&|^~?@#])/g)
    return (
      <div key={i} className="flex">
        <span className="text-muted-foreground text-xs w-8 text-right shrink-0 select-none pr-3">{i + 1}</span>
        <span className="flex-1">{tokens.map((token, j) => {
          if (/^"(?:[^"\\]|\\.)*"$/.test(token) || /^'(?:[^'\\]|\\.)*'$/.test(token) || /^`(?:[^`\\]|\\.)*`$/.test(token)) {
            return <span key={j} className={CODE_COLORS.string}>{token}</span>
          }
          if (/^\d+\.?\d*$/.test(token)) return <span key={j} className={CODE_COLORS.number}>{token}</span>
          if (/^(function|const|let|var|if|else|for|while|return|import|export|from|class|extends|new|this|async|await|try|catch|throw|switch|case|default|break|continue|typeof|instanceof|in|of|true|false|null|undefined|void)$/.test(token)) {
            return <span key={j} className={CODE_COLORS.keyword}>{token}</span>
          }
          if (/^(<\/?\w+[^>]*>)$/.test(token)) {
            return <span key={j} className={CODE_COLORS.tag}>{token}</span>
          }
          return <span key={j}>{token}</span>
        })}</span>
      </div>
    )
  })
}

export function FilePreview() {
  const [file, setFile] = React.useState<File | null>(null)
  const [textContent, setTextContent] = React.useState<string | null>(null)
  const [imageUrl, setImageUrl] = React.useState<string | null>(null)
  const [category, setCategory] = React.useState<ReturnType<typeof getFileCategory>>("other")

  const handleUpload = (files: File[]) => {
    const f = files[0]
    setFile(f)
    const cat = getFileCategory(f.name)
    setCategory(cat)

    if (cat === "image") {
      const url = URL.createObjectURL(f)
      setImageUrl(url)
      setTextContent(null)
    } else if (cat === "text" || cat === "code") {
      const reader = new FileReader()
      reader.onload = (e) => {
        setTextContent(e.target?.result as string)
      }
      reader.readAsText(f)
      setImageUrl(null)
    } else if (cat === "pdf") {
      const url = URL.createObjectURL(f)
      setImageUrl(url)
      setTextContent(null)
    } else {
      setTextContent(null)
      setImageUrl(null)
    }
  }

  const handleDownload = () => {
    if (!file) return
    const a = document.createElement("a")
    a.href = URL.createObjectURL(file)
    a.download = file.name
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const handleReset = () => {
    setFile(null)
    setTextContent(null)
    setImageUrl(null)
  }

  const getIcon = () => {
    switch (category) {
      case "image": return <Image className="h-5 w-5" />
      case "code": return <Terminal className="h-5 w-5" />
      case "text": return <AlignLeft className="h-5 w-5" />
      case "pdf": return <FileType className="h-5 w-5" />
      default: return <File className="h-5 w-5" />
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
          <Eye className="h-5 w-5 text-amber-500" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">File Preview</h2>
          <p className="text-sm text-muted-foreground">Preview files before downloading</p>
        </div>
      </div>

      {!file && (
        <FileUpload
          onUpload={handleUpload}
          maxFiles={1}
          maxSize={50 * 1024 * 1024}
        />
      )}

      <AnimatePresence>
        {file && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* File info */}
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                  {getIcon()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatSize(file.size)} · {file.type || "Unknown"} · Modified {formatDate(file.lastModified)}
                  </p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={handleDownload}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                  <button
                    onClick={handleReset}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              {category === "image" && imageUrl && (
                <div className="flex items-center justify-center p-4 bg-[radial-gradient(circle,#1a1a2e_1px,transparent_1px)] bg-[length:20px_20px]">
                  <img
                    src={imageUrl}
                    alt={file.name}
                    className="max-w-full max-h-[500px] rounded-lg object-contain"
                  />
                </div>
              )}

              {category === "text" && textContent !== null && (
                <div className="p-4">
                  <pre className="text-sm text-foreground whitespace-pre-wrap font-sans">
                    {textContent}
                  </pre>
                </div>
              )}

              {category === "code" && textContent !== null && (
                <div className="overflow-auto max-h-[500px]">
                  <pre className="text-sm font-mono leading-6 p-4 bg-muted/20">
                    <code>{basicSyntaxHighlight(textContent)}</code>
                  </pre>
                </div>
              )}

              {category === "pdf" && imageUrl && (
                <div className="w-full h-[500px]">
                  <iframe
                    src={imageUrl}
                    className="w-full h-full border-0"
                    title={file.name}
                  />
                </div>
              )}

              {category === "other" && (
                <div className="flex flex-col items-center gap-3 py-12 text-center">
                  <File className="h-12 w-12 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Preview not available for this file type
                  </p>
                  <Button onClick={handleDownload} variant="primary" size="sm">
                    <Download className="h-4 w-4" />
                    Download File
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!file && (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-12 text-center">
          <Eye className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Upload a file to preview it</p>
        </div>
      )}
    </div>
  )
}
