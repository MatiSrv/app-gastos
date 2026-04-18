import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TransactionRow } from "@/components/transactions/TransactionRow"
import { TransactionFiltersBar } from "@/components/transactions/TransactionFilters"
import { TransactionForm } from "@/components/transactions/TransactionForm"
import { useTransactions, useCreateTransaction, useUpdateTransaction, useDeleteTransaction } from "@/hooks/useTransactions"
import type { Transaction, TransactionFilters } from "@/lib/types"
import { currentMonth } from "@/lib/utils"

export function TransactionsPage() {
  const [filters, setFilters] = useState<TransactionFilters>({ month: currentMonth(), sort: "date_desc", page: 1, limit: 20 })
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Transaction | undefined>()

  const { data, isLoading } = useTransactions(filters)
  const createMutation = useCreateTransaction()
  const updateMutation = useUpdateTransaction()
  const deleteMutation = useDeleteTransaction()

  const transactions = data?.data ?? []
  const total = data?.total ?? 0
  const totalPages = Math.ceil(total / (filters.limit ?? 20))

  function updateFilters(f: Partial<TransactionFilters>) {
    setFilters((prev) => ({ ...prev, ...f }))
  }

  function openCreate() {
    setEditing(undefined)
    setFormOpen(true)
  }

  function openEdit(tx: Transaction) {
    setEditing(tx)
    setFormOpen(true)
  }

  function handleSubmit(data: Omit<Transaction, "id" | "user_id" | "created_at" | "updated_at" | "category" | "account">) {
    if (editing) {
      updateMutation.mutate({ id: editing.id, data }, { onSuccess: () => setFormOpen(false) })
    } else {
      createMutation.mutate(data, { onSuccess: () => setFormOpen(false) })
    }
  }

  return (
    <div className="p-6 space-y-4 pb-20 md:pb-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Transacciones</h1>
        <Button onClick={openCreate} size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Nueva transacción
        </Button>
      </div>

      <TransactionFiltersBar filters={filters} onChange={updateFilters} />

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="space-y-0">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-16 animate-pulse border-b border-border last:border-0" style={{ backgroundColor: "var(--card)" }} />
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <span className="text-5xl mb-4">📋</span>
            <p className="text-sm">No hay transacciones para este período.</p>
          </div>
        ) : (
          transactions.map((tx) => (
            <TransactionRow
              key={tx.id}
              transaction={tx}
              onEdit={openEdit}
              onDelete={(id) => deleteMutation.mutate(id)}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Mostrando {((filters.page ?? 1) - 1) * (filters.limit ?? 20) + 1}–{Math.min((filters.page ?? 1) * (filters.limit ?? 20), total)} de {total}</span>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={(filters.page ?? 1) <= 1}
              onClick={() => updateFilters({ page: (filters.page ?? 1) - 1 })}
            >
              ←
            </Button>
            {[...Array(Math.min(totalPages, 5))].map((_, i) => {
              const page = i + 1
              return (
                <Button
                  key={page}
                  variant={(filters.page ?? 1) === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateFilters({ page })}
                >
                  {page}
                </Button>
              )
            })}
            <Button
              variant="outline"
              size="sm"
              disabled={(filters.page ?? 1) >= totalPages}
              onClick={() => updateFilters({ page: (filters.page ?? 1) + 1 })}
            >
              →
            </Button>
          </div>
        </div>
      )}

      <TransactionForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        initial={editing}
        loading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  )
}
