"use client"

import * as React from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  CalendarCheck2,
  CalendarX2,
  Stethoscope,
  Plus,
  RefreshCw,
  Info,
  CheckCircle2,
} from "lucide-react"

import { AppShell } from "@/components/layout/app-shell"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { StatusBadge } from "@/components/shared/status-badge"
import { mockAppointments } from "@/data/appointments"
import { Appointment } from "@/types"
import { formatDate, formatTime, formatCurrency } from "@/lib/utils"
import { isSupabaseConfigured } from "@/lib/supabase/config"

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = React.useState<Appointment[]>(mockAppointments)
  const [selectedCalendarDate, setSelectedCalendarDate] = React.useState<Date>(() => new Date())
  const [weekOffset, setWeekOffset] = React.useState(0)
  const [isUpcomingOpen, setIsUpcomingOpen] = React.useState(true)
  const [isHistoryOpen, setIsHistoryOpen] = React.useState(true)
  const [isCancelledOpen, setIsCancelledOpen] = React.useState(false)

  // Dialog state for appointment details / reschedule
  const [selectedAppointment, setSelectedAppointment] = React.useState<Appointment | null>(null)
  const [isRescheduleOpen, setIsRescheduleOpen] = React.useState(false)
  const [isPaymentInfoOpen, setIsPaymentInfoOpen] = React.useState(false)
  const [isCancelOpen, setIsCancelOpen] = React.useState(false)
  const [cancelBusy, setCancelBusy] = React.useState(false)
  const [cancelError, setCancelError] = React.useState("")
  const [rescheduleSuccess, setRescheduleSuccess] = React.useState(false)
  const [rescheduleSlot, setRescheduleSlot] = React.useState("")
  const [rescheduleError, setRescheduleError] = React.useState("")

  React.useEffect(() => {
    if (!isSupabaseConfigured()) return
    fetch("/api/appointments", { cache: "no-store" })
      .then(async (response) => {
        const result = await response.json()
        if (!response.ok) throw new Error(result.error || "Não foi possível carregar as consultas.")
        const loaded = result.appointments.map((row: Record<string, any>) => ({
          id: row.id,
          userId: row.user_id,
          doctorId: row.doctor_id,
          doctor: {
            id: row.doctor.id,
            fullName: row.doctor.full_name,
            specialty: row.doctor.specialty,
            crm: row.doctor.crm,
            avatarUrl: row.doctor.avatar_url || "",
            rating: Number(row.doctor.rating),
            reviewsCount: row.doctor.reviews_count,
            experienceYears: row.doctor.experience_years,
            pricePerSession: Number(row.doctor.price_per_session),
            bio: row.doctor.bio,
            availableOnline: row.doctor.available_online,
            availableInPerson: row.doctor.available_in_person,
            availableSlots: row.doctor.available_slots,
          },
          scheduledAt: row.scheduled_at,
          durationMinutes: row.duration_minutes,
          status: row.status,
          type: row.type,
          notes: row.notes || undefined,
          price: Number(row.doctor.price_per_session),
        })) as Appointment[]
        setAppointments(loaded)
      })
      .catch(() => setAppointments([]))
  }, [])

  const chooseRescheduleSlot = async (slot: string) => {
    setRescheduleSlot(slot)
    setRescheduleError("")
    if (isSupabaseConfigured() && selectedAppointment) {
      const dayOffset = slot.startsWith("Amanhã") ? 1 : Number(slot.match(/Em (\d+) dias/)?.[1] || 0)
      const time = slot.match(/(\d{2}:\d{2})$/)?.[1]
      if (!time) return
      const scheduledAt = new Date()
      scheduledAt.setDate(scheduledAt.getDate() + dayOffset)
      const [hours, minutes] = time.split(":").map(Number)
      scheduledAt.setHours(hours, minutes, 0, 0)
      const response = await fetch(`/api/appointments/${selectedAppointment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scheduledAt: scheduledAt.toISOString() }),
      })
      const result = await response.json()
      if (!response.ok) {
        setRescheduleError(result.error || "Não foi possível reagendar.")
        return
      }
      setAppointments((current) => current.map((item) => item.id === selectedAppointment.id
        ? { ...item, scheduledAt: result.appointment.scheduled_at }
        : item))
    }
    setRescheduleSuccess(true)
  }

  const confirmCancelAppointment = async () => {
    if (!selectedAppointment) return
    setCancelBusy(true)
    setCancelError("")
    if (isSupabaseConfigured()) {
      const response = await fetch(`/api/appointments/${selectedAppointment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      })
      const result = await response.json()
      if (!response.ok) {
        setCancelError(result.error || "Não foi possível cancelar a consulta.")
        setCancelBusy(false)
        return
      }
    }
    setAppointments((current) => current.map((item) => item.id === selectedAppointment.id ? { ...item, status: "cancelled" } : item))
    setSelectedAppointment(null)
    setIsCancelOpen(false)
    setCancelBusy(false)
  }

  // Filter appointments
  const upcomingAppointments = React.useMemo(() => {
    return appointments
      .filter((apt) => apt.status === "scheduled" || apt.status === "confirmed")
      .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
  }, [appointments])

  const completedAppointments = React.useMemo(() => {
    return appointments
      .filter((apt) => apt.status === "completed")
      .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())
  }, [appointments])

  const cancelledAppointments = React.useMemo(() => {
    return appointments
      .filter((apt) => apt.status === "cancelled")
      .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())
  }, [appointments])

  const heroAppointment = upcomingAppointments[0]
  const otherUpcoming = upcomingAppointments.slice(1)

  // Calendar strip calculation with week navigation
  const weekDays = React.useMemo(() => {
    const baseDate = new Date()
    baseDate.setDate(baseDate.getDate() + weekOffset * 7)

    const day = baseDate.getDay()
    const diffToMon = day === 0 ? -6 : 1 - day
    const monday = new Date(baseDate)
    monday.setDate(baseDate.getDate() + diffToMon)
    monday.setHours(0, 0, 0, 0)

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const dayLabels = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"]

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday)
      d.setDate(monday.getDate() + i)
      const isToday = d.getTime() === today.getTime()
      const isSelected = d.toDateString() === selectedCalendarDate.toDateString()
      const isPast = d.getTime() < today.getTime()

      return {
        date: d,
        dayNum: d.getDate(),
        dayLabel: dayLabels[i],
        isToday,
        isSelected,
        isPast,
      }
    })
  }, [weekOffset, selectedCalendarDate])

  const calendarMonthLabel = React.useMemo(() => {
    const firstDay = weekDays[0]?.date || new Date()
    return new Intl.DateTimeFormat("pt-BR", {
      month: "long",
      year: "numeric",
    }).format(firstDay)
  }, [weekDays])

  return (
    <AppShell>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        {/* Page Header */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Minhas Consultas
            </h1>
            <p className="text-sm text-slate-500">
              Gerencie seus agendamentos e histórico médico com facilidade.
            </p>
          </div>
          <Link href="/doctors">
            <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl shadow-sm gap-2">
              <Plus className="h-4 w-4" />
              Agendar Nova Consulta
            </Button>
          </Link>
        </motion.div>

        {/* A2.3: Weekly Calendar Strip */}
        <motion.section variants={itemVariants} aria-label="Calendário semanal">
          <Card className="border-slate-100 bg-white shadow-sm rounded-2xl">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <span className="text-sm font-bold text-slate-800 capitalize">
                  {calendarMonthLabel}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full text-slate-600 hover:bg-slate-100"
                  onClick={() => setWeekOffset((prev) => prev - 1)}
                  aria-label="Semana anterior"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs font-semibold text-primary h-8 px-2.5 rounded-lg hover:bg-blue-50"
                  onClick={() => {
                    setWeekOffset(0)
                    setSelectedCalendarDate(new Date())
                  }}
                >
                  Hoje
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full text-slate-600 hover:bg-slate-100"
                  onClick={() => setWeekOffset((prev) => prev + 1)}
                  aria-label="Próxima semana"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="p-4 pt-3">
              <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {weekDays.map((day, idx) => {
                  const isActive = day.isToday || day.isSelected
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedCalendarDate(day.date)}
                      className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all ${
                        isActive
                          ? "bg-primary text-white shadow-md shadow-blue-500/25 ring-2 ring-primary/20 scale-105"
                          : day.isPast
                          ? "text-slate-400 hover:bg-slate-50"
                          : "text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <span
                        className={`text-[11px] font-medium uppercase mb-1 ${
                          isActive ? "text-blue-100 font-semibold" : ""
                        }`}
                      >
                        {day.dayLabel}
                      </span>
                      <span
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                          isActive
                            ? "bg-white text-primary shadow-sm"
                            : day.isPast
                            ? "text-slate-400"
                            : "text-slate-800"
                        }`}
                      >
                        {day.dayNum}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          </Card>
        </motion.section>

        {/* A2.2: Upcoming Section with Hero Card */}
        <motion.section variants={itemVariants} aria-labelledby="upcoming-heading">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <h2 id="upcoming-heading" className="text-lg font-bold text-slate-900 tracking-tight">
                Próximas
              </h2>
              <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-0 font-semibold px-2 py-0.5 rounded-full text-xs">
                {upcomingAppointments.length} agendada{upcomingAppointments.length !== 1 ? "s" : ""}
              </Badge>
            </div>
          </div>

          {heroAppointment ? (
            <div className="space-y-4">
              {/* Large blue gradient hero card for the next appointment */}
              <Card className="overflow-hidden border-0 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white shadow-xl shadow-blue-500/20 rounded-2xl">
                <CardContent className="p-6 md:p-8">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <div className="space-y-4 flex-1">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-md">
                          Próxima Consulta
                        </span>
                        <span className="flex items-center gap-1 text-xs text-blue-100 bg-white/10 px-2.5 py-1 rounded-full">
                          {heroAppointment.type === "telemedicine" ? (
                            <>
                              <Video className="h-3.5 w-3.5" /> Telemedicina
                            </>
                          ) : (
                            <>
                              <MapPin className="h-3.5 w-3.5" /> Presencial
                            </>
                          )}
                        </span>
                        <span className="text-xs text-blue-200">
                          #{heroAppointment.id.toUpperCase()}
                        </span>
                      </div>

                      <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16 rounded-2xl border-2 border-white/20 shadow-md">
                          <AvatarImage src={heroAppointment.doctor.avatarUrl} alt={heroAppointment.doctor.fullName} />
                          <AvatarFallback className="text-slate-900 font-bold">
                            {heroAppointment.doctor.fullName.slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="text-xl md:text-2xl font-bold tracking-tight">
                            {heroAppointment.doctor.fullName}
                          </h3>
                          <p className="text-blue-100 text-sm md:text-base font-medium">
                            {heroAppointment.doctor.specialty} • {heroAppointment.doctor.crm}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 pt-1 text-xs md:text-sm text-blue-50">
                        <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-1.5 backdrop-blur-sm">
                          <Calendar className="h-4 w-4 text-blue-200" />
                          <span className="font-semibold">{formatDate(heroAppointment.scheduledAt)}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-1.5 backdrop-blur-sm">
                          <Clock className="h-4 w-4 text-blue-200" />
                          <span className="font-semibold">{formatTime(heroAppointment.scheduledAt)} ({heroAppointment.durationMinutes} min)</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-row sm:flex-col lg:flex-row gap-3 pt-2 lg:pt-0">
                      <Button
                        variant="secondary"
                        onClick={() => setIsPaymentInfoOpen(true)}
                        className="flex-1 sm:flex-none bg-white/15 hover:bg-white/25 text-white border border-white/20 font-semibold rounded-xl"
                      >
                        Pagar agora
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setSelectedAppointment(heroAppointment)
                          setIsRescheduleOpen(true)
                        }}
                        className="flex-1 sm:flex-none bg-white/15 hover:bg-white/25 text-white border border-white/20 font-semibold rounded-xl"
                      >
                        <RefreshCw className="mr-1.5 h-4 w-4" />
                        Reagendar
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => setSelectedAppointment(heroAppointment)}
                        className="flex-1 sm:flex-none bg-white text-blue-700 hover:bg-blue-50 font-semibold shadow-md rounded-xl"
                      >
                        Detalhes
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Other upcoming appointments */}
              {otherUpcoming.length > 0 && (
                <div className="space-y-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsUpcomingOpen(!isUpcomingOpen)}
                    className="flex items-center justify-between w-full text-xs font-semibold text-slate-500 hover:text-slate-800 py-1"
                  >
                    <span>Outras consultas agendadas ({otherUpcoming.length})</span>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform duration-200 ${
                        isUpcomingOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {isUpcomingOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-3 overflow-hidden"
                      >
                        {otherUpcoming.map((apt) => (
                          <AppointmentListItem
                            key={apt.id}
                            appointment={apt}
                            onDetails={() => setSelectedAppointment(apt)}
                            onReschedule={() => {
                              setSelectedAppointment(apt)
                              setIsRescheduleOpen(true)
                            }}
                          />
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          ) : (
            <Card className="p-8 text-center border-dashed border-slate-200">
              <CalendarCheck2 className="h-10 w-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">
                Nenhuma consulta futura agendada
              </p>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                Encontre um especialista e agende seu próximo atendimento.
              </p>
              <Link href="/doctors">
                <Button size="sm" className="rounded-xl">
                  Buscar Médicos
                </Button>
              </Link>
            </Card>
          )}
        </motion.section>

        {/* A2.4: Histórico de Consultas (Completed) */}
        <motion.section variants={itemVariants} aria-labelledby="history-heading">
          <button
            type="button"
            onClick={() => setIsHistoryOpen(!isHistoryOpen)}
            className="flex items-center justify-between w-full mb-3 group"
          >
            <div className="flex items-center gap-2.5">
              <h2 id="history-heading" className="text-lg font-bold text-slate-900 tracking-tight">
                Histórico
              </h2>
              <Badge variant="outline" className="text-slate-600 border-slate-200 font-semibold px-2 py-0.5 rounded-full text-xs">
                {completedAppointments.length} concluída{completedAppointments.length !== 1 ? "s" : ""}
              </Badge>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-slate-500 group-hover:text-slate-800">
              <span>{isHistoryOpen ? "Ocultar" : "Expandir"}</span>
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-200 ${
                  isHistoryOpen ? "rotate-180" : ""
                }`}
              />
            </div>
          </button>

          <AnimatePresence>
            {isHistoryOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3 overflow-hidden"
              >
                {completedAppointments.map((apt) => (
                  <AppointmentListItem
                    key={apt.id}
                    appointment={apt}
                    onDetails={() => setSelectedAppointment(apt)}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>

        {/* A2.4: Canceladas Section */}
        {cancelledAppointments.length > 0 && (
          <motion.section variants={itemVariants} aria-labelledby="cancelled-heading">
            <button
              type="button"
              onClick={() => setIsCancelledOpen(!isCancelledOpen)}
              className="flex items-center justify-between w-full mb-3 group"
            >
              <div className="flex items-center gap-2.5">
                <h2 id="cancelled-heading" className="text-base font-bold text-slate-700 tracking-tight">
                  Canceladas
                </h2>
                <Badge variant="outline" className="text-red-600 bg-red-50 border-red-200 font-semibold px-2 py-0.5 rounded-full text-xs">
                  {cancelledAppointments.length}
                </Badge>
              </div>
              <div className="flex items-center gap-1 text-xs font-semibold text-slate-500 group-hover:text-slate-800">
                <span>{isCancelledOpen ? "Ocultar" : "Expandir"}</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${
                    isCancelledOpen ? "rotate-180" : ""
                  }`}
                />
              </div>
            </button>

            <AnimatePresence>
              {isCancelledOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3 overflow-hidden opacity-85"
                >
                  {cancelledAppointments.map((apt) => (
                    <AppointmentListItem
                      key={apt.id}
                      appointment={apt}
                      onDetails={() => setSelectedAppointment(apt)}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.section>
        )}
      </motion.div>

      {/* Appointment Details Dialog */}
      <Dialog
        open={Boolean(selectedAppointment && !isRescheduleOpen)}
        onOpenChange={(open) => !open && setSelectedAppointment(null)}
      >
        <DialogContent className="sm:max-w-md">
          {selectedAppointment && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between text-lg font-bold pr-6">
                  <span>Detalhes da Consulta</span>
                  <StatusBadge status={selectedAppointment.status} />
                </DialogTitle>
                <DialogDescription>
                  Código de agendamento: <span className="font-mono font-semibold text-slate-700">#{selectedAppointment.id.toUpperCase()}</span>
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                {/* Doctor Box */}
                <div className="flex items-center gap-3.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <Avatar className="h-12 w-12 rounded-xl border border-slate-200">
                    <AvatarImage src={selectedAppointment.doctor.avatarUrl} alt={selectedAppointment.doctor.fullName} />
                    <AvatarFallback>{selectedAppointment.doctor.fullName.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">
                      {selectedAppointment.doctor.fullName}
                    </p>
                    <p className="text-xs text-primary font-medium">
                      {selectedAppointment.doctor.specialty}
                    </p>
                    <p className="text-xs text-slate-400">{selectedAppointment.doctor.crm}</p>
                  </div>
                </div>

                {/* Appointment Info Grid */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl border border-slate-100 bg-white">
                    <span className="text-slate-400 block mb-1">Data & Horário</span>
                    <span className="font-bold text-slate-800 block">
                      {formatDate(selectedAppointment.scheduledAt)}
                    </span>
                    <span className="text-slate-600">
                      às {formatTime(selectedAppointment.scheduledAt)}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl border border-slate-100 bg-white">
                    <span className="text-slate-400 block mb-1">Modalidade</span>
                    <span className="font-bold text-slate-800 flex items-center gap-1">
                      {selectedAppointment.type === "telemedicine" ? (
                        <>
                          <Video className="h-3.5 w-3.5 text-blue-600" /> Telemedicina
                        </>
                      ) : (
                        <>
                          <MapPin className="h-3.5 w-3.5 text-emerald-600" /> Presencial
                        </>
                      )}
                    </span>
                    <span className="text-slate-500">{selectedAppointment.durationMinutes} minutos</span>
                  </div>
                </div>

                {/* Notes if available */}
                {selectedAppointment.notes && (
                  <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100/60 text-xs">
                    <p className="font-semibold text-blue-900 mb-0.5">Observações:</p>
                    <p className="text-blue-700">{selectedAppointment.notes}</p>
                  </div>
                )}

                {/* Price */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <span className="text-slate-500 font-medium">Valor ilustrativo do protótipo</span>
                  <span className="font-bold text-emerald-600 text-sm">
                    {formatCurrency(selectedAppointment.price)}
                  </span>
                </div>
              </div>

              <DialogFooter className="flex-col sm:flex-row gap-2">
                {selectedAppointment.status === "scheduled" || selectedAppointment.status === "confirmed" ? (
                  <>
                    <Button
                      variant="destructive"
                      className="rounded-xl"
                      onClick={() => setIsCancelOpen(true)}
                    >
                      Cancelar consulta
                    </Button>
                    <Button
                      variant="outline"
                      className="rounded-xl"
                      onClick={() => {
                        setIsRescheduleOpen(true)
                      }}
                    >
                      <RefreshCw className="mr-1.5 h-4 w-4" />
                      Reagendar
                    </Button>
                    <Button
                      className="rounded-xl bg-primary text-white"
                      onClick={() => setSelectedAppointment(null)}
                    >
                      Fechar
                    </Button>
                  </>
                ) : (
                  <Button
                    className="w-full rounded-xl bg-primary text-white"
                    onClick={() => setSelectedAppointment(null)}
                  >
                    Fechar
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Reschedule Confirmation Dialog */}
      <Dialog
        open={isRescheduleOpen}
        onOpenChange={(open) => {
          setIsRescheduleOpen(open)
          if (!open) {
            setRescheduleSuccess(false)
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              {rescheduleSuccess ? isSupabaseConfigured() ? "Consulta reagendada" : "Simulação de reagendamento" : "Reagendar Consulta"}
            </DialogTitle>
            <DialogDescription>
              {rescheduleSuccess
                ? isSupabaseConfigured() ? "A nova data foi salva na sua conta." : "A demonstração foi concluída. Nenhuma consulta foi alterada ou salva."
                : `Selecione um novo horário para a consulta com ${selectedAppointment?.doctor.fullName}.`}
            </DialogDescription>
          </DialogHeader>

          {rescheduleSuccess ? (
            <div className="py-6 flex flex-col items-center justify-center text-center space-y-3">
              <div className="h-14 w-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <p className="text-sm font-semibold text-slate-800">
                Horário selecionado: {rescheduleSlot}
              </p>
              <p className="text-xs text-slate-500 max-w-xs">
                Esta ação é apenas uma simulação; nenhum e-mail foi enviado.
              </p>
            </div>
          ) : (
            <div className="space-y-3 py-2 text-xs">
              <p className="font-semibold text-slate-700">Horários disponíveis mais próximos:</p>
              {!isSupabaseConfigured() && <p className="rounded-xl bg-blue-50 p-3 text-blue-800">Modo demonstração: a alteração não será salva.</p>}
              {rescheduleError && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-rose-700">{rescheduleError}</p>}
              <div className="grid grid-cols-2 gap-2">
                {["Amanhã, 10:00", "Amanhã, 14:30", "Em 3 dias, 09:00", "Em 5 dias, 16:00"].map((slot) => (
                  <Button
                    key={slot}
                    variant={rescheduleSlot === slot ? "default" : "outline"}
                    size="sm"
                    className="h-10 text-xs justify-center rounded-xl"
                    onClick={() => { void chooseRescheduleSlot(slot) }}
                  >
                    {slot}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              className="w-full rounded-xl"
              onClick={() => {
                setIsRescheduleOpen(false)
                setSelectedAppointment(null)
                setRescheduleSuccess(false)
              }}
            >
              {rescheduleSuccess ? "Concluir" : "Cancelar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isPaymentInfoOpen} onOpenChange={setIsPaymentInfoOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Pagamento indisponível</DialogTitle>
            <DialogDescription>
              Esta é uma demonstração com valores fictícios. Nenhuma cobrança pode ser feita neste protótipo.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setIsPaymentInfoOpen(false)}>Entendi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isCancelOpen} onOpenChange={setIsCancelOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Cancelar consulta?</DialogTitle>
            <DialogDescription>
              {isSupabaseConfigured()
                ? "A consulta será marcada como cancelada na sua conta."
                : "Modo demonstração: a consulta será removida apenas desta tela."}
            </DialogDescription>
          </DialogHeader>
          {cancelError && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{cancelError}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCancelOpen(false)}>Voltar</Button>
            <Button variant="destructive" disabled={cancelBusy} onClick={confirmCancelAppointment}>
              {cancelBusy ? "Cancelando…" : "Confirmar cancelamento"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  )
}

/**
 * Reusable list card for appointments
 */
function AppointmentListItem({
  appointment,
  onDetails,
  onReschedule,
}: {
  appointment: Appointment
  onDetails: () => void
  onReschedule?: () => void
}) {
  const dateObj = new Date(appointment.scheduledAt)
  const monthShort = new Intl.DateTimeFormat("pt-BR", { month: "short" }).format(dateObj).replace(".", "")
  const dayNum = dateObj.getDate()
  const timeStr = formatTime(appointment.scheduledAt)

  const isFuture = appointment.status === "scheduled" || appointment.status === "confirmed"

  return (
    <Card className="p-4 border-slate-100 bg-white hover:shadow-md hover:border-slate-200 transition-all rounded-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Date Badge + Doctor info */}
        <div className="flex items-center gap-3.5">
          {/* Date Badge */}
          <div className="flex flex-col items-center justify-center rounded-xl bg-blue-50/80 text-primary p-2 min-w-[62px] text-center border border-blue-100/60 shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
              {monthShort}
            </span>
            <span className="text-lg font-black leading-tight text-slate-900">
              {dayNum}
            </span>
            <span className="text-[10px] text-slate-500 font-medium">
              {timeStr}
            </span>
          </div>

          <Avatar className="h-12 w-12 rounded-xl border border-slate-100 shrink-0">
            <AvatarImage src={appointment.doctor.avatarUrl} alt={appointment.doctor.fullName} />
            <AvatarFallback>{appointment.doctor.fullName.slice(0, 2)}</AvatarFallback>
          </Avatar>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 truncate">
                {appointment.doctor.fullName}
              </h3>
              <span className="text-[11px] font-mono text-slate-400 shrink-0">
                #{appointment.id.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">{appointment.doctor.specialty}</p>
            <div className="flex items-center gap-2 mt-1 text-xs">
              {appointment.type === "telemedicine" ? (
                <span className="flex items-center gap-1 text-blue-600 font-medium text-[11px]">
                  <Video className="h-3 w-3" /> Telemedicina
                </span>
              ) : (
                <span className="flex items-center gap-1 text-emerald-600 font-medium text-[11px]">
                  <MapPin className="h-3 w-3" /> Presencial
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Status and action buttons */}
        <div className="flex items-center justify-between sm:justify-end gap-2.5 pt-2 sm:pt-0 border-t sm:border-0 border-slate-100">
          <StatusBadge status={appointment.status} />
          {isFuture && onReschedule && (
            <Button
              variant="outline"
              size="sm"
              onClick={onReschedule}
              className="h-8 text-xs font-semibold rounded-lg hover:bg-slate-50"
            >
              Reagendar
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onDetails}
            className="h-8 text-xs font-semibold text-primary hover:bg-blue-50 rounded-lg"
          >
            Detalhes
            <ChevronRight className="ml-0.5 h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </Card>
  )
}
