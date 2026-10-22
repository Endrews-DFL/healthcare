"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  ChevronRight,
  Stethoscope,
  TestTube,
  Pill,
  CreditCard,
  FileCheck,
  ArrowRight,
  Star,
  Check,
  type LucideIcon,
} from "lucide-react"

import { AppShell } from "@/components/layout/app-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { StatusBadge } from "@/components/shared/status-badge"
import { mockAppointments } from "@/data/appointments"
import { mockExams } from "@/data/exams"
import { mockServices } from "@/data/services"
import { mockDoctors } from "@/data/doctors"
import { formatDate, formatTime } from "@/lib/utils"
import { isSupabaseConfigured } from "@/lib/supabase/config"
import { Appointment, Exam } from "@/types"

const serviceIcons: Record<string, { icon: LucideIcon; bg: string; color: string }> = {
  Stethoscope: { icon: Stethoscope, bg: "bg-blue-50", color: "text-blue-600" },
  TestTube: { icon: TestTube, bg: "bg-emerald-50", color: "text-emerald-600" },
  Pill: { icon: Pill, bg: "bg-amber-50", color: "text-amber-600" },
  CreditCard: { icon: CreditCard, bg: "bg-purple-50", color: "text-purple-600" },
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
}

export default function DashboardPage() {
  const [selectedDate, setSelectedDate] = React.useState<Date>(() => new Date())
  const [upcomingAppointment, setUpcomingAppointment] = React.useState<Appointment | null>(() =>
    mockAppointments.find((appointment) => appointment.status === "confirmed" || appointment.status === "scheduled") || null
  )
  const [recentExams, setRecentExams] = React.useState<Exam[]>(mockExams.slice(0, 3))
  const [doctorRecords, setDoctorRecords] = React.useState(mockDoctors)
  const [appointmentMode, setAppointmentMode] = React.useState<"telemedicine" | "in_person">("telemedicine")

  React.useEffect(() => {
    if (!isSupabaseConfigured()) return
    Promise.all([
      fetch("/api/appointments", { cache: "no-store" }).then((response) => response.ok ? response.json() : Promise.reject()),
      fetch("/api/exams", { cache: "no-store" }).then((response) => response.ok ? response.json() : Promise.reject()),
      fetch("/api/doctors", { cache: "no-store" }).then((response) => response.ok ? response.json() : Promise.reject()),
    ]).then(([appointmentResult, examResult, doctorResult]) => {
      const appointment = appointmentResult.appointments
        .filter((row: Record<string, any>) => row.status === "scheduled" || row.status === "confirmed")
        .sort((a: Record<string, any>, b: Record<string, any>) => Date.parse(a.scheduled_at) - Date.parse(b.scheduled_at))[0]
      if (appointment) {
        setUpcomingAppointment({
          id: appointment.id,
          userId: appointment.user_id,
          doctorId: appointment.doctor_id,
          doctor: {
            id: appointment.doctor.id,
            fullName: appointment.doctor.full_name,
            specialty: appointment.doctor.specialty,
            crm: appointment.doctor.crm,
            avatarUrl: appointment.doctor.avatar_url || "",
            rating: Number(appointment.doctor.rating),
            reviewsCount: appointment.doctor.reviews_count,
            experienceYears: appointment.doctor.experience_years,
            pricePerSession: Number(appointment.doctor.price_per_session),
            bio: appointment.doctor.bio,
            availableOnline: appointment.doctor.available_online,
            availableInPerson: appointment.doctor.available_in_person,
          },
          scheduledAt: appointment.scheduled_at,
          durationMinutes: appointment.duration_minutes,
          status: appointment.status,
          type: appointment.type,
          notes: appointment.notes || undefined,
          price: Number(appointment.doctor.price_per_session),
        })
      } else {
        setUpcomingAppointment(null)
      }
      setRecentExams(examResult.exams.slice(0, 3))
      setDoctorRecords(doctorResult.doctors)
    }).catch(() => {
      setUpcomingAppointment(null)
      setRecentExams([])
      setDoctorRecords([])
    })
  }, [])

  const popularDoctors = doctorRecords
    .filter((doctor) => appointmentMode === "telemedicine" ? doctor.availableOnline : doctor.availableInPerson)
    .slice(0, 5)

  // Current week days (Monday - Sunday)
  const weekDays = React.useMemo(() => {
    const curr = new Date(selectedDate)
    const day = curr.getDay()
    const diffToMon = day === 0 ? -6 : 1 - day
    const monday = new Date(curr)
    monday.setDate(curr.getDate() + diffToMon)
    monday.setHours(0, 0, 0, 0)

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const dayLabels = ["S", "T", "Q", "Q", "S", "S", "D"]

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday)
      d.setDate(monday.getDate() + i)
      const isToday = d.getTime() === today.getTime()
      const isSelected = d.toDateString() === selectedDate.toDateString()
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
  }, [selectedDate])

  const formattedMonthYear = React.useMemo(() => {
    return new Intl.DateTimeFormat("pt-BR", {
      month: "long",
      year: "numeric",
    }).format(selectedDate)
  }, [selectedDate])

  return (
    <AppShell>
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        {/* A1.0: Hero Upcoming Appointment Banner */}
        {upcomingAppointment && (
          <motion.section variants={item} aria-labelledby="upcoming-appointment-heading">
            <h2 id="upcoming-appointment-heading" className="sr-only">
              Próxima Consulta
            </h2>
            <Card className="overflow-hidden border-0 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white shadow-xl shadow-blue-500/15 rounded-2xl">
              <CardContent className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-md">
                        Próxima Consulta
                      </span>
                      <span className="flex items-center gap-1 text-xs text-blue-100">
                        {upcomingAppointment.type === "telemedicine" ? (
                          <>
                            <Video className="h-3.5 w-3.5" /> Telemedicina
                          </>
                        ) : (
                          <>
                            <MapPin className="h-3.5 w-3.5" /> Presencial
                          </>
                        )}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-xl md:text-2xl font-bold tracking-tight">
                        {upcomingAppointment.doctor.fullName}
                      </h3>
                      <p className="text-blue-100 text-sm md:text-base font-medium">
                        {upcomingAppointment.doctor.specialty}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs md:text-sm text-blue-50">
                      <div className="flex items-center gap-1.5 bg-white/10 rounded-lg px-2.5 py-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(upcomingAppointment.scheduledAt)}</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-white/10 rounded-lg px-2.5 py-1">
                        <Clock className="h-4 w-4" />
                        <span>{formatTime(upcomingAppointment.scheduledAt)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-2 md:pt-0">
                    <Link href="/appointments">
                      <Button
                        variant="secondary"
                        className="w-full sm:w-auto bg-white text-blue-700 hover:bg-blue-50 font-semibold shadow-md"
                      >
                        Ver Detalhes
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.section>
        )}

        {/* A1.2: Improved Service Cards */}
        <motion.section variants={item} aria-labelledby="services-heading">
          <div className="flex items-center justify-between mb-4">
            <h2 id="services-heading" className="text-lg font-bold text-slate-900 tracking-tight">
              Serviços Rápidos
            </h2>
          </div>

          <div className="flex overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-4 gap-3.5 md:gap-4 snap-x no-scrollbar">
            {mockServices.map((service, index) => {
              const serviceConfig = serviceIcons[service.icon] || {
                icon: FileCheck,
                bg: "bg-blue-50",
                color: "text-primary",
              }
              const Icon = serviceConfig.icon
              const isFirst = index === 0

              return (
                <Link
                  key={service.id}
                  href={service.href}
                  className="group min-w-[150px] sm:min-w-0 flex-1 snap-start"
                >
                  <Card
                    className={`h-full relative overflow-hidden bg-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                      isFirst
                        ? "border-blue-200 ring-2 ring-primary/20 shadow-sm"
                        : "border-slate-100 hover:border-blue-100"
                    }`}
                  >
                    {isFirst && (
                      <span className="absolute top-2.5 right-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white shadow-sm ring-2 ring-white">
                        <Check className="h-3 w-3 stroke-[3]" />
                      </span>
                    )}
                    <CardContent className="p-4 md:p-5 flex flex-col items-center text-center">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl ${serviceConfig.bg} ${serviceConfig.color} transition-transform duration-200 group-hover:scale-105 mb-3`}
                      >
                        <Icon className="h-6 w-6 stroke-[2]" />
                      </div>
                      <span className="text-sm font-semibold text-slate-800 group-hover:text-primary transition-colors">
                        {service.name}
                      </span>
                      <span className="mt-1 text-xs text-slate-500 font-medium">
                        {service.count} {service.description}
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </motion.section>

        {/* A1.1: Weekly Horizontal Calendar */}
        <motion.section variants={item} aria-labelledby="weekly-calendar-heading">
          <Card className="border-slate-100 bg-white shadow-sm">
            <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
              <div>
                <CardTitle id="weekly-calendar-heading" className="text-base font-bold text-slate-900">
                  Hoje
                </CardTitle>
                <p className="text-xs text-slate-500 capitalize">{formattedMonthYear}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                aria-label="Abrir calendário completo"
                onClick={() => setSelectedDate(new Date())}
              >
                <Calendar className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="p-4 pt-1">
              <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {weekDays.map((day, idx) => {
                  const isActive = day.isSelected
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedDate(day.date)}
                      className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-2xl transition-all ${
                        isActive
                          ? "bg-primary text-white shadow-md shadow-blue-500/25 ring-2 ring-primary/20 scale-105"
                          : day.isPast
                          ? "text-slate-400 hover:bg-slate-50"
                          : "text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <span
                        className={`text-[11px] font-medium uppercase tracking-wider mb-1 ${
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
            </CardContent>
          </Card>
        </motion.section>

        {/* A1.3: Médicos Populares Section */}
        <motion.section variants={item} aria-labelledby="popular-doctors-heading">
          <div className="flex items-center justify-between mb-4">
            <h2 id="popular-doctors-heading" className="text-lg font-bold text-slate-900 tracking-tight">
              Médicos
            </h2>
            <Link
              href="/doctors"
              className="flex items-center text-xs font-semibold text-primary hover:underline"
            >
              Ver todos
              <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mb-4 inline-flex rounded-xl bg-slate-100 p-1" role="group" aria-label="Modalidade de atendimento">
            <button
              type="button"
              aria-pressed={appointmentMode === "telemedicine"}
              onClick={() => setAppointmentMode("telemedicine")}
              className={`rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${appointmentMode === "telemedicine" ? "bg-white text-primary shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
            >
              <Video className="mr-1.5 inline h-3.5 w-3.5" /> Online
            </button>
            <button
              type="button"
              aria-pressed={appointmentMode === "in_person"}
              onClick={() => setAppointmentMode("in_person")}
              className={`rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${appointmentMode === "in_person" ? "bg-white text-primary shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
            >
              <MapPin className="mr-1.5 inline h-3.5 w-3.5" /> Presencial
            </button>
          </div>

          <div className="flex overflow-x-auto pb-3 -mx-4 px-4 sm:mx-0 sm:px-0 gap-4 snap-x no-scrollbar">
            {popularDoctors.map((doc) => (
              <Link
                key={doc.id}
                href={`/doctors/${doc.id}`}
                className="snap-start shrink-0"
              >
                <Card className="w-[240px] sm:w-[260px] p-4 border-slate-100 bg-white hover:shadow-md hover:border-blue-100 transition-all group rounded-2xl">
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar className="h-12 w-12 rounded-xl border border-slate-100 shrink-0">
                      <AvatarImage src={doc.avatarUrl} alt={doc.fullName} />
                      <AvatarFallback>{doc.fullName.slice(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold text-slate-900 truncate group-hover:text-primary transition-colors">
                        {doc.fullName}
                      </h3>
                      <p className="text-xs text-primary font-medium truncate">
                        {doc.specialty}
                      </p>
                      <div className="flex items-center gap-1 mt-0.5 text-xs font-bold text-amber-500">
                        <Star className="h-3 w-3 fill-amber-400 stroke-amber-400" />
                        <span>{doc.rating}</span>
                        <span className="text-[11px] font-normal text-slate-400">
                          ({doc.reviewsCount})
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2.5 border-t border-slate-100">
                    <p className="text-[11px] font-semibold text-slate-500 mb-1.5">
                      Horários disponíveis:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {doc.availableSlots
                        ?.filter((s) => s.available)
                        .slice(0, 3)
                        .map((slot) => (
                          <span
                            key={slot.time}
                            className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium group-hover:bg-blue-50 group-hover:text-primary transition-colors"
                          >
                            {slot.time}
                          </span>
                        ))}
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </motion.section>

        {/* Recent Exams & Consultations Split Grid */}
        <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Exams Section */}
          <section aria-labelledby="recent-exams-heading">
            <Card className="border-slate-100 rounded-2xl">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle id="recent-exams-heading" className="text-base font-bold text-slate-900">
                  Exames Recentes
                </CardTitle>
                <Link
                  href="/exams"
                  className="flex items-center text-xs font-semibold text-primary hover:underline"
                >
                  Ver todos
                  <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Link>
              </CardHeader>
              <CardContent className="divide-y divide-slate-100">
                {recentExams.map((exam) => (
                  <div
                    key={exam.id}
                    className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-slate-800">
                        {exam.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {exam.labName} • {formatDate(exam.performedAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-sm font-bold text-slate-900">
                          {exam.resultValue}
                        </span>
                        <span className="text-xs text-slate-500 ml-1">
                          {exam.unit}
                        </span>
                      </div>
                      <StatusBadge status={exam.rangeStatus} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>

          {/* Quick Appointment Schedule Banner */}
          <section aria-labelledby="schedule-prompt-heading">
            <Card className="border-slate-100 bg-gradient-to-br from-emerald-50 via-teal-50 to-white rounded-2xl">
              <CardHeader>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm mb-2">
                  <Stethoscope className="h-5 w-5" />
                </div>
                <CardTitle id="schedule-prompt-heading" className="text-base font-bold text-slate-900">
                  Precisa de um médico especialista?
                </CardTitle>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Agende sua consulta presencial ou por telemedicina com os melhores especialistas credenciados ao seu plano.
                </p>
              </CardHeader>
              <CardContent className="pt-0">
                <Link href="/doctors">
                  <Button className="w-full bg-secondary hover:bg-secondary/90 text-white font-semibold rounded-xl">
                    Buscar Médicos Disponíveis
                    <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </section>
        </motion.div>
      </motion.div>
    </AppShell>
  )
}
