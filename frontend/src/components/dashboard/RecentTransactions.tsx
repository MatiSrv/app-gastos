import { Link } from "react-router-dom"
import type { Transaction } from "@/lib/types"
import { formatCurrency, formatDate } from "@/lib/utils"

interface RecentTransactionsProps {
  transactions: Transaction[]
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  if (transactions.length === 0) {
    return <p className="text-sm text-muted-foreground py-4">Sin transacciones recientes.</p>
  }

  return (
    <div className="space-y-0">
      {transactions.slice(0, 5).map((tx) => {
        const cat = tx.category
        const isExpense = tx.type === "expense"
        return (
          <div key={tx.id} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
            <div className="flex items-center gap-3">
              <div
                className="h-7 w-7 rounded-full flex items-center justify-center text-xs shrink-0"
                style={{ backgroundColor: (cat?.color ?? "#6366f1") + "33" }}
              >
                {cat?.icon && cat.icon.length <= 2 ? cat.icon : "🏷️"}
              </div>
              <div>
                <p className="text-sm text-foreground">{tx.description}</p>
                <p className="text-xs text-muted-foreground">{formatDate(tx.date)}</p>
              </div>
            </div>
            <span className={`text-sm font-semibold ${isExpense ? "text-rose-400" : "text-emerald-400"}`}>
              {isExpense ? "-" : "+"}{formatCurrency(tx.amount)}
            </span>
          </div>
        )
      })}
      <div className="pt-2">
        <Link to="/transactions" className="text-sm text-primary hover:underline">
          Ver todas →
        </Link>
      </div>
    </div>
  )
}
