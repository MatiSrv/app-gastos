import type { CategoryBudgetItem } from "@/lib/types"
import { BudgetProgressBar } from "@/components/categories/BudgetProgressBar"

interface BudgetProgressBarsProps {
  categories: CategoryBudgetItem[]
}

export function BudgetProgressBars({ categories }: BudgetProgressBarsProps) {
  const withBudget = categories.filter((c) => c.budget > 0)

  if (withBudget.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4">
        No hay categorías con presupuesto configurado.
      </p>
    )
  }

  return (
    <div className="space-y-4">
      {withBudget.map((cat) => (
        <div key={cat.category_id} className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">{cat.name}</span>
            {cat.percentage >= 100 && (
              <span className="text-xs bg-rose-500/20 text-rose-400 px-1.5 py-0.5 rounded">¡Superado!</span>
            )}
          </div>
          <BudgetProgressBar spent={cat.spent} budget={cat.budget} percentage={cat.percentage} />
        </div>
      ))}
    </div>
  )
}
