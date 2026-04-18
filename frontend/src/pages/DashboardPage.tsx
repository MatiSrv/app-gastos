import { useState } from "react"
import { Download } from "lucide-react"
import { MonthSelector } from "@/components/dashboard/MonthSelector"
import { KPICard } from "@/components/dashboard/KPICard"
import { ExpenseByCategoryChart } from "@/components/dashboard/ExpenseByCategoryChart"
import { BudgetProgressBars } from "@/components/dashboard/BudgetProgressBars"
import { IncomeVsExpenseChart } from "@/components/dashboard/IncomeVsExpenseChart"
import { RecentTransactions } from "@/components/dashboard/RecentTransactions"
import { ExportExpensesDialog } from "@/components/dashboard/ExportExpensesDialog"
import { useMonthlyDashboard } from "@/hooks/useDashboard"
import { currentMonth, prevMonth } from "@/lib/utils"

export function DashboardPage() {
  const [month, setMonth] = useState(currentMonth())
  const [exportOpen, setExportOpen] = useState(false)
  const { data, isLoading } = useMonthlyDashboard(month)
  const { data: prevData } = useMonthlyDashboard(prevMonth(month))

  const incomeChange = prevData?.total_income
    ? ((data?.total_income ?? 0) - prevData.total_income) / prevData.total_income * 100
    : undefined

  const expenseChange = prevData?.total_expense
    ? ((data?.total_expense ?? 0) - prevData.total_expense) / prevData.total_expense * 100
    : undefined

  return (
    <div className="p-6 space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <MonthSelector month={month} onChange={setMonth} />
      </div>

      {/* KPI cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-card animate-pulse rounded-lg border border-border" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <KPICard label="Ingresos" amount={data?.total_income ?? 0} variant="income" changePercent={incomeChange} />
          <KPICard
            label="Gastos"
            amount={data?.total_expense ?? 0}
            variant="expense"
            changePercent={expenseChange}
            action={
              data && (
                <button
                  type="button"
                  onClick={() => setExportOpen(true)}
                  className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Exportar gastos a Markdown"
                  title="Exportar a Markdown"
                >
                  <Download className="h-4 w-4" />
                </button>
              )
            }
          />
          <KPICard label="Balance neto" amount={data?.net ?? 0} variant="balance" />
        </div>
      )}

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-lg p-5">
          <h2 className="text-base font-semibold mb-4">Gastos por categoría</h2>
          {isLoading ? (
            <div className="h-52 animate-pulse bg-secondary rounded" />
          ) : (
            <ExpenseByCategoryChart categories={data?.categories ?? []} />
          )}
        </div>

        <div className="bg-card border border-border rounded-lg p-5">
          <h2 className="text-base font-semibold mb-4">Presupuestos del mes</h2>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => <div key={i} className="h-10 animate-pulse bg-secondary rounded" />)}
            </div>
          ) : (
            <BudgetProgressBars categories={data?.categories ?? []} />
          )}
        </div>
      </div>

      {/* Income vs Expense bar chart */}
      <div className="bg-card border border-border rounded-lg p-5">
        <h2 className="text-base font-semibold mb-4">Ingresos vs Gastos (últimos 6 meses)</h2>
        <IncomeVsExpenseChart currentMonth={month} />
      </div>

      {/* Recent transactions */}
      <div className="bg-card border border-border rounded-lg p-5">
        <h2 className="text-base font-semibold mb-3">Últimas transacciones</h2>
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => <div key={i} className="h-10 animate-pulse bg-secondary rounded" />)}
          </div>
        ) : (
          <RecentTransactions transactions={data?.top_expenses ?? []} />
        )}
      </div>

      {data && (
        <ExportExpensesDialog
          open={exportOpen}
          onOpenChange={setExportOpen}
          data={data}
          month={month}
        />
      )}
    </div>
  )
}
