import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MonthComparisonChart } from "@/components/comparison/MonthComparisonChart"
import { ComparisonTable } from "@/components/comparison/ComparisonTable"
import { useMonthComparison } from "@/hooks/useDashboard"
import { currentMonth, prevMonth, monthLabel, formatCurrency, nextMonth } from "@/lib/utils"
import { KPICard } from "@/components/dashboard/KPICard"

function MonthNav({ month, onChange, label }: { month: string; onChange: (m: string) => void; label: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="flex items-center gap-1 bg-card border border-border rounded-md px-2 py-1">
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onChange(prevMonth(month))}>
          <ChevronLeft className="h-3.5 w-3.5" />
        </Button>
        <span className="text-sm w-28 text-center capitalize">{monthLabel(month)}</span>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onChange(nextMonth(month))}>
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}

export function ComparisonPage() {
  const [fromMonth, setFromMonth] = useState(prevMonth(currentMonth()))
  const [toMonth, setToMonth] = useState(currentMonth())

  const { data, isLoading } = useMonthComparison(fromMonth, toMonth)

  const fromLabel = monthLabel(fromMonth).split(" ")[0]
  const toLabel = monthLabel(toMonth).split(" ")[0]

  const expenseDiff = (data?.to.expense ?? 0) - (data?.from.expense ?? 0)
  const incomeDiff = (data?.to.income ?? 0) - (data?.from.income ?? 0)

  return (
    <div className="p-6 space-y-6 pb-20 md:pb-6">
      <h1 className="text-2xl font-bold">Comparación de meses</h1>

      {/* Month selectors */}
      <div className="flex flex-wrap gap-6 items-end">
        <MonthNav month={fromMonth} onChange={setFromMonth} label="Mes base" />
        <span className="text-muted-foreground mb-2">vs</span>
        <MonthNav month={toMonth} onChange={setToMonth} label="Mes comparado" />
      </div>

      {/* Summary KPIs */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 animate-pulse bg-card rounded-lg border border-border" />)}
        </div>
      ) : data && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <KPICard label={`Ingresos ${fromLabel}`} amount={data.from.income} variant="income" />
          <KPICard label={`Ingresos ${toLabel}`} amount={data.to.income} variant="income" />
          <KPICard label={`Gastos ${fromLabel}`} amount={data.from.expense} variant="expense" />
          <KPICard label={`Gastos ${toLabel}`} amount={data.to.expense} variant="expense" />
        </div>
      )}

      {/* Summary text */}
      {data && (
        <div className="bg-card border border-border rounded-lg p-4 text-sm text-muted-foreground">
          En <span className="text-foreground font-medium capitalize">{monthLabel(toMonth)}</span>{" "}
          {expenseDiff === 0
            ? "gastaste lo mismo"
            : expenseDiff > 0
            ? `gastaste ${formatCurrency(expenseDiff)} más`
            : `gastaste ${formatCurrency(Math.abs(expenseDiff))} menos`}{" "}
          que en <span className="text-foreground font-medium capitalize">{monthLabel(fromMonth)}</span>.
          {incomeDiff !== 0 && (
            <> Los ingresos {incomeDiff > 0 ? "aumentaron" : "bajaron"} {formatCurrency(Math.abs(incomeDiff))}.</>
          )}
        </div>
      )}

      {/* Chart */}
      <div className="bg-card border border-border rounded-lg p-5">
        <h2 className="text-base font-semibold mb-4">Gasto por categoría</h2>
        {isLoading ? (
          <div className="h-64 animate-pulse bg-secondary rounded" />
        ) : (
          <MonthComparisonChart categories={data?.categories ?? []} fromLabel={fromLabel} toLabel={toLabel} />
        )}
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-lg p-5">
        <h2 className="text-base font-semibold mb-4">Tabla comparativa</h2>
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => <div key={i} className="h-10 animate-pulse bg-secondary rounded" />)}
          </div>
        ) : (
          <ComparisonTable categories={data?.categories ?? []} fromLabel={fromLabel} toLabel={toLabel} />
        )}
      </div>
    </div>
  )
}
