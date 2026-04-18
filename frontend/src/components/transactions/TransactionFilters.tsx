import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCategories } from "@/hooks/useCategories"
import { useAccounts } from "@/hooks/useAccounts"
import type { TransactionFilters } from "@/lib/types"
import { monthLabel, prevMonth, nextMonth, currentMonth } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface TransactionFiltersProps {
  filters: TransactionFilters
  onChange: (f: Partial<TransactionFilters>) => void
}

export function TransactionFiltersBar({ filters, onChange }: TransactionFiltersProps) {
  const { data: categories = [] } = useCategories()
  const { data: accounts = [] } = useAccounts()
  const month = filters.month ?? currentMonth()

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {/* Month navigator */}
      <div className="flex items-center gap-1 bg-card border border-border rounded-md px-2 py-1">
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onChange({ month: prevMonth(month), page: 1 })}>
          <ChevronLeft className="h-3.5 w-3.5" />
        </Button>
        <span className="text-sm w-28 text-center capitalize">{monthLabel(month)}</span>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onChange({ month: nextMonth(month), page: 1 })}>
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>

      <Select value={filters.category_id ?? "all"} onValueChange={(v) => onChange({ category_id: v === "all" ? undefined : v, page: 1 })}>
        <SelectTrigger className="w-40 h-9">
          <SelectValue placeholder="Categoría" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas las categorías</SelectItem>
          {categories.map((c) => (
            <SelectItem key={c.id} value={c.id}>{c.icon.length <= 2 ? c.icon : "🏷️"} {c.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.account_id ?? "all"} onValueChange={(v) => onChange({ account_id: v === "all" ? undefined : v, page: 1 })}>
        <SelectTrigger className="w-36 h-9">
          <SelectValue placeholder="Cuenta" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas las cuentas</SelectItem>
          {accounts.map((a) => (
            <SelectItem key={a.id} value={a.id}>{a.icon} {a.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.type ?? "all"} onValueChange={(v) => onChange({ type: v === "all" ? undefined : (v as "expense" | "income"), page: 1 })}>
        <SelectTrigger className="w-32 h-9">
          <SelectValue placeholder="Tipo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="expense">Gastos</SelectItem>
          <SelectItem value="income">Ingresos</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filters.sort ?? "date_desc"} onValueChange={(v) => onChange({ sort: v as TransactionFilters["sort"] })}>
        <SelectTrigger className="w-40 h-9">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="date_desc">Fecha (reciente)</SelectItem>
          <SelectItem value="date_asc">Fecha (antiguo)</SelectItem>
          <SelectItem value="amount_desc">Monto (mayor)</SelectItem>
          <SelectItem value="amount_asc">Monto (menor)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
