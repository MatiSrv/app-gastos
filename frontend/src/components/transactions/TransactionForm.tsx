import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCategories } from "@/hooks/useCategories"
import { useAccounts } from "@/hooks/useAccounts"
import type { Transaction } from "@/lib/types"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface TransactionFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: Omit<Transaction, "id" | "user_id" | "created_at" | "updated_at" | "category" | "account">) => void
  initial?: Transaction
  loading?: boolean
}

export function TransactionForm({ open, onClose, onSubmit, initial, loading }: TransactionFormProps) {
  const { data: categories = [] } = useCategories()
  const { data: accounts = [] } = useAccounts()

  const [type, setType] = useState<"expense" | "income">("expense")
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"))
  const [categoryId, setCategoryId] = useState("")
  const [accountId, setAccountId] = useState("")
  const [notes, setNotes] = useState("")

  useEffect(() => {
    if (initial) {
      setType(initial.type)
      setAmount(String(initial.amount))
      setDescription(initial.description)
      setDate(initial.date)
      setCategoryId(initial.category_id)
      setAccountId(initial.account_id)
      setNotes(initial.notes ?? "")
    } else {
      setType("expense")
      setAmount("")
      setDescription("")
      setDate(format(new Date(), "yyyy-MM-dd"))
      setCategoryId("")
      setAccountId(accounts[0]?.id ?? "")
      setNotes("")
    }
  }, [initial, open, accounts])

  const filteredCategories = categories.filter((c) => c.type === type)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit({ type, amount: parseFloat(amount), description, date, category_id: categoryId, account_id: accountId, notes: notes || undefined })
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{initial ? "Editar transacción" : "Nueva transacción"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type toggle */}
          <div className="flex rounded-lg overflow-hidden border border-border">
            <button
              type="button"
              className={cn("flex-1 py-2 text-sm font-medium transition-colors", type === "expense" ? "bg-rose-500 text-white" : "bg-card text-muted-foreground hover:text-foreground")}
              onClick={() => { setType("expense"); setCategoryId("") }}
            >
              Gasto
            </button>
            <button
              type="button"
              className={cn("flex-1 py-2 text-sm font-medium transition-colors", type === "income" ? "bg-emerald-500 text-white" : "bg-card text-muted-foreground hover:text-foreground")}
              onClick={() => { setType("income"); setCategoryId("") }}
            >
              Ingreso
            </button>
          </div>

          <div className="space-y-2">
            <Label>Monto</Label>
            <Input type="number" min="0.01" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label>Descripción</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} required maxLength={255} />
          </div>

          <div className="space-y-2">
            <Label>Fecha</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label>Categoría</Label>
            <Select value={categoryId} onValueChange={setCategoryId} required>
              <SelectTrigger><SelectValue placeholder="Seleccionar categoría" /></SelectTrigger>
              <SelectContent>
                {filteredCategories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.icon.length <= 2 ? c.icon : "🏷️"} {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Cuenta</Label>
            <Select value={accountId} onValueChange={setAccountId} required>
              <SelectTrigger><SelectValue placeholder="Seleccionar cuenta" /></SelectTrigger>
              <SelectContent>
                {accounts.map((a) => (
                  <SelectItem key={a.id} value={a.id}>{a.icon} {a.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Notas (opcional)</Label>
            <Input value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={500} />
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
