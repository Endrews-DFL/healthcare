"use client"

import * as React from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  Star,
  Video,
  MapPin,
  Heart,
  ChevronRight,
  Calendar,
  X,
  Stethoscope,
  Filter,
} from "lucide-react"

import { AppShell } from "@/components/layout/app-shell"
import { mockDoctors } from "@/data/doctors"
import { mockAppointments } from "@/data/appointments"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { EmptyState } from "@/components/shared/empty-state"
import { SPECIALTIES } from "@/lib/constants"
import { formatCurrency, formatDate, formatTime } from "@/lib/utils"
import { isSupabaseConfigured } from "@/lib/supabase/config"
import { Doctor } from "@/types"

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } },
}

export default function DoctorsPage() {
  const [doctors, setDoctors] = React.useState<Doctor[]>(mockDoctors)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedSpecialty, setSelectedSpecialty] = React.useState<string>("Todos")
  const [favorites, setFavorites] = React.useState<Set<string>>(new Set(["doc_001"]))
  const [searchError, setSearchError] = React.useState("")

  React.useEffect(() => {
    if (!isSupabaseConfigured()) return
    const controller = new AbortController()
    const params = new URLSearchParams()
    if (searchQuery.trim()) params.set("q", searchQuery.trim())
    if (selectedSpecialty !== "Todos") params.set("specialty", selectedSpecialty)
    fetch(`/api/doctors?${params.toString()}`, { signal: controller.signal, cache: "no-store" })
      .then(async (response) => {
        const result = await response.json()
        if (!response.ok) throw new Error(result.error || "Falha na busca de médicos.")
        setDoctors(result.doctors)
        setSearchError("")
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        setDoctors([])
        setSearchError(error instanceof Error ? error.message : "Falha na busca de médicos.")
      })
    return () => controller.abort()
  }, [searchQuery, selectedSpecialty])

  // Upcoming appointments for quick section
  const upcomingAppointments = React.useMemo(() => {
    return mockAppointments
      .filter((apt) => apt.status === "scheduled" || apt.status === "confirmed")
      .slice(0, 2)
  }, [])

  // Filtered doctors
  const filteredDoctors = React.useMemo(() => {
    return doctors.filter((doc) => {
      const matchesSearch =
        doc.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.crm.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesSpecialty =
        selectedSpecialty === "Todos" || doc.specialty === selectedSpecialty

      return matchesSearch && matchesSpecialty
    })
  }, [doctors, searchQuery, selectedSpecialty])

  const toggleFavorite = (e: React.MouseEvent, docId: string) => {
    e.preventDefault()
    e.stopPropagation()
    setFavorites((prev) => {
      const next = new Set(prev)
      if (next.has(docId)) {
        next.delete(docId)
      } else {
        next.add(docId)
      }
      return next
    })
  }

  return (
    <AppShell>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-7"
      >
        {/* Header Title */}
        <motion.div variants={itemVariants}>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 md:text-3xl">
            Médicos Disponíveis
          </h1>
          <p className="text-sm text-slate-500">
            Encontre especialistas credenciados e agende sua consulta.
          </p>
        </motion.div>

        {/* A3.1: Search Bar */}
        <motion.div variants={itemVariants} className="relative rounded-2xl border border-blue-100 bg-white p-2 shadow-sm shadow-blue-900/[0.03]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input
            type="text"
            placeholder="Buscar médico ou especialidade..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11 pr-10 h-12 rounded-xl border-transparent bg-slate-50 text-sm shadow-none focus-visible:bg-white focus-visible:ring-primary"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </motion.div>

        {searchError && <p role="status" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{searchError}</p>}

        {/* A3.2: Specialty Filter Chips */}
        <motion.div variants={itemVariants} className="flex items-center gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 no-scrollbar">
          <button
            type="button"
            onClick={() => setSelectedSpecialty("Todos")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedSpecialty === "Todos"
                ? "bg-primary text-white shadow-sm shadow-blue-500/25"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
            }`}
          >
            Todos
          </button>
          {SPECIALTIES.map((specialty) => {
            const isActive = selectedSpecialty === specialty
            return (
              <button
                key={specialty}
                type="button"
                onClick={() => setSelectedSpecialty(specialty)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-primary text-white shadow-sm shadow-blue-500/25"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                }`}
              >
                {specialty}
              </button>
            )
          })}
        </motion.div>

        {/* A3.3: Minhas Consultas Quick Section */}
        {upcomingAppointments.length > 0 && !searchQuery && selectedSpecialty === "Todos" && !isSupabaseConfigured() && (
          <motion.section variants={itemVariants} aria-labelledby="quick-appointments-heading">
            <div className="flex items-center justify-between mb-3">
              <h2 id="quick-appointments-heading" className="text-base font-bold text-slate-900 tracking-tight">
                Minhas Consultas
              </h2>
              <Link
                href="/appointments"
                className="text-xs font-semibold text-primary hover:underline flex items-center"
              >
                Ver todas
                <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {upcomingAppointments.map((apt) => (
                <Card
                  key={apt.id}
                  className="p-3.5 border-blue-100/70 bg-gradient-to-r from-blue-50/50 via-white to-indigo-50/30 rounded-2xl shadow-sm"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar className="h-11 w-11 rounded-xl border border-white shadow-sm shrink-0">
                        <AvatarImage src={apt.doctor.avatarUrl} alt={apt.doctor.fullName} />
                        <AvatarFallback>{apt.doctor.fullName.slice(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">
                          {apt.doctor.fullName}
                        </p>
                        <p className="text-xs text-slate-500 font-medium truncate">
                          {apt.doctor.specialty}
                        </p>
                        <p className="text-xs text-primary font-semibold mt-0.5 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(apt.scheduledAt)} às {formatTime(apt.scheduledAt)}
                        </p>
                      </div>
                    </div>
                    <Link href="/appointments">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-8 text-xs font-semibold rounded-xl bg-white text-blue-700 hover:bg-blue-50 shadow-sm border border-slate-100 shrink-0"
                      >
                        Ver
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          </motion.section>
        )}

        {/* Doctors Grid / List */}
        <motion.section variants={itemVariants} aria-labelledby="doctors-list-heading">
          <div className="flex items-center justify-between mb-4">
            <h2 id="doctors-list-heading" className="text-base font-bold text-slate-900">
              Especialistas{" "}
              <span className="text-xs font-normal text-slate-500">
                ({filteredDoctors.length} encontrado{filteredDoctors.length !== 1 ? "s" : ""})
              </span>
            </h2>
          </div>

          {filteredDoctors.length === 0 ? (
            <EmptyState
              icon={Stethoscope}
              title="Nenhum médico encontrado"
              description="Tente ajustar sua busca ou limpar os filtros de especialidade selecionados."
              actionLabel="Limpar filtros"
              onAction={() => {
                setSearchQuery("")
                setSelectedSpecialty("Todos")
              }}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredDoctors.map((doc) => {
                const isFavorite = favorites.has(doc.id)
                return (
                  <Card
                    key={doc.id}
                    className="p-5 border-slate-200/80 bg-gradient-to-br from-white via-white to-blue-50/60 shadow-sm shadow-slate-900/[0.03] hover:shadow-lg hover:shadow-blue-900/[0.06] hover:border-blue-200 transition-all rounded-2xl group relative"
                  >
                    {/* A3.4: Heart / Favorite button */}
                    <button
                      type="button"
                      onClick={(e) => toggleFavorite(e, doc.id)}
                      className={`absolute top-4 right-4 p-2 rounded-full transition-transform active:scale-90 ${
                        isFavorite
                          ? "text-red-500 bg-red-50 hover:bg-red-100"
                          : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                      }`}
                      aria-label={isFavorite ? "Remover dos favoritos" : "Salvar como favorito"}
                    >
                      <Heart
                        className={`h-4 w-4 ${isFavorite ? "fill-red-500 text-red-500" : ""}`}
                      />
                    </button>

                    <div className="flex items-start gap-4">
                      <Link href={`/doctors/${doc.id}`}>
                        <Avatar className="h-16 w-16 rounded-2xl border border-slate-100 transition-transform group-hover:scale-105 shrink-0">
                          <AvatarImage src={doc.avatarUrl} alt={doc.fullName} />
                          <AvatarFallback>{doc.fullName.slice(0, 2)}</AvatarFallback>
                        </Avatar>
                      </Link>

                      <div className="flex-1 min-w-0 pr-8">
                        <Link href={`/doctors/${doc.id}`} className="block">
                          <h3 className="text-base font-bold text-slate-900 group-hover:text-primary transition-colors truncate">
                            {doc.fullName}
                          </h3>
                        </Link>
                        <p className="text-xs font-semibold text-primary">
                          {doc.specialty}
                        </p>
                        <p className="text-xs text-slate-400">{doc.crm}</p>

                        <div className="flex items-center gap-1.5 mt-1.5">
                          <div className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full">
                            <Star className="h-3 w-3 fill-amber-400 stroke-amber-400" />
                            <span>{doc.rating}</span>
                          </div>
                          <span className="text-xs text-slate-400">
                            ({doc.reviewsCount} avaliações)
                          </span>
                        </div>

                        <div className="pt-2 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
                          {doc.availableOnline && (
                            <span className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md text-[11px] font-medium">
                              <Video className="h-3 w-3" /> Online
                            </span>
                          )}
                          {doc.availableInPerson && (
                            <span className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md text-[11px] font-medium">
                              <MapPin className="h-3 w-3" /> Presencial
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-blue-100/80 flex items-center justify-between">
                      <div>
                        <span className="text-xs text-slate-400 block">Consulta</span>
                        <span className="text-base font-bold text-slate-900">
                          {formatCurrency(doc.pricePerSession)}
                        </span>
                      </div>
                      <Link href={`/doctors/${doc.id}`}>
                        <Button size="sm" className="rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold">
                          Agendar
                        </Button>
                      </Link>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </motion.section>
      </motion.div>
    </AppShell>
  )
}
