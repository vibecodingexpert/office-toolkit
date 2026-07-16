"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils/cn"
import { ToolHeader } from "@/components/ui/tool-header"
import { FileUpload } from "@/components/ui/file-upload"
import { OutputPanel } from "@/components/ui/output-panel"
import { ProgressBar } from "@/components/ui/progress-bar"
import { toast } from "@/components/ui/toast"
import { Button } from "@/components/ui/button"
import type { Tool, ToolResult } from "@/types"
import {
  Upload,
  Download,
  Copy,
  Check,
  RefreshCw,
  AlertCircle,
  FileUp,
  Wand2,
} from "lucide-react"

type ProcessingState = "idle" | "uploading" | "processing" | "complete" | "error"

interface ToolWrapperProps {
  tool: Tool
  onProcess?: (files: File[]) => Promise<ToolResult>
  accept?: Record<string, string[]>
  maxFiles?: number
  maxSize?: number
  extraActions?: React.ReactNode
  showInput?: boolean
  inputPlaceholder?: string
  value?: string
  onChange?: (value: string) => void
  className?: string
  children?: React.ReactNode
}

export function ToolWrapper({
  tool,
  onProcess,
  accept,
  maxFiles = 1,
  maxSize = 10 * 1024 * 1024,
  extraActions,
  showInput = false,
  inputPlaceholder = "Enter text here...",
  value,
  onChange,
  className,
  children,
}: ToolWrapperProps) {
  const [state, setState] = React.useState<ProcessingState>("idle")
  const [progress, setProgress] = React.useState(0)
  const [result, setResult] = React.useState<ToolResult | null>(null)
  const [uploadedFiles, setUploadedFiles] = React.useState<File[]>([])
  const [error, setError] = React.useState<string | null>(null)

  const handleUpload = React.useCallback((files: File[]) => {
    setUploadedFiles(files)
    setState("uploading")
    setError(null)
    setResult(null)
    setProgress(0)
  }, [])

  const handleProcess = React.useCallback(async () => {
    if (!onProcess) return
    const files = uploadedFiles
    if (files.length === 0 && !value) {
      toast.error("Please upload a file or enter input")
      return
    }

    setState("processing")
    setError(null)
    setResult(null)

    // Simulate processing progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + Math.random() * 15
        return next >= 90 ? 90 : next
      })
    }, 300)

    try {
      const res = await onProcess(files)
      clearInterval(progressInterval)
      setProgress(100)

      if (res.success) {
        setState("complete")
        setResult(res)
        toast.success("Processing complete")
      } else {
        setState("error")
        setError(res.error || "An error occurred during processing")
        toast.error(res.error || "Processing failed")
      }
    } catch (err) {
      clearInterval(progressInterval)
      setState("error")
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred"
      setError(message)
      toast.error(message)
    }
  }, [onProcess, uploadedFiles, value])

  const handleReset = React.useCallback(() => {
    setState("idle")
    setProgress(0)
    setResult(null)
    setError(null)
    setUploadedFiles([])
  }, [])

  const handleDownload = React.useCallback(() => {
    if (result?.downloadUrl) {
      const a = document.createElement("a")
      a.href = result.downloadUrl
      a.download = `output.${tool.id}`
      a.click()
    }
  }, [result, tool.id])

  const handleCopy = React.useCallback(async () => {
    if (result?.data) {
      const text =
        typeof result.data === "string"
          ? result.data
          : JSON.stringify(result.data, null, 2)
      try {
        await navigator.clipboard.writeText(text)
        toast.success("Copied to clipboard")
      } catch {
        toast.error("Failed to copy")
      }
    }
  }, [result])

  const hasResult = state === "complete" && result
  const canProcess =
    state === "idle" || state === "uploading"
      ? uploadedFiles.length > 0 || (showInput && value)
      : false

  return (
    <div className={cn("mx-auto max-w-4xl space-y-8", className)}>
      <ToolHeader tool={tool} />

      {/* Processing state bar */}
      <AnimatePresence>
        {(state === "processing" || state === "error") && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.3 }}
            className={cn(
              "overflow-hidden rounded-2xl border p-5",
              state === "error"
                ? "border-destructive/30 bg-destructive/5"
                : "border-border bg-card shadow-sm"
            )}
          >
            {state === "processing" && (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <Wand2 className="h-5 w-5 animate-pulse text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Processing your {tool.name.toLowerCase()}...
                    </p>
                    <p className="text-xs text-muted-foreground">
                      This should only take a moment
                    </p>
                  </div>
                </div>
                <ProgressBar
                  value={progress}
                  variant="gradient"
                  size="md"
                  showPercentage
                />
              </div>
            )}

            {state === "error" && (
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-destructive/10">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    Processing failed
                  </p>
                  <p className="mt-0.5 text-sm text-destructive/80">{error}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleReset}
                    className="mt-3"
                  >
                    <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                    Try again
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input section */}
      <AnimatePresence mode="wait">
        {state !== "processing" && (
          <motion.div
            key={state === "complete" ? "complete" : "input"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* File upload */}
            {!showInput && state !== "complete" && (
              <FileUpload
                onUpload={handleUpload}
                maxFiles={maxFiles}
                maxSize={maxSize}
                accept={accept}
              />
            )}

            {/* Text input */}
            {showInput && state !== "complete" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <label className="text-sm font-medium text-foreground">
                  Input
                </label>
                <textarea
                  value={value}
                  onChange={(e) => onChange?.(e.target.value)}
                  placeholder={inputPlaceholder}
                  rows={6}
                  className="w-full resize-y rounded-2xl border border-border bg-background p-4 text-sm text-foreground placeholder-muted-foreground shadow-sm transition-all focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
                />
              </motion.div>
            )}

            {/* Custom children (for tools with special inputs) */}
            {children && state !== "complete" && <div>{children}</div>}

            {/* Action buttons */}
            {state !== "complete" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-wrap items-center gap-3"
              >
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleProcess}
                  disabled={!canProcess}
                >
                  <Wand2 className="h-4 w-4" />
                  {state === "idle" || state === "uploading"
                    ? "Process"
                    : "Reprocess"}
                </Button>

                {extraActions}

                {state === "error" && (
                  <Button variant="outline" size="lg" onClick={handleReset}>
                    <RefreshCw className="h-4 w-4" />
                    Reset
                  </Button>
                )}

                {state === "idle" && uploadedFiles.length > 0 && (
                  <Button variant="ghost" size="lg" onClick={handleReset}>
                    Clear
                  </Button>
                )}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Output */}
      <AnimatePresence>
        {hasResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <OutputPanel
              title="Result"
              onCopy={result.data ? handleCopy : undefined}
              onDownload={result.downloadUrl ? handleDownload : undefined}
              onReset={handleReset}
              copyValue={
                result.data
                  ? typeof result.data === "string"
                    ? result.data
                    : JSON.stringify(result.data, null, 2)
                  : undefined
              }
            >
              {result.data ? (
                <div className="overflow-auto">
                  {typeof result.data === "string" ? (
                    <pre className="whitespace-pre-wrap break-all text-sm text-foreground">
                      {result.data}
                    </pre>
                  ) : (
                    <pre className="overflow-x-auto whitespace-pre-wrap break-all text-sm text-foreground">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  )}
                </div>
              ) : result.downloadUrl ? (
                <div className="flex flex-col items-center gap-4 py-8">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10">
                    <Check className="h-8 w-8 text-emerald-500" />
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-foreground">
                      Ready for download
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Your file has been processed successfully
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleDownload}
                  >
                    <Download className="h-4 w-4" />
                    Download File
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                  Processing complete
                </div>
              )}
            </OutputPanel>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Idle state with files uploaded */}
      {state === "idle" && uploadedFiles.length === 0 && !showInput && !children && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-12 text-center"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
            <FileUp className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">
            Upload a file above to get started
          </p>
        </motion.div>
      )}
    </div>
  )
}
