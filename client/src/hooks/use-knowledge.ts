import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@shared/supabase";
import { useToast } from "./use-toast";

export function useKnowledgeItems(clientId: string) {
  return useQuery({
    queryKey: ['knowledge-items', clientId],
    queryFn: async () => {
      if (!clientId) return [];
      
      const { data: result, error } = await supabase
        .from('knowledge_items')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return result || [];
    },
    enabled: !!clientId,
  });
}

export function useDeleteKnowledgeItem() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (itemId: string) => {
      const { error } = await supabase
        .from('knowledge_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-items'] });
      toast({ title: "Sucesso", description: "Item excluído com sucesso" });
    },
    onError: (error: any) => {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    },
  });
}

export function useCreateKnowledgeItem() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: { 
      clientId: string; 
      title: string; 
      content: string; 
      type: string; 
      sourceUrl?: string 
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: itemData, error } = await supabase
        .from('knowledge_items')
        .insert({
          user_id: user.id,
          client_id: data.clientId,
          title: data.title,
          content: data.content,
          type: data.type,
          source_url: data.sourceUrl,
        })
        .select()
        .single();

      if (error) throw error;
      return itemData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-items'] });
      toast({ title: "Sucesso", description: "Item salvo na base de conhecimento" });
    },
    onError: (error: any) => {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    },
  });
}
