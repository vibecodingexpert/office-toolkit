export interface Tool {
  id: string
  name: string
  description: string
  icon: string
  category: ToolCategory
  slug: string
  isPro?: boolean
  isNew?: boolean
  isPopular?: boolean
  isTrending?: boolean
  color?: string
}

export type ToolCategory =
  | "pdf"
  | "image"
  | "document"
  | "developer"
  | "video"
  | "audio"
  | "business"
  | "office"
  | "ai"
  | "security"
  | "utility"

export interface Category {
  id: ToolCategory
  name: string
  description: string
  icon: string
  color: string
  toolCount: number
}

export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  plan: "free" | "pro" | "enterprise"
  createdAt: Date
}

export interface Favorite {
  toolId: string
  userId: string
  createdAt: Date
}

export interface RecentTool {
  toolId: string
  userId: string
  lastUsed: Date
}

export interface PricingPlan {
  id: string
  name: string
  description: string
  price: number
  currency: string
  interval: "month" | "year"
  features: string[]
  highlighted?: boolean
  badge?: string
}

export interface Testimonial {
  id: string
  name: string
  role: string
  company: string
  avatar: string
  content: string
  rating: number
}

export interface ToolResult {
  success: boolean
  data?: any
  error?: string
  downloadUrl?: string
}
