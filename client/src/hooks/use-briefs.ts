import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@shared/supabase";
import { useToast } from "./use-toast";

export function useBriefs(clientId: string) {
  return useQuery({
    queryKey: ['briefs', clientId],
    queryFn: async () => {
      const { data: result, error } = await supabase
        .from('briefs')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return result || [];
    },
    enabled: !!clientId,
  });
}

export function useBrief(id: string) {
  return useQuery({
    queryKey: ['brief', id],
    queryFn: async () => {
      const { data: result, error } = await supabase
        .from('briefs')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      return result;
    },
    enabled: !!id,
  });
}

export function useGenerateBrief() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ clientId, topic }: { clientId: string; topic: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: briefData, error } = await supabase
        .from('briefs')
        .insert({
          user_id: user.id,
          client_id: clientId,
          title: `Generated Brief: ${topic}`,
          angle: 'Comprehensive Guide',
          key_points: ['Point 1', 'Point 2', 'Point 3'],
          content_type: 'article',
          status: 'draft',
          generated_by: 'openai',
        })
        .select()
        .single();

      if (error) throw error;
      return briefData;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['briefs', variables.clientId] });
      toast({ title: "Success", description: "Brief created successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}
