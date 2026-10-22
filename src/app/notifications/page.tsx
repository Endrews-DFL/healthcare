"use client"

import * as React from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  Bell,
  Calendar,
  FileText,
  Pill,
  Info,
  CheckCheck,
  X,
  ExternalLink,
  RotateCcw,
} from "lucide-react"

import { AppShell } from "@/components/layout/app-shell"
import { EmptyState } from "@/components/shared/empty-state"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { mockNotifications as initialNotifications } from "@/data/notifications"
import { formatDate, formatTime, cn } from "@/lib/utils"
import { Notification } from "@/types"
import { isSupabaseConfigured } from "@/lib/supabase/config"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"

type DateGroupKey = "Hoje" | "Ontem" | "Esta Semana" | "Anteriores"

const GROUP_ORDER: DateGroupKey[] = ["Hoje", "Ontem", "Esta Semana", "Anteriores"]

/**
 * Determines relative date group for notifications.
 */
function getDateGroup(dateStr: string, referenceDate: Date): DateGroupKey {
  const date = new Date(dateStr)
  const refMidnight = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    referenceDate.getDate()
  )
  const itemMidnight = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  )

  const diffTime = refMidnight.getTime() - itemMidnight.getTime()
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays <= 0) return "Hoje"
  if (diffDays === 1) return "Ontem"
  if (diffDays <= 7) return "Esta Semana"
  return "Anteriores"
}

/**
 * Enhanced Notifications Page with relative date groupings, unread badges,
 * dismiss/mark-as-read transitions, and EmptyState handling.
 */
