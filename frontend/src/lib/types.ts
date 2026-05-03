export type TransactionType = "expense" | "income"
export type CategoryType = "expense" | "income"
export type UserRole = "admin" | "savings"

export interface Category {
  id: string
  user_id: string
  name: string
  icon: string
  color: string
  monthly_budget: number
  type: CategoryType
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Account {
  id: string
  user_id: string
  name: string
  initial_amount: number
  current_balance: number
  currency: string
  icon: string
  color: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: string
  user_id: string
  type: TransactionType
  amount: number
  description: string
  date: string
  category_id: string
  account_id: string
  notes?: string
  created_at: string
  updated_at: string
  category?: Pick<Category, "id" | "name" | "icon" | "color">
  account?: Pick<Account, "id" | "name" | "icon" | "color">
}

export interface PaginatedTransactions {
  data: Transaction[]
  total: number
  page: number
  limit: number
}

export interface Transfer {
  id: string
  user_id: string
  from_account_id: string
  to_account_id: string
  amount: number
  description?: string
  date: string
  created_at: string
  from_account?: Pick<Account, "id" | "name" | "icon" | "color">
  to_account?: Pick<Account, "id" | "name" | "icon" | "color">
}

export interface TransactionFilters {
  month?: string
  category_id?: string
  account_id?: string
  type?: TransactionType
  sort?: "date_asc" | "date_desc" | "amount_asc" | "amount_desc"
  page?: number
  limit?: number
}

// Dashboard types
export interface CategoryBudgetItem {
  category_id: string
  name: string
  icon: string
  color: string
  budget: number
  spent: number
  percentage: number
}

export interface MonthlyDashboard {
  month: string
  total_income: number
  total_expense: number
  net: number
  categories: CategoryBudgetItem[]
  top_expenses: Transaction[]
}

export interface ComparisonCategory {
  category_id: string
  name: string
  icon: string
  color: string
  from_spent: number
  to_spent: number
  difference: number
  percentage_change: number
}

export interface MonthComparison {
  from_month: string
  to_month: string
  from: { income: number; expense: number }
  to: { income: number; expense: number }
  expense_trend: "up" | "down" | "stable"
  categories: ComparisonCategory[]
}

export interface DashboardOverview {
  total_balance: number
  accounts: Account[]
  current_month: MonthlyDashboard
  recent_transactions: Transaction[]
}

export interface SavingsMember {
  id: string
  user_id: string
  display_name: string
  joined_at: string
  created_at: string
}

export interface SavingsContribution {
  id: string
  member_id: string
  member_display_name: string
  amount: number
  month: string
  notes?: string
  enters_fund: boolean
  created_at: string
}

export interface SavingsFundMonth {
  id: string
  month: string
  tna: number
  created_at: string
}

export interface SavingsMonthlyDetail {
  month: string
  contribution_entered: number
  accumulated: number
  monthly_rate: number
  return_amount: number
  cumulative_return: number
}

export interface SavingsPersonReturn {
  member_id: string
  display_name: string
  monthly_details: SavingsMonthlyDetail[]
  total_accumulated: number
  total_return: number
}

export interface SavingsReturns {
  members: SavingsPersonReturn[]
  total_fund: number
  total_return: number
}
