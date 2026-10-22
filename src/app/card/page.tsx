import * as React from "react"
import { AppShell } from "@/components/layout/app-shell"
import { mockUser } from "@/data/user"
import { Card, CardContent } from "@/components/ui/card"
import { HeartPulse, QrCode, ShieldCheck } from "lucide-react"
import { formatDate } from "@/lib/utils"

export default function HealthCardPage() {
  return (
    <AppShell>
      <div className="space-y-6 max-w-lg mx-auto">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Carteirinha Digital
          </h1>
          <p className="text-sm text-slate-500">
            Apresente sua identificação no atendimento e consultas.
          </p>
        </div>

        {/* Digital Insurance Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 p-6 text-white shadow-xl shadow-blue-500/20 aspect-[1.6/1] flex flex-col justify-between">
          {/* Background watermark icon */}
          <HeartPulse className="absolute -right-8 -bottom-8 h-48 w-48 text-white/5 pointer-events-none" />

          {/* Card Top */}
          <div className="flex items-start justify-between relative z-10">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center">
                <HeartPulse className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold tracking-tight text-base">HealthCare</span>
            </div>
            <span className="rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-semibold text-emerald-300 border border-emerald-400/30">
              {mockUser.planName}
            </span>
          </div>

          {/* Card Middle */}
          <div className="space-y-1 relative z-10 my-auto">
            <span className="text-[10px] uppercase tracking-wider text-blue-200">Titular</span>
            <h2 className="text-xl font-bold tracking-wide uppercase">{mockUser.fullName}</h2>
            <p className="font-mono text-sm tracking-wider text-blue-100">{mockUser.planNumber}</p>
          </div>

          {/* Card Bottom */}
          <div className="flex items-end justify-between relative z-10 pt-2 border-t border-white/10 text-xs">
            <div>
              <span className="text-[10px] block text-blue-200">Validade</span>
              <span className="font-semibold">{formatDate(mockUser.planValidUntil)}</span>
            </div>
            <div>
              <span className="text-[10px] block text-blue-200">CPF</span>
              <span className="font-semibold">{mockUser.cpf}</span>
            </div>
            <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center">
              <QrCode className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
