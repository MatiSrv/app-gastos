import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts"
import type { CategoryBudgetItem } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"

interface ExpenseByCategoryChartProps {
  categories: CategoryBudgetItem[]
}

export function ExpenseByCategoryChart({ categories }: ExpenseByCategoryChartProps) {
  const data = categories.filter((c) => c.spent > 0).slice(0, 8)

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
        Sin gastos este mes
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          dataKey="spent"
          nameKey="name"
        >
          {data.map((entry, index) => (
            <Cell key={index} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => [formatCurrency(Number(value)), "Gastado"]}
          contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px" }}
          labelStyle={{ color: "var(--foreground)" }}
        />
        <Legend
          formatter={(value) => <span style={{ color: "var(--muted-foreground)", fontSize: "12px" }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
