import { useEffect, useMemo, useState } from "react"
import { Check, Copy } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { copyToClipboard, formatCurrency, monthLabel } from "@/lib/utils"
import type { MonthlyDashboard } from "@/lib/types"

interface ExportExpensesDialogProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  data: MonthlyDashboard
  month: string
}

function formatPercent(value: number): string {
  return `${value.toFixed(1).replace(".", ",")}%`
}

function buildMonthlyExportMarkdown(data: MonthlyDashboard, month: string): string {
  const lines: string[] = []
  lines.push(`# Reporte de gastos — ${monthLabel(month)}`)
  lines.push("")
  lines.push("## Resumen")
  lines.push(`- **Ingresos:** ${formatCurrency(data.total_income)}`)
  lines.push(`- **Gastos:** ${formatCurrency(data.total_expense)}`)
  lines.push(`- **Balance neto:** ${formatCurrency(data.net)}`)
  lines.push("")
  lines.push("## Gastos por categoría")

  const categories = data.categories.filter((c) => c.spent > 0)
  if (categories.length === 0) {
    lines.push("")
    lines.push("_Sin gastos registrados en el mes._")
    return lines.join("\n")
  }

  lines.push("| Categoría | Monto | % del total |")
  lines.push("|-----------|------:|------------:|")
  for (const c of categories) {
    const pct = data.total_expense > 0 ? (c.spent / data.total_expense) * 100 : 0
    lines.push(`| ${c.name} | ${formatCurrency(c.spent)} | ${formatPercent(pct)} |`)
  }
  return lines.join("\n")
}

export function ExportExpensesDialog({
  open,
  onOpenChange,
  data,
  month,
}: ExportExpensesDialogProps) {
  const markdown = useMemo(() => buildMonthlyExportMarkdown(data, month), [data, month])
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!open) {
      setCopied(false)
      return
    }
    let cancelled = false
    copyToClipboard(markdown).then((ok) => {
      if (!cancelled && ok) setCopied(true)
    })
    return () => {
      cancelled = true
    }
  }, [open, markdown])

  useEffect(() => {
    if (!copied) return
    const t = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(t)
  }, [copied])

  const handleCopyAgain = async () => {
    const ok = await copyToClipboard(markdown)
    if (ok) setCopied(true)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Exportar gastos — {monthLabel(month)}</DialogTitle>
        </DialogHeader>
        <pre className="whitespace-pre-wrap text-xs bg-secondary text-foreground rounded p-3 max-h-96 overflow-auto font-mono">
          {markdown}
        </pre>
        <DialogFooter className="items-center gap-2">
          <span
            className={`flex items-center gap-1 text-xs ${
              copied ? "text-emerald-400" : "text-muted-foreground"
            }`}
            aria-live="polite"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5" /> Copiado al portapapeles
              </>
            ) : (
              "Listo para copiar"
            )}
          </span>
          <Button type="button" variant="secondary" onClick={handleCopyAgain}>
            <Copy className="h-4 w-4" />
            Copiar de nuevo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
