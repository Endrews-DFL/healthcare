import { NextResponse } from "next/server"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import { isSupabaseConfigured } from "@/lib/supabase/config"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get("code")
  if (!code || !isSupabaseConfigured()) {
    return NextResponse.redirect(new URL("/login?error=auth_callback", url.origin))
  }

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)
  return NextResponse.redirect(new URL(error ? "/login?error=auth_callback" : "/dashboard", url.origin))
}
