import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

import { getSupabaseConfig } from "./config"
import { Database } from "@/types/database"

export async function createSupabaseServerClient() {
  const config = getSupabaseConfig()
  if (!config) throw new Error("Supabase não está configurado.")

  const cookieStore = await cookies()
  return createServerClient<Database>(config.url, config.key, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        } catch {
          // Server Components cannot write cookies; middleware refreshes sessions.
        }
      },
    },
  })
}
