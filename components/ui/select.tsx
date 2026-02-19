"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const selectTriggerVariants = cva(
  "flex w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
  {
    variants: {
      variant: {
        default: "border-input bg-transparent",
        ghost: "border-transparent bg-transparent hover:bg-transparent",
      },
      size: {
        default: "h-10 py-2",
        sm: "h-9 px-2",
        lg: "h-11 px-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Select = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("relative w-full", className)} {...props} />
))
Select.displayName = "Select"

const SelectGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes>
>(({ class<HTMLDivElementName, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("relative w-full", className)}
    {...props}
  />
))
SelectGroup.displayName = "SelectGroup"

const SelectValue = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn("block truncate", className)}
    {...props}
  />
))
SelectValue.displayName = "SelectValue"

export {
  Select,
  SelectGroup,
  SelectValue,
}
