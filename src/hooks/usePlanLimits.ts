import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const planRules = {
  free: {
    maxAssets: 50,
    maxUsers: 2,
    support: "E-mail (até 72h)",
    icon: "🟢",
    color: "green",
    name: "Free",
    price: undefined,
    oldPrice: undefined,
  },
  basic: {
    maxAssets: 500,
    maxUsers: 5,
    support: "E-mail (até 48h)",
    icon: "🔵",
    color: "blue",
    name: "Basic",
    price: 39.90,
    oldPrice: 59.90,
  },
  premium: {
    maxAssets: 1000,
    maxUsers: 10,
    support: "WhatsApp (até 24h)",
    icon: "🟣",
    color: "purple",
    name: "Premium",
    price: 79.90,
    oldPrice: 99.90,
  },
};

type PlanRule = {
  maxAssets: number;
  maxUsers: number;
  support: string;
  icon: string;
  color: string;
  name: string;
  price?: number;
  oldPrice?: number;
};

export const planRulesTyped: Record<string, PlanRule> = planRules;

export type PlanType = keyof typeof planRules;

export interface PlanLimits {
  currentPlan: PlanType;
  planInfo: typeof planRules[PlanType];
  assetsCount: number;
  usersCount: number;
  assetsLimit: number;
  usersLimit: number;
  assetsUsage: number; // percentage
  usersUsage: number; // percentage
  isAssetsLimitReached: boolean;
  isUsersLimitReached: boolean;
  isAssetsLimitWarning: boolean; // 90% ou mais
  isUsersLimitWarning: boolean; // 90% ou mais
}

export function usePlanLimits() {
  const { profile, company } = useAuth();

  return useQuery({
    queryKey: ['plan-limits', profile?.company_id],
    queryFn: async (): Promise<PlanLimits> => {
      if (!profile?.company_id) {
        throw new Error('Company ID not found');
      }

      // Get current plan
      const currentPlan = (company?.plan || 'free') as PlanType;
      const planInfo = planRules[currentPlan];

      // Count assets
      const { count: assetsCount } = await supabase
        .from('assets')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', profile.company_id);

      // Count active users
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', profile.company_id)
        .eq('is_active', true);

      const assetsLimit = planInfo.maxAssets;
      const usersLimit = planInfo.maxUsers;
      const assetsUsage = Math.round((assetsCount || 0) / assetsLimit * 100);
      const usersUsage = Math.round((usersCount || 0) / usersLimit * 100);

      return {
        currentPlan,
        planInfo,
        assetsCount: assetsCount || 0,
        usersCount: usersCount || 0,
        assetsLimit,
        usersLimit,
        assetsUsage,
        usersUsage,
        isAssetsLimitReached: (assetsCount || 0) >= assetsLimit,
        isUsersLimitReached: (usersCount || 0) >= usersLimit,
        isAssetsLimitWarning: assetsUsage >= 90,
        isUsersLimitWarning: usersUsage >= 90,
      };
    },
    enabled: !!profile?.company_id && !!company,
  });
} 