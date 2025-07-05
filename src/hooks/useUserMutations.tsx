
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

type UserRole = Database['public']['Enums']['user_role'];

interface CreateUserData {
  email: string;
  name: string;
  role: UserRole;
  is_active: boolean;
}

interface UpdateUserData {
  userId: string;
  updates: {
    name: string;
    role: UserRole;
    is_active: boolean;
  };
}

export function useUserMutations() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createUserMutation = useMutation({
    mutationFn: async (userData: CreateUserData) => {
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: Math.random().toString(36).slice(-12),   // senha temporária
        options: {
          data: {
            name: userData.name,
            company_id: profile?.company_id,   // empresa do admin
            role: userData.role,               // viewer / editor / admin
            is_active: userData.is_active
          }
        }
      });

      if (error) throw error;

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-users'] });
      toast({
        title: "Usuário criado com sucesso!",
        description: "O usuário foi adicionado ao sistema. Ele receberá um email de confirmação.",
      });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, updates }: UpdateUserData) => {
      // Usar a função admin_update_user_profile para contornar as políticas RLS
      const { error } = await supabase.rpc('admin_update_user_profile', {
        user_id: userId,
        new_name: updates.name,
        new_role: updates.role,
        new_is_active: updates.is_active
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-users'] });
      toast({
        title: "Usuário atualizado com sucesso!",
        description: "As alterações foram salvas",
      });
    },
  });

  return {
    createUserMutation,
    updateUserMutation,
  };
}
