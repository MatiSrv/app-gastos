import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Account } from "@/lib/types"

const PRESET_COLORS = [
  "#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444",
  "#06b6d4", "#ec4899", "#84cc16", "#f97316", "#6366f1",
]

interface AccountFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: Omit<Account, "id" | "user_id" | "current_balance" | "is_active" | "created_at" | "updated_at">) => void
  initial?: Account
  loading?: boolean
}

export function AccountForm({ open, onClose, onSubmit, initial, loading }: AccountFormProps) {
  const [name, setName] = useState("")
  const [initialAmount, setInitialAmount] = useState("0")
  const [currency, setCurrency] = useState("ARS")
  const [icon, setIcon] = useState("💳")
  const [color, setColor] = useState(PRESET_COLORS[0])

  useEffect(() => {
    if (initial) {
      setName(initial.name)
      setInitialAmount(String(initial.initial_amount))
      setCurrency(initial.currency)
      setIcon(initial.icon)
      setColor(initial.color)
    } else {
      setName("")
      setInitialAmount("0")
      setCurrency("ARS")
      setIcon("💳")
      setColor(PRESET_COLORS[0])
    }
  }, [initial, open])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit({ name, initial_amount: parseFloat(initialAmount) || 0, currency, icon, color })
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{initial ? "Editar cuenta" : "Nueva cuenta"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Nombre</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required maxLength={100} />
          </div>

          {!initial && (
            <div className="space-y-2">
              <Label>Monto inicial</Label>
              <Input
                type="number"
                min="0"
                step="100"
                value={initialAmount}
                onChange={(e) => setInitialAmount(e.target.value)}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>Ícono (emoji)</Label>
            <Input value={icon} onChange={(e) => setIcon(e.target.value)} maxLength={50} />
          </div>

          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex gap-2 flex-wrap">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className="h-7 w-7 rounded-full border-2 transition-all"
                  style={{ backgroundColor: c, borderColor: color === c ? "white" : "transparent" }}
                  onClick={() => setColor(c)}
                />
              ))}
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-7 w-7 rounded cursor-pointer border-0 bg-transparent"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={loading}>{loading ? "Guardando..." : "Guardar"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
