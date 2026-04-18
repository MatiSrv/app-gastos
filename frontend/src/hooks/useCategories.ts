import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { categoryApi } from "@/lib/api"
import type { Category } from "@/lib/types"
import { toast } from "sonner"

export function useCategories() {
  return useQuery({ queryKey: ["categories"], queryFn: categoryApi.list })
}

export function useCreateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: categoryApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] })
      toast.success("Categoría creada")
    },
    onError: () => toast.error("Error al crear categoría"),
  })
}

export function useUpdateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Category> }) =>
      categoryApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] })
      qc.invalidateQueries({ queryKey: ["dashboard"] })
      toast.success("Categoría actualizada")
    },
    onError: () => toast.error("Error al actualizar categoría"),
  })
}

export function useDeleteCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: categoryApi.remove,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] })
      toast.success("Categoría eliminada")
    },
    onError: (err: { response?: { data?: { detail?: string } } }) =>
      toast.error(err?.response?.data?.detail ?? "Error al eliminar categoría"),
  })
}
