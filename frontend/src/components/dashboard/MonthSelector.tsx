import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { monthLabel, prevMonth, nextMonth } from "@/lib/utils"

interface MonthSelectorProps {
  month: string
  onChange: (month: string) => void
}

export function MonthSelector({ month, onChange }: MonthSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onChange(prevMonth(month))}>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="text-lg font-semibold capitalize min-w-36 text-center">{monthLabel(month)}</span>
      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onChange(nextMonth(month))}>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
