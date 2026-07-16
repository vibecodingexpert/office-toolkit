"use client"

import * as React from "react"
import { useDropzone, type DropzoneOptions } from "react-dropzone"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils/cn"
import {
  Upload,
  File,
  X,
  CheckCircle2,
  AlertCircle,
  FileText,
  FileImage,
  FileArchive,
  FileAudio,
  FileVideo,
  FileCode,
} from "lucide-react"

interface FilePreview {
  file: File
  id: string
  progress: number
  status: "uploading" | "complete" | "error"
  error?: string
}

interface FileUploadProps {
  onUpload?: (files: File[]) => void
  maxFiles?: number
  maxSize?: number
  accept?: Record<string, string[]>
  className?: string
}

function getFileIcon(name: string) {
  const ext = name.split(".").pop()?.toLowerCase()
  if (["pdf", "doc", "docx", "txt", "md"].includes(ext || ""))
    return <FileText className="h-5 w-5" />
  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext || ""))
    return <FileImage className="h-5 w-5" />
  if (["zip", "rar", "7z", "tar", "gz"].includes(ext || ""))
    return <FileArchive className="h-5 w-5" />
  if (["mp3", "wav", "ogg", "flac"].includes(ext || ""))
    return <FileAudio className="h-5 w-5" />
  if (["mp4", "avi", "mkv", "mov"].includes(ext || ""))
    return <FileVideo className="h-5 w-5" />
  if (["js", "ts", "jsx", "tsx", "py", "java", "css", "html"].includes(ext || ""))
    return <FileCode className="h-5 w-5" />
  return <File className="h-5 w-5" />
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function FileUpload({
  onUpload,
  maxFiles = 5,
  maxSize = 10 * 1024 * 1024,
  accept,
  className,
}: FileUploadProps) {
  const [files, setFiles] = React.useState<FilePreview[]>([])

  const onDrop = React.useCallback(
    (acceptedFiles: File[]) => {
      const newFiles = acceptedFiles.map((file) => ({
        file,
        id: crypto.randomUUID(),
        progress: 0,
        status: "uploading" as const,
      }))

      const total = [...files, ...newFiles].slice(0, maxFiles)
      setFiles(total)

      // Simulate upload progress
      newFiles.forEach((f) => {
        let progress = 0
        const interval = setInterval(() => {
          progress += Math.random() * 30
          if (progress >= 100) {
            progress = 100
            clearInterval(interval)
            setFiles((prev) =>
              prev.map((pf) =>
                pf.id === f.id
                  ? { ...pf, progress: 100, status: "complete" as const }
                  : pf
              )
            )
            onUpload?.(acceptedFiles)
          } else {
            setFiles((prev) =>
              prev.map((pf) =>
                pf.id === f.id
                  ? { ...pf, progress, status: "uploading" as const }
                  : pf
              )
            )
          }
        }, 200)
      })
    },
    [files, maxFiles, onUpload]
  )

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      onDrop,
      maxFiles,
      maxSize,
      accept,
      onDropRejected: (rejections) => {
        rejections.forEach((rejection) => {
          rejection.errors.forEach((err) => {
            if (err.code === "file-too-large") {
              const preview: FilePreview = {
                file: rejection.file,
                id: crypto.randomUUID(),
                progress: 0,
                status: "error",
                error: `File exceeds ${formatSize(maxSize)} limit`,
              }
              setFiles((prev) => [...prev, preview])
            }
          })
        })
      },
    })

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id))
  }

  return (
    <div className={cn("space-y-4", className)}>
      <motion.div
        initial={false}
        animate={
          isDragActive
            ? { scale: 1.01, borderColor: "var(--primary)" }
            : { scale: 1 }
        }
        {...(getRootProps() as React.ComponentPropsWithoutRef<typeof motion.div>)}
        className={cn(
          "relative cursor-pointer rounded-2xl border-2 border-dashed border-border bg-background p-8 text-center transition-all duration-200 hover:border-primary/50 hover:bg-primary/[0.02]",
          isDragActive && "border-primary bg-primary/5",
          isDragReject && "border-destructive bg-destructive/5",
          files.length >= maxFiles && "pointer-events-none opacity-50"
        )}
      >
        <input {...getInputProps()} />

        <motion.div
          animate={
            isDragActive
              ? { y: -4, scale: 1.05 }
              : { y: 0, scale: 1 }
          }
          className="flex flex-col items-center gap-3"
        >
          <motion.div
            animate={
              isDragActive
                ? { rotate: [0, -10, 10, -10, 0] }
                : {}
            }
            transition={{ duration: 0.5 }}
            className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 shadow-sm ring-1 ring-primary/10"
          >
            <Upload
              className={cn(
                "h-6 w-6 transition-colors",
                isDragActive ? "text-primary" : "text-muted-foreground"
              )}
            />
          </motion.div>

          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">
              {isDragActive ? (
                <span className="text-primary">Drop files here</span>
              ) : (
                <>
                  Drag & drop files or <span className="text-primary underline underline-offset-2">browse</span>
                </>
              )}
            </p>
            <p className="text-xs text-muted-foreground">
              Up to {maxFiles} files, {formatSize(maxSize)} each
            </p>
          </div>
        </motion.div>
      </motion.div>

      {/* File previews */}
      <AnimatePresence>
        {files.map((filePreview) => (
          <motion.div
            key={filePreview.id}
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "flex items-center gap-3 rounded-xl border p-3 transition-colors",
              filePreview.status === "error"
                ? "border-destructive/30 bg-destructive/5"
                : filePreview.status === "complete"
                  ? "border-emerald-500/30 bg-emerald-500/5"
                  : "border-border bg-card"
            )}
          >
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                filePreview.status === "error"
                  ? "bg-destructive/10 text-destructive"
                  : filePreview.status === "complete"
                    ? "bg-emerald-500/10 text-emerald-500"
                    : "bg-muted text-muted-foreground"
              )}
            >
              {filePreview.status === "complete" ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : filePreview.status === "error" ? (
                <AlertCircle className="h-5 w-5" />
              ) : (
                getFileIcon(filePreview.file.name)
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-foreground truncate">
                  {filePreview.file.name}
                </p>
                <span className="text-xs text-muted-foreground shrink-0">
                  {formatSize(filePreview.file.size)}
                </span>
              </div>

              {filePreview.status === "uploading" && (
                <div className="mt-2">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs text-muted-foreground">
                      Uploading...
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {Math.round(filePreview.progress)}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${filePreview.progress}%` }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className="h-full rounded-full bg-gradient-to-r from-primary to-violet-500"
                    />
                  </div>
                </div>
              )}

              {filePreview.status === "error" && filePreview.error && (
                <p className="mt-1 text-xs text-destructive">
                  {filePreview.error}
                </p>
              )}

              {filePreview.status === "complete" && (
                <p className="mt-0.5 text-xs text-emerald-500">
                  Upload complete
                </p>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => removeFile(filePreview.id)}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <X className="h-4 w-4" />
            </motion.button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
