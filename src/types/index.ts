export interface User {
  id: string
  email: string
  fullName: string
  cpf: string
  dateOfBirth: string
  phone: string
  avatarUrl: string
  planName: string
  planNumber: string
  planValidUntil: string
  createdAt: string
}

export interface Doctor {
  id: string
  fullName: string
  specialty: string
  crm: string
  avatarUrl: string
  rating: number
  reviewsCount: number
  experienceYears: number
  pricePerSession: number
  bio: string
  availableOnline: boolean
  availableInPerson: boolean
  availableSlots?: TimeSlot[]
}

export interface TimeSlot {
  time: string
  available: boolean
}

export interface Appointment {
  id: string
  userId: string
  doctorId: string
  doctor: Doctor
  scheduledAt: string
  durationMinutes: number
  status: "scheduled" | "confirmed" | "completed" | "cancelled" | "no_show"
  type: "in_person" | "telemedicine"
  notes?: string
  price: number
}

export interface Exam {
  id: string
  userId: string
  name: string
  category: string
  labName: string
  performedAt: string
  resultValue: string
  unit: string
  referenceRange: string
  rangeStatus: "in_range" | "below_range" | "above_range"
  status: "pending" | "available" | "viewed"
  pdfUrl?: string
}

export interface Prescription {
  id: string
  userId: string
  doctorId: string
  doctorName: string
  appointmentId: string
  medicationName: string
  dosage: string
  frequency: string
  duration: string
  notes?: string
  prescribedAt: string
  status: "active" | "completed" | "cancelled"
  color: string
  monthlyAdherence: Record<string, boolean>
}

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: "appointment" | "exam" | "prescription" | "general"
  read: boolean
  actionUrl?: string
  createdAt: string
}

export interface Service {
  id: string
  name: string
  icon: string
  count: number
  description: string
  href: string
}
