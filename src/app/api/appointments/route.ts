import { NextResponse } from "next/server"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import { isSupabaseConfigured } from "@/lib/supabase/config"
import { isCreateAppointmentInput } from "@/lib/validation"

function unavailable() {
  return NextResponse.json({ error: "Supabase não está configurado." }, { status: 503 })
}

export async function GET() {
  if (!isSupabaseConfigured()) return unavailable()
  const supabase = await createSupabaseServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: "Autenticação necessária." }, { status: 401 })

  const { data, error } = await supabase
    .from("appointments")
    .select("*, doctor:doctors!appointments_doctor_id_fkey(*)")
    .eq("user_id", user.id)
    .order("scheduled_at", { ascending: true })
  if (error) return NextResponse.json({ error: "Não foi possível carregar as consultas." }, { status: 500 })
  return NextResponse.json({ appointments: data })
}

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) return unavailable()
  const payload: unknown = await request.json().catch(() => null)
  if (!isCreateAppointmentInput(payload)) return NextResponse.json({ error: "Dados de consulta inválidos." }, { status: 400 })
  if (new Date(payload.scheduledAt).getTime() <= Date.now()) {
    return NextResponse.json({ error: "Escolha uma data futura." }, { status: 400 })
  }

  const supabase = await createSupabaseServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: "Autenticação necessária." }, { status: 401 })

  const { data, error } = await supabase
    .from("appointments")
    .insert({
      user_id: user.id,
      doctor_id: payload.doctorId,
      scheduled_at: payload.scheduledAt,
      type: payload.type,
      notes: payload.notes?.trim() || null,
    })
    .select("*, doctor:doctors!appointments_doctor_id_fkey(*)")
    .single()
  if (error) return NextResponse.json({ error: "Não foi possível criar a consulta." }, { status: 400 })
  return NextResponse.json({ appointment: data }, { status: 201 })
}
