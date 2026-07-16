"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils/cn"
import { Button } from "@/components/ui/button"
import { FileUpload } from "@/components/ui/file-upload"
import { ProgressBar } from "@/components/ui/progress-bar"
import {
  Files,
  Trash2,
  Search,
  CircleCheck,
  AlertCircle,
  File,
  FileText,
  FileImage,
  FileMusic,
  FileVideoCamera,
  Filter,
  Layers,
} from "lucide-react"

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

interface UploadedFile {
  file: File
  id: string
}

interface DuplicateGroup {
  key: string
  files: UploadedFile[]
}

export function DuplicateFinder() {
  const [uploadedFiles, setUploadedFiles] = React.useState<UploadedFile[]>([])
  const [compareMode, setCompareMode] = React.useState<"name" | "size" | "both">("both")
  const [groups, setGroups] = React.useState<DuplicateGroup[]>([])
  const [selectedForRemoval, setSelectedForRemoval] = React.useState<Set<string>>(new Set())
  const [scanning, setScanning] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  const [scanned, setScanned] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleUpload = (f: File[]) => {
    const newFiles = f.map((file) => ({ file, id: crypto.randomUUID() }))
    setUploadedFiles((prev) => [...prev, ...newFiles])
    setScanned(false)
    setGroups([])
  }

  const removeFile = (id: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== id))
    setScanned(false)
    setGroups([])
  }

  const findDuplicates = () => {
    if (uploadedFiles.length < 2) {
      setError("Upload at least 2 files to find duplicates")
      return
    }
    setScanning(true)
    setProgress(0)
    setError(null)

    setTimeout(() => {
      const map = new Map<string, UploadedFile[]>()

      uploadedFiles.forEach((uf, i) => {
        let key = ""
        if (compareMode === "name" || compareMode === "both") key += uf.file.name.toLowerCase()
        if (compareMode === "size" || compareMode === "both") key += `|${uf.file.size}`
        if (!map.has(key)) map.set(key, [])
        map.get(key)!.push(uf)
        setProgress(Math.round(((i + 1) / uploadedFiles.length) * 100))
      })

      const duplicateGroups: DuplicateGroup[] = []
      map.forEach((files, key) => {
        if (files.length > 1) {
          duplicateGroups.push({ key, files })
        }
      })

      setGroups(duplicateGroups)
      setScanned(true)
      setScanning(false)
      setProgress(100)
    }, 500)
  }

  const toggleSelection = (id: string) => {
    setSelectedForRemoval((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const removeSelected = () => {
    setUploadedFiles((prev) => prev.filter((f) => !selectedForRemoval.has(f.id)))
    setSelectedForRemoval(new Set())
    setGroups([])
    setScanned(false)
  }

  const totalDupes = groups.reduce((sum, g) => sum + g.files.length, 0)
  const wastedSpace = groups.reduce((sum, g) => {
    if (g.files.length < 2) return sum
    return sum + g.files.slice(1).reduce((s, f) => s + f.file.size, 0)
  }, 0)

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
          <Files className="h-5 w-5 text-amber-500" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Duplicate Finder</h2>
          <p className="text-sm text-muted-foreground">Find and remove duplicate files</p>
        </div>
      </div>

      <FileUpload
        onUpload={handleUpload}
        maxFiles={50}
        maxSize={50 * 1024 * 1024}
      />

      <AnimatePresence>
        {uploadedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="rounded-xl border border-border bg-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{uploadedFiles.length} file{uploadedFiles.length !== 1 ? "s" : ""}</span>
                {scanned && (
                  <span className="text-xs text-muted-foreground">
                    {groups.length} dupe group{groups.length !== 1 ? "s" : ""}
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                {(["name", "size", "both"] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setCompareMode(mode)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors",
                      compareMode === mode
                        ? "border-amber-500/30 bg-amber-500/10 text-amber-500"
                        : "border-border text-muted-foreground hover:bg-accent/50"
                    )}
                  >
                    <Filter className="h-3 w-3" />
                    {mode === "name" ? "Name" : mode === "size" ? "Size" : "Name + Size"}
                  </button>
                ))}
              </div>

              <div className="space-y-1 max-h-48 overflow-y-auto">
                {uploadedFiles.map((uf) => (
                  <div
                    key={uf.id}
                    className={cn(
                      "flex items-center gap-3 p-2 rounded-lg transition-colors",
                      selectedForRemoval.has(uf.id) ? "bg-destructive/5" : "hover:bg-accent/50"
                    )}
                  >
                    {getFileIcon(uf.file.name)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground truncate">{uf.file.name}</p>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">{formatSize(uf.file.size)}</span>
                    <button
                      onClick={() => removeFile(uf.id)}
                      className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {!scanned && !scanning && (
              <Button onClick={findDuplicates} fullWidth size="lg">
                <Search className="h-4 w-4" />
                Find Duplicates
              </Button>
            )}

            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {scanning && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-xl border border-border bg-card p-5"
          >
            <ProgressBar value={progress} variant="gradient" showPercentage label="Scanning..." />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {scanned && groups.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-border bg-card p-4 text-center">
                <Layers className="h-5 w-5 text-amber-500 mx-auto mb-1" />
                <p className="text-2xl font-bold text-foreground">{groups.length}</p>
                <p className="text-xs text-muted-foreground">Duplicate Groups</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-4 text-center">
                <AlertCircle className="h-5 w-5 text-destructive mx-auto mb-1" />
                <p className="text-2xl font-bold text-foreground">{formatSize(wastedSpace)}</p>
                <p className="text-xs text-muted-foreground">Wasted Space</p>
              </div>
            </div>

            {/* Groups */}
            {groups.map((group) => (
              <div key={group.key} className="rounded-xl border border-border bg-card p-4 space-y-2">
                <p className="text-xs text-muted-foreground">
                  {group.files.length} duplicates · {formatSize(group.files[0].file.size)} each
                </p>
                {group.files.map((uf) => (
                  <label
                    key={uf.id}
                    className={cn(
                      "flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors",
                      selectedForRemoval.has(uf.id) ? "bg-destructive/5 line-through" : "hover:bg-accent/50"
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={selectedForRemoval.has(uf.id)}
                      onChange={() => toggleSelection(uf.id)}
                      className="h-4 w-4 rounded border-border text-destructive focus:ring-destructive"
                    />
                    {getFileIcon(uf.file.name)}
                    <span className="flex-1 text-sm text-foreground truncate">{uf.file.name}</span>
                  </label>
                ))}
              </div>
            ))}

            {selectedForRemoval.size > 0 && (
              <Button
                onClick={removeSelected}
                variant="destructive"
                fullWidth
                size="lg"
              >
                <Trash2 className="h-4 w-4" />
                Remove {selectedForRemoval.size} Selected
              </Button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {scanned && groups.length === 0 && uploadedFiles.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-6 text-center"
        >
          <CircleCheck className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
          <p className="text-sm text-foreground">No duplicates found!</p>
          <p className="text-xs text-muted-foreground mt-1">All files are unique</p>
        </motion.div>
      )}
    </div>
  )
}
