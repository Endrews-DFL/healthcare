"use client"

import * as React from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  ChevronLeft,
  Share2,
  Heart,
  Star,
  Award,
  Users,
  CheckCircle2,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Video,
  GraduationCap,
  Building,
  ShieldCheck,
  ChevronRight,
  Check,
  Sparkles,
} from "lucide-react"

import { AppShell } from "@/components/layout/app-shell"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { EmptyState } from "@/components/shared/empty-state"
import { mockDoctors } from "@/data/doctors"
import { formatCurrency, formatDate } from "@/lib/utils"
import { isSupabaseConfigured } from "@/lib/supabase/config"

// Period slots definition
const PERIOD_SLOTS: Record<string, string[]> = {
  Manhã: ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30"],
  Tarde: ["13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"],
  Noite: ["18:00", "18:30", "19:00", "19:30", "20:00"],
}

export default function DoctorDetailPage() {
  const router = useRouter()
  const routerParams = useParams()
  const doctorId = routerParams?.id as string

  // Find doctor
  const doctor = React.useMemo(() => {
    return mockDoctors.find((d) => d.id === doctorId)
  }, [doctorId])

  // Favorite state
  const [isFavorite, setIsFavorite] = React.useState(false)
  const [copiedLink, setCopiedLink] = React.useState(false)

  // Booking selections
  const [currentMonthDate, setCurrentMonthDate] = React.useState<Date>(() => new Date())
  const [selectedDate, setSelectedDate] = React.useState<Date>(() => {
    const d = new Date()
    d.setDate(d.getDate() + 1)
    return d
  })
  const [selectedPeriod, setSelectedPeriod] = React.useState<"Manhã" | "Tarde" | "Noite">("Manhã")
  const [selectedSlot, setSelectedSlot] = React.useState<string>("09:00")
  const [selectedModality, setSelectedModality] = React.useState<"in_person" | "telemedicine">(
    doctor?.availableInPerson ? "in_person" : "telemedicine"
  )

  // Confirmation dialog state
  const [isConfirmOpen, setIsConfirmOpen] = React.useState(false)
  const [bookingCompleted, setBookingCompleted] = React.useState(false)
  const [bookingBusy, setBookingBusy] = React.useState(false)
  const [bookingError, setBookingError] = React.useState("")

  const confirmBooking = async () => {
    if (!doctor) return
    setBookingError("")
    if (isSupabaseConfigured()) {
      setBookingBusy(true)
      const appointmentDate = new Date(selectedDate)
      const [hours, minutes] = selectedSlot.split(":").map(Number)
      appointmentDate.setHours(hours, minutes, 0, 0)
      try {
        const response = await fetch("/api/appointments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ doctorId: doctor.id, scheduledAt: appointmentDate.toISOString(), type: selectedModality }),
        })
        const result = await response.json()
        if (!response.ok) throw new Error(result.error || "Não foi possível agendar.")
      } catch (error) {
        setBookingError(error instanceof Error ? error.message : "Não foi possível agendar.")
        setBookingBusy(false)
        return
      }
      setBookingBusy(false)
    }
    setBookingCompleted(true)
  }

  // Calendar month navigation
  const prevMonth = () => {
    setCurrentMonthDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentMonthDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }

  const calendarMonthLabel = React.useMemo(() => {
    return new Intl.DateTimeFormat("pt-BR", {
      month: "long",
      year: "numeric",
    }).format(currentMonthDate)
  }, [currentMonthDate])

  // Calendar days grid
  const calendarDays = React.useMemo(() => {
    const year = currentMonthDate.getFullYear()
    const month = currentMonthDate.getMonth()

    const firstDayIndex = new Date(year, month, 1).getDay()
    const daysCount = new Date(year, month + 1, 0).getDate()

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const days = []

    // Padding empty cells
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null)
    }

    // Days of current month
    for (let day = 1; day <= daysCount; day++) {
      const cellDate = new Date(year, month, day)
      cellDate.setHours(0, 0, 0, 0)

      const isToday = cellDate.getTime() === today.getTime()
      const isPast = cellDate.getTime() < today.getTime()
      const isSelected =
        cellDate.getDate() === selectedDate.getDate() &&
        cellDate.getMonth() === selectedDate.getMonth() &&
        cellDate.getFullYear() === selectedDate.getFullYear()

      days.push({
        date: cellDate,
        dayNum: day,
        isToday,
        isPast,
        isSelected,
      })
    }

    return days
  }, [currentMonthDate, selectedDate])

  // Copy link / share handler
  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2000)
    }
  }

  // If doctor not found
  if (!doctor) {
    return (
      <AppShell>
        <div className="py-12">
          <EmptyState
            icon={Building}
            title="Médico não encontrado"
            description="Não conseguimos localizar o perfil deste especialista. Ele pode não estar mais disponível."
            actionLabel="Voltar para Médicos"
            onAction={() => router.push("/doctors")}
          />
        </div>
      </AppShell>
    )
  }

  // Format short selected date
  const formattedSelectedDate = new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "short",
  }).format(selectedDate).replace(".", "")

  return (
    <AppShell showHeader={false}>
      <div className="min-h-screen pb-24 md:pb-12">
        {/* Custom Header Bar with Back and Share */}
        <div className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-100 bg-white/95 px-4 md:px-8 backdrop-blur-md">
          <Link href="/doctors">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full text-slate-700 hover:bg-slate-100"
              aria-label="Voltar para médicos"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>

          <h1 className="text-base font-bold text-slate-800">
            Perfil do Especialista
          </h1>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleShare}
              className="h-10 w-10 rounded-full text-slate-600 hover:bg-slate-100 relative"
              aria-label="Compartilhar perfil"
            >
              <Share2 className="h-5 w-5" />
              {copiedLink && (
                <span className="absolute -bottom-8 right-0 text-[10px] bg-slate-900 text-white px-2 py-0.5 rounded shadow-md whitespace-nowrap">
                  Link copiado!
                </span>
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsFavorite(!isFavorite)}
              className={`h-10 w-10 rounded-full transition-transform active:scale-90 ${
                isFavorite ? "text-red-500 hover:text-red-600" : "text-slate-600 hover:bg-slate-100"
              }`}
              aria-label={isFavorite ? "Remover dos favoritos" : "Salvar nos favoritos"}
            >
              <Heart className={`h-5 w-5 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
            </Button>
          </div>
        </div>

        {/* Content Container */}
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 space-y-6">
          {/* A4.1 & A4.2: Doctor Header and Info Section */}
          <Card className="p-6 border-slate-100 bg-white shadow-sm rounded-3xl overflow-hidden relative">
            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-5">
              <Avatar className="h-24 w-24 sm:h-28 sm:w-28 rounded-3xl border-2 border-white shadow-lg ring-4 ring-blue-50 shrink-0">
                <AvatarImage src={doctor.avatarUrl} alt={doctor.fullName} />
                <AvatarFallback className="text-xl font-bold">
                  {doctor.fullName.slice(0, 2)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200/80 hover:bg-emerald-50 px-3 py-1 text-xs font-bold rounded-full">
                    {doctor.specialty}
                  </Badge>
                  <span className="text-xs text-slate-400 font-medium">
                    {doctor.crm}
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {doctor.fullName}
                </h2>

                <div className="pt-1 flex items-baseline justify-center sm:justify-start gap-1.5">
                  <span className="text-2xl font-black text-primary">
                    {formatCurrency(doctor.pricePerSession)}
                  </span>
                  <span className="text-sm font-semibold text-slate-500">
                    / Sessão
                  </span>
                  <span className="text-xs text-emerald-600 font-semibold ml-2 bg-emerald-50 px-2 py-0.5 rounded-md">
                    100% Coberto pelo Plano
                  </span>
                </div>
              </div>
            </div>

            {/* A4.2: Stats Row */}
            <div className="grid grid-cols-3 gap-3 pt-6 mt-6 border-t border-slate-100">
              {/* Experiência */}
              <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-blue-50/60 border border-blue-100/60 text-center">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-sm mb-1.5">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <span className="text-base font-extrabold text-slate-900">
                  {doctor.experienceYears}+ Anos
                </span>
                <span className="text-[11px] font-medium text-slate-500">
                  Experiência
                </span>
              </div>

              {/* Avaliações */}
              <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100/60 text-center">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm mb-1.5">
                  <Users className="h-5 w-5" />
                </div>
                <span className="text-base font-extrabold text-slate-900">
                  {doctor.reviewsCount}+
                </span>
                <span className="text-[11px] font-medium text-slate-500">
                  Pacientes
                </span>
              </div>

              {/* Nota / Classificação */}
              <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-amber-50/60 border border-amber-100/60 text-center">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-white shadow-sm mb-1.5">
                  <Star className="h-5 w-5 fill-white stroke-white" />
                </div>
                <span className="text-base font-extrabold text-slate-900">
                  {doctor.rating}
                </span>
                <span className="text-[11px] font-medium text-slate-500">
                  Avaliação
                </span>
              </div>
            </div>
          </Card>

          {/* A4.3: Tabs Section */}
          <Tabs defaultValue="disponibilidade" className="w-full">
            <TabsList className="w-full grid grid-cols-4 p-1 bg-slate-100/80 rounded-2xl h-12">
              <TabsTrigger value="disponibilidade" className="rounded-xl text-xs sm:text-sm font-semibold">
                Disponibilidade
              </TabsTrigger>
              <TabsTrigger value="sobre" className="rounded-xl text-xs sm:text-sm font-semibold">
                Sobre
              </TabsTrigger>
              <TabsTrigger value="formacao" className="rounded-xl text-xs sm:text-sm font-semibold">
                Formação
              </TabsTrigger>
              <TabsTrigger value="avaliacoes" className="rounded-xl text-xs sm:text-sm font-semibold">
                Avaliações
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: DISPONIBILIDADE (A4.4 & A4.5) */}
            <TabsContent value="disponibilidade" className="mt-5 space-y-6">
              {/* Modality selector */}
              <div className="p-4 rounded-2xl border border-slate-100 bg-white">
                <h3 className="text-sm font-bold text-slate-900 mb-2.5">
                  Selecione a Modalidade
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    disabled={!doctor.availableInPerson}
                    onClick={() => setSelectedModality("in_person")}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${
                      selectedModality === "in_person"
                        ? "border-primary bg-blue-50/70 text-primary shadow-sm"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    } ${!doctor.availableInPerson ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <MapPin className="h-4 w-4 text-emerald-600" />
                    Presencial no Consultório
                  </button>
                  <button
                    type="button"
                    disabled={!doctor.availableOnline}
                    onClick={() => setSelectedModality("telemedicine")}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${
                      selectedModality === "telemedicine"
                        ? "border-primary bg-blue-50/70 text-primary shadow-sm"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    } ${!doctor.availableOnline ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <Video className="h-4 w-4 text-blue-600" />
                    Telemedicina Online
                  </button>
                </div>
              </div>

              {/* A4.4: Calendar Card */}
              <Card className="border-slate-100 bg-white shadow-sm rounded-3xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Escolha a Data
                    </h3>
                    <p className="text-xs text-slate-500 capitalize">
                      {calendarMonthLabel}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={prevMonth}
                      className="h-8 w-8 rounded-full text-slate-600 hover:bg-slate-100"
                      aria-label="Mês anterior"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={nextMonth}
                      className="h-8 w-8 rounded-full text-slate-600 hover:bg-slate-100"
                      aria-label="Próximo mês"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Calendar Days Header */}
                <div className="grid grid-cols-7 gap-1 text-center mb-2">
                  {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((dayName) => (
                    <span
                      key={dayName}
                      className="text-xs font-bold text-slate-400 py-1 uppercase tracking-wider"
                    >
                      {dayName}
                    </span>
                  ))}
                </div>

                {/* Calendar Grid Cells */}
                <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                  {calendarDays.map((cell, idx) => {
                    if (!cell) {
                      return <div key={`empty-${idx}`} className="h-10 sm:h-11" />
                    }

                    return (
                      <button
                        key={`day-${cell.dayNum}`}
                        type="button"
                        disabled={cell.isPast}
                        onClick={() => setSelectedDate(cell.date)}
                        className={`h-10 sm:h-11 flex flex-col items-center justify-center rounded-2xl text-xs sm:text-sm font-semibold transition-all relative ${
                          cell.isSelected
                            ? "bg-primary text-white font-bold shadow-md shadow-blue-500/25 ring-2 ring-primary/20 scale-105"
                            : cell.isToday
                            ? "border-2 border-primary text-primary font-bold hover:bg-blue-50"
                            : cell.isPast
                            ? "text-slate-300 cursor-not-allowed"
                            : "text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        <span>{cell.dayNum}</span>
                        {cell.isToday && !cell.isSelected && (
                          <span className="h-1 w-1 rounded-full bg-primary absolute bottom-1.5" />
                        )}
                      </button>
                    )
                  })}
                </div>
              </Card>

              {/* A4.5: Time Slot Picker */}
              <Card className="border-slate-100 bg-white shadow-sm rounded-3xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Horários Disponíveis
                    </h3>
                    <p className="text-xs text-slate-500">
                      Para {formattedSelectedDate}
                    </p>
                  </div>
                </div>

                {/* Period chips: Manhã, Tarde, Noite */}
                <div className="flex items-center gap-2">
                  {(["Manhã", "Tarde", "Noite"] as const).map((period) => {
                    const isActive = selectedPeriod === period
                    return (
                      <button
                        key={period}
                        type="button"
                        onClick={() => setSelectedPeriod(period)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                          isActive
                            ? "bg-primary text-white shadow-sm shadow-blue-500/20"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {period}
                      </button>
                    )
                  })}
                </div>

                {/* Time slots grid */}
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 pt-1">
                  {PERIOD_SLOTS[selectedPeriod].map((time) => {
                    // Check doctor availability slot if defined
                    const slotData = doctor.availableSlots?.find((s) => s.time === time)
                    const isAvailable = slotData !== undefined ? slotData.available : true
                    const isSelected = selectedSlot === time

                    return (
                      <button
                        key={time}
                        type="button"
                        disabled={!isAvailable}
                        onClick={() => setSelectedSlot(time)}
                        className={`py-2.5 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                          isSelected
                            ? "bg-primary text-white font-bold shadow-md shadow-blue-500/25 ring-2 ring-primary/20 scale-105"
                            : isAvailable
                            ? "bg-white border border-slate-200 text-slate-800 hover:border-primary hover:text-primary hover:bg-blue-50/30"
                            : "bg-slate-100 text-slate-400 border border-slate-100 cursor-not-allowed line-through"
                        }`}
                      >
                        <Clock className={`h-3.5 w-3.5 ${isSelected ? "text-blue-100" : "text-slate-400"}`} />
                        <span>{time}</span>
                      </button>
                    )
                  })}
                </div>
              </Card>
            </TabsContent>

            {/* TAB 2: SOBRE */}
            <TabsContent value="sobre" className="mt-5 space-y-4">
              <Card className="p-6 border-slate-100 bg-white shadow-sm rounded-3xl space-y-5">
                <div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">
                    Biografia
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {doctor.bio}
                  </p>
                  <p className="text-sm text-slate-600 leading-relaxed mt-3">
                    Atuação focada no acolhimento do paciente, medicina baseada em evidências e acompanhamento integral. Realiza consultas com tempo dedicado a diagnósticos minuciosos e planos de cuidado individualizados.
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <h4 className="text-sm font-bold text-slate-900">
                    Locais e Formas de Atendimento
                  </h4>
                  <div className="space-y-2 text-xs text-slate-600">
                    <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <MapPin className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-slate-800">Centro Médico HealthCare - Unidade Jardins</p>
                        <p className="text-slate-500">Av. Paulista, 1500 - 4º andar, São Paulo - SP</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <Video className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-slate-800">Teleconsulta ao Vivo</p>
                        <p className="text-slate-500">Sala de atendimento digital criptografada, com emissão de receitas e atestados com assinatura digital ICP-Brasil.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <h4 className="text-sm font-bold text-slate-900 mb-2">
                    Idiomas Falados
                  </h4>
                  <div className="flex gap-2">
                    <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium">
                      Português (Nativo)
                    </span>
                    <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium">
                      Inglês
                    </span>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* TAB 3: FORMAÇÃO */}
            <TabsContent value="formacao" className="mt-5 space-y-4">
              <Card className="p-6 border-slate-100 bg-white shadow-sm rounded-3xl space-y-4">
                <h3 className="text-base font-bold text-slate-900">
                  Formação Acadêmica e Títulos
                </h3>

                <div className="space-y-4 divide-y divide-slate-100">
                  <div className="flex items-start gap-3.5 pt-3 first:pt-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-primary shrink-0">
                      <GraduationCap className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        Graduação em Medicina
                      </h4>
                      <p className="text-xs text-slate-500">
                        Faculdade de Medicina da Universidade de São Paulo (USP) • 2005 - 2011
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5 pt-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
                      <Award className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        Residência Médica em {doctor.specialty}
                      </h4>
                      <p className="text-xs text-slate-500">
                        Hospital das Clínicas da FMUSP (HCFMUSP) • 2011 - 2014
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5 pt-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 shrink-0">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        Título de Especialista pela Sociedade Brasileira
                      </h4>
                      <p className="text-xs text-slate-500">
                        Associação Médica Brasileira (AMB) • RQE emitido
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* TAB 4: AVALIAÇÕES */}
            <TabsContent value="avaliacoes" className="mt-5 space-y-4">
              <Card className="p-6 border-slate-100 bg-white shadow-sm rounded-3xl space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Avaliações de Pacientes
                    </h3>
                    <p className="text-xs text-slate-500">
                      Baseado em {doctor.reviewsCount} consultas realizadas
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-2xl border border-amber-100">
                    <Star className="h-4 w-4 fill-amber-400 stroke-amber-400" />
                    <span className="text-base font-extrabold text-amber-700">
                      {doctor.rating}
                    </span>
                    <span className="text-xs text-slate-400">/ 5.0</span>
                  </div>
                </div>

                <div className="space-y-4 divide-y divide-slate-100">
                  {/* Review 1 */}
                  <div className="pt-3 first:pt-0 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <Avatar className="h-8 w-8 rounded-full">
                          <AvatarFallback className="bg-blue-100 text-blue-700 text-xs font-bold">
                            MS
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-xs font-bold text-slate-900">
                            Mariana Silva
                          </p>
                          <p className="text-[10px] text-slate-400">
                            Consulta presencial • Há 3 dias
                          </p>
                        </div>
                      </div>
                      <div className="flex text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-3.5 w-3.5 fill-amber-400 stroke-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Excelente profissional! Muito atencioso, explicou todo o diagnóstico com clareza e tirou todas as dúvidas com paciência. O consultório é impecável.
                    </p>
                  </div>

                  {/* Review 2 */}
                  <div className="pt-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <Avatar className="h-8 w-8 rounded-full">
                          <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs font-bold">
                            CD
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-xs font-bold text-slate-900">
                            Carlos Drummond
                          </p>
                          <p className="text-[10px] text-slate-400">
                            Telemedicina • Há 2 semanas
                          </p>
                        </div>
                      </div>
                      <div className="flex text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-3.5 w-3.5 fill-amber-400 stroke-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      A consulta online funcionou muito bem. Recebi a prescrição digital com certificado digital imediatamente após a ligação. Pontual e assertivo.
                    </p>
                  </div>

                  {/* Review 3 */}
                  <div className="pt-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <Avatar className="h-8 w-8 rounded-full">
                          <AvatarFallback className="bg-purple-100 text-purple-700 text-xs font-bold">
                            PS
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-xs font-bold text-slate-900">
                            Patricia Souza
                          </p>
                          <p className="text-[10px] text-slate-400">
                            Consulta presencial • Há 1 mês
                          </p>
                        </div>
                      </div>
                      <div className="flex text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-3.5 w-3.5 fill-amber-400 stroke-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Atendimento humanizado de verdade. Me senti ouvida e segura com a conduta médica adotada. Recomendo de olhos fechados.
                    </p>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* A4.6: Bottom Sticky Booking CTA Button */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 border-t border-slate-100 backdrop-blur-md p-4 md:px-8">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
            <div className="hidden sm:block">
              <span className="text-xs text-slate-400 block font-medium">Horário selecionado</span>
              <span className="text-sm font-bold text-slate-900">
                {formattedSelectedDate} às {selectedSlot} • {selectedModality === "in_person" ? "Presencial" : "Telemedicina"}
              </span>
            </div>

            <Button
              size="lg"
              onClick={() => setIsConfirmOpen(true)}
              className="w-full sm:w-auto sm:min-w-[280px] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/25 h-12 text-sm"
            >
              Agendar Consulta • {formattedSelectedDate} às {selectedSlot}
            </Button>
          </div>
        </div>
      </div>

      {/* Booking Confirmation Dialog */}
      <Dialog
        open={isConfirmOpen}
        onOpenChange={(open) => {
          setIsConfirmOpen(open)
          if (!open) {
            setBookingCompleted(false)
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              {bookingCompleted ? "Simulação de agendamento" : "Confirmar Agendamento"}
            </DialogTitle>
            <DialogDescription>
              {bookingCompleted
                ? isSupabaseConfigured() ? "Consulta salva na sua conta." : "Demonstração concluída. Nenhuma consulta foi salva."
                : "Revise os detalhes da sua consulta antes de confirmar."}
            </DialogDescription>
          </DialogHeader>

          {bookingCompleted ? (
              <div className="py-6 flex flex-col items-center justify-center text-center space-y-3">
              <div className="h-16 w-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-sm">
                <Check className="h-8 w-8 stroke-[3]" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Tudo pronto para sua consulta!
              </h3>
              <p className="text-xs text-slate-500 max-w-xs">
                Enviamos a confirmação e lembretes para o seu e-mail e SMS cadastrados.
              </p>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs w-full text-left space-y-1 mt-2">
                <p className="font-bold text-slate-800">{doctor.fullName}</p>
                <p className="text-slate-500">{doctor.specialty} • {doctor.crm}</p>
                <p className="text-primary font-semibold">
                  {formattedSelectedDate} às {selectedSlot} ({selectedModality === "in_person" ? "Presencial" : "Telemedicina"})
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-2 text-xs">
              {/* Doctor snippet */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <Avatar className="h-12 w-12 rounded-xl border border-slate-200">
                  <AvatarImage src={doctor.avatarUrl} alt={doctor.fullName} />
                  <AvatarFallback>{doctor.fullName.slice(0, 2)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-bold text-slate-900">{doctor.fullName}</p>
                  <p className="text-xs text-primary font-semibold">{doctor.specialty}</p>
                  <p className="text-xs text-slate-400">{doctor.crm}</p>
                </div>
              </div>

              {/* Summary grid */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-xl border border-slate-100 bg-white">
                  <span className="text-slate-400 block mb-0.5">Data & Horário</span>
                  <span className="font-bold text-slate-800 block text-xs">
                    {formattedSelectedDate} às {selectedSlot}
                  </span>
                </div>
                <div className="p-3 rounded-xl border border-slate-100 bg-white">
                  <span className="text-slate-400 block mb-0.5">Modalidade</span>
                  <span className="font-bold text-slate-800 flex items-center gap-1 text-xs">
                    {selectedModality === "in_person" ? (
                      <>
                        <MapPin className="h-3 w-3 text-emerald-600" /> Presencial
                      </>
                    ) : (
                      <>
                        <Video className="h-3 w-3 text-blue-600" /> Telemedicina
                      </>
                    )}
                  </span>
                </div>
              </div>

              {/* Price coverage */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-xs">
                <span className="text-emerald-800 font-medium">Valor ilustrativo</span>
                <span className="font-extrabold text-emerald-700">
                  {formatCurrency(doctor.pricePerSession)}
                </span>
              </div>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            {bookingCompleted ? (
              <>
                <Button
                  className="w-full rounded-xl bg-primary text-white"
                  onClick={() => {
                    setBookingCompleted(false)
                    setIsConfirmOpen(false)
                  }}
                >
                  Fechar demonstração
                </Button>
              </>
            ) : (
              <>
                {!isSupabaseConfigured() && <p className="rounded-xl bg-blue-50 p-3 text-xs text-blue-800">Modo demonstração: este agendamento não será salvo.</p>}
                {bookingError && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-xs text-rose-700">{bookingError}</p>}
                <Button
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => setIsConfirmOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  className="rounded-xl bg-primary text-white font-bold"
                  disabled={bookingBusy}
                  onClick={confirmBooking}
                >
                  {bookingBusy ? "Salvando…" : "Confirmar Agendamento"}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  )
}
