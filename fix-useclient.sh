#!/bin/bash

# Script de CORREÇÃO para build do BriefFlow
# Corrige o erro de falta do hook useClient
# Uso: cd /opt/brieflow && ./fix-useclient.sh

set -e

echo "🔧 === CORRIGINDO ERRO DE BUILD ==="
echo ""

cd /opt/brieflow

echo "📝 Corrigindo arquivo client/src/hooks/use-clients.ts..."
cat > client/src/hooks/use-clients.ts << 'EOF'
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@shared/supabase";
import { useToast } from "./use-toast";

export function useClients() {
  return useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data: result, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return result || [];
    },
  });
}

export function useClient(clientId: string) {
  return useQuery({
    queryKey: ['client', clientId],
    queryFn: async () => {
      const { data: result, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .single();

      if (error) throw error;
      return result;
    },
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: { name: string; description?: string; niche?: string; targetAudience?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: clientData, error } = await supabase
        .from('clients')
        .insert({
          user_id: user.id,
          name: data.name,
          description: data.description,
          niche: data.niche,
          target_audience: data.targetAudience,
        })
        .select()
        .single();

      if (error) throw error;
      return clientData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast({ title: "Success", description: "Client created successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}
EOF

echo "✅ Arquivo corrigido!"
echo ""

echo "🧹 Limpando cache..."
rm -rf dist .vite
echo "✅ Cache limpo!"
echo ""

echo "🏗️  Executando build..."
npx vite build --config vite.config.ts --mode production
echo ""

echo "✅ === CORREÇÃO CONCLUÍDA ==="
echo ""
echo "🚀 Próximo passo:"
echo "   docker service scale briefflow_app=0 && docker service scale briefflow_app=1"
echo ""
echo "✨ Após reiniciar, acesse:"
echo "   http://seu-servidor:5001"
echo ""
