import { loadStripe } from '@stripe/stripe-js';
import { supabase } from '@/integrations/supabase/client';

// Configuração do Stripe
const STRIPE_PUBLISHABLE_KEY = 'pk_live_51RgE7aCpLUoYVzVwqFuUAyAotOLJnfXY6ZxSCTtHoijgcj5h1QBpIH1NYsSakSYDQeZ8T2n138c8KHhy5upz2WRu00JxHw6RRn';

// Carregar Stripe no frontend
export const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

// Tipos para os planos
export interface StripePlan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
}

// Configuração dos planos no Stripe
export const STRIPE_PLANS: Record<string, StripePlan> = {
  basic: {
    id: 'price_basic_monthly', // Será substituído pelo ID real do Stripe
    name: 'Basic',
    price: 29.90,
    interval: 'month',
    features: [
      'Até 500 ativos',
      'Até 3 usuários',
      'Suporte por e-mail (até 48h)',
      'Relatórios básicos'
    ]
  },
  premium: {
    id: 'price_premium_monthly', // Será substituído pelo ID real do Stripe
    name: 'Premium',
    price: 79.90,
    interval: 'month',
    features: [
      'Até 1000 ativos',
      'Até 10 usuários',
      'Suporte por WhatsApp (até 24h)',
      'Relatórios avançados',
      'Integração com APIs'
    ]
  }
};

// IDs dos produtos no Stripe
export const STRIPE_PRODUCT_IDS = {
  basic: 'price_1RgEawCpLUoYVzVwlcuui2Qc',    // Basic 39,90
  premium: 'price_1RgEbCCpLUoYVzVwu5xAwQpV', // Premium 79,90
};

// URL da função Supabase Edge Function
const SUPABASE_FUNCTION_URL = 'https://nvwscxburlixyqkbhfux.supabase.co/functions/v1/create-stripe-session';

// Função para criar sessão de checkout do Stripe
export async function createStripeSession(plan: 'basic' | 'premium') {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    // Obter dados da empresa do usuário
    const { data: profile } = await supabase
      .from('profiles')
      .select('company_id, name, email')
      .eq('id', user.id)
      .single();

    if (!profile) {
      throw new Error('Perfil não encontrado');
    }

    // Dados para enviar para a função Supabase
    const requestData = {
      product_id: STRIPE_PRODUCT_IDS[plan],
      company_id: profile.company_id || 'empresa_123', // Fallback para desenvolvimento
      plan: plan
    };

    // Fazer chamada para a função Supabase Edge Function
    const response = await fetch(SUPABASE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52d3NjeGJ1cmxpeHlxa2JoZnV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1Mjk1MTEsImV4cCI6MjA2NjEwNTUxMX0.ppBJapu82yVC7wBeXqZlkgceMGLpPt9VA58AOSmUlhI'}`,
      },
      body: JSON.stringify(requestData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao criar sessão de checkout');
    }

    const { sessionId } = await response.json();
    return sessionId;
  } catch (error) {
    console.error('Erro ao criar sessão de checkout:', error);
    throw error;
  }
}

// Função para redirecionar para checkout
export async function redirectToCheckout(plan: 'basic' | 'premium') {
  try {
    const sessionId = await createStripeSession(plan);
    const stripe = await stripePromise;
    
    if (!stripe) {
      throw new Error('Stripe não carregado');
    }

    const { error } = await stripe.redirectToCheckout({
      sessionId,
    });

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Erro ao redirecionar para checkout:', error);
    throw error;
  }
}

// Função para lidar com upgrade do plano Basic
export async function handleUpgradeBasic() {
  try {
    await redirectToCheckout('basic');
  } catch (error) {
    console.error('Erro ao fazer upgrade para Basic:', error);
    throw error;
  }
}

// Função para lidar com upgrade do plano Premium
export async function handleUpgradePremium() {
  try {
    await redirectToCheckout('premium');
  } catch (error) {
    console.error('Erro ao fazer upgrade para Premium:', error);
    throw error;
  }
}

// Função para obter dados do cliente no Stripe
export async function getCustomerPortalUrl() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    // TODO: Implementar quando necessário
    throw new Error('Função não implementada ainda');
  } catch (error) {
    console.error('Erro ao obter URL do portal:', error);
    throw error;
  }
} 