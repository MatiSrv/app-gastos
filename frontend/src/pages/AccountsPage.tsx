import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AccountCard } from "@/components/accounts/AccountCard"
import { AccountForm } from "@/components/accounts/AccountForm"
import { TransferForm } from "@/components/accounts/TransferForm"
import { useAccounts, useCreateAccount, useUpdateAccount, useDeleteAccount } from "@/hooks/useAccounts"
import type { Account } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"

export function AccountsPage() {
  const { data: accounts = [], isLoading } = useAccounts()
  const createMutation = useCreateAccount()
  const updateMutation = useUpdateAccount()
  const deleteMutation = useDeleteAccount()

  const [formOpen, setFormOpen] = useState(false)
  const [transferOpen, setTransferOpen] = useState(false)
  const [editing, setEditing] = useState<Account | undefined>()
  const [transferFromId, setTransferFromId] = useState<string | undefined>()

  const totalBalance = accounts.reduce((s, a) => s + a.current_balance, 0)

  function openCreate() {
    setEditing(undefined)
    setFormOpen(true)
  }

  function openEdit(acc: Account) {
    setEditing(acc)
    setFormOpen(true)
  }

  function openTransfer(acc: Account) {
    setTransferFromId(acc.id)
    setTransferOpen(true)
  }

  function handleSubmit(data: Omit<Account, "id" | "user_id" | "current_balance" | "is_active" | "created_at" | "updated_at">) {
    if (editing) {
      updateMutation.mutate(
        { id: editing.id, data: { name: data.name, icon: data.icon, color: data.color, currency: data.currency } },
        { onSuccess: () => setFormOpen(false) }
      )
    } else {
      createMutation.mutate(data, { onSuccess: () => setFormOpen(false) })
    }
  }

  return (
    <div className="p-6 space-y-6 pb-20 md:pb-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Cuentas</h1>
        <Button onClick={openCreate} size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Nueva cuenta
        </Button>
      </div>

      {/* Total balance */}
      <div className="bg-card border border-border rounded-lg p-5">
        <p className="text-sm text-muted-foreground">Balance total</p>
        <p className={`text-3xl font-bold mt-1 ${totalBalance >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
          {formatCurrency(totalBalance)}
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-40 bg-card animate-pulse rounded-lg border border-border" />
          ))}
        </div>
      ) : accounts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <span className="text-5xl mb-4">💳</span>
          <p className="text-sm">No tenés cuentas. ¡Creá una para empezar!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((acc) => (
            <AccountCard
              key={acc.id}
              account={acc}
              onEdit={openEdit}
              onTransfer={openTransfer}
              onDelete={(id) => deleteMutation.mutate(id)}
            />
          ))}
        </div>
      )}

      <AccountForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        initial={editing}
        loading={createMutation.isPending || updateMutation.isPending}
      />

      <TransferForm
        open={transferOpen}
        onClose={() => setTransferOpen(false)}
        defaultFromId={transferFromId}
      />
    </div>
  )
}
