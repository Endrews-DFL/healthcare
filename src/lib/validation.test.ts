import { describe, expect, it } from "vitest"

import { isAppointmentStatus, isCreateAppointmentInput, isPdfFile } from "./validation"

describe("appointment request validation", () => {
  it("accepts a valid appointment payload", () => {
    expect(isCreateAppointmentInput({
      doctorId: "doc_001",
      scheduledAt: "2030-05-01T12:00:00.000Z",
      type: "telemedicine",
    })).toBe(true)
  })

  it("rejects invalid modality, date, and missing doctor", () => {
    expect(isCreateAppointmentInput({ doctorId: "doc_001", scheduledAt: "bad", type: "telemedicine" })).toBe(false)
    expect(isCreateAppointmentInput({ doctorId: "", scheduledAt: "2030-05-01", type: "in_person" })).toBe(false)
    expect(isCreateAppointmentInput({ doctorId: "doc_001", scheduledAt: "2030-05-01", type: "other" })).toBe(false)
  })
})

describe("appointment status validation", () => {
  it("allows only known status values", () => {
    expect(isAppointmentStatus("cancelled")).toBe(true)
    expect(isAppointmentStatus("pending")).toBe(false)
  })
})

describe("PDF validation", () => {
  it("accepts a small PDF and rejects other formats or oversized files", () => {
    expect(isPdfFile({ name: "report.pdf", type: "application/pdf", size: 1024 })).toBe(true)
    expect(isPdfFile({ name: "report.pdf", type: "text/plain", size: 1024 })).toBe(false)
    expect(isPdfFile({ name: "report.pdf", type: "application/pdf", size: 11 * 1024 * 1024 })).toBe(false)
  })
})
