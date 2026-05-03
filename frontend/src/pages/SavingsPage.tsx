import { useState } from "react"
import { Plus, UserPlus, Pencil, Trash2, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MonthSelector } from "@/components/dashboard/MonthSelector"
import { ContributionForm } from "@/components/savings/ContributionForm"
import { AddMemberForm } from "@/components/savings/AddMemberForm"
import { FundMonthForm } from "@/components/savings/FundMonthForm"
import { ReturnsView } from "@/components/savings/ReturnsView"
import { useContributions, useMembers, useDeleteContribution, useToggleFundEntry } from "@/hooks/useSavings"
import { useAuth } from "@/hooks/useAuth"
import { currentMonth, monthLabel } from "@/lib/utils"
import type { SavingsContribution } from "@/lib/types"

export default function SavingsPage() {
  const { role } = useAuth()
  const isAdmin = role === "admin"
  const [month, setMonth] = useState(currentMonth())
  const [addOpen, setAddOpen] = useState(false)
  const [memberOpen, setMemberOpen] = useState(false)
  const [fundMonthOpen, setFundMonthOpen] = useState(false)
  const [editing, setEditing] = useState<SavingsContribution | null>(null)

  const { data: contributions = [], isLoading } = useContributions(month)
  const { data: members = [] } = useMembers()
  const deleteContribution = useDeleteContribution()
  const toggleFundEntry = useToggleFundEntry()

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      <h1 className="text-2xl font-semibold">Aportes</h1>

      <Tabs defaultValue="aportes">
        <TabsList>
          <TabsTrigger value="aportes">Aportes</TabsTrigger>
          <TabsTrigger value="retornos">Retornos</TabsTrigger>
        </TabsList>

        <TabsContent value="aportes">
          <div className="flex flex-col gap-4 mt-2">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <MonthSelector month={month} onChange={setMonth} />
              {isAdmin && (
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => setAddOpen(true)}>
                    <Plus className="h-4 w-4 mr-1" /> Agregar aporte
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setMemberOpen(true)}>
                    <UserPlus className="h-4 w-4 mr-1" /> Agregar miembro
                  </Button>
                </div>
              )}
            </div>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : contributions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
                <p>No hay aportes para {monthLabel(month)}</p>
                {isAdmin && (
                  <Button variant="outline" size="sm" onClick={() => setAddOpen(true)}>
                    <Plus className="h-4 w-4 mr-1" /> Agregar aporte
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {contributions.map((c) => (
                  <div key={c.id} className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium text-sm">{c.member_display_name}</span>
                      <span className="text-xs text-muted-foreground">{monthLabel(c.month.slice(0, 7))}</span>
                      {c.notes && <span className="text-xs text-muted-foreground italic">{c.notes}</span>}
                    </div>
                    <div className="flex items-center gap-3">
                      {isAdmin && (
                        <Button
                          size="sm"
                          variant={c.enters_fund ? "default" : "outline"}
                          className="h-7 text-xs px-2"
                          onClick={() => toggleFundEntry.mutate({ id: c.id, enters_fund: !c.enters_fund })}
                          title={c.enters_fund ? "En el fondo — clic para quitar" : "No está en el fondo — clic para agregar"}
                        >
                          {c.enters_fund ? "✓ En fondo" : "En fondo"}
                        </Button>
                      )}
                      <span className="font-semibold tabular-nums">
                        {c.amount.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 })}
                      </span>
                      {isAdmin && (
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditing(c)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() => deleteContribution.mutate(c.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="retornos">
          <div className="mt-2">
            {isAdmin && (
              <div className="flex justify-end mb-4">
                <Button size="sm" variant="outline" onClick={() => setFundMonthOpen(true)}>
                  <Calendar className="h-4 w-4 mr-1" /> Agregar mes
                </Button>
              </div>
            )}
            <ReturnsView onAddFundMonth={() => setFundMonthOpen(true)} />
          </div>
        </TabsContent>
      </Tabs>

      {isAdmin && (
        <>
          <ContributionForm open={addOpen} onClose={() => setAddOpen(false)} members={members} defaultMonth={month} />
          <ContributionForm open={editing !== null} onClose={() => setEditing(null)} members={members} initial={editing ?? undefined} defaultMonth={month} />
          <AddMemberForm open={memberOpen} onClose={() => setMemberOpen(false)} />
          <FundMonthForm open={fundMonthOpen} onClose={() => setFundMonthOpen(false)} />
        </>
      )}
    </div>
  )
}
