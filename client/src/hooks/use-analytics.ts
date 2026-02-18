import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "./use-toast";

interface AnalyticsAccount {
  id: string;
  platform: 'meta' | 'google';
  account_id: string;
  account_name: string;
  account_type: 'page' | 'ad_account' | 'mcc';
  is_active: boolean;
  is_selected: boolean;
  created_at: string;
}

interface AccountsResponse {
  meta: AnalyticsAccount[];
  google: AnalyticsAccount[];
}

export function useAnalyticsAccounts() {
  return useQuery({
    queryKey: ['analytics-accounts'],
    queryFn: async (): Promise<AccountsResponse> => {
      const res = await fetch('/api/analytics/accounts');
      if (!res.ok) throw new Error('Failed to fetch accounts');
      return res.json();
    },
  });
}

export function useSelectAccount() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ platform, accountId }: { platform: string; accountId: string }) => {
      const res = await fetch('/api/analytics/select-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform, accountId }),
      });
      if (!res.ok) throw new Error('Failed to select account');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['meta-organic'] });
      queryClient.invalidateQueries({ queryKey: ['meta-ads'] });
      toast({ title: 'Conta selecionada' });
    },
    onError: (error: any) => {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    },
  });
}

export function useHideAccount() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch('/api/analytics/hide-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error('Failed to hide account');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics-accounts'] });
      toast({ title: 'Conta ocultada' });
    },
    onError: (error: any) => {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    },
  });
}

export function useMetaOrganic() {
  return useQuery({
    queryKey: ['meta-organic'],
    queryFn: async () => {
      const res = await fetch('/api/analytics/meta/organic');
      if (!res.ok) throw new Error('Failed to fetch Meta organic metrics');
      return res.json();
    },
  });
}

export function useMetaAds() {
  return useQuery({
    queryKey: ['meta-ads'],
    queryFn: async () => {
      const res = await fetch('/api/analytics/meta/ads');
      if (!res.ok) throw new Error('Failed to fetch Meta ads metrics');
      return res.json();
    },
  });
}

export function useGoogleAds() {
  return useQuery({
    queryKey: ['google-ads'],
    queryFn: async () => {
      const res = await fetch('/api/analytics/google/ads');
      if (!res.ok) throw new Error('Failed to fetch Google Ads metrics');
      return res.json();
    },
  });
}
