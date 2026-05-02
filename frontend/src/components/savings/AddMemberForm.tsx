import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useCreateMember } from "@/hooks/useSavings"
import { currentMonth } from "@/lib/utils"

interface AddMemberFormProps {
  open: boolean
  onClose: () => void
}

export function AddMemberForm({ open, onClose }: AddMemberFormProps) {
  const [userId, setUserId] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [joinedAt, setJoinedAt] = useState(currentMonth())

  const createMember = useCreateMember()

  useEffect(() => {
    if (!open) {
      setUserId("")
      setDisplayName("")
      setJoinedAt(currentMonth())
    }
  }, [open])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    createMember.mutate(
      { user_id: userId, display_name: displayName, joined_at: `${joinedAt}-01` },
      { onSuccess: onClose },
    )
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Agregar miembro</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Auth User ID (UUID)</Label>
            <Input
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Nombre</Label>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={100}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Fecha de ingreso</Label>
            <Input
              type="month"
              value={joinedAt}
              onChange={(e) => setJoinedAt(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={createMember.isPending}>
              {createMember.isPending ? "Guardando..." : "Agregar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
