import { Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BudgetProgressBar } from "./BudgetProgressBar"
import type { Category, CategoryBudgetItem } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"

interface CategoryCardProps {
  category: Category
  budgetData?: CategoryBudgetItem
  onEdit: (cat: Category) => void
  onDelete: (id: string) => void
}

export function CategoryCard({ category, budgetData, onEdit, onDelete }: CategoryCardProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="h-10 w-10 rounded-full flex items-center justify-center text-lg"
            style={{ backgroundColor: category.color + "33" }}
          >
            {category.icon.length <= 2 ? category.icon : "🏷️"}
          </div>
          <div>
            <p className="font-medium text-foreground">{category.name}</p>
            {category.monthly_budget > 0 && (
              <p className="text-xs text-muted-foreground">
                Presupuesto: {formatCurrency(category.monthly_budget)}
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(category)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={() => onDelete(category.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {budgetData && category.monthly_budget > 0 && (
        <BudgetProgressBar
          spent={budgetData.spent}
          budget={budgetData.budget}
          percentage={budgetData.percentage}
        />
      )}
      {budgetData && category.monthly_budget === 0 && budgetData.spent > 0 && (
        <p className="text-xs text-muted-foreground">
          Gastado este mes: {formatCurrency(budgetData.spent)}
        </p>
      )}
    </div>
  )
}
