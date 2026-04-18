import type { ComparisonCategory } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface ComparisonTableProps {
  categories: ComparisonCategory[]
  fromLabel: string
  toLabel: string
}

export function ComparisonTable({ categories, fromLabel, toLabel }: ComparisonTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-muted-foreground border-b border-border">
            <th className="text-left py-2 pr-4 font-medium">Categoría</th>
            <th className="text-right py-2 px-4 font-medium">{fromLabel}</th>
            <th className="text-right py-2 px-4 font-medium">{toLabel}</th>
            <th className="text-right py-2 pl-4 font-medium">Diferencia</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((cat) => {
            const isUp = cat.difference > 0
            const isZero = cat.difference === 0
            const TrendIcon = isZero ? Minus : isUp ? TrendingUp : TrendingDown
            const trendColor = isZero ? "text-muted-foreground" : isUp ? "text-rose-400" : "text-emerald-400"

            return (
              <tr key={cat.category_id} className="border-b border-border last:border-0 hover:bg-accent/20">
                <td className="py-2.5 pr-4">
                  <span className="font-medium text-foreground">{cat.name}</span>
                </td>
                <td className="py-2.5 px-4 text-right text-muted-foreground">{formatCurrency(cat.from_spent)}</td>
                <td className="py-2.5 px-4 text-right text-muted-foreground">{formatCurrency(cat.to_spent)}</td>
                <td className="py-2.5 pl-4 text-right">
                  <span className={`flex items-center justify-end gap-1 ${trendColor}`}>
                    <TrendIcon className="h-3.5 w-3.5" />
                    {cat.difference > 0 ? "+" : ""}{formatCurrency(cat.difference)}
                    {!isZero && <span className="text-xs">({Math.abs(cat.percentage_change).toFixed(1)}%)</span>}
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
