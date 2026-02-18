# 🔧 CORREÇÃO: Falta useClient Hook

## ❌ O Erro

```
"useClient" is not exported by "client/src/hooks/use-clients.ts"
```

**Causa:** O arquivo `use-clients.ts` exportava `useClients` (plural), mas vários componentes tentavam importar `useClient` (singular).

---

## ✅ SOLUÇÃO: Adicionar Hook useClient

Foi adicionada a função `useClient(clientId)` no arquivo `use-clients.ts`.

---

## 🚀 Como Aplicar a Correção na VPS

### Execute na VPS:

```bash
cd /opt/brieflow

# Corrigir o arquivo use-clients.ts
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
```

---

## 🔄 Tentar Novamente o Build

```bash
# Limpar cache
rm -rf dist .vite

# Tentar build
npx vite build --config vite.config.ts --mode production
```

---

## ⚠️ Se Houver Mais Erros

Se aparecer outro erro, copie e cole aqui para corrigir!

---

## 📊 Arquivos Usando useClient

Estes arquivos usam o hook `useClient`:
- `client/src/components/ClientWorkspace/index.tsx`
- `client/src/components/ClientWorkspace/SettingsTab.tsx`
- `client/src/pages/ClientDetails.tsx`

Todos deveriam funcionar agora! ✅

---

## 🎯 Próximo Passo

Após aplicar a correção:

```bash
npx vite build --config vite.config.ts --mode production
```

Se o build funcionar:

```bash
docker service scale briefflow_app=0 && docker service scale briefflow_app=1
```

E acesse: `http://seu-servidor:5001`

Você verá a **interface completa do BriefFlow**! 🎉
