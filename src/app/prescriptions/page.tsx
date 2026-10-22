"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Pill,
  Clock,
  Calendar,
  Check,
  X,
  Minus,
  ChevronDown,
  ChevronUp,
  FileText,
  User,
  ShieldCheck,
  Download,
  AlertCircle,
  Activity,
} from "lucide-react"

import { AppShell } from "@/components/layout/app-shell"
import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import { EmptyState } from "@/components/shared/empty-state"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { mockPrescriptions } from "@/data/prescriptions"
import { formatDate } from "@/lib/utils"
import { Prescription } from "@/types"

type FilterTab = "all" | "active" | "completed"

const TIMELINE_MONTHS = [
  { key: "Jan", label: "Jan" },
  { key: "Feb", label: "Fev" },
  { key: "Mar", label: "Mar" },
  { key: "Apr", label: "Abr" },
  { key: "May", label: "Mai" },
  { key: "Jun", label: "Jun" },
  { key: "Jul", label: "Jul" },
  { key: "Aug", label: "Ago" },
  { key: "Sep", label: "Set" },
  { key: "Oct", label: "Out" },
]

/**
 * Calculates adherence percentage and counts for a prescription.
 */
function getAdherenceStats(adherence: Record<string, boolean>) {
  const entries = Object.values(adherence)
  if (entries.length === 0) return { percent: 100, completed: 0, total: 0 }
  const completed = entries.filter(Boolean).length
  const total = entries.length
  const percent = Math.round((completed / total) * 100)
  return { percent, completed, total }
}

/**
 * Prescriptions page with filter tabs, adherence timeline, and expandable medication cards.
 */
