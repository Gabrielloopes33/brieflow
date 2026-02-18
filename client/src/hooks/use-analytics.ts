import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "./use-toast";
import { apiGet, apiPost } from "@/lib/api";

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
      return apiGet('/api/analytics/accounts');
    },
  });
}

export function useSelectAccount() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ platform, accountId }: { platform: string; accountId: string }) => {
      return apiPost('/api/analytics/select-account', { platform, accountId });
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
      return apiPost('/api/analytics/hide-account', { id });
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
      return apiGet('/api/analytics/meta/organic');
    },
  });
}

export function useMetaAds() {
  return useQuery({
    queryKey: ['meta-ads'],
    queryFn: async () => {
      return apiGet('/api/analytics/meta/ads');
    },
  });
}

export function useGoogleAds() {
  return useQuery({
    queryKey: ['google-ads'],
    queryFn: async () => {
      return apiGet('/api/analytics/google/ads');
    },
  });
}
