import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface KPICardProps {
  label: string
  amount: number
  variant: "income" | "expense" | "balance"
  changePercent?: number
}

export function KPICard({ label, amount, variant, changePercent }: KPICardProps) {
  const colors = {
    income: "text-emerald-400",
    expense: "text-rose-400",
    balance: "text-blue-400",
  }

  const TrendIcon = changePercent === undefined || changePercent === 0
    ? Minus
    : changePercent > 0 ? TrendingUp : TrendingDown

  const trendColor = changePercent === undefined || changePercent === 0
    ? "text-muted-foreground"
    : changePercent > 0 ? "text-emerald-400" : "text-rose-400"

  return (
    <div className="bg-card border border-border rounded-lg p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${colors[variant]}`}>{formatCurrency(amount)}</p>
      {changePercent !== undefined && (
        <div className={`flex items-center gap-1 mt-1 text-xs ${trendColor}`}>
          <TrendIcon className="h-3.5 w-3.5" />
          <span>{Math.abs(changePercent).toFixed(1)}% vs mes anterior</span>
        </div>
      )}
    </div>
  )
}
