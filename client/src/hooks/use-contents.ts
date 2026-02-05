import { useQuery } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";

export function useContents(clientId: string) {
  return useQuery({
    queryKey: [api.contents.list.path, clientId],
    queryFn: async () => {
      if (!clientId) return [];
      const url = buildUrl(api.contents.list.path, { clientId });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch contents");
      return api.contents.list.responses[200].parse(await res.json());
    },
    enabled: !!clientId,
  });
}
