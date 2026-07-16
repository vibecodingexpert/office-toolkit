"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils/cn"
import { toast } from "@/components/ui/toast"
import {
  Copy,
  Download,
  RotateCcw,
  Check,
  FileDown,
  Eye,
  EyeOff,
} from "lucide-react"

interface OutputPanelProps {
  title?: string
  children: React.ReactNode
  onCopy?: () => void
  onDownload?: () => void
  onReset?: () => void
  copyValue?: string
  downloadFileName?: string
  showPreviewToggle?: boolean
  className?: string
}

export function OutputPanel({
  title = "Output",
  children,
  onCopy,
  onDownload,
  onReset,
  copyValue,
  showPreviewToggle = false,
  className,
}: OutputPanelProps) {
  const [isPreviewVisible, setIsPreviewVisible] = React.useState(true)
  const [copied, setCopied] = React.useState(false)

  const handleCopy = async () => {
    if (copyValue) {
      try {
        await navigator.clipboard.writeText(copyValue)
        setCopied(true)
        toast.success("Copied to clipboard")
        setTimeout(() => setCopied(false), 2000)
      } catch {
        toast.error("Failed to copy")
      }
    }
    onCopy?.()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "overflow-hidden rounded-2xl border border-border bg-card shadow-sm",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-red-500/80" />
            <div className="h-3 w-3 rounded-full bg-amber-500/80" />
            <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
          </div>
          <span className="ml-3 text-sm font-medium text-foreground">
            {title}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {showPreviewToggle && (
            <button
              onClick={() => setIsPreviewVisible(!isPreviewVisible)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              aria-label={isPreviewVisible ? "Hide preview" : "Show preview"}
            >
              {isPreviewVisible ? (
                <Eye className="h-4 w-4" />
              ) : (
                <EyeOff className="h-4 w-4" />
              )}
            </button>
          )}

          {onCopy && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCopy}
              className="flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  Copy
                </>
              )}
            </motion.button>
          )}

          {onDownload && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onDownload}
              className="flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              Download
            </motion.button>
          )}

          {onReset && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onReset}
              className="flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </motion.button>
          )}
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {isPreviewVisible && (
          <motion.div
            key="content"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="p-5"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>

      {!isPreviewVisible && (
        <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
          Preview hidden
        </div>
      )}
    </motion.div>
  )
}
