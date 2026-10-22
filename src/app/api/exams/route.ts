import { NextResponse } from "next/server"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import { isSupabaseConfigured } from "@/lib/supabase/config"

export async function GET() {
  if (!isSupabaseConfigured()) return NextResponse.json({ error: "Supabase não está configurado." }, { status: 503 })
  const supabase = await createSupabaseServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: "Autenticação necessária." }, { status: 401 })
  const { data, error } = await supabase.from("exams").select("*").eq("user_id", user.id).order("performed_at", { ascending: false })
  if (error) return NextResponse.json({ error: "Não foi possível carregar os exames." }, { status: 500 })
  return NextResponse.json({ exams: data.map((row) => ({
    id: row.id,
    userId: row.user_id,
    name: row.name,
    category: row.category,
    labName: row.lab_name,
    performedAt: row.performed_at,
    resultValue: row.result_value || "—",
    unit: row.unit,
    referenceRange: row.reference_range,
    rangeStatus: row.range_status,
    status: row.status,
    hasReport: Boolean(row.report_path),
  })) })
}
