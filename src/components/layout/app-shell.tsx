"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  HeartPulse,
  Home,
  Stethoscope,
  Calendar,
  FileText,
  User,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react"

import { Header } from "@/components/layout/header"
import { BottomNav } from "@/components/layout/bottom-nav"
import { NAV_ITEMS, APP_NAME } from "@/lib/constants"
import { mockUser } from "@/data/user"
import { cn } from "@/lib/utils"
import { isSupabaseConfigured } from "@/lib/supabase/config"

const iconMap: Record<string, LucideIcon> = {
  Home,
  Stethoscope,
  Calendar,
  FileText,
  User,
}

interface AppShellProps {
  children: React.ReactNode
  showHeader?: boolean
  showBottomNav?: boolean
  className?: string
}

/**
 * Main application shell with responsive desktop sidebar, top header,
 * and mobile bottom navigation.
 */
export function AppShell({
  children,
  showHeader = true,
  showBottomNav = true,
  className,
}: AppShellProps) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-[#f3f6fb] text-slate-900 antialiased flex flex-col md:flex-row">
      {/* Desktop Sidebar (hidden on mobile) */}
      <aside className="hidden md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-40 border-r border-slate-200/80 bg-white">
        {/* Brand Logo */}
        <div className="flex h-20 items-center gap-3 px-6 border-b border-slate-100">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-md shadow-blue-500/25">
            <HeartPulse className="h-6 w-6 stroke-[2.25]" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-slate-900">
              {APP_NAME}
            </span>
            <span className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Portal do Paciente
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5">
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Navegação Principal
          </p>
          {NAV_ITEMS.map((item) => {
            const Icon = iconMap[item.icon] || Home
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href))

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3.5 rounded-2xl px-3.5 py-3 text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                  isActive
                    ? "bg-blue-50 text-primary ring-1 ring-blue-100 font-semibold"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                <Icon className={cn("h-5 w-5", isActive ? "stroke-[2.25]" : "stroke-[1.75]")} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </div>

        {/* Plan Info Badge & User Footer */}
        <div className="p-4 border-t border-slate-100">
          <div className="rounded-xl bg-blue-50/80 p-3.5 border border-blue-100/60">
            <div className="flex items-center gap-2 text-primary font-semibold text-xs">
              <ShieldCheck className="h-4 w-4" />
              <span>{mockUser.planName}</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-500 truncate">
              Nº {mockUser.planNumber}
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col md:pl-72 min-w-0">
        {showHeader && <Header />}

        {isSupabaseConfigured() && (
          <div role="status" className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-xs font-medium text-amber-900 md:px-8">
            Ambiente de demonstração: médicos, prescrições, plano e contagens de serviços são fictícios. Não insira dados clínicos reais.
          </div>
        )}
        
        <main
          className={cn(
            "flex-1 pb-24 md:pb-12 px-4 py-6 md:px-10 max-w-[1440px] mx-auto w-full",
            className
          )}
        >
          {children}
        </main>

        {showBottomNav && <BottomNav />}
      </div>
    </div>
  )
}
