import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/utils"

interface BudgetProgressBarProps {
  spent: number
  budget: number
  percentage: number
}

export function BudgetProgressBar({ spent, budget, percentage }: BudgetProgressBarProps) {
  const color =
    percentage >= 100 ? "bg-rose-500" : percentage >= 80 ? "bg-amber-500" : "bg-emerald-500"

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{formatCurrency(spent)} gastado</span>
        {budget > 0 ? (
          <span>
            {formatCurrency(budget)} ({percentage}%)
          </span>
        ) : (
          <span>Sin presupuesto</span>
        )}
      </div>
      {budget > 0 && (
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all", color)}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      )}
    </div>
  )
}
