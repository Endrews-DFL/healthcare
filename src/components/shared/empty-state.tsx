import * as React from "react"
import { type LucideIcon, Inbox } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: LucideIcon
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  actionElement?: React.ReactNode
}

/**
 * Standard Empty State component to handle empty list or search results.
 */
export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
  actionElement,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[260px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center animate-fade-in",
        className
      )}
      {...props}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 text-slate-400">
        <Icon className="h-7 w-7 stroke-[1.75]" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-slate-800">
        {title}
      </h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-sm text-slate-500">
          {description}
        </p>
      )}
      {actionElement ? (
        <div className="mt-5">{actionElement}</div>
      ) : actionLabel && onAction ? (
        <Button
          onClick={onAction}
          variant="outline"
          size="sm"
          className="mt-5 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-100"
        >
          {actionLabel}
        </Button>
      ) : null}
    </div>
  )
}
