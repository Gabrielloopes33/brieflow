import { useQuery } from "@tanstack/react-query";
import { supabase } from "@shared/supabase";

export function useContents(clientId: string) {
  return useQuery({
    queryKey: ['contents', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contents')
        .select('*')
        .eq('client_id', clientId)
        .order('scraped_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!clientId,
  });
}
