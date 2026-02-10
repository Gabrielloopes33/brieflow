import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@shared/supabase";
import { useToast } from "./use-toast";

export function useSources(clientId: string) {
  return useQuery({
    queryKey: ['sources', clientId],
    queryFn: async () => {
      const { data: result, error } = await supabase
        .from('sources')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return result || [];
    },
    enabled: !!clientId,
  });
}

export function useCreateSource() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: { clientId: string; name: string; url: string; type?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: sourceData, error } = await supabase
        .from('sources')
        .insert({
          user_id: user.id,
          client_id: data.clientId,
          name: data.name,
          url: data.url,
          type: data.type || 'blog',
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;
      return sourceData;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sources', variables.clientId] });
      toast({ title: "Success", description: "Source created successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

export function useDeleteSource() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (sourceId: string) => {
      const { error } = await supabase
        .from('sources')
        .delete()
        .eq('id', sourceId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sources'] });
      toast({ title: "Success", description: "Source deleted successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}
