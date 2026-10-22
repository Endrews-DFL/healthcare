import { NextResponse } from "next/server"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import { isSupabaseConfigured } from "@/lib/supabase/config"

export async function GET() {
  if (!isSupabaseConfigured()) return NextResponse.json({ error: "Supabase não está configurado." }, { status: 503 })
  const supabase = await createSupabaseServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: "Autenticação necessária." }, { status: 401 })
  const { data, error } = await supabase.from("profiles").select("full_name, phone").eq("id", user.id).maybeSingle()
  if (error) return NextResponse.json({ error: "Não foi possível carregar o perfil." }, { status: 500 })
  return NextResponse.json({
    id: user.id,
    fullName: data?.full_name || user.user_metadata?.full_name || "",
    email: user.email || "",
    phone: data?.phone || "",
  })
}

export async function PATCH(request: Request) {
  if (!isSupabaseConfigured()) return NextResponse.json({ error: "Supabase não está configurado." }, { status: 503 })
  const body: unknown = await request.json().catch(() => null)
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Dados inválidos." }, { status: 400 })
  const { fullName, phone } = body as Record<string, unknown>
  if (typeof fullName !== "string" || fullName.trim().length < 2 || typeof phone !== "string") {
    return NextResponse.json({ error: "Informe nome e telefone válidos." }, { status: 400 })
  }
  const supabase = await createSupabaseServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: "Autenticação necessária." }, { status: 401 })
  const { data, error } = await supabase
    .from("profiles")
    .upsert({ id: user.id, full_name: fullName.trim(), phone: phone.trim() || null })
    .select("full_name, phone")
    .single()
  if (error) return NextResponse.json({ error: "Não foi possível salvar o perfil." }, { status: 400 })
  const { error: metadataError } = await supabase.auth.updateUser({ data: { full_name: data.full_name } })
  if (metadataError) return NextResponse.json({ error: "Perfil salvo, mas não foi possível atualizar o nome da conta." }, { status: 500 })
  return NextResponse.json({ fullName: data.full_name, phone: data.phone, email: user.email || "" })
}
