import { useQuery } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type Content } from "@shared/schema";

export function useContents(clientId: string) {
  return useQuery<Content[]>({
    queryKey: [api.contents.list.path, clientId],
    queryFn: async () => {
      if (!clientId) return [];
      const url = buildUrl(api.contents.list.path, { clientId });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) {
        const error = await res.json().catch(() => ({ message: "Unknown error" }));
        throw new Error(error.message || "Failed to fetch contents");
      }
      const data = await res.json();
      // Garantir que retorna um array
      return Array.isArray(data) ? data : [];
    },
    enabled: !!clientId,
    initialData: [],
  });
}
