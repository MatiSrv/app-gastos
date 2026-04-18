import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { accountApi } from "@/lib/api"
import type { Account } from "@/lib/types"
import { toast } from "sonner"

export function useAccounts() {
  return useQuery({ queryKey: ["accounts"], queryFn: accountApi.list })
}

export function useCreateAccount() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: accountApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["accounts"] })
      qc.invalidateQueries({ queryKey: ["dashboard"] })
      toast.success("Cuenta creada")
    },
    onError: () => toast.error("Error al crear cuenta"),
  })
}

export function useUpdateAccount() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Account> }) =>
      accountApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["accounts"] })
      toast.success("Cuenta actualizada")
    },
    onError: () => toast.error("Error al actualizar cuenta"),
  })
}

export function useDeleteAccount() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: accountApi.remove,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["accounts"] })
      toast.success("Cuenta eliminada")
    },
    onError: (err: { response?: { data?: { detail?: string } } }) =>
      toast.error(err?.response?.data?.detail ?? "Error al eliminar cuenta"),
  })
}
