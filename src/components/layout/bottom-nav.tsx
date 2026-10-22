"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import {
  Home,
  Stethoscope,
  Calendar,
  FileText,
  User,
  type LucideIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { NAV_ITEMS } from "@/lib/constants"

const iconMap: Record<string, LucideIcon> = {
  Home,
  Stethoscope,
  Calendar,
  FileText,
  User,
}

/**
 * Mobile bottom navigation component with smooth framer-motion indicator.
 * Displays only on mobile (hidden on medium screens and larger).
 */
export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Navegação inferior mobile"
      className="fixed bottom-0 left-0 right-0 z-40 block border-t border-slate-200/80 bg-white/95 backdrop-blur-md shadow-lg shadow-slate-900/5 md:hidden"
    >
      <div className="mx-auto flex h-16 max-w-lg items-center justify-around px-2">
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
                "relative flex flex-1 flex-col items-center justify-center py-1 transition-colors duration-200",
                isActive ? "text-primary font-semibold" : "text-slate-500 hover:text-slate-800"
              )}
            >
              <div className="relative flex flex-col items-center">
                <motion.div
                  animate={{ scale: isActive ? 1.15 : 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className="relative p-1"
                >
                  <Icon className={cn("h-5 w-5", isActive ? "stroke-[2.5]" : "stroke-[1.75]")} />
                  {isActive && (
                    <motion.div
                      layoutId="bottom-nav-active-glow"
                      className="absolute inset-0 rounded-full bg-blue-100/60 -z-10"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                </motion.div>
                <span className="mt-0.5 text-[11px] leading-tight tracking-tight">
                  {item.label}
                </span>
              </div>
            </Link>
          )
        })}
      </div>
      {/* Safe area spacer for modern iOS / Android devices */}
      <div className="pb-safe" />
    </nav>
  )
}
