import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertBrief, type Brief } from "@shared/schema";
import { useToast } from "./use-toast";

export function useBriefs(clientId: string) {
  return useQuery<Brief[]>({
    queryKey: [api.briefs.list.path, clientId],
    queryFn: async () => {
      if (!clientId) return [];
      const url = buildUrl(api.briefs.list.path, { clientId });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) {
        const error = await res.json().catch(() => ({ message: "Unknown error" }));
        throw new Error(error.message || "Failed to fetch briefs");
      }
      const data = await res.json();
      // Garantir que retorna um array
      return Array.isArray(data) ? data : [];
    },
    enabled: !!clientId,
    initialData: [],
  });
}

export function useBrief(id: string) {
  return useQuery({
    queryKey: [api.briefs.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.briefs.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch brief");
      return api.briefs.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useGenerateBrief() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ clientId, topic, contentIds }: { clientId: string; topic: string; contentIds?: string[] }) => {
      const url = buildUrl(api.briefs.generate.path, { clientId });
      const res = await fetch(url, {
        method: api.briefs.generate.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, contentIds }),
        credentials: "include",
      });
      
      if (!res.ok) {
        throw new Error("Failed to generate brief");
      }
      return api.briefs.generate.responses[201].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.briefs.list.path, variables.clientId] });
      toast({ title: "Success", description: "Brief generation started" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}
