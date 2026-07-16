"use client"

import * as React from "react"
import { cn } from "@/lib/utils/cn"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn("rounded-lg skeleton", className)}
      {...props}
    />
  )
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-5 space-y-4",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <Skeleton className="h-12 w-12 rounded-xl" />
        <Skeleton className="h-5 w-12 rounded-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
      </div>
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    </div>
  )
}

export function SkeletonTable({ rows = 5, className }: { rows?: number; className?: string }) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex gap-4 pb-2">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 py-3 border-t border-border">
          <Skeleton className="h-3 w-1/4" />
          <Skeleton className="h-3 w-1/4" />
          <Skeleton className="h-3 w-1/4" />
          <Skeleton className="h-3 w-1/4" />
        </div>
      ))}
    </div>
  )
}

export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-3"
          style={{ width: `${100 - i * 15}%` }}
        />
      ))}
    </div>
  )
}
