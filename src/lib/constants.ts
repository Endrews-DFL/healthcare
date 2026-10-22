export const APP_NAME = "HealthCare"

export const SPECIALTIES = [
  "Cardiologia",
  "Dermatologia",
  "Endocrinologia",
  "Gastroenterologia",
  "Ginecologia",
  "Neurologia",
  "Oftalmologia",
  "Ortopedia",
  "Otorrinolaringologia",
  "Pediatria",
  "Psiquiatria",
  "Urologia",
] as const

export const APPOINTMENT_STATUS = {
  SCHEDULED: "scheduled",
  CONFIRMED: "confirmed",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  NO_SHOW: "no_show",
} as const

export const EXAM_STATUS = {
  PENDING: "pending",
  AVAILABLE: "available",
  VIEWED: "viewed",
} as const

export const PRESCRIPTION_STATUS = {
  ACTIVE: "active",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const

export const NAV_ITEMS = [
  { label: "Home", href: "/dashboard", icon: "Home" },
  { label: "Médicos", href: "/doctors", icon: "Stethoscope" },
  { label: "Consultas", href: "/appointments", icon: "Calendar" },
  { label: "Exames", href: "/exams", icon: "FileText" },
  { label: "Perfil", href: "/profile", icon: "User" },
] as const
