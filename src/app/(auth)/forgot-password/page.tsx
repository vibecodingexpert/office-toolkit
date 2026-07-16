"use client"

import * as React from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { AuthLayout } from "@/components/layout/auth-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [isSent, setIsSent] = React.useState(false)
  const [error, setError] = React.useState("")

  const validate = () => {
    if (!email.trim()) {
      setError("Email is required")
      return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Invalid email address")
      return false
    }
    setError("")
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsLoading(true)
    await new Promise((r) => setTimeout(r, 1500))
    setIsLoading(false)
    setIsSent(true)
    toast.success("Reset link sent to your email")
  }

  return (
    <AuthLayout
      title="Forgot password?"
      subtitle={
        isSent
          ? "Check your email for the reset link"
          : "Enter your email and we'll send you a reset link"
      }
    >
      <AnimatePresence mode="wait">
        {isSent ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="flex flex-col items-center text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.1 }}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 mb-5"
            >
              <CheckCircle2 className="h-8 w-8 text-emerald-500" />
            </motion.div>

            <p className="text-sm text-muted-foreground mb-6 max-w-sm">
              We&apos;ve sent a password reset link to{" "}
              <span className="font-medium text-foreground">{email}</span>.
              Please check your inbox and follow the instructions.
            </p>

            <Button
              variant="outline"
              size="md"
              fullWidth
              onClick={() => {
                setIsSent(false)
                setEmail("")
              }}
            >
              Send again
            </Button>

            <Link
              href="/login"
              className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to login
            </Link>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              icon={<Mail className="h-4 w-4" />}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (error) setError("")
              }}
              error={error}
              autoComplete="email"
              disabled={isLoading}
            />

            <Button
              type="submit"
              size="lg"
              fullWidth
              loading={isLoading}
            >
              {isLoading ? "Sending..." : "Send Reset Link"}
            </Button>

            <p className="text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to login
              </Link>
            </p>
          </motion.form>
        )}
      </AnimatePresence>
    </AuthLayout>
  )
}
