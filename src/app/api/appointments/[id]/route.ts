import { NextResponse } from "next/server"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import { isSupabaseConfigured } from "@/lib/supabase/config"
import { isAppointmentStatus } from "@/lib/validation"
import { Database } from "@/types/database"

type RouteContext = { params: Promise<{ id: string }> }

export async function PATCH(request: Request, { params }: RouteContext) {
  const { id } = await params
  if (!isSupabaseConfigured()) return NextResponse.json({ error: "Supabase não está configurado." }, { status: 503 })
  const body: unknown = await request.json().catch(() => null)
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Dados inválidos." }, { status: 400 })
  const input = body as Record<string, unknown>
  const update: Database["public"]["Tables"]["appointments"]["Update"] = {}

  if (input.status !== undefined) {
    if (!isAppointmentStatus(input.status)) return NextResponse.json({ error: "Status inválido." }, { status: 400 })
    update.status = input.status
  }
  if (input.notes !== undefined) {
    if (input.notes !== null && typeof input.notes !== "string") return NextResponse.json({ error: "Observação inválida." }, { status: 400 })
    update.notes = typeof input.notes === "string" ? input.notes.trim() || null : null
  }
  if (input.scheduledAt !== undefined) {
    if (typeof input.scheduledAt !== "string" || Number.isNaN(Date.parse(input.scheduledAt)) || Date.parse(input.scheduledAt) <= Date.now()) {
      return NextResponse.json({ error: "Data futura inválida." }, { status: 400 })
    }
    update.scheduled_at = input.scheduledAt
  }
  if (Object.keys(update).length === 0) return NextResponse.json({ error: "Nenhuma alteração informada." }, { status: 400 })
  update.updated_at = new Date().toISOString()

  const supabase = await createSupabaseServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: "Autenticação necessária." }, { status: 401 })
  const { data, error } = await supabase
    .from("appointments")
    .update(update)
    .eq("id", id)
    .eq("user_id", user.id)
    .select("*, doctor:doctors!appointments_doctor_id_fkey(*)")
    .maybeSingle()
  if (error) return NextResponse.json({ error: "Não foi possível atualizar a consulta." }, { status: 400 })
  if (!data) return NextResponse.json({ error: "Consulta não encontrada." }, { status: 404 })
  return NextResponse.json({ appointment: data })
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const { id } = await params
  if (!isSupabaseConfigured()) return NextResponse.json({ error: "Supabase não está configurado." }, { status: 503 })
  const supabase = await createSupabaseServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: "Autenticação necessária." }, { status: 401 })
  const { data, error } = await supabase
    .from("appointments")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)
    .select("id")
    .maybeSingle()
  if (error) return NextResponse.json({ error: "Não foi possível cancelar a consulta." }, { status: 400 })
  if (!data) return NextResponse.json({ error: "Consulta não encontrada." }, { status: 404 })
  return NextResponse.json({ deleted: true })
}
