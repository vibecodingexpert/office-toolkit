"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils/cn"

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-10 items-center justify-center rounded-xl bg-muted p-1 text-muted-foreground",
      className
    )}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, children, ...props }, ref) => {
  const [isActive, setIsActive] = React.useState(false)

  React.useEffect(() => {
    const el = document.getElementById(props.value)
    if (el) {
      setIsActive(el.getAttribute("data-state") === "active")
    }
  }, [props.value])

  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(
        "relative inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:text-foreground",
        className
      )}
      {...props}
    >
      {children}
    </TabsPrimitive.Trigger>
  )
})
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }

export function AnimatedTabs({
  tabs,
  defaultValue,
  className,
}: {
  tabs: { value: string; label: string; content: React.ReactNode }[]
  defaultValue?: string
  className?: string
}) {
  const [activeTab, setActiveTab] = React.useState(defaultValue || tabs[0]?.value)

  return (
    <Tabs
      value={activeTab}
      onValueChange={setActiveTab}
      className={className}
    >
      <TabsList className="relative">
        {tabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value}>
            {tab.label}
          </TabsTrigger>
        ))}
        <motion.div
          layoutId="active-tab-indicator"
          className="absolute bottom-0.5 left-0 right-0 mx-auto h-0.5 w-3/4 rounded-full bg-primary"
          style={{
            left: undefined,
            right: undefined,
          }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value}>
          <motion.div
            key={tab.value}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {tab.content}
          </motion.div>
        </TabsContent>
      ))}
    </Tabs>
  )
}
