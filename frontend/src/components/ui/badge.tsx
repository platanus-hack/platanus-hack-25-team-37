import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-all duration-200",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-apple-sm",
        secondary:
          "bg-secondary text-secondary-foreground",
        destructive:
          "bg-red-50 text-red-700 border border-red-100",
        outline: "text-foreground border border-neutral-200",
        success:
          "bg-emerald-50 text-emerald-700 border border-emerald-100",
        warning:
          "bg-amber-50 text-amber-700 border border-amber-100",
        neutral:
          "bg-neutral-100 text-neutral-700 border border-neutral-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
