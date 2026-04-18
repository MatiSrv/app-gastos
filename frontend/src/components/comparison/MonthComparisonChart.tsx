import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts"
import type { ComparisonCategory } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"

interface MonthComparisonChartProps {
  categories: ComparisonCategory[]
  fromLabel: string
  toLabel: string
}

export function MonthComparisonChart({ categories, fromLabel, toLabel }: MonthComparisonChartProps) {
  const data = categories.slice(0, 8).map((c) => ({
    name: c.name,
    [fromLabel]: c.from_spent,
    [toLabel]: c.to_spent,
    color: c.color,
  }))

  if (data.length === 0) {
    return <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">Sin datos para comparar.</div>
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} width={60} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
        <Tooltip
          formatter={(value, name) => [formatCurrency(Number(value)), String(name)]}
          contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px" }}
        />
        <Legend formatter={(v) => <span style={{ color: "var(--muted-foreground)", fontSize: "12px" }}>{v}</span>} />
        <Bar dataKey={fromLabel} fill="#6366f1" radius={[4, 4, 0, 0]} />
        <Bar dataKey={toLabel} fill="#8b5cf6" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
