"use client"

import { Toaster as SonnerToaster, toast } from "sonner"
import { cn } from "@/lib/utils/cn"
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Info,
  Loader2,
  X,
} from "lucide-react"

type ToastProps = {
  className?: string
}

export function Toaster({ className }: ToastProps) {
  return (
    <SonnerToaster
      className={cn("toaster group", className)}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:rounded-xl",
          description: "group-[.toast]:text-muted-foreground text-sm",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:rounded-lg group-[.toast]:text-xs group-[.toast]:font-medium",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:rounded-lg group-[.toast]:text-xs group-[.toast]:font-medium",
          closeButton:
            "group-[.toast]:bg-background group-[.toast]:border-border group-[.toast]:text-muted-foreground group-[.toast]:hover:text-foreground",
          error: "group-[.toaster]:border-destructive/50 group-[.toaster]:text-destructive",
          success: "group-[.toaster]:border-emerald-500/50",
          loading: "group-[.toaster]:border-primary/20",
        },
      }}
      icons={{
        success: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
        error: <XCircle className="h-5 w-5 text-destructive" />,
        info: <Info className="h-5 w-5 text-primary" />,
        warning: <AlertCircle className="h-5 w-5 text-amber-500" />,
        loading: <Loader2 className="h-5 w-5 text-primary animate-spin" />,
        close: <X className="h-4 w-4" />,
      }}
      closeButton
      richColors={false}
      position="top-right"
      gap={8}
      visibleToasts={5}
      expand={false}
    />
  )
}

export { toast }
