"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils/cn"
import { Button } from "@/components/ui/button"
import { FileUpload } from "@/components/ui/file-upload"
import { ProgressBar } from "@/components/ui/progress-bar"
import {
  Lock,
  Upload,
  Download,
  Shield,
  AlertCircle,
  CheckCircle2,
  File,
  FileText,
  Eye,
  EyeOff,
} from "lucide-react"

async function deriveKey(password: string, salt: Uint8Array, length: 128 | 256): Promise<CryptoKey> {
  const enc = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  )
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: salt.buffer as ArrayBuffer, iterations: 600000, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-CBC", length },
    true,
    ["encrypt"]
  )
}

export function FileEncrypt() {
  const [file, setFile] = React.useState<File | null>(null)
  const [password, setPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [showPw, setShowPw] = React.useState(false)
  const [showConfirm, setShowConfirm] = React.useState(false)
  const [algorithm, setAlgorithm] = React.useState<128 | 256>(256)
  const [encrypting, setEncrypting] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  const [encryptedBlob, setEncryptedBlob] = React.useState<Blob | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  const handleEncrypt = async () => {
    if (!file || !password) return
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    setError(null)
    setEncrypting(true)
    setProgress(0)

    try {
      const salt = crypto.getRandomValues(new Uint8Array(16))
      const iv = crypto.getRandomValues(new Uint8Array(16))
      const key = await deriveKey(password, salt, algorithm)

      const buffer = await file.arrayBuffer()
      const encrypted = await crypto.subtle.encrypt({ name: "AES-CBC", iv }, key, buffer)

      setProgress(50)

      const metadata = new TextEncoder().encode(
        JSON.stringify({
          name: file.name,
          size: file.size,
          type: file.type || "application/octet-stream",
          algorithm: `AES-${algorithm}`,
        })
      )

      const metadataLen = new Uint8Array(new Uint32Array([metadata.length]).buffer)
      const algoFlag = new Uint8Array([algorithm === 128 ? 1 : 2])

      const combined = new Uint8Array(
        1 + 4 + salt.length + iv.length + metadata.length + encrypted.byteLength
      )
      let offset = 0
      combined.set(algoFlag, offset); offset += 1
      combined.set(metadataLen, offset); offset += 4
      combined.set(salt, offset); offset += salt.length
      combined.set(iv, offset); offset += iv.length
      combined.set(metadata, offset); offset += metadata.length
      combined.set(new Uint8Array(encrypted), offset)

      const blob = new Blob([combined], { type: "application/octet-stream" })
      setProgress(100)
      setEncryptedBlob(blob)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Encryption failed")
    } finally {
      setEncrypting(false)
    }
  }

  const handleDownload = () => {
    if (!encryptedBlob || !file) return
    const a = document.createElement("a")
    a.href = URL.createObjectURL(encryptedBlob)
    a.download = `${file.name}.enc`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const handleReset = () => {
    setFile(null)
    setPassword("")
    setConfirmPassword("")
    setEncryptedBlob(null)
    setError(null)
    setProgress(0)
  }

  const passwordsMatch = password === confirmPassword
  const canEncrypt = file && password && confirmPassword && passwordsMatch && password.length >= 8

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10">
          <Lock className="h-5 w-5 text-cyan-500" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">File Encrypt</h2>
          <p className="text-sm text-muted-foreground">Encrypt files with AES encryption</p>
        </div>
      </div>

      {!encryptedBlob && (
        <>
          <FileUpload
            onUpload={(files) => setFile(files[0])}
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
                <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <File className="h-8 w-8 text-primary" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-5 space-y-4">
                  <span className="text-sm font-medium">Encryption Algorithm</span>
                  <div className="grid grid-cols-2 gap-3">
                    {([128, 256] as const).map((bits) => (
                      <button
                        key={bits}
                        onClick={() => setAlgorithm(bits)}
                        className={cn(
                          "flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-medium transition-colors",
                          algorithm === bits
                            ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-500"
                            : "border-border text-muted-foreground hover:bg-accent/50"
                        )}
                      >
                        <Shield className="h-4 w-4" />
                        AES-{bits}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-5 space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Password</label>
                    <div className="relative">
                      <input
                        type={showPw ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter encryption password"
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
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Confirm Password</label>
                    <div className="relative">
                      <input
                        type={showConfirm ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm encryption password"
                        className="w-full h-10 rounded-lg border border-input bg-background px-3 pr-10 text-sm text-foreground placeholder-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                      <button
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  {password && confirmPassword && !passwordsMatch && (
                    <p className="text-sm text-destructive">Passwords do not match</p>
                  )}
                </div>

                {error && (
                  <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {error}
                  </div>
                )}

                <Button onClick={handleEncrypt} disabled={!canEncrypt} loading={encrypting} fullWidth size="lg">
                  <Lock className="h-4 w-4" />
                  Encrypt File
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {/* Progress */}
      <AnimatePresence>
        {encrypting && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-xl border border-border bg-card p-5"
          >
            <ProgressBar value={progress} variant="gradient" showPercentage label="Encrypting..." />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result */}
      <AnimatePresence>
        {encryptedBlob && !encrypting && (
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
              <p className="text-lg font-semibold text-foreground">Encryption Complete</p>
              <p className="text-sm text-muted-foreground mt-1">
                AES-{algorithm} encrypted file ready for download
              </p>
            </div>
            <div className="flex justify-center gap-3">
              <Button onClick={handleDownload} variant="primary" size="lg">
                <Download className="h-4 w-4" />
                Download .enc
              </Button>
              <Button onClick={handleReset} variant="outline" size="lg">
                Encrypt Another
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
