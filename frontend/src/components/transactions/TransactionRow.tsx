import { Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Transaction } from "@/lib/types"
import { formatCurrency, formatDate } from "@/lib/utils"

interface TransactionRowProps {
  transaction: Transaction
  onEdit: (tx: Transaction) => void
  onDelete: (id: string) => void
}

export function TransactionRow({ transaction: tx, onEdit, onDelete }: TransactionRowProps) {
  const isExpense = tx.type === "expense"
  const cat = tx.category
  const acc = tx.account

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-border last:border-0 hover:bg-accent/30 group transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <div
          className="h-8 w-8 rounded-full flex items-center justify-center text-sm shrink-0"
          style={{ backgroundColor: (cat?.color ?? "#6366f1") + "33" }}
        >
          {cat?.icon && cat.icon.length <= 2 ? cat.icon : "🏷️"}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{tx.description}</p>
          <p className="text-xs text-muted-foreground">
            {cat?.name} · {acc?.name}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <div className="text-right hidden sm:block">
          <p className="text-xs text-muted-foreground">{formatDate(tx.date)}</p>
        </div>
        <p className={`text-sm font-semibold w-28 text-right ${isExpense ? "text-rose-400" : "text-emerald-400"}`}>
          {isExpense ? "-" : "+"}{formatCurrency(tx.amount)}
        </p>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(tx)}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => onDelete(tx.id)}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
