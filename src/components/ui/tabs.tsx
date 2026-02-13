"use client";

import * as React from "react"
import { cn } from "@/lib/utils"

const Tabs = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { defaultValue?: string }
>(({ className, defaultValue, children, ...props }, ref) => {
  const [activeTab, setActiveTab] = React.useState(defaultValue || "")

  // Clone children to pass activeTab and setActiveTab
  const childrenWithProps = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { activeTab, setActiveTab } as any)
    }
    return child
  })

  return (
    <div ref={ref} className={cn("w-full", className)} {...props}>
      {childrenWithProps}
    </div>
  )
})
Tabs.displayName = "Tabs"

const TabsList = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { activeTab?: string; setActiveTab?: (value: string) => void }
>(({ className, activeTab, setActiveTab, children, ...props }, ref) => {
  const childrenWithProps = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { activeTab, setActiveTab } as any)
    }
    return child
  })

  return (
    <div
      ref={ref}
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-lg bg-slate-900/50 p-1 text-slate-400 backdrop-blur-sm border border-white/5",
        className
      )}
      {...props}
    >
      {childrenWithProps}
    </div>
  )
})
TabsList.displayName = "TabsList"

const TabsTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string; activeTab?: string; setActiveTab?: (value: string) => void }
>(({ className, value, activeTab, setActiveTab, children, ...props }, ref) => {
  return (
    <button
      ref={ref}
      role="tab"
      type="button"
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        activeTab === value
          ? "bg-indigo-600 text-white shadow-sm"
          : "hover:bg-white/5 hover:text-white",
        className
      )}
      onClick={() => setActiveTab && setActiveTab(value)}
      {...props}
    >
      {children}
    </button>
  )
})
TabsTrigger.displayName = "TabsTrigger"

const TabsContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value: string; activeTab?: string }
>(({ className, value, activeTab, children, ...props }, ref) => {
  if (value !== activeTab) return null

  return (
    <div
      ref={ref}
      className={cn(
        "mt-6 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 animate-in fade-in-50 slide-in-from-bottom-2 duration-300",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})
TabsContent.displayName = "TabsContent"

export { Tabs, TabsList, TabsTrigger, TabsContent }
