import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { savingsApi } from "@/lib/api"
import { toast } from "sonner"

export function useMembers() {
  return useQuery({ queryKey: ["savings-members"], queryFn: savingsApi.getMembers })
}

export function useContributions(month?: string) {
  return useQuery({
    queryKey: ["savings-contributions", month],
    queryFn: () => savingsApi.getContributions(month),
  })
}

export function useCreateMember() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: savingsApi.createMember,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["savings-members"] })
      qc.invalidateQueries({ queryKey: ["savings-contributions"] })
      toast.success("Miembro agregado")
    },
    onError: (err: { response?: { data?: { detail?: string } } }) =>
      toast.error(err?.response?.data?.detail ?? "Error al agregar miembro"),
  })
}

export function useCreateContribution() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: savingsApi.createContribution,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["savings-contributions"] })
      toast.success("Aporte registrado")
    },
    onError: (err: { response?: { data?: { detail?: string } } }) =>
      toast.error(err?.response?.data?.detail ?? "Error al registrar aporte"),
  })
}

export function useUpdateContribution() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { amount?: number; notes?: string } }) =>
      savingsApi.updateContribution(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["savings-contributions"] })
      toast.success("Aporte actualizado")
    },
    onError: () => toast.error("Error al actualizar aporte"),
  })
}

export function useDeleteContribution() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: savingsApi.deleteContribution,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["savings-contributions"] })
      toast.success("Aporte eliminado")
    },
    onError: () => toast.error("Error al eliminar aporte"),
  })
}

export function useFundMonths() {
  return useQuery({ queryKey: ["savings-fund-months"], queryFn: savingsApi.getFundMonths })
}

export function useCreateFundMonth() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: savingsApi.createFundMonth,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["savings-fund-months"] })
      qc.invalidateQueries({ queryKey: ["savings-returns"] })
      toast.success("Mes del fondo agregado")
    },
    onError: (err: { response?: { data?: { detail?: string } } }) =>
      toast.error(err?.response?.data?.detail ?? "Error al agregar mes"),
  })
}

export function useToggleFundEntry() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, enters_fund }: { id: string; enters_fund: boolean }) =>
      savingsApi.toggleFundEntry(id, enters_fund),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["savings-contributions"] })
      qc.invalidateQueries({ queryKey: ["savings-returns"] })
    },
    onError: () => toast.error("Error al actualizar"),
  })
}

export function useReturns() {
  return useQuery({ queryKey: ["savings-returns"], queryFn: savingsApi.getReturns })
}
