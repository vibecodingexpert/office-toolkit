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
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  Globe,
  GitBranch,
} from "lucide-react"

function getPasswordStrength(password: string): {
  score: number
  label: string
  color: string
} {
  let score = 0
  if (password.length >= 6) score += 20
  if (password.length >= 10) score += 20
  if (/[A-Z]/.test(password)) score += 20
  if (/[0-9]/.test(password)) score += 20
  if (/[^A-Za-z0-9]/.test(password)) score += 20

  if (score <= 20) return { score, label: "Weak", color: "bg-destructive" }
  if (score <= 40)
    return { score, label: "Fair", color: "bg-orange-500" }
  if (score <= 60)
    return { score, label: "Good", color: "bg-amber-500" }
  if (score <= 80)
    return { score, label: "Strong", color: "bg-emerald-500" }
  return { score, label: "Very Strong", color: "bg-emerald-500" }
}

export default function SignUpPage() {
  const router = useRouter()
  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)
  const [showConfirm, setShowConfirm] = React.useState(false)
  const [acceptTerms, setAcceptTerms] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [errors, setErrors] = React.useState<Record<string, string>>({})

  const passwordStrength = React.useMemo(
    () => getPasswordStrength(password),
    [password]
  )

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!name.trim()) {
      newErrors.name = "Name is required"
    } else if (name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters"
    }
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
    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password"
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }
    if (!acceptTerms) {
      newErrors.terms = "You must accept the terms and conditions"
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
    toast.success("Account created! Welcome to Office Toolkit Pro.")
    router.push("/dashboard")
  }

  const handleSocialSignup = (provider: string) => {
    toast.info(`Signing up with ${provider}...`)
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <AuthLayout
      title="Create an account"
      subtitle="Get started with Office Toolkit Pro"
    >
      <motion.form
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <motion.div variants={itemVariants}>
          <Input
            label="Full name"
            type="text"
            placeholder="John Doe"
            icon={<User className="h-4 w-4" />}
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              if (errors.name) setErrors((prev) => ({ ...prev, name: "" }))
            }}
            error={errors.name}
            autoComplete="name"
            disabled={isLoading}
          />
        </motion.div>

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
            placeholder="Create a strong password"
            icon={<Lock className="h-4 w-4" />}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              if (errors.password) setErrors((prev) => ({ ...prev, password: "" }))
            }}
            error={errors.password}
            autoComplete="new-password"
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

          {password.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-2 space-y-1"
            >
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                      i <= passwordStrength.score / 20
                        ? passwordStrength.color
                        : "bg-muted"
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Strength:{" "}
                <span
                  className="font-medium"
                  style={{ color: passwordStrength.color.replace("bg-", "") }}
                >
                  {passwordStrength.label}
                </span>
              </p>
            </motion.div>
          )}
        </motion.div>

        <motion.div variants={itemVariants} className="relative">
          <Input
            label="Confirm password"
            type={showConfirm ? "text" : "password"}
            placeholder="Repeat your password"
            icon={<Lock className="h-4 w-4" />}
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value)
              if (errors.confirmPassword)
                setErrors((prev) => ({ ...prev, confirmPassword: "" }))
            }}
            error={errors.confirmPassword}
            autoComplete="new-password"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 top-[38px] text-muted-foreground hover:text-foreground transition-colors"
            tabIndex={-1}
          >
            {showConfirm ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </motion.div>

        <motion.div variants={itemVariants}>
          <label className="flex items-start gap-2 cursor-pointer group">
            <div className="relative flex items-center justify-center mt-0.5">
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="peer sr-only"
              />
              <div
                className={`h-4 w-4 rounded border transition-all group-hover:border-primary/50 ${
                  acceptTerms
                    ? "bg-primary border-primary"
                    : "border-input bg-background"
                } ${
                  errors.terms ? "border-destructive" : ""
                } peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2`}
              />
              {acceptTerms && (
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
              I accept the{" "}
              <Link
                href="/terms"
                className="font-medium text-primary hover:text-primary/80"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="font-medium text-primary hover:text-primary/80"
              >
                Privacy Policy
              </Link>
            </span>
          </label>
          {errors.terms && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-destructive mt-1"
              role="alert"
            >
              {errors.terms}
            </motion.p>
          )}
        </motion.div>

        <motion.div variants={itemVariants}>
          <Button
            type="submit"
            size="lg"
            fullWidth
            loading={isLoading}
          >
            {isLoading ? "Creating account..." : "Create account"}
          </Button>
        </motion.div>

        <motion.div variants={itemVariants} className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or sign up with
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
            onClick={() => handleSocialSignup("Google")}
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
            onClick={() => handleSocialSignup("GitHub")}
            disabled={isLoading}
          >
            GitHub
          </Button>
        </motion.div>

        <motion.p
          variants={itemVariants}
          className="text-center text-sm text-muted-foreground"
        >
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-primary hover:text-primary/80 transition-colors"
          >
            Sign in
          </Link>
        </motion.p>
      </motion.form>
    </AuthLayout>
  )
}