export default function PrescriptionsPage() {
  const [activeFilter, setActiveFilter] = React.useState<FilterTab>("all")
  const [expandedCards, setExpandedCards] = React.useState<Record<string, boolean>>({
    presc_001: true, // First card open by default
  })

  const toggleExpand = (id: string) => {
    setExpandedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  // Filtered prescriptions based on active tab
  const filteredPrescriptions = React.useMemo(() => {
    if (activeFilter === "active") {
      return mockPrescriptions.filter((p) => p.status === "active")
    }
    if (activeFilter === "completed") {
      return mockPrescriptions.filter((p) => p.status === "completed")
    }
    return mockPrescriptions
  }, [activeFilter])

  // Prescriptions with monthly adherence data for timeline
  const timelinePrescriptions = React.useMemo(() => {
    // Show either filtered or all prescriptions that have adherence records
    const list = filteredPrescriptions.length > 0 ? filteredPrescriptions : mockPrescriptions
    return list.filter((p) => Object.keys(p.monthlyAdherence).length > 0)
  }, [filteredPrescriptions])

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Page Header */}
        <PageHeader
          title="Receitas & Medicamentos"
          description="Acompanhe o cronograma de tratamento, adesão mensal e orientações médicas."
        />

        {/* Filter Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200/80">
            <button
              onClick={() => setActiveFilter("all")}
              className={`relative px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeFilter === "all"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Todos
              <span className="ml-1.5 px-1.5 py-0.5 text-[10px] rounded-full bg-slate-100 text-slate-600">
                {mockPrescriptions.length}
              </span>
            </button>
            <button
              onClick={() => setActiveFilter("active")}
              className={`relative px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeFilter === "active"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Ativos
              <span className="ml-1.5 px-1.5 py-0.5 text-[10px] rounded-full bg-emerald-100 text-emerald-700">
                {mockPrescriptions.filter((p) => p.status === "active").length}
              </span>
            </button>
            <button
              onClick={() => setActiveFilter("completed")}
              className={`relative px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeFilter === "completed"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Concluídos
              <span className="ml-1.5 px-1.5 py-0.5 text-[10px] rounded-full bg-slate-200 text-slate-700">
                {mockPrescriptions.filter((p) => p.status === "completed").length}
              </span>
            </button>
          </div>

          {/* Quick Adherence Stat Badge */}
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-600 bg-blue-50/70 border border-blue-100 px-3 py-1.5 rounded-xl">
            <Activity className="h-4 w-4 text-primary shrink-0" />
            <span>Média geral de adesão: <strong>84%</strong></span>
          </div>
        </div>

        {/* Medication Legend */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Legenda de Medicamentos
            </span>
            <span className="text-[11px] text-slate-400">
              Cores identificam cada tratamento na linha do tempo
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            {mockPrescriptions.map((presc) => (
              <div
                key={presc.id}
                className="flex items-center gap-2 rounded-full border border-slate-200/90 bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-sm transition hover:border-slate-300"
              >
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0 shadow-xs"
                  style={{ backgroundColor: presc.color }}
                />
                <span>{presc.medicationName}</span>
                <span className="text-[11px] text-slate-400">({presc.dosage})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Medication Timeline View */}
        <Card className="border-slate-200/80 shadow-xs overflow-hidden">
          <CardHeader className="border-b border-slate-100 bg-slate-50/40 p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base font-bold text-slate-900">
                  Linha do Tempo de Adesão
                </CardTitle>
                <CardDescription className="text-xs text-slate-500 mt-0.5">
                  Acompanhamento mês a mês da tomada dos medicamentos prescritos.
                </CardDescription>
              </div>

              {/* Indicator Legend */}
              <div className="flex items-center gap-3 text-xs text-slate-600 shrink-0">
                <span className="inline-flex items-center gap-1.5">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white">
                    <Check className="h-2.5 w-2.5 stroke-[3]" />
                  </span>
                  Tomado
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-white">
                    <X className="h-2.5 w-2.5 stroke-[3]" />
                  </span>
                  Não tomado
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-slate-200 text-slate-400">
                    <Minus className="h-2.5 w-2.5" />
                  </span>
                  Sem registro
                </span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0 overflow-x-auto">
            <div className="min-w-[620px]">
              {/* Timeline Header Row (Medications) */}
              <div className="grid grid-cols-12 border-b border-slate-100 bg-slate-50/60 py-3 px-4 text-xs font-semibold text-slate-500">
                <div className="col-span-2 text-left pl-2">Mês</div>
                <div className="col-span-10 grid" style={{ gridTemplateColumns: `repeat(${timelinePrescriptions.length}, minmax(0, 1fr))` }}>
                  {timelinePrescriptions.map((presc) => (
                    <div
                      key={presc.id}
                      className="flex flex-col items-center justify-center gap-1 px-1 text-center"
                    >
                      <div className="flex items-center gap-1.5">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: presc.color }}
                        />
                        <span className="font-semibold text-slate-800 truncate max-w-[90px]" title={presc.medicationName}>
                          {presc.medicationName}
                        </span>
                      </div>
                      <span className="text-[10px] font-normal text-slate-400">
                        {presc.dosage}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Monthly Rows with Vertical Connected Lines */}
              <div className="divide-y divide-slate-100">
                {TIMELINE_MONTHS.map((month, monthIdx) => {
                  const isFirst = monthIdx === 0
                  const isLast = monthIdx === TIMELINE_MONTHS.length - 1

                  return (
                    <div
                      key={month.key}
                      className="grid grid-cols-12 items-center py-2.5 px-4 hover:bg-slate-50/50 transition-colors"
                    >
                      {/* Month Label */}
                      <div className="col-span-2 pl-2">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                          {month.label}
                        </span>
                      </div>

                      {/* Medication Indicator Columns */}
                      <div
                        className="col-span-10 grid"
                        style={{ gridTemplateColumns: `repeat(${timelinePrescriptions.length}, minmax(0, 1fr))` }}
                      >
                        {timelinePrescriptions.map((presc) => {
                          const adherenceStatus = presc.monthlyAdherence[month.key]

                          return (
                            <div
                              key={presc.id}
                              className="relative flex items-center justify-center py-1.5"
                            >
                              {/* Vertical connecting line */}
                              <div
                                className="absolute left-1/2 -translate-x-1/2 w-0.5 pointer-events-none"
                                style={{
                                  backgroundColor: presc.color,
                                  opacity: 0.2,
                                  top: isFirst ? "50%" : 0,
                                  bottom: isLast ? "50%" : 0,
                                }}
                              />

                              {/* Indicator Node */}
                              {adherenceStatus === true && (
                                <motion.div
                                  initial={{ scale: 0.8, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white shadow-xs ring-2 ring-white cursor-help"
                                  title={`${presc.medicationName} em ${month.label}: Adesão confirmada`}
                                >
                                  <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                                </motion.div>
                              )}

                              {adherenceStatus === false && (
                                <motion.div
                                  initial={{ scale: 0.8, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-white shadow-xs ring-2 ring-white cursor-help"
                                  title={`${presc.medicationName} em ${month.label}: Não tomado / Falha de adesão`}
                                >
                                  <X className="h-3.5 w-3.5 stroke-[2.5]" />
                                </motion.div>
                              )}

                              {adherenceStatus === undefined && (
                                <div
                                  className="relative z-10 flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-slate-300 ring-2 ring-white"
                                  title={`${presc.medicationName} em ${month.label}: Sem prescrição no período`}
                                >
                                  <Minus className="h-2.5 w-2.5" />
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Card List Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">
              Minhas Prescrições
            </h2>
            <span className="text-xs text-slate-500">
              {filteredPrescriptions.length} de {mockPrescriptions.length} exibidos
            </span>
          </div>

          {filteredPrescriptions.length === 0 ? (
            <EmptyState
              icon={Pill}
              title="Nenhuma receita encontrada"
              description="Não encontramos receitas para o filtro selecionado."
              actionLabel="Ver todas as receitas"
              onAction={() => setActiveFilter("all")}
            />
          ) : (
            <div className="space-y-3">
              <AnimatePresence initial={false}>
                {filteredPrescriptions.map((presc, index) => {
                  const isExpanded = !!expandedCards[presc.id]
                  const adherence = getAdherenceStats(presc.monthlyAdherence)

                  return (
                    <motion.div
                      key={presc.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                    >
                      <Card className="overflow-hidden border-slate-200/90 shadow-xs transition-shadow hover:shadow-sm">
                        {/* Header Section (Always Visible) */}
                        <div
                          onClick={() => toggleExpand(presc.id)}
                          className="p-5 cursor-pointer select-none hover:bg-slate-50/40 transition-colors"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-start gap-3.5">
                              {/* Pill Avatar with Prescription Color */}
                              <div
                                className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0 text-white shadow-xs"
                                style={{ backgroundColor: presc.color }}
                              >
                                <Pill className="h-5 w-5" />
                              </div>

                              <div className="space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h3 className="text-base font-semibold text-slate-900">
                                    {presc.medicationName}
                                  </h3>
                                  <span className="text-xs font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                                    {presc.dosage}
                                  </span>
                                  <StatusBadge status={presc.status} />
                                </div>

                                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                                    {presc.frequency}
                                  </span>
                                  <span>•</span>
                                  <span>Duração: {presc.duration}</span>
                                </div>
                              </div>
                            </div>

                            {/* Adherence Progress Bar & Expand Button */}
                            <div className="flex items-center gap-4 sm:justify-end">
                              {/* Adherence Mini Bar */}
                              <div className="min-w-[130px] space-y-1">
                                <div className="flex items-center justify-between text-[11px]">
                                  <span className="text-slate-500">Adesão</span>
                                  <span
                                    className={`font-semibold ${
                                      adherence.percent >= 80
                                        ? "text-emerald-600"
                                        : adherence.percent >= 50
                                        ? "text-amber-600"
                                        : "text-rose-600"
                                    }`}
                                  >
                                    {adherence.percent}%
                                  </span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all duration-500 ${
                                      adherence.percent >= 80
                                        ? "bg-emerald-500"
                                        : adherence.percent >= 50
                                        ? "bg-amber-500"
                                        : "bg-rose-500"
                                    }`}
                                    style={{ width: `${adherence.percent}%` }}
                                  />
                                </div>
                              </div>

                              {/* Toggle Expand Icon */}
                              <button
                                type="button"
                                aria-label={isExpanded ? "Recolher detalhes" : "Expandir detalhes"}
                                className="h-8 w-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                              >
                                {isExpanded ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Collapsible Details */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="border-t border-slate-100 bg-slate-50/50 p-5 space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                                  <div className="flex items-start gap-2.5">
                                    <User className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                                    <div>
                                      <p className="font-medium text-slate-500">Médico Responsável</p>
                                      <p className="font-semibold text-slate-900 mt-0.5">{presc.doctorName}</p>
                                    </div>
                                  </div>

                                  <div className="flex items-start gap-2.5">
                                    <Calendar className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                                    <div>
                                      <p className="font-medium text-slate-500">Data da Prescrição</p>
                                      <p className="font-semibold text-slate-900 mt-0.5">
                                        {formatDate(presc.prescribedAt)}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex items-start gap-2.5">
                                    <Clock className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                                    <div>
                                      <p className="font-medium text-slate-500">Tempo de Tratamento</p>
                                      <p className="font-semibold text-slate-900 mt-0.5">{presc.duration}</p>
                                    </div>
                                  </div>
                                </div>

                                {presc.notes && (
                                  <div className="rounded-xl bg-white p-3.5 border border-slate-200/80 text-xs text-slate-600 flex items-start gap-2">
                                    <AlertCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                    <div>
                                      <span className="font-semibold text-slate-900">Orientações de Uso: </span>
                                      {presc.notes}
                                    </div>
                                  </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex items-center justify-end gap-2 pt-1">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 text-xs gap-1.5 rounded-lg border-slate-200 text-slate-700 hover:bg-white"
                                  >
                                    <Download className="h-3.5 w-3.5 text-slate-500" />
                                    Baixar Receita (PDF)
                                  </Button>
                                  <Button
                                    size="sm"
                                    className="h-8 text-xs gap-1.5 rounded-lg bg-primary hover:bg-primary/90 text-white"
                                  >
                                    <Check className="h-3.5 w-3.5" />
                                    Registrar Tomada
                                  </Button>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </Card>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}
