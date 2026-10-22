import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

export type StatusType =
  | "scheduled"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "pending"
  | "no_show"
  | "available"
  | "viewed"
  | "active"
  | "in_range"
  | "below_range"
  | "above_range"

const statusBadgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors border",
  {
    variants: {
      status: {
        scheduled: "bg-blue-50 text-blue-700 border-blue-200/80",
        confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
        completed: "bg-slate-100 text-slate-700 border-slate-200",
        cancelled: "bg-red-50 text-red-700 border-red-200/80",
        pending: "bg-amber-50 text-amber-700 border-amber-200/80",
        no_show: "bg-rose-50 text-rose-700 border-rose-200/80",
        available: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
        viewed: "bg-slate-100 text-slate-600 border-slate-200",
        active: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
        in_range: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
        below_range: "bg-amber-50 text-amber-700 border-amber-200/80",
        above_range: "bg-rose-50 text-rose-700 border-rose-200/80",
      },
    },
    defaultVariants: {
      status: "scheduled",
    },
  }
)

const defaultLabels: Record<StatusType, string> = {
  scheduled: "Agendado",
  confirmed: "Confirmado",
  completed: "Concluído",
  cancelled: "Cancelado",
  pending: "Pendente",
  no_show: "Não compareceu",
  available: "Disponível",
  viewed: "Visualizado",
  active: "Ativo",
  in_range: "Normal",
  below_range: "Abaixo",
  above_range: "Elevado",
}

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusBadgeVariants> {
  status: StatusType
  children?: React.ReactNode
  showDot?: boolean
}

/**
 * Reusable StatusBadge component for appointments, exams, and prescriptions.
 */
export function StatusBadge({
  status,
  children,
  showDot = true,
  className,
  ...props
}: StatusBadgeProps) {
  const dotColorClass = {
    scheduled: "bg-blue-500",
    confirmed: "bg-emerald-500",
    completed: "bg-slate-400",
    cancelled: "bg-red-500",
    pending: "bg-amber-500",
    no_show: "bg-rose-500",
    available: "bg-emerald-500",
    viewed: "bg-slate-400",
    active: "bg-emerald-500",
    in_range: "bg-emerald-500",
    below_range: "bg-amber-500",
    above_range: "bg-rose-500",
  }[status]

  return (
    <span
      className={cn(statusBadgeVariants({ status }), className)}
      {...props}
    >
      {showDot && (
        <span
          className={cn("h-1.5 w-1.5 rounded-full", dotColorClass)}
          aria-hidden="true"
        />
      )}
      {children || defaultLabels[status] || status}
    </span>
  )
}
