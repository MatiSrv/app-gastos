import { useQuery } from "@tanstack/react-query"
import { dashboardApi } from "@/lib/api"

export function useMonthlyDashboard(month: string) {
  return useQuery({
    queryKey: ["dashboard", "monthly", month],
    queryFn: () => dashboardApi.monthly(month),
    enabled: !!month,
  })
}

export function useMonthComparison(fromMonth: string, toMonth: string) {
  return useQuery({
    queryKey: ["dashboard", "comparison", fromMonth, toMonth],
    queryFn: () => dashboardApi.comparison(fromMonth, toMonth),
    enabled: !!fromMonth && !!toMonth,
  })
}

export function useDashboardOverview() {
  return useQuery({
    queryKey: ["dashboard", "overview"],
    queryFn: dashboardApi.overview,
  })
}
