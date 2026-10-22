import { NextResponse } from "next/server"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import { isSupabaseConfigured } from "@/lib/supabase/config"

export async function GET(request: Request) {
  if (!isSupabaseConfigured()) return NextResponse.json({ error: "Supabase não está configurado." }, { status: 503 })
  const params = new URL(request.url).searchParams
  const query = (params.get("q") || "").trim().replace(/[,%()]/g, " ").slice(0, 80)
  const specialty = params.get("specialty")?.slice(0, 80)
  const mode = params.get("mode")
  const minRating = Number(params.get("minRating") || 0)

  const supabase = await createSupabaseServerClient()
  let requestQuery = supabase.from("doctors").select("*").gte("rating", Number.isFinite(minRating) ? Math.min(5, Math.max(0, minRating)) : 0)
  if (query) requestQuery = requestQuery.or(`full_name.ilike.%${query}%,specialty.ilike.%${query}%,crm.ilike.%${query}%`)
  if (specialty && specialty !== "Todos") requestQuery = requestQuery.eq("specialty", specialty)
  if (mode === "online") requestQuery = requestQuery.eq("available_online", true)
  if (mode === "in_person") requestQuery = requestQuery.eq("available_in_person", true)

  const { data, error } = await requestQuery.order("rating", { ascending: false }).limit(50)
  if (error) return NextResponse.json({ error: "Não foi possível buscar médicos." }, { status: 500 })

  const doctors = data.map((row) => ({
    id: row.id,
    fullName: row.full_name,
    specialty: row.specialty,
    crm: row.crm,
    avatarUrl: row.avatar_url || "",
    rating: Number(row.rating),
    reviewsCount: row.reviews_count,
    experienceYears: row.experience_years,
    pricePerSession: Number(row.price_per_session),
    bio: row.bio,
    availableOnline: row.available_online,
    availableInPerson: row.available_in_person,
    availableSlots: row.available_slots,
  }))
  return NextResponse.json({ doctors })
}
