"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils/cn"
import { Button } from "@/components/ui/button"
import { FileUpload } from "@/components/ui/file-upload"
import { ProgressBar } from "@/components/ui/progress-bar"
import {
  Unlock,
  Download,
  AlertCircle,
  CheckCircle2,
  File,
  Eye,
  EyeOff,
  ShieldAlert,
} from "lucide-react"

async function deriveKey(password: string, salt: Uint8Array, length: 128 | 256): Promise<CryptoKey> {
  const enc = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveKey"])
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: salt.buffer as ArrayBuffer, iterations: 600000, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-CBC", length },
    true,
    ["decrypt"]
  )
}

export function FileDecrypt() {
  const [file, setFile] = React.useState<File | null>(null)
  const [password, setPassword] = React.useState("")
  const [showPw, setShowPw] = React.useState(false)
  const [decrypting, setDecrypting] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  const [decryptedBlob, setDecryptedBlob] = React.useState<Blob | null>(null)
  const [originalName, setOriginalName] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)

  const handleDecrypt = async () => {
    if (!file || !password) return

    setError(null)
    setDecrypting(true)
    setProgress(0)

    try {
      const buffer = await file.arrayBuffer()
      const data = new Uint8Array(buffer)

      let offset = 0
      const algoFlag = data[offset]; offset += 1
      const algorithm: 128 | 256 = algoFlag === 1 ? 128 : 256

      const metaLen = new Uint32Array(data.slice(offset, offset + 4).buffer)[0]; offset += 4
      const salt = data.slice(offset, offset + 16); offset += 16
      const iv = data.slice(offset, offset + 16); offset += 16
      const metaJson = new TextDecoder().decode(data.slice(offset, offset + metaLen)); offset += metaLen
      const encryptedData = data.slice(offset)

      const metadata = JSON.parse(metaJson)
      setOriginalName(metadata.name)

      setProgress(30)

      const key = await deriveKey(password, salt, algorithm)
      const decrypted = await crypto.subtle.decrypt({ name: "AES-CBC", iv }, key, encryptedData)

      setProgress(80)

      const blob = new Blob([decrypted], { type: metadata.type || "application/octet-stream" })
      setProgress(100)
      setDecryptedBlob(blob)
    } catch {
      setError("Decryption failed. Wrong password or corrupted file.")
    } finally {
      setDecrypting(false)
    }
  }

  const handleDownload = () => {
    if (!decryptedBlob) return
    const a = document.createElement("a")
    a.href = URL.createObjectURL(decryptedBlob)
    a.download = originalName || "decrypted-file"
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const handleReset = () => {
    setFile(null)
    setPassword("")
    setDecryptedBlob(null)
    setError(null)
    setProgress(0)
    setOriginalName("")
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10">
          <Unlock className="h-5 w-5 text-cyan-500" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">File Decrypt</h2>
          <p className="text-sm text-muted-foreground">Decrypt .enc files encrypted with AES</p>
        </div>
      </div>

      {!decryptedBlob && (
        <>
          <FileUpload
            onUpload={(files) => setFile(files[0])}
            maxFiles={1}
            accept={{ "application/octet-stream": [".enc"] }}
          />

          <AnimatePresence>
            {file && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <File className="h-8 w-8 text-primary" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-5 space-y-3">
                  <label className="text-sm font-medium">Decryption Password</label>
                  <div className="relative">
                    <input
                      type={showPw ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter the encryption password"
                      className="w-full h-10 rounded-lg border border-input bg-background px-3 pr-10 text-sm text-foreground placeholder-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                    <button
                      onClick={() => setShowPw(!showPw)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                    <ShieldAlert className="h-4 w-4 shrink-0" />
                    {error}
                  </div>
                )}

                <Button onClick={handleDecrypt} disabled={!file || !password} loading={decrypting} fullWidth size="lg">
                  <Unlock className="h-4 w-4" />
                  Decrypt File
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      <AnimatePresence>
        {decrypting && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-xl border border-border bg-card p-5"
          >
            <ProgressBar value={progress} variant="gradient" showPercentage label="Decrypting..." />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {decryptedBlob && !decrypting && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-8 text-center space-y-4"
          >
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10">
                <CheckCircle2 className="h-8 w-8 text-emerald-500" />
              </div>
            </div>
            <div>
              <p className="text-lg font-semibold text-foreground">Decryption Complete</p>
              <p className="text-sm text-muted-foreground mt-1">
                {originalName || "File"} has been decrypted successfully
              </p>
            </div>
            <div className="flex justify-center gap-3">
              <Button onClick={handleDownload} variant="primary" size="lg">
                <Download className="h-4 w-4" />
                Download Decrypted File
              </Button>
              <Button onClick={handleReset} variant="outline" size="lg">
                Decrypt Another
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