export default function NotificationsPage() {
  const [notifications, setNotifications] = React.useState<Notification[]>(initialNotifications)
  const [showArchived, setShowArchived] = React.useState(false)
  const [backendUserId, setBackendUserId] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!isSupabaseConfigured()) return
    let active = true
    let channel: ReturnType<ReturnType<typeof createSupabaseBrowserClient>["channel"]> | undefined

    const load = async () => {
      const response = await fetch("/api/notifications", { cache: "no-store" })
      if (!response.ok) throw new Error("Não foi possível carregar as notificações.")
      const result = await response.json()
      if (!active) return
      setNotifications(result.notifications)
      setBackendUserId(result.userId)
      return result.userId as string
    }

    load().then((userId) => {
      if (!active || !userId) return
      const supabase = createSupabaseBrowserClient()
      channel = supabase
        .channel(`notifications:${userId}`)
        .on("postgres_changes", {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        }, () => { void load() })
        .subscribe()
    }).catch((error: unknown) => {
      if (active) setNotifications([])
      console.error(error)
    })

    return () => {
      active = false
      if (channel) void createSupabaseBrowserClient().removeChannel(channel)
    }
  }, [])

  // Reference date aligned with mock data (Oct 2026)
  const referenceDate = React.useMemo(() => {
    const now = new Date()
    if (now.getFullYear() === 2026) return now
    return new Date("2026-10-22T23:59:59Z")
  }, [])

  const unreadCount = React.useMemo(() => {
    return notifications.filter((n) => !n.read).length
  }, [notifications])

  const allRead = unreadCount === 0

  // Mark all notifications as read
  const handleMarkAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notif) => ({ ...notif, read: true }))
    )
    if (backendUserId) {
      void Promise.all(notifications.filter((notif) => !notif.read).map((notif) =>
        fetch("/api/notifications", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: notif.id, read: true }),
        })
      ))
    }
  }

  // Mark individual notification as read
  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    )
    if (backendUserId) {
      void fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, read: true }),
      })
    }
  }

  // Dismiss / delete individual notification
  const handleDismiss = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setNotifications((prev) => prev.filter((notif) => notif.id !== id))
  }

  // Reset to initial mock notifications for testing
  const handleResetNotifications = () => {
    setNotifications(initialNotifications)
    setShowArchived(false)
  }

  // Group notifications by date
  const groupedNotifications = React.useMemo(() => {
    const groups: Record<DateGroupKey, Notification[]> = {
      Hoje: [],
      Ontem: [],
      "Esta Semana": [],
      Anteriores: [],
    }

    notifications.forEach((notif) => {
      const groupKey = getDateGroup(notif.createdAt, referenceDate)
      groups[groupKey].push(notif)
    })

    return groups
  }, [notifications, referenceDate])

  // Get icon by notification type
  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "appointment":
        return <Calendar className="h-5 w-5 text-blue-600" />
      case "exam":
        return <FileText className="h-5 w-5 text-emerald-600" />
      case "prescription":
        return <Pill className="h-5 w-5 text-purple-600" />
      default:
        return <Info className="h-5 w-5 text-slate-600" />
    }
  }

  return (
    <AppShell>
      <div className="space-y-6 max-w-2xl mx-auto">
        {/* Custom Header with Badge & Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Notificações
              </h1>
              {unreadCount > 0 && (
                <Badge className="bg-primary hover:bg-primary/90 text-white font-semibold text-xs px-2.5 py-0.5 rounded-full shadow-xs">
                  {unreadCount} nova{unreadCount > 1 ? "s" : ""}
                </Badge>
              )}
            </div>
            <p className="text-sm text-slate-500 mt-0.5">
              Avisos de consultas, exames e comunicados importantes.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="h-8 text-xs gap-1.5 rounded-lg border-slate-200 text-slate-700 hover:bg-slate-50 font-medium"
              >
                <CheckCheck className="h-3.5 w-3.5 text-primary" />
                Marcar todas como lidas
              </Button>
            )}

            {notifications.length < initialNotifications.length && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetNotifications}
                className="h-8 text-xs gap-1 text-slate-400 hover:text-slate-600"
                title="Restaurar notificações"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>

        {/* Empty State when all notifications are read or none exist */}
        {notifications.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="Tudo em dia!"
            description="Sem novas notificações no momento."
            actionLabel="Recarregar avisos"
            onAction={handleResetNotifications}
          />
        ) : allRead && !showArchived ? (
          <div className="space-y-4">
            <EmptyState
              icon={Bell}
              title="Tudo em dia!"
              description="Sem novas notificações pendentes. Todas foram lidas."
              actionLabel="Ver histórico de lidas"
              onAction={() => setShowArchived(true)}
            />
          </div>
        ) : (
          <div className="space-y-6">
            {allRead && showArchived && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100/70 text-xs text-slate-600 border border-slate-200/80">
                <span>Exibindo histórico de notificações lidas.</span>
                <button
                  onClick={() => setShowArchived(false)}
                  className="font-semibold text-primary hover:underline"
                >
                  Ocultar lidas
                </button>
              </div>
            )}

            {GROUP_ORDER.map((groupName) => {
              const groupItems = groupedNotifications[groupName]
              if (groupItems.length === 0) return null

              return (
                <div key={groupName} className="space-y-2.5">
                  <div className="flex items-center justify-between px-1">
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      {groupName}
                    </h2>
                    <span className="text-[11px] text-slate-400">
                      {groupItems.length} aviso{groupItems.length > 1 ? "s" : ""}
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    <AnimatePresence mode="popLayout">
                      {groupItems.map((notif) => {
                        const isUnread = !notif.read

                        return (
                          <motion.div
                            key={notif.id}
                            layout
                            initial={{ opacity: 0, y: 8, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, x: -20, transition: { duration: 0.15 } }}
                            transition={{ duration: 0.2 }}
                          >
                            <Card
                              onClick={() => handleMarkAsRead(notif.id)}
                              className={cn(
                                "group relative p-4 transition-all duration-200 cursor-pointer rounded-2xl border",
                                isUnread
                                  ? "bg-blue-50/50 border-blue-200/70 shadow-xs hover:bg-blue-50/70"
                                  : "bg-white border-slate-100/90 shadow-xs hover:bg-slate-50/60"
                              )}
                            >
                              <div className="flex items-start gap-3.5">
                                {/* Unread Blue Dot Indicator */}
                                <div className="flex items-center justify-center self-center shrink-0 w-2">
                                  {isUnread && (
                                    <motion.span
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      exit={{ scale: 0, opacity: 0 }}
                                      className="h-2 w-2 rounded-full bg-primary"
                                      title="Não lida"
                                    />
                                  )}
                                </div>

                                {/* Category Icon */}
                                <div className="p-2.5 rounded-xl bg-white shadow-xs ring-1 ring-slate-100 shrink-0">
                                  {getIcon(notif.type)}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0 space-y-1">
                                  <div className="flex items-center justify-between gap-2">
                                    <h3
                                      className={cn(
                                        "text-sm tracking-tight truncate",
                                        isUnread
                                          ? "font-bold text-slate-900"
                                          : "font-medium text-slate-700"
                                      )}
                                    >
                                      {notif.title}
                                    </h3>
                                    <span className="text-[11px] text-slate-400 whitespace-nowrap">
                                      {formatDate(notif.createdAt)}
                                    </span>
                                  </div>

                                  <p className="text-xs text-slate-600 leading-relaxed pr-6">
                                    {notif.message}
                                  </p>

                                  {notif.actionUrl && (
                                    <div className="pt-1">
                                      <Link
                                        href={notif.actionUrl}
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          handleMarkAsRead(notif.id)
                                        }}
                                        className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                                      >
                                        <span>Acessar detalhes</span>
                                        <ExternalLink className="h-3 w-3" />
                                      </Link>
                                    </div>
                                  )}
                                </div>

                                {/* Dismiss button */}
                                <button
                                  type="button"
                                  onClick={(e) => handleDismiss(notif.id, e)}
                                  className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                                  title="Dispensar notificação"
                                  aria-label="Dispensar notificação"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </Card>
                          </motion.div>
                        )
                      })}
                    </AnimatePresence>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </AppShell>
  )
}
