import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { useMonthlyDashboard } from "@/hooks/useDashboard"
import { prevMonth, monthLabel } from "@/lib/utils"

function buildLastSixMonths(currentMonth: string): string[] {
  const months: string[] = []
  let m = currentMonth
  for (let i = 0; i < 6; i++) {
    months.unshift(m)
    m = prevMonth(m)
  }
  return months
}

// Hooks called at top level — one per slot (rules of hooks: can't loop)
function useM1(m: string) { return useMonthlyDashboard(m) }
function useM2(m: string) { return useMonthlyDashboard(m) }
function useM3(m: string) { return useMonthlyDashboard(m) }
function useM4(m: string) { return useMonthlyDashboard(m) }
function useM5(m: string) { return useMonthlyDashboard(m) }
function useM6(m: string) { return useMonthlyDashboard(m) }

interface IncomeVsExpenseChartProps {
  currentMonth: string
}

export function IncomeVsExpenseChart({ currentMonth }: IncomeVsExpenseChartProps) {
  const months = buildLastSixMonths(currentMonth)
  const d1 = useM1(months[0])
  const d2 = useM2(months[1])
  const d3 = useM3(months[2])
  const d4 = useM4(months[3])
  const d5 = useM5(months[4])
  const d6 = useM6(months[5])

  const rawData = [d1, d2, d3, d4, d5, d6]
  const chartData = months.map((m, i) => ({
    label: monthLabel(m).split(" ")[0].slice(0, 3),
    Ingresos: rawData[i].data?.total_income ?? 0,
    Gastos: rawData[i].data?.total_expense ?? 0,
  }))

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
        <YAxis
          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          axisLine={false}
          tickLine={false}
          width={60}
          tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
        />
        <Tooltip
          formatter={(value) => [
            new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(Number(value)),
          ]}
          contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px" }}
        />
        <Legend formatter={(v) => <span style={{ color: "var(--muted-foreground)", fontSize: "12px" }}>{v}</span>} />
        <Bar dataKey="Ingresos" fill="#10b981" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Gastos" fill="#f43f5e" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
