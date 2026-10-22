import { createBrowserClient } from "@supabase/ssr"

import { getSupabaseConfig } from "./config"
import { Database } from "@/types/database"

export function createSupabaseBrowserClient() {
  const config = getSupabaseConfig()
  if (!config) throw new Error("Supabase não está configurado.")

  return createBrowserClient<Database>(config.url, config.key)
}
