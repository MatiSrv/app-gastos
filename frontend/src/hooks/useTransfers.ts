import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { transferApi } from "@/lib/api"
import { toast } from "sonner"

export function useTransfers() {
  return useQuery({ queryKey: ["transfers"], queryFn: transferApi.list })
}

export function useCreateTransfer() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: transferApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transfers"] })
      qc.invalidateQueries({ queryKey: ["accounts"] })
      qc.invalidateQueries({ queryKey: ["dashboard"] })
      toast.success("Transferencia realizada")
    },
    onError: (err: { response?: { data?: { detail?: string } } }) =>
      toast.error(err?.response?.data?.detail ?? "Error al realizar transferencia"),
  })
}

export function useDeleteTransfer() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: transferApi.remove,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transfers"] })
      qc.invalidateQueries({ queryKey: ["accounts"] })
      toast.success("Transferencia eliminada")
    },
    onError: () => toast.error("Error al eliminar transferencia"),
  })
}
