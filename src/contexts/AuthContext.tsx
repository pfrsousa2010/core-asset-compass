import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { useNavigate } from 'react-router-dom';

type Profile = Tables<'profiles'>;
type Company = Tables<'companies'>;

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  company: Company | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<'inactive' | 'success'>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  updatePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const clearAuthState = () => {
    setUser(null);
    setProfile(null);
    setCompany(null);
    localStorage.removeItem('supabase.auth.token');
  };

  const loadUserData = async (currentUser: User) => {
    try {
      // Buscar perfil do usuário
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      if (profileError) {
        console.error('Erro ao carregar perfil:', profileError);
        
        // Se perfil não existe mas usuário está confirmado, redirecionar para onboarding
        if (profileError.code === 'PGRST116' && currentUser.email_confirmed_at) {
          console.log('Usuário confirmado mas sem perfil, precisa fazer onboarding');
          navigate('/onboarding', { replace: true });
          return;
        }
        
        // Outros erros, fazer logout
        await signOut();
        return;
      }

      // Verificar se o usuário está ativo
      if (profileData?.is_active === false) {
        navigate('/acesso-negado', { replace: true });
        return;
      }

      setProfile(profileData);

      // Buscar dados da empresa
      if (profileData?.company_id) {
        const { data: companyData, error: companyError } = await supabase
          .from('companies')
          .select('*')
          .eq('id', profileData.company_id)
          .single();

        if (companyError) {
          console.error('Erro ao carregar empresa:', companyError);
        } else {
          setCompany(companyData);
        }
      } else {
        // Se usuário não tem empresa, redirecionar para onboarding
        console.log('Usuário sem empresa, redirecionando para onboarding');
        navigate('/onboarding', { replace: true });
        return;
      }
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
      // Se houver erro ao carregar dados, fazer logout
      await signOut();
    }
  };

  const checkSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Erro ao verificar sessão:', error);
        clearAuthState();
        setLoading(false);
        return;
      }

      if (session?.user) {
        // Verificar se o token ainda é válido fazendo uma query simples
        const { error: testError } = await supabase.from('profiles').select('id').limit(1);
        
        if (testError && (testError.code === 'invalid_token' || testError.message?.includes('JWT'))) {
          await signOut();
          return;
        }

        setUser(session.user);
        await loadUserData(session.user);
      } else {
        clearAuthState();
      }
    } catch (error) {
      console.error('Erro ao verificar sessão:', error);
      clearAuthState();
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string): Promise<'inactive' | 'success'> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
  
    if (error) {
      // Adiciona tratamento para e-mail não confirmado
      if (error.code === 'email_not_confirmed') {
        throw new Error('Você precisa confirmar seu e-mail antes de acessar. Verifique sua caixa de entrada ou spam.');
      }
      throw new Error('Email ou senha inválidos.');
    }
  
    if (data.user) {
      console.log('Login realizado, verificando perfil do usuário:', data.user.id);
      
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('is_active, company_id')
        .eq('id', data.user.id)
        .single();
  
      if (profileError) {
        console.error('Erro ao verificar perfil:', profileError);
        
        // Se perfil não existe mas usuário está confirmado, redirecionar para onboarding
        if (profileError.code === 'PGRST116' && data.user.email_confirmed_at) {
          console.log('Usuário confirmado mas sem perfil, redirecionando para onboarding');
          setUser(data.user);
          navigate('/onboarding', { replace: true });
          return 'success';
        }
        
        await supabase.auth.signOut();
        throw new Error('Conta não encontrada ou não confirmada.');
      }
      
      if (!profile?.is_active) {
        await supabase.auth.signOut();
        return 'inactive';
      }

      // Se não tem empresa, redirecionar para onboarding
      if (!profile?.company_id) {
        setUser(data.user);
        navigate('/onboarding', { replace: true });
        return 'success';
      }
  
      setUser(data.user);
      await loadUserData(data.user);
      return 'success';
    }
    throw new Error('Erro inesperado.');
  };  

  const signUp = async (email: string, password: string, name: string): Promise<void> => {
    const redirectUrl = `${window.location.origin}/onboarding`;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          name: name,
        }
      }
    });
  
    if (error) throw error;
  };  

  const signOut = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      clearAuthState();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      // Mesmo com erro, limpar o estado local
      clearAuthState();
      navigate('/login', { replace: true });
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (newPassword: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  };

  useEffect(() => {
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        setTimeout(() => {
          loadUserData(session.user);
        }, 0);
      } else if (event === 'SIGNED_OUT') {
        clearAuthState();
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        setUser(session.user);
        setTimeout(() => {
          loadUserData(session.user);
        }, 0);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = {
    user,
    profile,
    company,
    loading,
    signIn,
    signUp,
    signOut,
    updatePassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
