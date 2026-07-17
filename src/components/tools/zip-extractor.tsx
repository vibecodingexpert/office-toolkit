"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils/cn"
import { Button } from "@/components/ui/button"
import { FileUpload } from "@/components/ui/file-upload"
import { ProgressBar } from "@/components/ui/progress-bar"
import JSZip from "jszip"
import {
  FileArchive,
  Download,
  File,
  Folder,
  CircleCheck,
  AlertCircle,
  FileText,
  FileImage,
  FileMusic,
  FileVideoCamera,
  Search,
} from "lucide-react"

interface ZipEntry {
  name: string
  size: number
  compressedSize?: number
  isDirectory: boolean
}

function getFileIcon(name: string) {
  const ext = name.split(".").pop()?.toLowerCase()
  if (["txt", "pdf", "doc", "docx", "md"].includes(ext || "")) return <FileText className="h-4 w-4" />
  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext || "")) return <FileImage className="h-4 w-4" />
  if (["mp3", "wav", "ogg", "flac"].includes(ext || "")) return <FileMusic className="h-4 w-4" />
  if (["mp4", "avi", "mkv", "mov"].includes(ext || "")) return <FileVideoCamera className="h-4 w-4" />
  return <File className="h-4 w-4" />
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function ZipExtractor() {
  const [file, setFile] = React.useState<File | null>(null)
  const [entries, setEntries] = React.useState<ZipEntry[]>([])
  const [selected, setSelected] = React.useState<Set<string>>(new Set())
  const [extracting, setExtracting] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  const [extractedBlobs, setExtractedBlobs] = React.useState<Map<string, Blob>>(new Map())
  const [search, setSearch] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const zipRef = React.useRef<JSZip | null>(null)

  const handleUpload = (files: File[]) => {
    const f = files[0]
    setFile(f)
    setExtractedBlobs(new Map())
    setError(null)
    setSelected(new Set())

    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const buffer = e.target?.result as ArrayBuffer
        const zip = await JSZip.loadAsync(buffer)
        zipRef.current = zip

        const allEntries: ZipEntry[] = []
        zip.forEach((relativePath, zipEntry) => {
          const raw = (zipEntry as any)._data
          allEntries.push({
            name: relativePath,
            size: raw?.uncompressedSize ?? 0,
            compressedSize: raw?.compressedSize ?? 0,
            isDirectory: zipEntry.dir,
          })
        })

        setEntries(allEntries)
        setSelected(new Set(allEntries.filter((e) => !e.isDirectory).map((e) => e.name)))
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to read ZIP file")
      }
    }
    reader.readAsArrayBuffer(f)
  }

  const toggleEntry = (name: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

  const handleExtract = async () => {
    if (!file || selected.size === 0) return
    setExtracting(true)
    setProgress(0)
    setError(null)

    try {
      const blobs = new Map<string, Blob>()
      const selectedEntries = entries.filter((e) => selected.has(e.name))
      const total = selectedEntries.length
      let done = 0

      for (const entry of selectedEntries) {
        const zipObj = zipRef.current?.file(entry.name)
        if (zipObj && !zipObj.dir) {
          const blob = await zipObj.async("blob")
          blobs.set(entry.name, blob)
        }
        done++
        setProgress(Math.round((done / total) * 100))
      }

      setExtractedBlobs(blobs)
      setProgress(100)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Extraction failed")
    } finally {
      setExtracting(false)
    }
  }

  const handleDownload = (name: string) => {
    const blob = extractedBlobs.get(name)
    if (!blob) return
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = name.split("/").pop() || name
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const handleDownloadAll = async () => {
    const newZip = new JSZip()
    extractedBlobs.forEach((blob, name) => {
      newZip.file(name, blob)
    })
    const content = await newZip.generateAsync({ type: "blob" })
    const a = document.createElement("a")
    a.href = URL.createObjectURL(content)
    a.download = "extracted-files.zip"
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const handleReset = () => {
    setFile(null)
    setEntries([])
    setSelected(new Set())
    setExtractedBlobs(new Map())
    setError(null)
    setProgress(0)
  }

  const filteredEntries = entries.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
          <FileArchive className="h-5 w-5 text-amber-500" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Zip Extractor</h2>
          <p className="text-sm text-muted-foreground">Extract files from ZIP archives</p>
        </div>
      </div>

      {extractedBlobs.size === 0 && (
        <>
          <FileUpload
            onUpload={handleUpload}
            maxFiles={1}
            accept={{ "application/zip": [".zip"] }}
          />

          <AnimatePresence>
            {entries.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="rounded-xl border border-border bg-card p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Archive Contents ({entries.filter((e) => !e.isDirectory).length} files)
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {selected.size} selected
                    </span>
                  </div>

                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search files..."
                      className="w-full h-9 rounded-lg border border-input bg-background pl-9 pr-3 text-sm text-foreground placeholder-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>

                  <div className="space-y-0.5 max-h-64 overflow-y-auto">
                    {filteredEntries.map((entry) => (
                      <div
                        key={entry.name}
                        className={cn(
                          "flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors",
                          entry.isDirectory ? "opacity-60" : "hover:bg-accent/50",
                          selected.has(entry.name) && !entry.isDirectory && "bg-primary/5"
                        )}
                        onClick={() => !entry.isDirectory && toggleEntry(entry.name)}
                      >
                        <input
                          type="checkbox"
                          checked={selected.has(entry.name)}
                          onChange={() => toggleEntry(entry.name)}
                          disabled={entry.isDirectory}
                          className="h-4 w-4 rounded border-border text-amber-500 focus:ring-amber-500"
                        />
                        {entry.isDirectory ? (
                          <Folder className="h-4 w-4 text-muted-foreground shrink-0" />
                        ) : (
                          getFileIcon(entry.name)
                        )}
                        <span className={cn(
                          "flex-1 text-sm truncate",
                          entry.isDirectory ? "text-muted-foreground" : "text-foreground"
                        )}>
                          {entry.name}
                        </span>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {formatSize(entry.size)}
                        </span>
                      </div>
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
                  onClick={handleExtract}
                  disabled={selected.size === 0}
                  loading={extracting}
                  fullWidth
                  size="lg"
                >
                  <FileArchive className="h-4 w-4" />
                  Extract {selected.size} file{selected.size !== 1 ? "s" : ""}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      <AnimatePresence>
        {extracting && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-xl border border-border bg-card p-5"
          >
            <ProgressBar value={progress} variant="gradient" showPercentage label="Extracting..." />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {extractedBlobs.size > 0 && !extracting && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CircleCheck className="h-5 w-5 text-emerald-500" />
                <span className="text-sm font-medium">Extraction Complete</span>
              </div>
              <Button onClick={handleDownloadAll} variant="primary" size="sm">
                <Download className="h-4 w-4" />
                Download All
              </Button>
            </div>
            <div className="space-y-1">
              {Array.from(extractedBlobs.entries()).map(([name, blob]) => (
                <div
                  key={name}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
                  onClick={() => handleDownload(name)}
                >
                  <div className="flex items-center gap-2">
                    {getFileIcon(name)}
                    <span className="text-sm text-foreground">{name.split("/").pop()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{formatSize(blob.size)}</span>
                    <Download className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>
            <Button onClick={handleReset} variant="outline" fullWidth>
              Extract Another Archive
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
