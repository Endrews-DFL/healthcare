import { NextResponse } from "next/server"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import { isSupabaseConfigured } from "@/lib/supabase/config"
import { isPdfFile } from "@/lib/validation"

type RouteContext = { params: Promise<{ id: string }> }

export async function POST(request: Request, { params }: RouteContext) {
  const { id } = await params
  if (!isSupabaseConfigured()) return NextResponse.json({ error: "Supabase não está configurado." }, { status: 503 })
  const formData = await request.formData().catch(() => null)
  const file = formData?.get("file")
  if (!(file instanceof File) || !isPdfFile(file)) {
    return NextResponse.json({ error: "Envie um arquivo PDF de até 10 MB." }, { status: 400 })
  }
  const bytes = new Uint8Array(await file.arrayBuffer())
  const signature = new TextDecoder().decode(bytes.slice(0, 5))
  if (signature !== "%PDF-") return NextResponse.json({ error: "O arquivo não parece ser um PDF válido." }, { status: 400 })

  const supabase = await createSupabaseServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: "Autenticação necessária." }, { status: 401 })
  const { data: exam, error: examError } = await supabase.from("exams").select("id").eq("id", id).eq("user_id", user.id).maybeSingle()
  if (examError || !exam) return NextResponse.json({ error: "Exame não encontrado." }, { status: 404 })

  const path = `${user.id}/${exam.id}/${crypto.randomUUID()}.pdf`
  const { error: uploadError } = await supabase.storage.from("medical-reports").upload(path, bytes, {
    contentType: "application/pdf",
    upsert: false,
  })
  if (uploadError) return NextResponse.json({ error: "Não foi possível enviar o laudo." }, { status: 400 })

  const { error: updateError } = await supabase.from("exams").update({ report_path: path }).eq("id", exam.id).eq("user_id", user.id)
  if (updateError) {
    await supabase.storage.from("medical-reports").remove([path])
    return NextResponse.json({ error: "Não foi possível associar o laudo ao exame." }, { status: 500 })
  }
  return NextResponse.json({ uploaded: true }, { status: 201 })
}

export async function GET(_request: Request, { params }: RouteContext) {
  const { id } = await params
  if (!isSupabaseConfigured()) return NextResponse.json({ error: "Supabase não está configurado." }, { status: 503 })
  const supabase = await createSupabaseServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: "Autenticação necessária." }, { status: 401 })
  const { data: exam, error: examError } = await supabase.from("exams").select("report_path").eq("id", id).eq("user_id", user.id).maybeSingle()
  if (examError || !exam?.report_path) return NextResponse.json({ error: "Laudo não encontrado." }, { status: 404 })
  const { data, error } = await supabase.storage.from("medical-reports").createSignedUrl(exam.report_path, 60)
  if (error) return NextResponse.json({ error: "Não foi possível abrir o laudo." }, { status: 500 })
  return NextResponse.json({ url: data.signedUrl })
}
