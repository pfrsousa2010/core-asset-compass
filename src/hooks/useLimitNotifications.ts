import { useEffect } from 'react';
import { usePlanLimits } from './usePlanLimits';
import { useToast } from './use-toast';
import { useAuth } from '@/contexts/AuthContext';

export function useLimitNotifications() {
  const { data: planLimits } = usePlanLimits();
  const { toast } = useToast();
  const { profile } = useAuth();

  // Only admins should see plan limit toasts
  const isAdmin = profile?.role === 'admin';

  useEffect(() => {
    if (!planLimits || !isAdmin) return;

    // Notificar quando atingir 100% do limite de ativos
    if (planLimits.isAssetsLimitReached) {
      toast({
        title: "Limite de ativos atingido",
        description: `Você atingiu o limite de ${planLimits.assetsLimit} ativos do seu plano. Faça upgrade para adicionar mais ativos.`,
        variant: "destructive",
        duration: 8000,
      });
    }
    // Notificar quando atingir 80% do limite de ativos
    else if (planLimits.isAssetsLimitWarning) {
      toast({
        title: "Aproximando do limite de ativos",
        description: `Você está usando ${planLimits.assetsUsage}% do seu limite de ativos. Considere fazer upgrade do seu plano.`,
        variant: "destructive",
        duration: 6000,
      });
    }

    // Notificar quando atingir 100% do limite de usuários
    if (planLimits.isUsersLimitReached) {
      toast({
        title: "Limite de usuários atingido",
        description: `Você atingiu o limite de ${planLimits.usersLimit} usuários do seu plano. Faça upgrade para adicionar mais usuários.`,
        variant: "destructive",
        duration: 8000,
      });
    }
    // Notificar quando atingir 80% do limite de usuários
    else if (planLimits.isUsersLimitWarning) {
      toast({
        title: "Aproximando do limite de usuários",
        description: `Você está usando ${planLimits.usersUsage}% do seu limite de usuários. Considere fazer upgrade do seu plano.`,
        variant: "destructive",
        duration: 6000,
      });
    }
  }, [planLimits, toast, isAdmin]);

  return {
    planLimits,
    showLimitWarning: (type: 'assets' | 'users') => {
      if (!planLimits || !isAdmin) return;

      if (type === 'assets' && planLimits.isAssetsLimitWarning) {
        toast({
          title: "Aproximando do limite de ativos",
          description: `Você está usando ${planLimits.assetsUsage}% do seu limite de ativos. Considere fazer upgrade do seu plano.`,
          variant: "destructive",
        });
      }

      if (type === 'users' && planLimits.isUsersLimitWarning) {
        toast({
          title: "Aproximando do limite de usuários",
          description: `Você está usando ${planLimits.usersUsage}% do seu limite de usuários. Considere fazer upgrade do seu plano.`,
          variant: "destructive",
        });
      }
    },
  };
} 