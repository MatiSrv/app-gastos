import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useCreateFundMonth } from "@/hooks/useSavings"
import { currentMonth } from "@/lib/utils"

interface FundMonthFormProps {
  open: boolean
  onClose: () => void
}

export function FundMonthForm({ open, onClose }: FundMonthFormProps) {
  const [month, setMonth] = useState(currentMonth())
  const [tna, setTna] = useState("")
  const createFundMonth = useCreateFundMonth()

  useEffect(() => {
    if (!open) { setMonth(currentMonth()); setTna("") }
  }, [open])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    createFundMonth.mutate(
      { month: `${month}-01`, tna: parseFloat(tna) },
      { onSuccess: onClose }
    )
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader><DialogTitle>Agregar mes al fondo</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Mes</Label>
            <Input type="month" value={month} onChange={(e) => setMonth(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>TNA (%)</Label>
            <Input type="number" min="0.01" step="0.01" value={tna} onChange={(e) => setTna(e.target.value)} placeholder="ej: 120" required />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={createFundMonth.isPending}>{createFundMonth.isPending ? "Guardando..." : "Guardar"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
