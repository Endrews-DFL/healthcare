import * as React from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

/**
 * Generic Card Skeleton loader.
 */
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="space-y-2">
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-4 w-2/3" />
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-9 w-28 rounded-lg mt-2" />
      </CardContent>
    </Card>
  )
}

/**
 * Doctor Card Skeleton loader.
 */
export function DoctorCardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn("overflow-hidden p-5", className)}>
      <div className="flex items-start gap-4">
        <Skeleton className="h-16 w-16 rounded-full shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-5 w-12 rounded-full" />
          </div>
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3.5 w-32" />
          <div className="pt-2 flex gap-2">
            <Skeleton className="h-6 w-20 rounded-md" />
            <Skeleton className="h-6 w-24 rounded-md" />
          </div>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-9 w-32 rounded-xl" />
      </div>
    </Card>
  )
}

/**
 * Appointment Card Skeleton loader.
 */
export function AppointmentCardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn("overflow-hidden p-5", className)}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3.5 w-24" />
          </div>
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <div className="mt-4 rounded-xl bg-slate-50 p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-28" />
        </div>
        <Skeleton className="h-4 w-16" />
      </div>
      <div className="mt-4 flex gap-2 justify-end">
        <Skeleton className="h-9 w-24 rounded-xl" />
        <Skeleton className="h-9 w-28 rounded-xl" />
      </div>
    </Card>
  )
}

/**
 * Exam Card Skeleton loader.
 */
export function ExamCardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn("overflow-hidden p-5", className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-1.5">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-3.5 w-24" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <div className="mt-4 flex items-baseline justify-between">
        <div>
          <Skeleton className="h-3 w-16 mb-1" />
          <Skeleton className="h-6 w-20" />
        </div>
        <div className="text-right">
          <Skeleton className="h-3 w-20 mb-1" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
        <Skeleton className="h-3.5 w-28" />
        <Skeleton className="h-8 w-20 rounded-lg" />
      </div>
    </Card>
  )
}
