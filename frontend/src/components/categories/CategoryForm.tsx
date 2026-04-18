import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Category } from "@/lib/types"

const PRESET_COLORS = [
  "#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4",
  "#3b82f6", "#8b5cf6", "#ec4899", "#14b8a6", "#f59e0b",
]

interface CategoryFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: Omit<Category, "id" | "user_id" | "is_active" | "created_at" | "updated_at">) => void
  initial?: Category
  loading?: boolean
}

export function CategoryForm({ open, onClose, onSubmit, initial, loading }: CategoryFormProps) {
  const [name, setName] = useState("")
  const [type, setType] = useState<"expense" | "income">("expense")
  const [icon, setIcon] = useState("tag")
  const [color, setColor] = useState(PRESET_COLORS[0])
  const [budget, setBudget] = useState("0")

  useEffect(() => {
    if (initial) {
      setName(initial.name)
      setType(initial.type)
      setIcon(initial.icon)
      setColor(initial.color)
      setBudget(String(initial.monthly_budget))
    } else {
      setName("")
      setType("expense")
      setIcon("tag")
      setColor(PRESET_COLORS[0])
      setBudget("0")
    }
  }, [initial, open])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit({ name, type, icon, color, monthly_budget: parseFloat(budget) || 0 })
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{initial ? "Editar categoría" : "Nueva categoría"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Nombre</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required maxLength={100} />
          </div>

          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select value={type} onValueChange={(v) => setType(v as "expense" | "income")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="expense">Gasto</SelectItem>
                <SelectItem value="income">Ingreso</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Ícono (emoji o nombre Lucide)</Label>
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
                  style={{
                    backgroundColor: c,
                    borderColor: color === c ? "white" : "transparent",
                  }}
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

          <div className="space-y-2">
            <Label>Presupuesto mensual</Label>
            <Input
              type="number"
              min="0"
              step="100"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
            />
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
