import { useReturns, useFundMonths } from "@/hooks/useSavings"
import { useAuth } from "@/hooks/useAuth"
import { monthLabel } from "@/lib/utils"
import type { SavingsPersonReturn } from "@/lib/types"

interface ReturnsViewProps {
  onAddFundMonth: () => void
}

export function ReturnsView({ onAddFundMonth }: ReturnsViewProps) {
  const { role } = useAuth()
  const isAdmin = role === "admin"
  const { data: returns, isLoading } = useReturns()
  const { data: fundMonths = [] } = useFundMonths()

  const fmt = (n: number) => n.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 })

  if (isLoading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>

  if (!returns || returns.members.length === 0 || fundMonths.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
        <p>Sin meses registrados en el fondo</p>
        {isAdmin && <button onClick={onAddFundMonth} className="text-sm text-primary underline">Agregar primer mes</button>}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground mb-1">Total en fondo</p>
          <p className="text-xl font-bold tabular-nums">{fmt(returns.total_fund)}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground mb-1">Total rendimientos</p>
          <p className="text-xl font-bold tabular-nums text-green-600">{fmt(returns.total_return)}</p>
        </div>
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-2 text-left font-medium">Miembro</th>
              <th className="px-4 py-2 text-right font-medium">Acumulado</th>
              <th className="px-4 py-2 text-right font-medium">Rendimiento total</th>
            </tr>
          </thead>
          <tbody>
            {returns.members.map((m: SavingsPersonReturn) => (
              <tr key={m.member_id} className="border-t border-border">
                <td className="px-4 py-3 font-medium">{m.display_name}</td>
                <td className="px-4 py-3 text-right tabular-nums">{fmt(m.total_accumulated)}</td>
                <td className="px-4 py-3 text-right tabular-nums text-green-600">{fmt(m.total_return)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isAdmin && fundMonths.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">Historial de meses</h3>
          <div className="space-y-1">
            {fundMonths.map((fm) => (
              <div key={fm.id} className="flex justify-between text-sm rounded border border-border px-3 py-2 bg-card">
                <span>{monthLabel(fm.month.slice(0, 7))}</span>
                <span className="text-muted-foreground">TNA {fm.tna}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
