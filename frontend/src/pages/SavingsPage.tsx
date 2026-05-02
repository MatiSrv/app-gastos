import { PiggyBank } from "lucide-react"

export default function SavingsPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
      <PiggyBank className="h-16 w-16 opacity-40" />
      <p className="text-lg font-medium">Aportes — próximamente</p>
    </div>
  )
}
