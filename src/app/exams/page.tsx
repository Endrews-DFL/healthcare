"use client"

import * as React from "react"
import { AppShell } from "@/components/layout/app-shell"
import { mockExams } from "@/data/exams"
import { Card } from "@/components/ui/card"
import { StatusBadge } from "@/components/shared/status-badge"
import { formatDate } from "@/lib/utils"
import { FileText, Download, UploadCloud } from "lucide-react"
import { Button } from "@/components/ui/button"
import { isSupabaseConfigured } from "@/lib/supabase/config"
import { Exam } from "@/types"

type ExamWithReport = Exam & { hasReport?: boolean }

export default function ExamsPage() {
  const [exams, setExams] = React.useState<ExamWithReport[]>(mockExams)
  const [message, setMessage] = React.useState("")
  const [busyExamId, setBusyExamId] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!isSupabaseConfigured()) return
    fetch("/api/exams")
      .then(async (response) => {
        if (!response.ok) throw new Error("Não foi possível carregar os exames.")
        const data = await response.json()
        setExams(data.exams)
      })
      .catch((error: unknown) => setMessage(error instanceof Error ? error.message : "Erro ao carregar exames."))
  }, [])

  const handleUpload = async (examId: string, file?: File) => {
    if (!file) return
    setBusyExamId(examId)
    setMessage("")
    try {
      const body = new FormData()
      body.set("file", file)
      const response = await fetch(`/api/exams/${examId}/report`, { method: "POST", body })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || "Falha ao enviar o PDF.")
      setExams((current) => current.map((exam) => exam.id === examId ? { ...exam, hasReport: true } : exam))
      setMessage("Laudo enviado com acesso privado.")
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Falha ao enviar o PDF.")
    } finally {
      setBusyExamId(null)
    }
  }

  const handleOpenReport = async (examId: string) => {
    const response = await fetch(`/api/exams/${examId}/report`)
    const result = await response.json()
    if (!response.ok) {
      setMessage(result.error || "Não foi possível abrir o laudo.")
      return
    }
    window.open(result.url, "_blank", "noopener,noreferrer")
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Meus Exames
          </h1>
          <p className="text-sm text-slate-500">
            Resultados de análises clínicas e laudos laboratoriais.
          </p>
        </div>

        {message && <p role="status" className="rounded-xl bg-blue-50 p-3 text-sm text-blue-800">{message}</p>}

        <div className="space-y-3">
          {exams.map((exam) => (
            <Card key={exam.id} className="p-4 border-slate-100 hover:shadow-sm transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-xl bg-blue-50 text-primary flex items-center justify-center shrink-0">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">{exam.name}</h3>
                    <p className="text-xs text-slate-500">{exam.labName} • {formatDate(exam.performedAt)}</p>
                    <p className="text-xs text-slate-400 mt-0.5">Faixa de referência: {exam.referenceRange} {exam.unit}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-0 border-slate-100">
                  <div className="text-right">
                    <span className="text-base font-bold text-slate-900">{exam.resultValue}</span>
                    <span className="text-xs text-slate-500 ml-1">{exam.unit}</span>
                  </div>
                  <StatusBadge status={exam.rangeStatus} />
                  {isSupabaseConfigured() && exam.hasReport ? (
                    <Button type="button" variant="ghost" size="icon" aria-label="Abrir laudo PDF" onClick={() => handleOpenReport(exam.id)} className="h-8 w-8 text-slate-500 hover:text-slate-700">
                      <Download className="h-4 w-4" />
                    </Button>
                  ) : isSupabaseConfigured() ? (
                    <label className="inline-flex h-8 cursor-pointer items-center gap-1 rounded-lg border border-slate-200 px-2 text-xs font-medium text-slate-600 hover:bg-slate-50">
                      <UploadCloud className="h-3.5 w-3.5" />
                      {busyExamId === exam.id ? "Enviando" : "PDF"}
                      <input type="file" accept="application/pdf,.pdf" className="sr-only" disabled={busyExamId === exam.id} onChange={(event) => handleUpload(exam.id, event.target.files?.[0])} />
                    </label>
                  ) : (
                    <Button type="button" variant="ghost" size="icon" disabled aria-label="Laudos PDF indisponíveis no modo demonstração" className="h-8 w-8 text-slate-300">
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  )
}
