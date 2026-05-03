import axios from "axios"
import { getCachedToken } from "./supabase"
import type {
  Category,
  Account,
  Transaction,
  PaginatedTransactions,
  Transfer,
  TransactionFilters,
  MonthlyDashboard,
  MonthComparison,
  DashboardOverview,
  UserRole,
  SavingsMember,
  SavingsContribution,
  SavingsFundMonth,
  SavingsReturns,
} from "./types"

const http = axios.create({ baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:8000" })

// Attach Supabase JWT on every request — reads from module-level cache to
// avoid calling getSession() inside onAuthStateChange (deadlock with Supabase v2 lock).
http.interceptors.request.use((config) => {
  const token = getCachedToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ---- Categories ----
export const categoryApi = {
  list: () => http.get<Category[]>("/api/categories").then((r) => r.data),
  create: (body: Omit<Category, "id" | "user_id" | "is_active" | "created_at" | "updated_at">) =>
    http.post<Category>("/api/categories", body).then((r) => r.data),
  update: (id: string, body: Partial<Category>) =>
    http.put<Category>(`/api/categories/${id}`, body).then((r) => r.data),
  remove: (id: string) => http.delete(`/api/categories/${id}`),
  summary: (id: string, month: string) =>
    http.get(`/api/categories/${id}/summary`, { params: { month } }).then((r) => r.data),
}

// ---- Accounts ----
export const accountApi = {
  list: () => http.get<Account[]>("/api/accounts").then((r) => r.data),
  create: (body: Omit<Account, "id" | "user_id" | "current_balance" | "is_active" | "created_at" | "updated_at">) =>
    http.post<Account>("/api/accounts", body).then((r) => r.data),
  update: (id: string, body: Partial<Account>) =>
    http.put<Account>(`/api/accounts/${id}`, body).then((r) => r.data),
  remove: (id: string) => http.delete(`/api/accounts/${id}`),
  summary: (id: string) => http.get(`/api/accounts/${id}/summary`).then((r) => r.data),
}

// ---- Transactions ----
export const transactionApi = {
  list: (filters: TransactionFilters = {}) =>
    http.get<PaginatedTransactions>("/api/transactions", { params: filters }).then((r) => r.data),
  create: (body: Omit<Transaction, "id" | "user_id" | "created_at" | "updated_at" | "category" | "account">) =>
    http.post<Transaction>("/api/transactions", body).then((r) => r.data),
  update: (id: string, body: Partial<Transaction>) =>
    http.put<Transaction>(`/api/transactions/${id}`, body).then((r) => r.data),
  remove: (id: string) => http.delete(`/api/transactions/${id}`),
}

// ---- Transfers ----
export const transferApi = {
  list: () => http.get<Transfer[]>("/api/transfers").then((r) => r.data),
  create: (body: Omit<Transfer, "id" | "user_id" | "created_at" | "from_account" | "to_account">) =>
    http.post<Transfer>("/api/transfers", body).then((r) => r.data),
  remove: (id: string) => http.delete(`/api/transfers/${id}`),
}

// ---- Dashboard ----
export const dashboardApi = {
  monthly: (month: string) =>
    http.get<MonthlyDashboard>("/api/dashboard/monthly", { params: { month } }).then((r) => r.data),
  comparison: (from: string, to: string) =>
    http.get<MonthComparison>("/api/dashboard/comparison", { params: { from, to } }).then((r) => r.data),
  overview: () => http.get<DashboardOverview>("/api/dashboard/overview").then((r) => r.data),
}

// ---- Users ----
export const getMe = (): Promise<{ user_id: string; role: UserRole }> =>
  http.get<{ user_id: string; role: UserRole }>("/api/users/me").then((r) => r.data)

// ---- Savings ----
export const savingsApi = {
  getMembers: () =>
    http.get<SavingsMember[]>("/api/savings/members").then((r) => r.data),
  createMember: (body: Pick<SavingsMember, "user_id" | "display_name" | "joined_at">) =>
    http.post<SavingsMember>("/api/savings/members", body).then((r) => r.data),
  getContributions: (month?: string) =>
    http.get<SavingsContribution[]>("/api/savings/contributions", {
      params: month ? { month } : {},
    }).then((r) => r.data),
  createContribution: (body: { member_id: string; amount: number; month: string; notes?: string }) =>
    http.post<SavingsContribution>("/api/savings/contributions", body).then((r) => r.data),
  updateContribution: (id: string, body: { amount?: number; notes?: string }) =>
    http.patch<SavingsContribution>(`/api/savings/contributions/${id}`, body).then((r) => r.data),
  deleteContribution: (id: string) =>
    http.delete(`/api/savings/contributions/${id}`),
  toggleFundEntry: (id: string, enters_fund: boolean) =>
    http.patch<SavingsContribution>(`/api/savings/contributions/${id}/fund`, { enters_fund }).then((r) => r.data),
  getFundMonths: () =>
    http.get<SavingsFundMonth[]>("/api/savings/fund-months").then((r) => r.data),
  createFundMonth: (body: { month: string; tna: number }) =>
    http.post<SavingsFundMonth>("/api/savings/fund-months", body).then((r) => r.data),
  getReturns: () =>
    http.get<SavingsReturns>("/api/savings/returns").then((r) => r.data),
}
