import { createContext, createElement, useCallback, useContext, useEffect, useState, type ReactNode } from "react"
import type { Session, User } from "@supabase/supabase-js"
import { supabase, cacheSession } from "@/lib/supabase"
import { getMe } from "@/lib/api"
import type { UserRole } from "@/lib/types"

interface AuthContextValue {
  session: Session | null
  user: User | null
  role: UserRole
  loading: boolean
  signIn: (email: string, password: string) => ReturnType<typeof supabase.auth.signInWithPassword>
  signOut: () => ReturnType<typeof supabase.auth.signOut>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<UserRole>("savings")
  const [loading, setLoading] = useState(true)

  const fetchRole = useCallback(async (s: Session | null) => {
    if (!s) {
      setRole("savings")
      return
    }
    try {
      const data = await getMe()
      setRole(data.role)
    } catch (err) {
      console.error("[Auth] Failed to fetch role, defaulting to savings", err)
      setRole("savings")
    }
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session: s } }) => {
      cacheSession(s)
      setSession(s)
      setUser(s?.user ?? null)
      await fetchRole(s)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, s) => {
      cacheSession(s)
      setLoading(true)
      setSession(s)
      setUser(s?.user ?? null)
      await fetchRole(s)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [fetchRole])

  const signIn = (email: string, password: string) =>
    supabase.auth.signInWithPassword({ email, password })
  const signOut = () => supabase.auth.signOut()

  return createElement(AuthContext.Provider, { value: { session, user, role, loading, signIn, signOut } }, children)
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider")
  return ctx
}
