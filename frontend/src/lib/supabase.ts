import { createClient, type Session } from "@supabase/supabase-js"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Module-level session cache so the Axios interceptor can read the token
// synchronously without calling getSession() (which acquires the Supabase auth
// lock and deadlocks when called from inside onAuthStateChange).
let _cachedSession: Session | null = null

export function cacheSession(session: Session | null) {
  _cachedSession = session
}

export function getCachedToken(): string | undefined {
  return _cachedSession?.access_token ?? undefined
}
