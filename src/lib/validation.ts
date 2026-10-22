export interface CreateAppointmentInput {
  doctorId: string
  scheduledAt: string
  type: "in_person" | "telemedicine"
  notes?: string
}

export function isCreateAppointmentInput(value: unknown): value is CreateAppointmentInput {
  if (!value || typeof value !== "object") return false
  const candidate = value as Record<string, unknown>
  return typeof candidate.doctorId === "string" && candidate.doctorId.trim().length > 0
    && typeof candidate.scheduledAt === "string" && !Number.isNaN(Date.parse(candidate.scheduledAt))
    && (candidate.type === "in_person" || candidate.type === "telemedicine")
    && (candidate.notes === undefined || typeof candidate.notes === "string")
}

export function isAppointmentStatus(value: unknown): value is "scheduled" | "confirmed" | "completed" | "cancelled" | "no_show" {
  return value === "scheduled" || value === "confirmed" || value === "completed" || value === "cancelled" || value === "no_show"
}

export function isPdfFile(file: Pick<File, "type" | "size" | "name">, maxBytes = 10 * 1024 * 1024) {
  return file.type === "application/pdf" && file.size > 0 && file.size <= maxBytes && file.name.toLowerCase().endsWith(".pdf")
}
