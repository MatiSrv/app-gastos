import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "@/components/ui/sonner"
import { AppLayout } from "@/components/layout/AppLayout"
import { LoginPage } from "@/pages/LoginPage"
import { RegisterPage } from "@/pages/RegisterPage"
import { DashboardPage } from "@/pages/DashboardPage"
import { TransactionsPage } from "@/pages/TransactionsPage"
import { CategoriesPage } from "@/pages/CategoriesPage"
import { AccountsPage } from "@/pages/AccountsPage"
import { ComparisonPage } from "@/pages/ComparisonPage"
import SavingsPage from "@/pages/SavingsPage"
import { AuthProvider, useAuth } from "@/hooks/useAuth"

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 1000 * 60 } },
})

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { session, role, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }
  if (!session) return <Navigate to="/login" replace />
  if (role === "savings" && location.pathname !== "/savings") {
    return <Navigate to="/savings" replace />
  }
  return <>{children}</>
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/"
              element={
                <AuthGuard>
                  <AppLayout />
                </AuthGuard>
              }
            >
              <Route index element={<DashboardPage />} />
              <Route path="savings" element={<SavingsPage />} />
              <Route path="transactions" element={<TransactionsPage />} />
              <Route path="categories" element={<CategoriesPage />} />
              <Route path="accounts" element={<AccountsPage />} />
              <Route path="comparison" element={<ComparisonPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
        <Toaster richColors position="top-right" />
      </AuthProvider>
    </QueryClientProvider>
  )
}
