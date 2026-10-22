import { NextResponse } from "next/server"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import { isSupabaseConfigured } from "@/lib/supabase/config"

export async function GET() {
  if (!isSupabaseConfigured()) return NextResponse.json({ error: "Supabase não está configurado." }, { status: 503 })
  const supabase = await createSupabaseServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: "Autenticação necessária." }, { status: 401 })
  const { data, error } = await supabase.from("notifications").select("*").eq("user_id", user.id).order("created_at", { ascending: false })
  if (error) return NextResponse.json({ error: "Não foi possível carregar as notificações." }, { status: 500 })
  return NextResponse.json({ userId: user.id, notifications: data.map((row) => ({
    id: row.id,
    userId: row.user_id,
    title: row.title,
    message: row.message,
    type: row.type,
    read: row.read,
    actionUrl: row.action_url,
    createdAt: row.created_at,
  })) })
}

export async function PATCH(request: Request) {
  if (!isSupabaseConfigured()) return NextResponse.json({ error: "Supabase não está configurado." }, { status: 503 })
  const body: unknown = await request.json().catch(() => null)
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Dados inválidos." }, { status: 400 })
  const { id, read } = body as Record<string, unknown>
  if (typeof id !== "string" || typeof read !== "boolean") return NextResponse.json({ error: "Notificação inválida." }, { status: 400 })
  const supabase = await createSupabaseServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: "Autenticação necessária." }, { status: 401 })
  const { data, error } = await supabase.from("notifications").update({ read }).eq("id", id).eq("user_id", user.id).select("id").maybeSingle()
  if (error) return NextResponse.json({ error: "Não foi possível atualizar a notificação." }, { status: 400 })
  if (!data) return NextResponse.json({ error: "Notificação não encontrada." }, { status: 404 })
  return NextResponse.json({ updated: true })
}
