import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CategoryCard } from "@/components/categories/CategoryCard"
import { CategoryForm } from "@/components/categories/CategoryForm"
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from "@/hooks/useCategories"
import { useMonthlyDashboard } from "@/hooks/useDashboard"
import { currentMonth } from "@/lib/utils"
import type { Category } from "@/lib/types"

export function CategoriesPage() {
  const { data: categories = [], isLoading } = useCategories()
  const { data: monthly } = useMonthlyDashboard(currentMonth())
  const createMutation = useCreateCategory()
  const updateMutation = useUpdateCategory()
  const deleteMutation = useDeleteCategory()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Category | undefined>()

  const budgetMap = Object.fromEntries(
    (monthly?.categories ?? []).map((c) => [c.category_id, c])
  )

  const expenses = categories.filter((c) => c.type === "expense")
  const incomes = categories.filter((c) => c.type === "income")

  function openCreate() {
    setEditing(undefined)
    setFormOpen(true)
  }

  function openEdit(cat: Category) {
    setEditing(cat)
    setFormOpen(true)
  }

  function handleSubmit(data: Omit<Category, "id" | "user_id" | "is_active" | "created_at" | "updated_at">) {
    if (editing) {
      updateMutation.mutate({ id: editing.id, data }, { onSuccess: () => setFormOpen(false) })
    } else {
      createMutation.mutate(data, { onSuccess: () => setFormOpen(false) })
    }
  }

  return (
    <div className="p-6 space-y-6 pb-20 md:pb-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Categorías</h1>
        <Button onClick={openCreate} size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Nueva categoría
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-card animate-pulse rounded-lg border border-border" />
          ))}
        </div>
      ) : (
        <Tabs defaultValue="expense">
          <TabsList>
            <TabsTrigger value="expense">Gastos ({expenses.length})</TabsTrigger>
            <TabsTrigger value="income">Ingresos ({incomes.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="expense" className="mt-4">
            {expenses.length === 0 ? (
              <EmptyState message="No tenés categorías de gasto. ¡Creá una para empezar!" />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {expenses.map((cat) => (
                  <CategoryCard
                    key={cat.id}
                    category={cat}
                    budgetData={budgetMap[cat.id]}
                    onEdit={openEdit}
                    onDelete={(id) => deleteMutation.mutate(id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="income" className="mt-4">
            {incomes.length === 0 ? (
              <EmptyState message="No tenés categorías de ingreso." />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {incomes.map((cat) => (
                  <CategoryCard
                    key={cat.id}
                    category={cat}
                    budgetData={budgetMap[cat.id]}
                    onEdit={openEdit}
                    onDelete={(id) => deleteMutation.mutate(id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}

      <CategoryForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        initial={editing}
        loading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
      <span className="text-5xl mb-4">🏷️</span>
      <p className="text-sm">{message}</p>
    </div>
  )
}
