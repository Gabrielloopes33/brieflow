import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertSource, type Source } from "@shared/schema";
import { useToast } from "./use-toast";

export function useSources(clientId: string) {
  return useQuery<Source[]>({
    queryKey: [api.sources.list.path, clientId],
    queryFn: async () => {
      if (!clientId) return [];
      const url = buildUrl(api.sources.list.path, { clientId });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) {
        const error = await res.json().catch(() => ({ message: "Unknown error" }));
        throw new Error(error.message || "Failed to fetch sources");
      }
      const data = await res.json();
      // Garantir que retorna um array
      return Array.isArray(data) ? data : [];
    },
    enabled: !!clientId,
    initialData: [],
  });
}

export function useCreateSource() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ clientId, data }: { clientId: string; data: Omit<InsertSource, "clientId"> }) => {
      const url = buildUrl(api.sources.create.path, { clientId });
      const res = await fetch(url, {
        method: api.sources.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create source");
      }
      return api.sources.create.responses[201].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.sources.list.path, variables.clientId] });
      toast({ title: "Success", description: "Source added successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

export function useDeleteSource() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, clientId }: { id: string; clientId: string }) => {
      const url = buildUrl(api.sources.delete.path, { id });
      const res = await fetch(url, {
        method: api.sources.delete.method,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete source");
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.sources.list.path, variables.clientId] });
      toast({ title: "Success", description: "Source deleted" });
    },
  });
}
