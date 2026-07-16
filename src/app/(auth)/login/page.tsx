"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { AuthLayout } from "@/components/layout/auth-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  Globe,
  GitBranch,
} from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [rememberMe, setRememberMe] = React.useState(false)
  const [showPassword, setShowPassword] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [errors, setErrors] = React.useState<Record<string, string>>({})

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Invalid email address"
    }
    if (!password) {
      newErrors.password = "Password is required"
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsLoading(true)
    await new Promise((r) => setTimeout(r, 1500))
    setIsLoading(false)
    toast.success("Welcome back! Redirecting to dashboard...")
    router.push("/dashboard")
  }

  const handleSocialLogin = (provider: string) => {
    toast.info(`Signing in with ${provider}...`)
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.06 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your account to continue"
    >
      <motion.form
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        <motion.div variants={itemVariants}>
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            icon={<Mail className="h-4 w-4" />}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (errors.email) setErrors((prev) => ({ ...prev, email: "" }))
            }}
            error={errors.email}
            autoComplete="email"
            disabled={isLoading}
          />
        </motion.div>

        <motion.div variants={itemVariants} className="relative">
          <Input
            label="Password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            icon={<Lock className="h-4 w-4" />}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              if (errors.password) setErrors((prev) => ({ ...prev, password: "" }))
            }}
            error={errors.password}
            autoComplete="current-password"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-[38px] text-muted-foreground hover:text-foreground transition-colors"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="flex items-center justify-between"
        >
          <label className="flex items-center gap-2 cursor-pointer group">
            <div className="relative flex items-center justify-center">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="peer sr-only"
              />
              <div className="h-4 w-4 rounded border border-input bg-background peer-checked:bg-primary peer-checked:border-primary peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 transition-all group-hover:border-primary/50" />
              {rememberMe && (
                <svg
                  className="absolute h-3 w-3 text-primary-foreground pointer-events-none"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </div>
            <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors select-none">
              Remember me
            </span>
          </label>

          <Link
            href="/forgot-password"
            className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            Forgot password?
          </Link>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Button
            type="submit"
            size="lg"
            fullWidth
            loading={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>
        </motion.div>

        <motion.div variants={itemVariants} className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="grid grid-cols-2 gap-3"
        >
          <Button
            type="button"
            variant="outline"
            size="md"
            fullWidth
            icon={<Globe className="h-4 w-4" />}
            onClick={() => handleSocialLogin("Google")}
            disabled={isLoading}
          >
            Google
          </Button>
          <Button
            type="button"
            variant="outline"
            size="md"
            fullWidth
            icon={<GitBranch className="h-4 w-4" />}
            onClick={() => handleSocialLogin("GitHub")}
            disabled={isLoading}
          >
            GitHub
          </Button>
        </motion.div>

        <motion.p
          variants={itemVariants}
          className="text-center text-sm text-muted-foreground"
        >
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-medium text-primary hover:text-primary/80 transition-colors"
          >
            Sign up
          </Link>
        </motion.p>
      </motion.form>
    </AuthLayout>
  )
}
