import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCreateContribution, useUpdateContribution } from "@/hooks/useSavings"
import { currentMonth } from "@/lib/utils"
import type { SavingsMember, SavingsContribution } from "@/lib/types"

interface ContributionFormProps {
  open: boolean
  onClose: () => void
  members: SavingsMember[]
  initial?: SavingsContribution
  defaultMonth?: string
}

export function ContributionForm({ open, onClose, members, initial, defaultMonth }: ContributionFormProps) {
  const [memberId, setMemberId] = useState("")
  const [amount, setAmount] = useState("")
  const [month, setMonth] = useState(defaultMonth ?? currentMonth())
  const [notes, setNotes] = useState("")

  const createContribution = useCreateContribution()
  const updateContribution = useUpdateContribution()

  const isEdit = initial !== undefined

  useEffect(() => {
    if (initial) {
      setMemberId(initial.member_id)
      setAmount(String(initial.amount))
      setMonth(initial.month.slice(0, 7))
      setNotes(initial.notes ?? "")
    } else {
      setMemberId("")
      setAmount("")
      setMonth(defaultMonth ?? currentMonth())
      setNotes("")
    }
  }, [open, initial, defaultMonth])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isEdit && !memberId) return
    if (isEdit) {
      updateContribution.mutate(
        { id: initial.id, data: { amount: parseFloat(amount), notes: notes } },
        { onSuccess: onClose },
      )
    } else {
      createContribution.mutate(
        { member_id: memberId, amount: parseFloat(amount), month: `${month}-01`, notes: notes || undefined },
        { onSuccess: onClose },
      )
    }
  }

  const isPending = createContribution.isPending || updateContribution.isPending

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar aporte" : "Agregar aporte"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Miembro</Label>
            {isEdit ? (
              <Input value={initial.member_display_name} disabled />
            ) : (
              <Select value={memberId} onValueChange={setMemberId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar miembro" />
                </SelectTrigger>
                <SelectContent>
                  {members.map((m) => (
                    <SelectItem key={m.id} value={m.id}>{m.display_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <Label>Monto</Label>
            <Input
              type="number"
              min="1"
              step="100"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Mes</Label>
            <Input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Notas (opcional)</Label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Observaciones..."
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={isPending}>{isPending ? "Guardando..." : "Guardar"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
