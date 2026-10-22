"use client"

import * as React from "react"
import Link from "next/link"
import { Bell } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { mockUser } from "@/data/user"
import { mockNotifications } from "@/data/notifications"
import { cn } from "@/lib/utils"
import { isSupabaseConfigured } from "@/lib/supabase/config"

interface HeaderProps {
  userName?: string
  subtitle?: string
  avatarUrl?: string
  unreadCount?: number
  className?: string
}

/**
 * Top header component displaying user greeting, avatar, and notification trigger.
 */
export function Header({
  userName = mockUser.fullName.split(" ")[0],
  subtitle = "Como você está se sentindo hoje?",
  avatarUrl = mockUser.avatarUrl,
  unreadCount = mockNotifications.filter((n) => !n.read).length,
  className,
}: HeaderProps) {
  const [displayName, setDisplayName] = React.useState(userName)

  React.useEffect(() => {
    if (!isSupabaseConfigured()) return
    fetch("/api/profile", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : null)
      .then((profile) => {
        if (profile?.fullName) setDisplayName(profile.fullName.split(" ")[0])
      })
      .catch(() => undefined)
  }, [])

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-20 w-full items-center justify-between border-b border-slate-100 bg-white/90 px-4 md:px-10 backdrop-blur-md transition-all",
        className
      )}
    >
      <div className="flex items-center gap-3.5">
        <Link href="/profile" className="transition-transform active:scale-95">
          <Avatar className="h-11 w-11 border-2 border-white shadow-sm ring-2 ring-blue-100">
            <AvatarImage src={avatarUrl} alt={displayName} />
            <AvatarFallback>{displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
        </Link>
        <div>
          <h1 className="text-base font-bold text-slate-900 md:text-lg">
            Olá, {displayName}
          </h1>
          <p className="text-xs font-normal text-slate-500 md:text-sm">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Link href="/notifications">
          <Button
            variant="ghost"
            size="icon"
            className="relative h-10 w-10 rounded-full text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            aria-label={`Notificações: ${unreadCount} não lidas`}
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white ring-2 ring-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Button>
        </Link>
      </div>
    </header>
  )
}
