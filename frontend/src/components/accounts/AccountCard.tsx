import { Pencil, ArrowLeftRight, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Account } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"

interface AccountCardProps {
  account: Account
  onEdit: (acc: Account) => void
  onTransfer: (acc: Account) => void
  onDelete: (id: string) => void
}

export function AccountCard({ account, onEdit, onTransfer, onDelete }: AccountCardProps) {
  const isPositive = account.current_balance >= 0

  return (
    <div className="bg-card border border-border rounded-lg p-5 space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className="h-10 w-10 rounded-full flex items-center justify-center text-lg"
            style={{ backgroundColor: account.color + "33" }}
          >
            {account.icon}
          </div>
          <div>
            <p className="font-semibold text-foreground">{account.name}</p>
            <p className="text-xs text-muted-foreground">{account.currency}</p>
          </div>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(account)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onTransfer(account)}>
            <ArrowLeftRight className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={() => onDelete(account.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div>
        <p className="text-xs text-muted-foreground mb-1">Balance actual</p>
        <p className={`text-2xl font-bold ${isPositive ? "text-emerald-400" : "text-rose-400"}`}>
          {formatCurrency(account.current_balance)}
        </p>
      </div>
    </div>
  )
}
